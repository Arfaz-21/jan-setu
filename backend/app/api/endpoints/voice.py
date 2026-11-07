from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.tts_service import bhashini_adapter

router = APIRouter(prefix="/voice", tags=["Voice & Kannada Accessibility"])

class TTSRequest(BaseModel):
    text: str

KANNADA_AUDIO_GUIDES = [
    {
        "id": "guide-01",
        "category": "Income Certificate",
        "kannada_text": "ನಿಮ್ಮ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ ಅವಧಿ ಮುಗಿದಿರಬಹುದು. ದಯವಿಟ್ಟು ನಾಡಕಚೇರಿಯಲ್ಲಿ ಹೊಸ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "english_translation": "Your Income Certificate may be expired. Please check and obtain a renewed certificate from Nadakacheri.",
        "phonetic_kannada": "Nimma aadaaya pramaanapatrada avadhi mugidirabahudu. Dayavittu Nadakacheriyalli hosa pramaanapatravannu parisheelisi."
    },
    {
        "id": "guide-02",
        "category": "Name Mismatch",
        "kannada_text": "ದಾಖಲೆಗಳಲ್ಲಿ ಹೆಸರಿನ ಅಕ್ಷರಗಳಲ್ಲಿ ಸಣ್ಣ ವ್ಯತ್ಯಾಸ ಕಂಡುಬಂದಿದೆ. ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಹೆಸರನ್ನು ದೃಢೀಕರಿಸಿ.",
        "english_translation": "A minor name variation was detected across your documents. Please verify your name before portal submission.",
        "phonetic_kannada": "Daakhalegalalli hesarina aksharagalalli sanna vyatyaasa kandubandide. Arji sallisuva modalu hesarannu drudheekarisi."
    },
    {
        "id": "guide-03",
        "category": "Sakala Escalation",
        "kannada_text": "ನಿಮ್ಮ ಸಕಾಲ ಅರ್ಜಿಯ ೨೧ ದಿನಗಳ ಕಾಲಮಿತಿ ಮುಗಿದಿದೆ. ನೀವು ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಲು ಅರ್ಹರಾಗಿದ್ದೀರಿ.",
        "english_translation": "Your Sakala application deadline of 21 working days has elapsed. You are eligible to file a First Appeal before the First Appellate Authority.",
        "phonetic_kannada": "Nimma Sakaala arjiya 21 dinagala kaalamiti mugidide. Neevu prathama melmanavi praadhikaarakke melmanavi sallisalu arharaagiddeeri."
    },
    {
        "id": "guide-04",
        "category": "Aadhaar Seeding",
        "kannada_text": "ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಗೃಹಲಕ್ಷ್ಮಿ ಸೌಲಭ್ಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಲಿಂಕ್ ಆಗಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
        "english_translation": "Ensure your bank account is seeded with Aadhaar (NPCI mapped) to receive scholarship and welfare direct benefit transfers.",
        "phonetic_kannada": "Vidyarthivetana mattu Gruha Lakshmi sowlabhyakkaagi nimma bank khaatege Aadhaar link aagiruvudannu khachitapadisikolli."
    }
]

@router.get("/status")
def voice_adapter_status():
    """Returns the live connection status of Bhashini adapter and speech engine."""
    return bhashini_adapter.get_service_status()

@router.get("/phrases")
def get_kannada_phrases():
    """Returns accessibility phrases with Kannada text, English translations, and phonetic guides."""
    return KANNADA_AUDIO_GUIDES

@router.post("/tts")
def synthesize_speech(payload: TTSRequest):
    """
    Synthesizes Kannada voice guidance.
    Uses browser SpeechSynthesis instruction parameters when Bhashini cloud credentials are not supplied.
    """
    return bhashini_adapter.synthesize_kannada_speech(payload.text)
