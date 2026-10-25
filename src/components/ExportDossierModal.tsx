/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useEventContext } from '../context/EventContext';
import { formatMoney } from '../utils/currency';
import { Printer, Download, X, Calendar, MapPin, Users, DollarSign, CheckCircle2 } from 'lucide-react';

interface ExportDossierModalProps {
  onClose: () => void;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({ onClose }) => {
  const {
    activeEvent,
    activeCurrency,
    totalEstimatedMinor,
    totalActualMinor,
    totalPaidMinor,
    remainingBudgetMinor,
    isOverBudget,
  } = useEventContext();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeEvent) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeEvent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeEvent.title.replace(/\s+/g, '_')}_Dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dossier-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-10 text-left my-8 print:m-0 print:p-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Client Dossier & Planning Export
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Backup</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Master Dossier Document */}
        <div className="space-y-8">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="text-xs font-serif tracking-widest uppercase text-amber-700 font-semibold mb-1">
              AI Event Planner Pro · Master Executive Dossier
            </div>
            <h1 id="export-dossier-title" className="text-3xl font-serif font-bold text-slate-950 tracking-tight">
              {activeEvent.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: {activeEvent.date}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Destination: {activeEvent.destinationName}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Headcount: {activeEvent.guestCount} Guests</span>
              </span>
            </div>
          </div>

          {/* Section 1: Executive Overview */}
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Event Architecture & Theme Direction
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Style & Atmosphere</span>
                <span className="font-semibold text-slate-900">{activeEvent.style}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Color Palette / Theme</span>
                <span className="font-semibold text-slate-900">{activeEvent.theme}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Setting</span>
                <span className="font-semibold text-slate-900 capitalize">{activeEvent.indoorOutdoor}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="font-semibold text-emerald-700 capitalize">Confirmed Planning</span>
              </div>
            </div>
            {activeEvent.dietaryPreferences && (
              <p className="text-xs text-slate-600">
                <strong>Dietary & Catering: </strong> {activeEvent.dietaryPreferences}
              </p>
            )}
          </div>

          {/* Section 2: Financial Summary & Itemized Breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Budget & Financial Ledger
            </h2>
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Target Budget</span>
                <span className="text-base font-bold text-slate-950 tabular-nums">
                  {formatMoney(activeEvent.totalBudgetMinor, activeCurrency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Committed Actual</span>
                <span className="text-base font-bold text-slate-950 tabular-nums">
                  {formatMoney(totalActualMinor, activeCurrency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Remaining / Overrun</span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    isOverBudget ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {formatMoney(remainingBudgetMinor, activeCurrency)}
                </span>
              </div>
            </div>

            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden mt-3">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-right">Estimate</th>
                  <th className="p-2.5 text-right">Actual</th>
                  <th className="p-2.5 text-right">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeEvent.budgetItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5 font-medium capitalize">{item.category.replace('_', ' ')}</td>
                    <td className="p-2.5">{item.name}</td>
                    <td className="p-2.5 text-right tabular-nums">{formatMoney(item.estimatedMinor, activeCurrency)}</td>
                    <td className="p-2.5 text-right tabular-nums font-semibold">{formatMoney(item.actualMinor, activeCurrency)}</td>
                    <td className="p-2.5 text-right tabular-nums text-emerald-700">{formatMoney(item.paidMinor, activeCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Timeline Milestones */}
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Scheduled Milestones & Key Deadlines
            </h2>
            <div className="space-y-2">
              {activeEvent.timelineTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900">{t.title}</span>
                    <div className="text-slate-500">{t.description}</div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="font-medium text-slate-700 tabular-nums">Due: {t.deadlineDate}</span>
                    <span className="block text-[11px] text-slate-400 capitalize">{t.priority} Priority · {t.assignedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Verified Vendor Directory */}
          {activeEvent.vendors.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                4. Contracted Vendors & Contacts
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeEvent.vendors.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">{v.name}</div>
                    <div className="text-slate-600 capitalize">{v.category} · Contact: {v.contactPerson}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{v.contactPhone} · {v.contactEmail}</div>
                    <div className="text-slate-800 font-semibold pt-1">
                      Quote: {formatMoney(v.quoteMinor, activeCurrency)} (Paid: {formatMoney(v.paidMinor, activeCurrency)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Sign-off */}
          <div className="pt-8 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
            <span>Prepared via AI Event Planner Pro</span>
            <span>Generated on {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
