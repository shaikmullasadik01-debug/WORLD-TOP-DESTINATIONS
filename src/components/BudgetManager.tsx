/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { ExpenseCategory, BudgetItem } from '../types';
import { formatMoney, toMinorUnits, toMajorUnits } from '../utils/currency';
import {
  DollarSign,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  PieChart,
  ShieldAlert,
  Edit2,
  X,
} from 'lucide-react';

export const BudgetManager: React.FC = () => {
  const {
    activeEvent,
    activeCurrency,
    totalEstimatedMinor,
    totalActualMinor,
    totalPaidMinor,
    remainingBudgetMinor,
    isOverBudget,
    overbudgetAmountMinor,
    percentSpent,
    unpaidVendorDepositsMinor,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    updateEvent,
  } = useEventContext();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form State for Add / Edit
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('venue');
  const [formName, setFormName] = useState('');
  const [formEstimated, setFormEstimated] = useState(0);
  const [formActual, setFormActual] = useState(0);
  const [formPaid, setFormPaid] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formConfirmed, setFormConfirmed] = useState(false);

  const categories: ExpenseCategory[] = [
    'venue',
    'catering',
    'decoration',
    'photography',
    'entertainment',
    'travel',
    'accommodation',
    'invitations',
    'gifts',
    'equipment',
    'taxes_fees',
    'contingency',
  ];

  if (!activeEvent) {
    return (
      <div className="py-20 text-center text-slate-500">
        No active event selected. Please create or select an event first.
      </div>
    );
  }

  const filteredItems = useMemo(() => {
    if (filterCategory === 'all') return activeEvent.budgetItems;
    return activeEvent.budgetItems.filter((item) => item.category === filterCategory);
  }, [activeEvent.budgetItems, filterCategory]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormCategory('venue');
    setFormName('');
    setFormEstimated(50000);
    setFormActual(50000);
    setFormPaid(0);
    setFormNotes('');
    setFormConfirmed(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormEstimated(toMajorUnits(item.estimatedMinor));
    setFormActual(toMajorUnits(item.actualMinor));
    setFormPaid(toMajorUnits(item.paidMinor));
    setFormNotes(item.notes || '');
    setFormConfirmed(item.isConfirmed);
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const itemData = {
      category: formCategory,
      name: formName.trim(),
      estimatedMinor: toMinorUnits(formEstimated),
      actualMinor: toMinorUnits(formActual),
      paidMinor: toMinorUnits(formPaid),
      notes: formNotes.trim(),
      isConfirmed: formConfirmed,
    };

    if (editingItem) {
      updateBudgetItem(activeEvent.id, editingItem.id, itemData);
    } else {
      addBudgetItem(activeEvent.id, itemData);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Overview & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Target Budget</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900 tabular-nums">
            {formatMoney(activeEvent.totalBudgetMinor, activeCurrency)}
          </div>
          <div className="text-xs text-slate-400">
            Set for {activeEvent.guestCount} guests
          </div>
        </div>

        {/* Actual Committed Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Actual Committed</span>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900 tabular-nums">
            {formatMoney(totalActualMinor, activeCurrency)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">{percentSpent}%</span> of total budget
          </div>
        </div>

        {/* Remaining / Overbudget Card */}
        <div
          className={`p-5 rounded-2xl border shadow-xs space-y-1 ${
            isOverBudget
              ? 'bg-rose-50 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isOverBudget ? 'Over Budget By' : 'Remaining Budget'}</span>
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div
            className={`text-2xl font-serif font-bold tabular-nums ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {isOverBudget
              ? formatMoney(overbudgetAmountMinor, activeCurrency)
              : formatMoney(remainingBudgetMinor, activeCurrency)}
          </div>
          <div className="text-xs text-slate-500">
            {isOverBudget ? 'Action required to balance' : 'Safe headroom available'}
          </div>
        </div>

        {/* Outstanding Vendor Deposits Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Unpaid Vendor Balances</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900 tabular-nums">
            {formatMoney(unpaidVendorDepositsMinor, activeCurrency)}
          </div>
          <div className="text-xs text-slate-500">
            {formatMoney(totalPaidMinor, activeCurrency)} paid to date
          </div>
        </div>
      </div>

      {/* Overbudget Warning Banner */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-800">Budget Warning: Expenses exceed target</span>
            <p>
              Your actual committed expenses exceed your target budget by {formatMoney(overbudgetAmountMinor, activeCurrency)}.
              Consider trimming non-essential decor items or renegotiating venue buyout hours to stay on track.
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Budget Consumption</span>
          <span className="text-slate-500 font-medium tabular-nums">
            {formatMoney(totalActualMinor, activeCurrency)} / {formatMoney(activeEvent.totalBudgetMinor, activeCurrency)} ({percentSpent}%)
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-rose-500' : percentSpent > 80 ? 'bg-amber-500' : 'bg-slate-900'
            }`}
            style={{ width: `${Math.min(100, percentSpent)}%` }}
          />
        </div>
      </div>

      {/* Expense Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Filter:</span>
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({activeEvent.budgetItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense Item</span>
          </button>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Notes</th>
                <th className="py-3 px-4 text-right">Estimated</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 capitalize whitespace-nowrap">
                    {item.category.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    {item.notes && <div className="text-slate-500 text-xs truncate">{item.notes}</div>}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-600 tabular-nums whitespace-nowrap">
                    {formatMoney(item.estimatedMinor, activeCurrency)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatMoney(item.actualMinor, activeCurrency)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-700 tabular-nums whitespace-nowrap">
                    {formatMoney(item.paidMinor, activeCurrency)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block text-xs font-medium ${
                        item.isConfirmed ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {item.isConfirmed ? '✓ Confirmed' : '· Estimate'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBudgetItem(activeEvent.id, item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">
            No expense items in this category. Click "+ Add Expense Item" to track vendor costs.
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {editingItem ? 'Edit Expense Item' : 'Add Expense Item'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 capitalize"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Item / Vendor Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Clifftop Glass Chapel Buyout"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Estimated ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formEstimated}
                    onChange={(e) => setFormEstimated(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Actual ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formActual}
                    onChange={(e) => setFormActual(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tabular-nums font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Paid ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formPaid}
                    onChange={(e) => setFormPaid(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Scope Details</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Includes 50% deposit and airport ferry transfers"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confirmedCheckbox"
                  checked={formConfirmed}
                  onChange={(e) => setFormConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="confirmedCheckbox" className="text-slate-700 font-medium">
                  Confirmed quotation / Signed contract
                </label>
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
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
