/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { VendorItem, VendorStatus } from '../types';
import { formatMoney, toMinorUnits, toMajorUnits } from '../utils/currency';
import { INITIAL_CURATED_VENDORS } from '../data/initialData';
import {
  Users,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  CheckSquare,
  Square,
  DollarSign,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

export const VendorManager: React.FC = () => {
  const {
    activeEvent,
    activeCurrency,
    addVendor,
    updateVendor,
    deleteVendor,
  } = useEventContext();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<any>('decoration');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formQuote, setFormQuote] = useState(100000);
  const [formPaid, setFormPaid] = useState(0);
  const [formStatus, setFormStatus] = useState<VendorStatus>('quoted');
  const [formNotes, setFormNotes] = useState('');

  if (!activeEvent) {
    return (
      <div className="py-20 text-center text-slate-500">
        No active event selected. Please select an event first.
      </div>
    );
  }

  // Combined list of active event vendors + ability to import curated sample vendors
  const eventVendors = activeEvent.vendors;

  const filteredVendors = categoryFilter === 'all'
    ? eventVendors
    : eventVendors.filter((v) => v.category === categoryFilter);

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormName('');
    setFormCategory('decoration');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormQuote(50000);
    setFormPaid(0);
    setFormStatus('inquired');
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const vendorData = {
      name: formName.trim(),
      category: formCategory,
      contactPerson: formContactPerson.trim(),
      contactEmail: formEmail.trim(),
      contactPhone: formPhone.trim(),
      quoteMinor: toMinorUnits(formQuote),
      paidMinor: toMinorUnits(formPaid),
      status: formStatus,
      isVerified: true,
      notes: formNotes.trim(),
      contractChecklist: [
        { id: 'c1', item: 'Detailed Quote & Rider Received', completed: formStatus !== 'inquired' },
        { id: 'c2', item: 'Service Agreement Executed', completed: formStatus === 'booked' || formStatus === 'paid' },
        { id: 'c3', item: 'Initial Deposit Transferred', completed: formPaid > 0 },
      ],
    };

    if (editingVendor) {
      updateVendor(activeEvent.id, editingVendor.id, vendorData);
    } else {
      addVendor(activeEvent.id, vendorData);
    }

    setShowAddModal(false);
  };

  const toggleChecklistItem = (vendorId: string, checklistId: string) => {
    const targetVendor = eventVendors.find((v) => v.id === vendorId);
    if (!targetVendor) return;

    const updatedChecklist = targetVendor.contractChecklist.map((c) =>
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );

    updateVendor(activeEvent.id, vendorId, { contractChecklist: updatedChecklist });
  };

  const handleImportCuratedVendor = (curated: VendorItem) => {
    addVendor(activeEvent.id, {
      ...curated,
      name: `${curated.name} (${activeEvent.destinationName.split(',')[0]})`,
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-slate-900">
            Vendor Directory & Contracts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate venues, catering guilds, florists, cinematographers, and musicians.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 mr-1 hidden sm:inline">Category:</span>
        {['all', 'venue', 'catering', 'decoration', 'photography', 'entertainment', 'travel'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => {
          const balanceMinor = Math.max(0, vendor.quoteMinor - vendor.paidMinor);

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Top Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-slate-900">
                        {vendor.name}
                      </h4>
                      {vendor.isVerified && (
                        <div className="flex items-center gap-0.5 text-xs text-emerald-600" title="Verified vendor record">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 capitalize mt-0.5">
                      {vendor.category} · {vendor.contactPerson}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize ${
                      vendor.status === 'booked'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : vendor.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {vendor.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  {vendor.contactPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.contactPhone}</span>
                    </span>
                  )}
                  {vendor.contactEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.contactEmail}</span>
                    </span>
                  )}
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {vendor.notes}
                  </p>
                )}

                {/* Quote vs Paid Bar */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Agreed Quotation:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatMoney(vendor.quoteMinor, activeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Paid to Date:</span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      {formatMoney(vendor.paidMinor, activeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 font-semibold text-slate-900">
                    <span>Outstanding Balance:</span>
                    <span className={balanceMinor > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      {formatMoney(balanceMinor, activeCurrency)}
                    </span>
                  </div>
                </div>

                {/* Contract Checklist */}
                {vendor.contractChecklist && vendor.contractChecklist.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Contract Deliverables
                    </span>
                    <div className="space-y-1">
                      {vendor.contractChecklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem(vendor.id, item.id)}
                          className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-950 w-full text-left"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={item.completed ? 'line-through text-slate-400' : ''}>
                            {item.item}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    const newStatus: VendorStatus =
                      vendor.status === 'inquired'
                        ? 'quoted'
                        : vendor.status === 'quoted'
                        ? 'booked'
                        : 'paid';
                    updateVendor(activeEvent.id, vendor.id, { status: newStatus });
                  }}
                  className="text-xs font-medium text-slate-700 hover:text-slate-950"
                >
                  Advance Stage →
                </button>

                <button
                  onClick={() => deleteVendor(activeEvent.id, vendor.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Remove Vendor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-serif font-bold text-slate-900">
            No vendors registered in this category yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You can add your own vendors or import verified luxury suppliers from our directory.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {INITIAL_CURATED_VENDORS.slice(0, 2).map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleImportCuratedVendor(sample)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Import {sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Register New Vendor
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Royal Mewar Florals"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 capitalize font-medium"
                  >
                    <option value="venue">Venue</option>
                    <option value="catering">Catering</option>
                    <option value="decoration">Decoration & Stage</option>
                    <option value="photography">Photography</option>
                    <option value="entertainment">Entertainment & DJ</option>
                    <option value="travel">Transport & Shuttles</option>
                    <option value="accommodation">Accommodations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 capitalize font-medium"
                  >
                    <option value="inquired">Inquired</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked (Deposit Paid)</option>
                    <option value="paid">Fully Settled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98290 12345"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@vendor.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Quotation Amount ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formQuote}
                    onChange={(e) => setFormQuote(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tabular-nums font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Deposit Paid ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formPaid}
                    onChange={(e) => setFormPaid(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Scope Terms</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Includes setup, teardown, and sound permit clearance"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-xs"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
