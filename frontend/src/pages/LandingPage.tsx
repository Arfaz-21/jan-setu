import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2, GitCompare, Volume2, ClockAlert,
  ArrowRight, ShieldCheck, Lock, CheckCircle2,
  FileText, Award, HelpCircle, Layers, Landmark
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-2">
      {/* HERO SECTION */}
      <section className="text-center py-10 sm:py-14 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 rounded-full blur-3xl -z-10 opacity-70" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-4">
          <Landmark className="w-3.5 h-3.5 text-teal-700" />
          <span>Karnataka GovTech Innovation &bull; INNOVEX Season 02</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto">
          Government Services, Made Simpler.
        </h1>
        <p className="text-lg sm:text-xl font-medium text-teal-700 mt-2">
          Prepare confidently. Understand clearly. Track responsibly.
        </p>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          JAN SETU helps Karnataka citizens prepare government applications, validate documents and understand their service rights through accessible, multilingual technology.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/documents"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Check Document Readiness</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/schemes"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition shadow-sm"
          >
            <span>Explore Schemes</span>
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Zero-registration required for synthetic demonstration &bull; No sensitive identity data retained
        </div>
      </section>

      {/* FOUR FEATURE CARDS */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">
            Engineered for Citizen Reliability
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bridging the gap between citizen documents and government approval criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Document Readiness
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects expired Form 7/F Income certificates, verifies 15-character Nadakacheri RD numbers, and previews extracted fields with OCR confidence.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Name Consistency
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Leverages RapidFuzz token matching to identify spelling variations across Caste, Aadhaar, and Income certificates (e.g. Mohd vs Mohammed) without falsely invalidating them.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Kannada Voice Guidance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empowers Kannada-first citizens with voice read-aloud explanations for correcting document flaws via modular Bhashini and browser speech synthesis.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <ClockAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">
              Sakala & Legal Appeals
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates statutory deadlines skipping non-working days. Generates formal downloadable First Appeal drafts under Section 8 of Karnataka Act 1 of 2012.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
          How JAN SETU Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="text-center p-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">
              Upload & Extract
            </h4>
            <p className="text-xs text-slate-500">
              Upload Income, Caste, or Aadhaar certificate samples. The engine masks sensitive ID numbers and extracts dates and authority details.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">
              Automated Rule Validation
            </h4>
            <p className="text-xs text-slate-500">
              Deterministic rules verify 5-year validity, cross-document name compatibility, and provide your transparent Application Readiness Score.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">
              Apply or Escalate Confidently
            </h4>
            <p className="text-xs text-slate-500">
              Navigate directly to official portals (SSP, Seva Sindhu) or generate a legally-grounded appeal draft if your Sakala service is delayed.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST & PRIVACY */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs tracking-wider uppercase">
            <Lock className="w-4 h-4" />
            <span>Built on Privacy & Safety Standards</span>
          </div>
          <h2 className="text-2xl font-bold">
            Zero-Retention Personal Data Protection
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            JAN SETU enforces explicit citizen privacy safeguards:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="flex items-start gap-2 bg-slate-800/70 p-3 rounded-lg border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>Aadhaar numbers are automatically masked (XXXX-XXXX-1234) before display or storage.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-800/70 p-3 rounded-lg border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>One-click purge removes all uploaded temporary files immediately from server disk.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-800/70 p-3 rounded-lg border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>Operates completely offline with zero dependency on paid cloud services.</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-800/70 p-3 rounded-lg border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>Transparent provenance: every check links directly to official Government Orders.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORTED SCHEMES PREVIEW */}
      <section className="text-center pb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Supported Karnataka Welfare Portals & Frameworks
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 text-xs font-semibold">
          <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">State Scholarship Portal (SSP)</span>
          <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">Seva Sindhu</span>
          <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">Nadakacheri (AJKS)</span>
          <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">Karnataka Sakala Mission</span>
          <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">Backward Classes Welfare (BCWD)</span>
        </div>
      </section>
    </div>
  );
};
