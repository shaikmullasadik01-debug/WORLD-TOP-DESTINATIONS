/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { TimelineTask, TaskPriority, TaskStatus } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  User,
  Filter,
  X,
  ListFilter,
} from 'lucide-react';

export const TimelineManager: React.FC = () => {
  const {
    activeEvent,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    completedTasksCount,
    totalTasksCount,
  } = useEventContext();

  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Planning');
  const [formDeadline, setFormDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formAssignedTo, setFormAssignedTo] = useState('Lead Coordinator');

  if (!activeEvent) {
    return (
      <div className="py-20 text-center text-slate-500">
        No active event selected. Please select an event to manage its timeline.
      </div>
    );
  }

  // Today's date for overdue checks
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return activeEvent.timelineTasks
      .filter((task) => {
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
        return true;
      })
      .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [activeEvent.timelineTasks, statusFilter, priorityFilter]);

  const overdueCount = useMemo(() => {
    return activeEvent.timelineTasks.filter(
      (t) => t.status !== 'completed' && t.deadlineDate < todayStr
    ).length;
  }, [activeEvent.timelineTasks, todayStr]);

  const percentComplete = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('General');
    setFormDeadline(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setFormPriority('medium');
    setFormAssignedTo('Lead Coordinator');
    setShowAddModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const taskData = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory.trim() || 'General',
      deadlineDate: formDeadline,
      priority: formPriority,
      assignedTo: formAssignedTo.trim() || 'Unassigned',
      status: (editingTask ? editingTask.status : 'todo') as TaskStatus,
    };

    if (editingTask) {
      updateTask(activeEvent.id, editingTask.id, taskData);
    } else {
      addTask(activeEvent.id, taskData);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Milestone Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Event Timeline & Milestones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Event Date: <strong className="text-slate-900">{activeEvent.date}</strong> in {activeEvent.destinationName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Progress</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {completedTasksCount} of {totalTasksCount} completed ({percentComplete}%)
              </span>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Overdue alert if applicable */}
        {overdueCount > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You have <strong>{overdueCount} overdue task(s)</strong> that have passed their target deadlines.
            </span>
          </div>
        )}
      </div>

      {/* Filter and Task List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Status:</span>
            {(['all', 'todo', 'in_progress', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  priorityFilter === pr
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Items */}
        <div className="divide-y divide-slate-100">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.deadlineDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  isCompleted ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(activeEvent.id, task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-500 bg-white'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Clean Unboxed Metadata */}
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-medium">{task.category}</span>

                      {/* Priority Tag */}
                      <span className="text-xs text-slate-400">·</span>
                      <span
                        className={`text-xs font-semibold capitalize ${
                          task.priority === 'high'
                            ? 'text-rose-600'
                            : task.priority === 'medium'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      {isOverdue && (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          · <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums">Due {task.deadlineDate}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.assignedTo}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setFormTitle(task.title);
                      setFormDescription(task.description);
                      setFormCategory(task.category);
                      setFormDeadline(task.deadlineDate);
                      setFormPriority(task.priority);
                      setFormAssignedTo(task.assignedTo);
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(activeEvent.id, task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400">
            No tasks found matching current filters. Click "+ Add Task" to schedule key milestones.
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {editingTask ? 'Edit Task Milestone' : 'Add Milestone Task'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Taste & Select Sangeet Dessert Counters"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Instructions, contact phone numbers, or specifics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Venue, Catering, Legal"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 capitalize font-medium"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    placeholder="e.g. Bride, Groom, Lead Planner"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
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
                  {editingTask ? 'Update Milestone' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
