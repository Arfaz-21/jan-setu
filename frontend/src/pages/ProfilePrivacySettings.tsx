import React, { useState } from 'react';
import {
  User, Shield, Lock, Trash2, CheckCircle2,
  AlertTriangle, RefreshCw, EyeOff, FileText, Key
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const ProfilePrivacySettings: React.FC = () => {
  const { language } = useLanguage();
  const [purging, setPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const handlePurge = async () => {
    if (!window.confirm('Are you sure you want to purge all uploaded temporary documents and session records?')) {
      return;
    }
    setPurging(true);
    try {
      const res = await api.purgeDocuments();
      setPurgeMessage(res.message);
    } catch (err) {
      console.error(err);
      alert('Failed to purge temporary files.');
    } finally {
      setPurging(false);
    }
  };

  const handleResetDemoData = async () => {
    try {
      await api.getSamples();
      setPurgeMessage('Reset to synthetic demonstration profile (Mohammed Arfaz).');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">
          Citizen Profile & Privacy Controls
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your demonstration citizen records and manage privacy safeguards for government certificate validation.
        </p>
      </div>

      {purgeMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{purgeMessage}</span>
          </div>
          <button onClick={() => setPurgeMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* SYNTHETIC CITIZEN PROFILE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200">
              MA
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Mohammed Arfaz
              </h2>
              <span className="text-xs text-slate-400">
                Synthetic Benchmark Citizen &bull; INNOVEX Test Persona
              </span>
            </div>
          </div>

          <button
            onClick={handleResetDemoData}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            Reset Demonstration State
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400">District:</span>
            <div className="font-bold text-slate-800 text-sm mt-0.5">Bengaluru Urban</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400">Taluk:</span>
            <div className="font-bold text-slate-800 text-sm mt-0.5">Bengaluru North</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400">Category / Caste:</span>
            <div className="font-bold text-slate-800 text-sm mt-0.5">Category-II(B) OBC</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400">Annual Family Income:</span>
            <div className="font-bold text-slate-800 text-sm mt-0.5">Rs. 1,20,000</div>
          </div>
        </div>
      </div>

      {/* PRIVACY CONTROLS & EXPLICIT PURGE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <Trash2 className="w-5 h-5" />
          <h3 className="font-bold text-slate-900 text-base">
            Zero-Retention Temporary Document Storage
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In strict compliance with GovTech security guidelines, uploaded certificates are used solely to run deterministic validation in RAM/ephemeral disk. You can trigger an immediate hard purge of all temporary uploads at any moment.
        </p>

        <div className="pt-2">
          <button
            onClick={handlePurge}
            disabled={purging}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{purging ? 'Purging Files...' : 'Purge All Temporary Uploaded Files'}</span>
          </button>
        </div>
      </div>

      {/* SECURITY PRINCIPLES CHECKLIST */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-teal-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>GovTech Architecture Security Guarantees</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
          <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Aadhaar Privacy (UIDAI Section 29):</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                First 8 digits are masked immediately during OCR parsing. Raw Aadhaar numbers are never stored in plain text.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Statutory Rule Provenance:</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every validation check links directly to specific Karnataka Government Orders or Sakala notifications.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Zero External Cost / Paid API Keys:</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Runs locally using Python, SQLite, browser speech synthesis, and local RapidFuzz matching.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">No AI Black-Box Decisions:</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                LLMs are never used for determining eligibility or rejection; checks are 100% deterministic code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
