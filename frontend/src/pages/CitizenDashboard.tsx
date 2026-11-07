import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck, AlertTriangle, ArrowRight, Clock,
  FileText, ShieldCheck, CheckCircle2, AlertCircle,
  ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, ValidationResponse, SchemeItem, ApplicationItem } from '../types';
import { ReadinessScoreCard } from '../components/common/ReadinessScoreCard';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';

export const CitizenDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Pre-load synthetic sample documents if none
      await api.getSamples();
      const [docsData, valData, schemesData, appsData] = await Promise.all([
        api.listDocuments(),
        api.validateDocuments(),
        api.getSchemes({ scheme_type: 'student' }),
        api.getApplications()
      ]);

      setDocuments(docsData);
      setValidation(valData);
      setSchemes(schemesData.slice(0, 3));
      setApplications(appsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* WELCOME SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              {language === 'kn' ? 'ನಾಗರಿಕ ವಿವರ' : 'Demonstration Citizen Profile'}
            </span>
            <span className="text-xs text-slate-400">&bull; Bengaluru North Taluk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {language === 'kn' ? 'ಸ್ವಾಗತ, ಮೊಹಮ್ಮದ್ ಅರ್ಫಾಜ್' : 'Welcome, Mohammed Arfaz'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Category II(B) OBC &bull; Annual Income on Record: Rs. 1,20,000
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition shadow-xs"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Manage Documents</span>
          </Link>
        </div>
      </div>

      {/* READINESS OVERVIEW & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {validation ? (
            <ReadinessScoreCard
              score={validation.readiness_score}
              breakdown={validation.score_breakdown}
            />
          ) : (
            <div className="h-48 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
              Calculating readiness checks...
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/documents"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-teal-50 hover:border-teal-200 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-teal-600" />
                  <span>Upload & Verify Certificates</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/voice"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-200 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Kannada Voice Assistance</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/sakala"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-purple-50 hover:border-purple-200 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Track Sakala Deadlines</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/appeals"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-rose-50 hover:border-rose-200 transition text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Generate Sakala First Appeal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 inline mr-1" />
            Zero unmasked Aadhaar retention active
          </div>
        </div>
      </div>

      {/* PENDING DOCUMENT CORRECTIONS ALERT */}
      {validation && validation.warning_checks > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                {language === 'kn' ? 'ದಾಖಲೆಗಳಲ್ಲಿ ಗಮನಿಸಬೇಕಾದ ಅಂಶಗಳು' : 'Pending Document Discrepancies Detected'}
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                Your uploaded documents have {validation.warning_checks} items requiring attention before portal submission to prevent rejection:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-900 list-disc list-inside">
                {validation.results
                  .filter((r) => r.status === 'ATTENTION_REQUIRED')
                  .map((r, i) => (
                    <li key={i}>
                      <strong>{r.category}:</strong> {r.reason}
                    </li>
                  ))}
              </ul>
              <div className="mt-3">
                <Link
                  to="/documents"
                  className="text-xs font-bold text-amber-950 underline hover:text-amber-800"
                >
                  Go to Document Checker to review and correct &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECENTLY CHECKED DOCUMENTS */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Recently Checked Documents ({documents.length})
          </h3>
          <Link to="/documents" className="text-xs text-teal-700 hover:underline font-semibold">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const isIncome = doc.document_type === 'Income Certificate';
            const isCaste = doc.document_type === 'Caste Certificate';
            const isAadhaar = doc.document_type === 'Aadhaar Card';

            return (
              <div
                key={doc.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {doc.document_type}
                  </span>
                  <Badge
                    status={
                      isIncome
                        ? 'EXPIRED'
                        : isCaste
                        ? 'ATTENTION_REQUIRED'
                        : 'VERIFIED'
                    }
                  />
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Name: </span>
                    <strong className="text-slate-800">{doc.extracted_data.full_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Cert / ID: </span>
                    <code className="text-[11px] bg-slate-200/60 px-1 py-0.5 rounded text-slate-800">
                      {doc.extracted_data.certificate_number || 'N/A'}
                    </code>
                  </div>
                  {doc.extracted_data.expiry_date && (
                    <div>
                      <span className="text-slate-400">Expiry: </span>
                      <span className="text-rose-700 font-semibold">{doc.extracted_data.expiry_date} (Expired)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SAKALA APPLICATION TRACKING */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Active Sakala Service Tracking
            </h3>
            <p className="text-xs text-slate-500">
              Timeline calculated under Karnataka Guarantee of Services to Citizens Act, 2011
            </p>
          </div>
          <Link to="/sakala" className="text-xs text-teal-700 hover:underline font-semibold">
            Track Another &rarr;
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-lg border border-rose-200 bg-rose-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{app.service_name}</span>
                    <Badge status={app.is_overdue ? 'OVERDUE' : 'PENDING'} />
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-4">
                    <span>GSC No: <code className="font-semibold text-slate-800">{app.gsc_number}</code></span>
                    <span>Applied: {app.submission_date}</span>
                    <span>Deadline: {app.expected_deadline}</span>
                  </div>
                  <p className="text-xs text-rose-700 font-medium">
                    Overdue by {app.days_remaining_or_overdue} days. Eligible for First Appeal under Section 8.
                  </p>
                </div>

                <Link
                  to="/appeals"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draft First Appeal</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No active applications being tracked.</p>
        )}
      </div>

      {/* SUGGESTED SCHEMES */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Suggested Government Schemes for Mohammed Arfaz
            </h3>
            <p className="text-xs text-slate-500">
              Matched for Category II(B) OBC student in Bengaluru Urban
            </p>
          </div>
          <Link to="/schemes" className="text-xs text-teal-700 hover:underline font-semibold">
            Explore All 5 Schemes &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-lg border border-slate-200 flex flex-col justify-between hover:border-teal-300 transition"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {s.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-2">
                  {s.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {s.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {s.application_deadline ? `Till ${s.application_deadline}` : 'Open Application'}
                </span>
                <Link
                  to="/schemes"
                  className="font-semibold text-teal-700 hover:underline"
                >
                  Check Readiness &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
