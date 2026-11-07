import React from 'react';
import { CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { ReadinessScoreBreakdown } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ReadinessScoreCardProps {
  score: number;
  breakdown?: ReadinessScoreBreakdown;
  compact?: boolean;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({
  score,
  breakdown,
  compact = false
}) => {
  const { t, language } = useLanguage();

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-600 stroke-emerald-600';
    if (val >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getStatusText = (val: number) => {
    if (val >= 80) return language === 'kn' ? 'ಉತ್ತಮ ಸಿದ್ಧತೆ' : 'High Readiness';
    if (val >= 60) return language === 'kn' ? 'ಮಧ್ಯಮ ಸಿದ್ಧತೆ (ಗಮನ ಅಗತ್ಯ)' : 'Moderate Readiness (Issues Detected)';
    return language === 'kn' ? 'ಅಪೂರ್ಣ ಸಿದ್ಧತೆ' : 'Action Required';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('score_label', 'Application Readiness Score')}
            </span>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <div className="hidden group-hover:block absolute left-0 bottom-5 w-64 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-20">
                Calculated from verified document coverage, certificate expiry dates, Nadakacheri barcode checks, and cross-document name consistency.
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">
            {getStatusText(score)}
          </h3>
        </div>

        {/* Circular gauge */}
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={163.3}
                strokeDashoffset={163.3 - (163.3 * score) / 100}
                strokeLinecap="round"
                className={getScoreColor(score)}
                fill="transparent"
              />
            </svg>
            <span className="absolute text-lg font-bold text-slate-800">
              {score}%
            </span>
          </div>
        </div>
      </div>

      {!compact && breakdown && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700">Document Coverage</span>
              <span className="font-semibold text-slate-900">{breakdown.document_coverage.score}/{breakdown.document_coverage.max} pts</span>
            </div>
            <p className="text-slate-500">{breakdown.document_coverage.detail}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700">Certificate Validity</span>
              <span className={`font-semibold ${breakdown.certificate_validity.score < breakdown.certificate_validity.max ? 'text-amber-600' : 'text-emerald-700'}`}>
                {breakdown.certificate_validity.score}/{breakdown.certificate_validity.max} pts
              </span>
            </div>
            <p className="text-slate-500">{breakdown.certificate_validity.detail}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700">Name Consistency</span>
              <span className="font-semibold text-slate-900">{breakdown.name_consistency.score}/{breakdown.name_consistency.max} pts</span>
            </div>
            <p className="text-slate-500">{breakdown.name_consistency.detail}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700">Format & Aadhaar Masking</span>
              <span className="font-semibold text-slate-900">{breakdown.format_and_integrity.score}/{breakdown.format_and_integrity.max} pts</span>
            </div>
            <p className="text-slate-500">{breakdown.format_and_integrity.detail}</p>
          </div>
        </div>
      )}

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Readiness score indicates document preparedness for submission. It is calculated deterministically and does not constitute guaranteed eligibility or official government sanction.
        </span>
      </div>
    </div>
  );
};
