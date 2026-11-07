import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Calendar, AlertTriangle, CheckCircle2, ShieldCheck,
  FileText, ArrowRight, Info, PlusCircle, Search, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { SakalaServiceItem, ApplicationItem } from '../types';
import { Badge } from '../components/common/Badge';
import { useLanguage } from '../context/LanguageContext';

export const SakalaTracker: React.FC = () => {
  const { language } = useLanguage();
  const [services, setServices] = useState<SakalaServiceItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [gscNumber, setGscNumber] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [submissionDate, setSubmissionDate] = useState('2026-09-10');
  const [officeName, setOfficeName] = useState('Nadakacheri Bengaluru North');
  const [calculatedDeadline, setCalculatedDeadline] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [svc, apps] = await Promise.all([
        api.getSakalaServices(),
        api.getApplications()
      ]);
      setServices(svc);
      setApplications(apps);
      if (svc.length > 0 && !selectedServiceId) {
        setSelectedServiceId(svc[0].service_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCalculate = async () => {
    if (!submissionDate || !selectedServiceId) return;
    try {
      const res = await api.calculateDeadline({
        service_id: selectedServiceId,
        submission_date: submissionDate,
      });
      setCalculatedDeadline(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gscNumber || !selectedServiceId || !submissionDate) {
      alert('Please fill GSC Number, Service, and Submission Date.');
      return;
    }

    const svc = services.find((s) => s.service_id === selectedServiceId);
    try {
      await api.addApplication({
        gsc_number: gscNumber,
        service_id: selectedServiceId,
        service_name: svc?.service_name || 'Sakala Service',
        applicant_name: 'Mohammed Arfaz',
        submission_date: submissionDate,
        office_name: officeName,
        status: 'PENDING',
        status_source: 'MANUAL_ENTRY',
      });
      setStatusMessage(`Application ${gscNumber} tracked successfully.`);
      setGscNumber('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            Karnataka Guarantee of Services to Citizens Act, 2011
          </span>
          <span className="text-xs text-slate-400">&bull; Act 1 of 2012</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Sakala Service Deadline Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Accurately computes legal delivery deadlines excluding Sundays and 2nd/4th Saturdays as per Karnataka government service schedules.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* TRACKING INPUT & DEADLINE CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Track a Sakala Application (GSC)</span>
          </h3>

          <form onSubmit={handleRegisterApplication} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                GSC (Guarantee of Services Citizen) Number *
              </label>
              <input
                type="text"
                placeholder="e.g. REV/2026/0482910"
                value={gscNumber}
                onChange={(e) => setGscNumber(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:border-purple-500"
              />
              <span className="text-[11px] text-slate-400">
                Printed on your official Nadakacheri or Seva Sindhu acknowledgement slip.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Select Sakala Service *
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {services.map((svc) => (
                  <option key={svc.service_id} value={svc.service_id}>
                    {svc.service_name} ({svc.stipulated_timeline_days} working days)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Submission Date *
                </label>
                <input
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Taluk / Office Name
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs transition"
              >
                Register & Track
              </button>
              <button
                type="button"
                onClick={handleCalculate}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                Preview Deadline
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            Status is maintained through citizen records. No unauthorized synthetic simulation of live government databases is performed.
          </div>
        </div>

        {/* Calculated Deadline Display */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Statutory Timeline Calculation
            </h3>

            {calculatedDeadline ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Stipulated Service Timeline:</span>
                    <strong className="text-slate-900 font-mono">
                      {calculatedDeadline.stipulated_timeline_days} Working Days
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Submission Date:</span>
                    <strong className="text-slate-900">{calculatedDeadline.submission_date}</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                    <span className="font-semibold text-slate-800">Mandated Deadline Date:</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {calculatedDeadline.expected_deadline}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  calculatedDeadline.is_overdue
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {calculatedDeadline.is_overdue ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>
                      {calculatedDeadline.is_overdue
                        ? `Application Overdue by ${calculatedDeadline.overdue_days} Days`
                        : `${calculatedDeadline.remaining_days} Days Remaining within Statutory Window`}
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 leading-relaxed">
                    {calculatedDeadline.escalation_window_text}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1">
                  <div><strong>Designated Officer:</strong> {calculatedDeadline.designated_officer}</div>
                  <div><strong>First Appellate Authority:</strong> {calculatedDeadline.first_appellate_authority}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a service and date, then click &apos;Preview Deadline&apos; to view the statutory working-day timeline.
              </div>
            )}
          </div>

          {calculatedDeadline?.escalation_eligible && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/appeals"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Prepare Sakala First Appeal Draft &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* TRACKED APPLICATIONS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Citizen Tracked Applications ({applications.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click &apos;Draft Appeal&apos; on any overdue application
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">GSC Number</th>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Submission</th>
                <th className="px-4 py-3">Statutory Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {app.gsc_number}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {app.service_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {app.submission_date}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={app.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {app.expected_deadline}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge status={app.is_overdue ? 'OVERDUE' : 'PENDING'} />
                      <span className="text-[10px] text-slate-400">({app.status_source})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {app.is_overdue && (
                      <Link
                        to="/appeals"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 font-semibold"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Draft Appeal</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
