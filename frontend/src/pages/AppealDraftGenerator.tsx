import React, { useState, useEffect } from 'react';
import {
  FileText, Download, CheckCircle2, ShieldAlert,
  AlertTriangle, BookOpen, ExternalLink, Printer,
  Eye, CheckSquare, Sparkles, Scale
} from 'lucide-react';
import { api } from '../services/api';
import { LegalProvisionItem } from '../types';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';

export const AppealDraftGenerator: React.FC = () => {
  const { language } = useLanguage();
  const [provisions, setProvisions] = useState<LegalProvisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any | null>(null);

  // Form Fields
  const [gscNumber, setGscNumber] = useState('REV/2026/0482910');
  const [serviceName, setServiceName] = useState('Issue of Income Certificate (Form 7/F)');
  const [applicantName, setApplicantName] = useState('Mohammed Arfaz');
  const [applicantAddress, setApplicantAddress] = useState('No. 42, 3rd Cross, RT Nagar, Bengaluru North, Karnataka - 560032');
  const [submissionDate, setSubmissionDate] = useState('2026-09-10');
  const [deadlineDate, setDeadlineDate] = useState('2026-10-06');
  const [designatedOfficer, setDesignatedOfficer] = useState('Tahsildar / Competent Officer, Nadakacheri Bengaluru North');
  const [firstAppellateAuthority, setFirstAppellateAuthority] = useState('Assistant Commissioner, Bengaluru North Sub-Division');
  const [citizenFacts, setCitizenFacts] = useState(
    'The applicant submitted Form 7/F online with all prescribed documents on 10/09/2026. The statutory period of 21 working days lapsed on 06/10/2026. Over 30 days have elapsed without issuance, formal communication, or written justification from the Designated Officer.'
  );
  const [compensationClaimed, setCompensationClaimed] = useState(true);
  const [disclaimerAck, setDisclaimerAck] = useState(true);

  useEffect(() => {
    api.getLegalProvisions().then(setProvisions).catch(console.error);
  }, []);

  const handleGenerateAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimerAck) {
      alert('Please acknowledge that this is an informational draft and not legal advice.');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.generateAppeal({
        gsc_number: gscNumber,
        service_id: 'SAK-REV-01',
        service_name: serviceName,
        applicant_name: applicantName,
        applicant_address: applicantAddress,
        submission_date: submissionDate,
        deadline_date: deadlineDate,
        designated_officer: designatedOfficer,
        first_appellate_authority: firstAppellateAuthority,
        citizen_facts: citizenFacts,
        compensation_claimed: compensationClaimed,
        disclaimer_ack: disclaimerAck,
      });
      setGeneratedDraft(res.appeal_data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate appeal draft.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-rose-700" />
            <span>Statutory Grievance Redressal</span>
          </span>
          <span className="text-xs text-slate-400">&bull; Section 8 First Appeal</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Sakala First Appeal Draft Generator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Drafts formal appeals grounded in the Karnataka Guarantee of Services to Citizens Act, 2011 (Karnataka Act No. 01 of 2012) with compensatory claim provisions.
        </p>
      </div>

      {/* STATUTORY WARNING BANNER */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl text-xs text-amber-950 space-y-1">
        <div className="font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Statutory Notice & Citizen Non-Legal Advice Disclaimer</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          &ldquo;This is a draft for informational purposes, not legal advice. Please verify the applicable provision, competent authority and filing deadline before submission.&rdquo;
          JAN SETU never submits appeals automatically to authorities; you must review, sign, and tender the draft in person or via Seva Sindhu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* APPEAL INPUT FORM */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Appeal Particulars & Facts
          </h3>

          <form onSubmit={handleGenerateAppeal} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">GSC Number *</label>
                <input
                  type="text"
                  value={gscNumber}
                  onChange={(e) => setGscNumber(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Citizen Full Name *</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Citizen Residential Address *</label>
              <input
                type="text"
                value={applicantAddress}
                onChange={(e) => setApplicantAddress(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Service Applied For *</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Application Date *</label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Statutory Deadline *</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Defaulting Designated Officer</label>
              <input
                type="text"
                value={designatedOfficer}
                onChange={(e) => setDesignatedOfficer(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Competent First Appellate Authority</label>
              <input
                type="text"
                value={firstAppellateAuthority}
                onChange={(e) => setFirstAppellateAuthority(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Statement of Relevant Facts (Chronology of Delay) *
              </label>
              <textarea
                rows={3}
                value={citizenFacts}
                onChange={(e) => setCitizenFacts(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={compensationClaimed}
                  onChange={(e) => setCompensationClaimed(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-medium text-slate-800">
                  Claim compensatory cost under Section 13(1) (Rs. 20/day delay, payable to citizen)
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer bg-slate-50 p-2.5 rounded border border-slate-200">
                <input
                  type="checkbox"
                  checked={disclaimerAck}
                  onChange={(e) => setDisclaimerAck(e.target.checked)}
                  className="w-4 h-4 text-teal-600 mt-0.5 rounded"
                />
                <span className="text-[11px] text-slate-600">
                  I understand this draft is generated for informational guidance and I must independently verify dates and file the signed paper copy or portal appeal myself.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={generating || !disclaimerAck}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-2 text-xs"
              >
                <FileText className="w-4 h-4" />
                <span>{generating ? 'Drafting Official Appeal PDF...' : 'Generate Official Appeal Draft & PDF'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* GENERATED PREVIEW & STATUTORY CLAUSES */}
        <div className="space-y-4">
          {/* Download Action Box if draft generated */}
          {generatedDraft ? (
            <div className="bg-white p-6 rounded-xl border-2 border-emerald-500 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Appeal Draft Successfully Compiled
                  </span>
                </div>
                <a
                  href={generatedDraft.download_url}
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Formal PDF</span>
                </a>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <h5 className="font-bold text-slate-800">Next Steps for Citizen:</h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  {generatedDraft.instructions.map((inst: string, idx: number) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>

              {/* Markdown Preview Drawer */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Document Text Preview</span>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="p-4 bg-white max-h-72 overflow-y-auto text-[11px] font-mono whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {generatedDraft.markdown_preview}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center text-xs text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">
                Real-Time Statutory Legal Citations
              </h4>
              <p>
                Fill the appeal particulars on the left to compile a complete First Appeal draft under Section 8 of the Karnataka Sakala Act.
              </p>
            </div>
          )}

          {/* VERIFIED STATUTORY PROVISIONS REPOSITORY */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Verified Legal Provisions Repository (Act 1 of 2012)
            </h4>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {provisions.map((prov) => (
                <div
                  key={prov.provision_key}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {prov.provision_number}: {prov.title}
                    </span>
                    <Badge status={prov.verification_status} />
                  </div>

                  <p className="text-slate-600 text-[11px] italic">
                    &ldquo;{prov.exact_verified_text}&rdquo;
                  </p>

                  <div className="pt-1 text-[10px] text-slate-400 flex flex-wrap gap-x-2">
                    <span>Source: {prov.source_document}</span>
                    <span>&bull;</span>
                    <span>Verified: {prov.verification_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
