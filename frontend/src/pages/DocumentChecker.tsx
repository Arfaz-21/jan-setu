import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle,
  HelpCircle, RefreshCw, Edit3, Save, ExternalLink, ShieldAlert,
  ArrowRight, Info, Check, GitCompare
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, ValidationResponse } from '../types';
import { ReadinessScoreCard } from '../components/common/ReadinessScoreCard';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';

export const DocumentChecker: React.FC = () => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingField, setEditingField] = useState<{ docId: string; field: string; val: string } | null>(null);
  const [selectedDocHint, setSelectedDocHint] = useState<string>('Auto Detect');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDocumentsAndValidate = async () => {
    setLoading(true);
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        const val = await api.validateDocuments();
        setValidation(val);
      }
    } catch (err) {
      console.error('Error fetching documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsAndValidate();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      const res = await api.uploadDocument(file, selectedDocHint);
      setStatusMessage(`Document '${file.name}' uploaded and processed successfully.`);
      await fetchDocumentsAndValidate();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleManualSave = async () => {
    if (!editingField) return;
    try {
      await api.manualCorrectField(editingField.docId, editingField.field, editingField.val);
      setEditingField(null);
      await fetchDocumentsAndValidate();
      setStatusMessage(`Manually corrected ${editingField.field} saved.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadSamples = async () => {
    setLoading(true);
    try {
      await api.getSamples();
      await fetchDocumentsAndValidate();
      setStatusMessage('Demonstration documents for Mohammed Arfaz loaded successfully.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER & CONTROLS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Document Readiness Checker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated verification of Karnataka Income, Caste, and Identity certificates with versioned rule provenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleLoadSamples}
            className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition"
          >
            Load Demo Profile (Mohammed Arfaz)
          </button>
          <button
            onClick={fetchDocumentsAndValidate}
            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Re-run validation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-teal-700 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* READINESS SCORE SUMMARY */}
      {validation && (
        <ReadinessScoreCard
          score={validation.readiness_score}
          breakdown={validation.score_breakdown}
        />
      )}

      {/* RAPIDFUZZ NAME VARIATION NOTICE */}
      {validation?.name_similarity_analysis?.comparisons && validation.name_similarity_analysis.comparisons.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              RapidFuzz Cross-Document Name Consistency Analysis
            </h3>
          </div>

          <p className="text-xs text-slate-600 mb-4">
            Under Karnataka SSP and Sakala guidelines, minor name variations should prompt citizen verification before portal submission rather than being automatically disqualified.
          </p>

          <div className="space-y-3">
            {validation.name_similarity_analysis.comparisons.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">
                      {c.doc1_type}: <span className="text-slate-950 font-bold">{c.name1}</span>
                    </span>
                    <span className="text-slate-400">vs</span>
                    <span className="font-semibold text-slate-800">
                      {c.doc2_type}: <span className="text-slate-950 font-bold">{c.name2}</span>
                    </span>
                  </div>
                  <p className="text-slate-600">{c.explanation}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-1 rounded bg-slate-200/80 font-mono font-bold text-[11px] text-slate-800">
                    {c.score}% Match
                  </span>
                  <Badge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD WORKFLOW BOX */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 shadow-xs text-center">
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-sm">
          Upload Karnataka Certificate (PDF, JPG, PNG)
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Maximum file size: 5MB. Files are verified locally with zero unmasked Aadhaar retention.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <select
            value={selectedDocHint}
            onChange={(e) => setSelectedDocHint(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="Auto Detect">Auto-Detect Document Type</option>
            <option value="Income Certificate">Income Certificate (Form 7/F)</option>
            <option value="Caste Certificate">Caste Certificate (Form D)</option>
            <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
            <option value="Marks Card">Marks Card / Marksheet</option>
          </select>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs">
            <span>{uploading ? 'Processing OCR...' : 'Select File to Upload'}</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* EXTRACTED DOCUMENTS & MANUAL CORRECTION */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">
          Active Verified Documents ({documents.length})
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {documents.map((doc) => {
            const data = doc.extracted_data;
            const conf = doc.ocr_confidence || {};

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Document Card Header */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-sm text-slate-900">
                      {doc.document_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({doc.filename})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.is_synthetic && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Synthetic Demo Data
                      </span>
                    )}
                  </div>
                </div>

                {/* Extracted Fields Grid */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Applicant Full Name</span>
                        {conf.full_name && (
                          <span className="text-[10px] font-mono text-slate-500">
                            OCR: {Math.round(conf.full_name * 100)}%
                          </span>
                        )}
                      </div>
                      {editingField?.docId === doc.id && editingField?.field === 'full_name' ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            value={editingField.val}
                            onChange={(e) => setEditingField({ ...editingField, val: e.target.value })}
                            className="w-full bg-white border border-teal-500 rounded px-2 py-1 text-xs"
                          />
                          <button onClick={handleManualSave} className="p-1 bg-teal-600 text-white rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                          <span>{data.full_name || 'Not detected'}</span>
                          <button
                            onClick={() => setEditingField({ docId: doc.id, field: 'full_name', val: data.full_name || '' })}
                            className="text-slate-400 hover:text-teal-600"
                            title="Manually correct name"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate / Barcode Number */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Certificate / Barcode Number</span>
                        {conf.certificate_number && (
                          <span className="text-[10px] font-mono text-slate-500">
                            OCR: {Math.round(conf.certificate_number * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {data.certificate_number || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Issue Date</span>
                        {conf.issue_date && (
                          <span className="text-[10px] font-mono text-slate-500">
                            OCR: {Math.round(conf.issue_date * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {data.issue_date || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Expiry Date / Validity</span>
                        {conf.expiry_date && (
                          <span className="text-[10px] font-mono text-slate-500">
                            OCR: {Math.round(conf.expiry_date * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-sm">
                        {data.expiry_date ? (
                          <span className="text-rose-700 font-semibold">{data.expiry_date} (Expired)</span>
                        ) : (
                          <span className="text-slate-600">Perpetual / Not Applicable</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Issuing Authority */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="text-slate-400 mb-1">Issuing Authority</div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {data.issuing_authority || 'Tahsildar / Revenue Department'}
                      </div>
                    </div>
                  </div>

                  {/* Annual Income or Category */}
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="text-slate-400 mb-1">Category / Financial Record</div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {data.annual_income ? `Annual Income: Rs. ${data.annual_income.toLocaleString()}` : (data.applicant_category || 'Cat-IIB')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicable Rule Provenance Checks for this Document */}
                {validation?.results && (
                  <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Statutory Rule Validations ({doc.document_type})
                    </h4>
                    <div className="space-y-2">
                      {validation.results
                        .filter((r) => r.document_id === doc.id)
                        .map((r, ridx) => (
                          <div
                            key={ridx}
                            className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              r.status === 'VERIFIED'
                                ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                                : 'bg-amber-50/70 border-amber-200 text-amber-950'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-semibold">
                                <span>{r.reason}</span>
                              </div>
                              {r.rule_provenance && (
                                <div className="mt-1 text-[11px] text-slate-600 flex flex-wrap gap-x-2">
                                  <span><strong>Rule:</strong> {r.rule_provenance.rule_id}</span>
                                  <span>&bull;</span>
                                  <span><strong>Notification:</strong> {r.rule_provenance.government_order_or_notification}</span>
                                  <span>&bull;</span>
                                  <span><strong>Clause:</strong> {r.rule_provenance.relevant_clause}</span>
                                </div>
                              )}
                            </div>

                            <Badge status={r.status} className="shrink-0" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
