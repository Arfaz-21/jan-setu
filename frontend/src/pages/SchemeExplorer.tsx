import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ExternalLink, FileCheck, CheckCircle2,
  AlertTriangle, ArrowRight, ShieldCheck, HelpCircle, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { SchemeItem, DocumentItem } from '../types';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';

export const SchemeExplorer: React.FC = () => {
  const { language } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'student' | 'welfare'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<SchemeItem | null>(null);
  const [evaluatingScheme, setEvaluatingScheme] = useState(false);
  const [schemeReadiness, setSchemeReadiness] = useState<any | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemes({
        scheme_type: activeFilter === 'all' ? undefined : activeFilter,
        search: searchQuery || undefined,
      });
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    api.listDocuments().then((docs) => setDocuments(docs)).catch(console.error);
  }, []);

  const handleEvaluateReadiness = async (scheme: SchemeItem) => {
    setSelectedScheme(scheme);
    setEvaluatingScheme(true);
    setSchemeReadiness(null);
    try {
      const docIds = documents.map((d) => d.id);
      const res = await api.checkSchemeReadiness(scheme.id, {
        uploaded_document_ids: docIds,
        annual_income: 120000,
      });
      setSchemeReadiness(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingScheme(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          Karnataka Scheme Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified scholarship and welfare schemes under the Government of Karnataka. Check your document readiness directly against departmental criteria.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by scheme name, department or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Schemes ({schemes.length})
            </button>
            <button
              onClick={() => setActiveFilter('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeFilter === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Scholarships
            </button>
            <button
              onClick={() => setActiveFilter('welfare')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeFilter === 'welfare'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Welfare Guarantees
            </button>
          </div>
        </div>
      </div>

      {/* SCHEME READINESS MODAL / DETAIL DRAWER */}
      {selectedScheme && (
        <div className="bg-white rounded-xl border-2 border-teal-500/80 p-6 shadow-md space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Scheme Readiness Evaluation
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {selectedScheme.name}
              </h2>
              <p className="text-xs text-slate-500">{selectedScheme.department}</p>
            </div>
            <button
              onClick={() => setSelectedScheme(null)}
              className="text-slate-400 hover:text-slate-700 font-bold text-sm px-2 py-1"
            >
              &times; Close
            </button>
          </div>

          {evaluatingScheme ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Evaluating your active documents against scheme rules...
            </div>
          ) : schemeReadiness ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs text-slate-500">Readiness Score</div>
                  <div className="text-3xl font-extrabold text-teal-700 mt-1">
                    {schemeReadiness.readiness_score}%
                  </div>
                  <div className="mt-1">
                    <Badge status={schemeReadiness.readiness_status} />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">Required Documents:</div>
                  <div className="text-emerald-700 font-medium">
                    Verified: {schemeReadiness.valid_documents.length}
                  </div>
                  <div className="text-amber-700 font-medium">
                    Missing / Pending: {schemeReadiness.missing_documents.length}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">Official Portal:</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Proceed directly to the government portal after resolving document issues.
                    </p>
                  </div>
                  <a
                    href={selectedScheme.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs justify-center"
                  >
                    <span>Open Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Identified Issues */}
              {schemeReadiness.document_issues.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-2">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Readiness Action Items before Portal Submission:</span>
                  </h4>
                  <ul className="space-y-1.5 text-amber-900 list-disc list-inside">
                    {schemeReadiness.document_issues.map((iss: any, i: number) => (
                      <li key={i}>
                        <strong>{iss.document_type}:</strong> {iss.issue}
                        {iss.kannada_issue && (
                          <span className="block text-slate-600 pl-4 font-normal mt-0.5">
                            ಕನ್ನಡ: {iss.kannada_issue}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic">
                {schemeReadiness.disclaimer}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* SCHEME CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-teal-400 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {scheme.category}
                </span>
                <Badge status={scheme.verification_status} />
              </div>

              <h3 className="font-bold text-base text-slate-900 mt-2.5">
                {scheme.name}
              </h3>
              {scheme.kannada_name && (
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  {scheme.kannada_name}
                </p>
              )}

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {scheme.description}
              </p>

              {/* Eligibility & Required Documents */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Department: </span>
                  <span className="text-slate-600">{scheme.department}</span>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Income Criteria: </span>
                  <span className="text-slate-600">
                    {scheme.income_limit_display || (scheme.income_limit > 0 ? `Up to Rs. ${scheme.income_limit.toLocaleString()}/year` : 'Standard welfare criteria')}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Required Documents: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {scheme.required_documents.map((doc, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Application Deadline: </span>
                  <span className={scheme.deadline_verified ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    {scheme.application_deadline ? `${scheme.application_deadline} (Official)` : 'Open / Rolling'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span>Source: {scheme.source_of_information}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleEvaluateReadiness(scheme)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Check My Documents</span>
              </button>

              <a
                href={scheme.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <span>Portal Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
