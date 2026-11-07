import re
from typing import Dict, Any, List
from rapidfuzz import fuzz

COMMON_KARNATAKA_NAME_ABBREVIATIONS = {
    "mohd": "mohammed",
    "md": "mohammed",
    "syed": "sayyed",
    "shaik": "shaikh",
    "km": "kumari",
    "smt": "shrimati",
    "sri": "shree",
    "dr": "doctor",
}

def normalize_name(name: str) -> str:
    """
    Normalizes a person's name by lowercasing, removing honorifics/titles/punctuations,
    and expanding common standard abbreviations.
    """
    if not name:
        return ""
    
    # Remove special punctuation except spaces
    cleaned = re.sub(r"[^a-zA-Z\s]", " ", name.lower())
    tokens = cleaned.split()
    expanded = [COMMON_KARNATAKA_NAME_ABBREVIATIONS.get(t, t) for t in tokens]
    return " ".join(expanded)

def compare_names(name1: str, name2: str, threshold: float = 85.0) -> Dict[str, Any]:
    """
    Compares two names using RapidFuzz ratio and token sort ratio.
    Returns similarity score, match status, and detailed human-readable explanation.
    Does NOT automatically declare slightly different names as legally invalid.
    """
    if not name1 or not name2:
        return {
            "name1": name1,
            "name2": name2,
            "score": 0.0,
            "is_exact": False,
            "is_acceptable_match": False,
            "status": "UNABLE_TO_VERIFY",
            "explanation": "One or both names are missing in the document records."
        }

    raw1 = name1.strip()
    raw2 = name2.strip()

    if raw1.lower() == raw2.lower():
        return {
            "name1": raw1,
            "name2": raw2,
            "score": 100.0,
            "is_exact": True,
            "is_acceptable_match": True,
            "status": "VERIFIED",
            "explanation": "Exact match across document records."
        }

    norm1 = normalize_name(raw1)
    norm2 = normalize_name(raw2)

    ratio = fuzz.ratio(norm1, norm2)
    token_sort = fuzz.token_sort_ratio(norm1, norm2)
    token_set = fuzz.token_set_ratio(norm1, norm2)

    # Best representative score
    best_score = round(max(ratio, token_sort, token_set), 1)

    if best_score >= 95.0:
        status = "VERIFIED"
        explanation = f"High-confidence match ({best_score}%) with minor spelling or title difference (e.g., '{raw1}' vs '{raw2}')."
    elif best_score >= threshold:
        status = "ATTENTION_REQUIRED"
        explanation = (
            f"Potential name variation detected ({best_score}% similarity). "
            f"Document A has '{raw1}' and Document B has '{raw2}'. "
            "Government portal verification may require an affidavit or confirmation before submission."
        )
    else:
        status = "ATTENTION_REQUIRED"
        explanation = (
            f"Significant name difference detected ({best_score}% similarity). "
            f"Document A: '{raw1}', Document B: '{raw2}'. "
            "Ensure the documents belong to the same citizen before submitting to government schemes."
        )

    return {
        "name1": raw1,
        "name2": raw2,
        "score": best_score,
        "is_exact": False,
        "is_acceptable_match": best_score >= threshold,
        "status": status,
        "explanation": explanation
    }

def cross_check_document_names(documents_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Performs pairwise name comparison across all uploaded documents.
    """
    names_found = []
    for doc in documents_data:
        doc_type = doc.get("document_type", "Unknown")
        name = doc.get("full_name") or (doc.get("extracted_data", {}).get("full_name") if isinstance(doc.get("extracted_data"), dict) else None)
        if name:
            names_found.append({"doc_type": doc_type, "name": name, "doc_id": doc.get("id", "")})

    if len(names_found) < 2:
        return {
            "status": "VERIFIED" if len(names_found) == 1 else "UNABLE_TO_VERIFY",
            "comparisons": [],
            "message": "Upload at least two documents with names to perform cross-document consistency checks."
        }

    comparisons = []
    has_warning = False

    for i in range(len(names_found)):
        for j in range(i + 1, len(names_found)):
            d1 = names_found[i]
            d2 = names_found[j]
            comp = compare_names(d1["name"], d2["name"])
            comp["doc1_type"] = d1["doc_type"]
            comp["doc2_type"] = d2["doc_type"]
            comparisons.append(comp)
            if comp["status"] != "VERIFIED":
                has_warning = True

    return {
        "status": "ATTENTION_REQUIRED" if has_warning else "VERIFIED",
        "comparisons": comparisons,
        "message": "Potential name variation detected between documents. Please verify before applying." if has_warning else "Names are consistent across all uploaded documents."
    }
