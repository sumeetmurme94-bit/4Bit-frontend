import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Clock,
  CheckCircle,
  CheckSquare,
  BarChart3,
  Filter,
  Search,
  Eye,
  Check,
  Siren,
  Building,
  RotateCcw,
  Flame,
  Stethoscope,
  ArrowRight,
  UserCheck,
  FileCheck2,
  Sparkles,
  AlertTriangle,
  Play,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Complaint, StaffRole, EvidenceData } from '../types/complaint';
import { INITIAL_COMPLAINTS } from '../data/mockComplaints';
import { STATUS_STATES } from '../types/status';
import { UploadEvidenceModal } from '../components/dashboard/UploadEvidenceModal';
import { ReviewEvidenceModal } from '../components/dashboard/ReviewEvidenceModal';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../components/layout/Header';

export interface DashboardPageProps {
  currentRole?: StaffRole;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedUnit?: string;
  onSelectUnit?: (unit: string) => void;
}

const ALL_DEPARTMENTS = [
  'Sanitation & Maintenance',
  'Clinical & Nursing',
  'Radiology & Diagnostics',
  'Pharmacy & Medical Supplies',
  'Administration & Billing',
];

const SANITATION_TEAM_MEMBERS = [
  { name: 'Ramesh K.', role: 'Sanitation Officer', shift: 'Morning Shift', avatarColor: 'bg-teal-600' },
  { name: 'Suresh Gowda', role: 'Plumbing Specialist', shift: 'On Call', avatarColor: 'bg-sky-600' },
  { name: 'Karthik S.', role: 'Duty Electrician', shift: 'Morning Shift', avatarColor: 'bg-indigo-600' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentRole: propRole,
  activeTab,
  onTabChange,
  selectedUnit: propUnit,
  onSelectUnit,
}) => {
  const { currentUser } = useAuth();
  const currentRole: StaffRole = currentUser?.role || propRole || 'Ward Staff';

  // 1. Complaint State with Live Mutability
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);

  // Local unit state fallback if not passed from parent
  const [localUnit, setLocalUnit] = useState<string>('Sanitation & Maintenance');
  const selectedUnit = propUnit || localUnit;

  const handleUnitChange = (newUnit: string) => {
    if (onSelectUnit) {
      onSelectUnit(newUnit);
    } else {
      setLocalUnit(newUnit);
    }
  };

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [uploadModalComplaint, setUploadModalComplaint] = useState<Complaint | null>(null);
  const [reviewModalComplaint, setReviewModalComplaint] = useState<Complaint | null>(null);

  // Success Notification Toast state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // -------------------------------------------------------------
  // ACTIONS: Ward Staff Task Execution
  // -------------------------------------------------------------
  const handleAcknowledge = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Acknowledged',
          };
        }
        return c;
      })
    );
    showToast(`Ticket ${complaintId} acknowledged. Response SLA timer active.`);
  };

  const handleStartWork = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'In progress',
          };
        }
        return c;
      })
    );
    showToast(`Ticket ${complaintId} status updated to In Progress.`);
  };

  const handleUploadEvidenceSubmit = (complaintId: string, evidence: EvidenceData) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Evidence submitted',
            evidence,
            reworkReason: undefined,
          };
        }
        return c;
      })
    );
    showToast(`Resolution evidence & GPS audit submitted for ${complaintId}! Forwarded to Quality Review.`);
  };

  // -------------------------------------------------------------
  // ACTIONS: Department Head - Assign Staff
  // -------------------------------------------------------------
  const handleAssignStaff = (complaintId: string, staffName: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            assignedStaff: staffName,
            status: 'Assigned',
          };
        }
        return c;
      })
    );
    showToast(`Ticket ${complaintId} assigned to ${staffName}.`);
  };

  // -------------------------------------------------------------
  // ACTIONS: Administrator / Reviewer Oversight
  // -------------------------------------------------------------
  const handleApproveResolve = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Resolved',
            isOverdue: false,
          };
        }
        return c;
      })
    );
    showToast(`Complaint ${complaintId} verified and officially RESOLVED. Resolution recorded in public log.`);
  };

  const handleRejectReopen = (complaintId: string, reason: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Reopened',
            priority: 'High',
            deadline: 'Urgent Rework Required',
            reworkReason: reason,
          };
        }
        return c;
      })
    );
    showToast(`Complaint ${complaintId} REJECTED and returned for rework: "${reason}".`, 'alert');
  };

  const handleEscalateToSuperintendent = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Escalated',
            priority: 'High',
            isOverdue: true,
          };
        }
        return c;
      })
    );
    showToast(`Urgent alert dispatched to Medical Superintendent for ticket ${complaintId}!`, 'alert');
  };

  const handleResetData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    showToast('Mock data engine reset to initial state.');
  };

  // -------------------------------------------------------------
  // STRICT ROLE-BASED ACCESS CONTROL (RBAC) SCOPING
  // -------------------------------------------------------------
  // 1. Ward Staff: Highly restricted execution view. Show ONLY tickets assigned directly to them!
  const wardStaffComplaints = complaints.filter((c) => {
    const staffName = currentUser?.name || 'Ramesh';
    const firstName = staffName.split(' ')[0];
    return !!c.assignedStaff && c.assignedStaff.toLowerCase().includes(firstName.toLowerCase());
  });

  // 2. Department Head: Restricted to their selected department.
  const deptHeadComplaints = complaints.filter(
    (c) => c.assignedDepartment === selectedUnit
  );

  // Department unassigned tickets (no assignedStaff or empty)
  const deptUnassignedComplaints = deptHeadComplaints.filter(
    (c) => !c.assignedStaff || c.assignedStaff.trim() === ''
  );

  // Department reviews queue (evidence submitted or under verification)
  const deptReviewComplaints = deptHeadComplaints.filter(
    (c) => c.status === 'Evidence submitted' || c.status === 'Under verification'
  );

  // 3. Hospital Administrator: Global access across all departments
  const hospitalEscalationQueue = complaints.filter(
    (c) => c.status === 'Escalated' || c.isOverdue
  );

  const centralHumanReviewQueue = complaints.filter(
    (c) => (c.status === 'Evidence submitted' || c.status === 'Under verification') && c.evidence
  );

  // Active dataset based on role
  const roleBaseComplaints =
    currentRole === 'Ward Staff'
      ? wardStaffComplaints
      : currentRole === 'Department Head'
      ? deptHeadComplaints
      : complaints;

  // Filtered dataset after search and dropdowns
  const displayedComplaints = roleBaseComplaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesDept =
      currentRole !== 'Hospital Administrator' || departmentFilter === 'All'
        ? true
        : c.assignedDepartment === departmentFilter;
    const matchesQuery =
      searchQuery === '' ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedStaff && c.assignedStaff.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.assignedDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDept && matchesQuery;
  });

  // Department Head tab determination: mutually exclusive ('grievances' vs 'workload')
  const isDeptHeadGrievancesTab = activeTab === 'grievances' || activeTab === 'tasks';
  const isDeptHeadWorkloadTab = activeTab === 'workload' || activeTab === 'overview';

  // Hospital Administrator active view state: mutually exclusive ('overview' vs 'escalations')
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'escalations'>(
    activeTab === 'escalations' ? 'escalations' : 'overview'
  );

  // Synchronize when parent activeTab changes (e.g. via mobile bottom nav)
  React.useEffect(() => {
    if (activeTab === 'escalations') {
      setActiveAdminTab('escalations');
    } else if (activeTab === 'overview' || activeTab === 'tasks') {
      setActiveAdminTab('overview');
    }
  }, [activeTab]);

  const handleAdminTabChange = (tab: 'overview' | 'escalations') => {
    setActiveAdminTab(tab);
    onTabChange(tab);
  };

  const isAdminEscalationsTab = activeAdminTab === 'escalations';
  const isAdminOverviewTab = activeAdminTab === 'overview';

  // Helper renderer for the Data Table
  const renderGrievancesTable = () => (
    <Card variant="default" padding="none">
      {/* Table Search & Status Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              aria-label="Search grievances"
              placeholder="Search ticket ID, ward, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Status:</span>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 cursor-pointer"
            >
              <option value="All">All Statuses ({roleBaseComplaints.length})</option>
              {STATUS_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter (Visible ONLY for Hospital Administrator) */}
          {currentRole === 'Hospital Administrator' && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Dept:</span>
              <select
                aria-label="Filter by department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {ALL_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs font-medium text-slate-500 flex items-center gap-3">
          <span>
            Showing <strong>{displayedComplaints.length}</strong> of {roleBaseComplaints.length} complaints
          </span>
          {(statusFilter !== 'All' || departmentFilter !== 'All' || searchQuery !== '') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setDepartmentFilter('All');
                setSearchQuery('');
              }}
              className="text-hospital-700 font-bold hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table with STICKY Operational Actions Column */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-stone-100/90 border-b border-stone-200 text-xs uppercase font-bold text-stone-700 tracking-wider">
              <th className="py-4 px-6">ID &amp; Patient Voice Summary</th>
              <th className="py-4 px-6">Location &amp; Category</th>
              <th className="py-4 px-6">Assigned Dept / Staff</th>
              <th className="py-4 px-6">Status State</th>
              <th className="py-4 px-6">SLA Deadline</th>
              {/* Sticky Right-Most Column Header */}
              <th className="py-4 px-6 text-right sticky right-0 bg-stone-100 z-20 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)] border-b border-stone-200 border-l border-stone-200/50">
                Operational Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {displayedComplaints.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 px-6">
                  <EmptyState
                    title="All caught up! No pending grievances here."
                    description="No grievances found matching the selected filter criteria."
                  />
                </td>
              </tr>
            ) : (
              displayedComplaints.map((item) => {
                const canAcknowledge = item.status === 'Assigned' || item.status === 'Received';
                const canStartWork = item.status === 'Acknowledged';
                const canMarkDone =
                  item.status === 'In progress' ||
                  item.status === 'Acknowledged' ||
                  item.status === 'Reopened';
                const hasEvidenceToReview =
                  item.evidence !== undefined &&
                  (item.status === 'Evidence submitted' || item.status === 'Under verification');

                const wardName = item.ward || item.wardArea || 'General Ward';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/70 transition-colors group"
                  >
                    {/* ID & Spoken Summary */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-950 text-sm">
                          {item.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                          {item.language}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900 mt-1 line-clamp-2">
                        {item.summary}
                      </p>
                      {item.transcript && (
                        <p className="text-[11px] text-stone-500 mt-0.5 italic line-clamp-1">
                          &quot;{item.transcript}&quot;
                        </p>
                      )}
                      {/* Rework Reason Callout */}
                      {item.reworkReason && (
                        <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800 text-xs space-y-0.5">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 block flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Rework Requested
                          </span>
                          <span className="font-medium text-[11px] line-clamp-2">
                            &quot;{item.reworkReason}&quot;
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Location & Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-stone-800 text-xs sm:text-sm">
                        {wardName}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {item.category}
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 mt-1 rounded text-[11px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </td>

                    {/* Assigned Dept & Staff */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-xs font-bold text-stone-800">
                        {item.assignedDepartment}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <span>Staff:</span>
                        <span className="font-bold text-stone-800">
                          {item.assignedStaff || (
                            <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                              Unassigned
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={item.status} size="md" showDot={true} />
                    </td>

                    {/* Deadline / SLA */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span
                          className={
                            item.isOverdue ? 'text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60' : 'text-stone-600 font-medium'
                          }
                        >
                          {item.deadline}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Logged: {item.timestamp}
                      </div>
                    </td>

                    {/* Sticky Right-Most Operational Actions Cell */}
                    <td className="py-4 px-6 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-stone-50/90 z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)] border-l border-stone-100 transition-colors">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* ========================================= */}
                        {/* WARD STAFF ACTIONS (Strict Proof-of-Work) */}
                        {/* ========================================= */}
                        {currentRole === 'Ward Staff' && (
                          <>
                            {canAcknowledge && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAcknowledge(item.id)}
                                leftIcon={<Check className="w-4 h-4" />}
                                className="bg-emerald-900 hover:bg-emerald-800 text-stone-50 font-bold transition-colors duration-300"
                              >
                                Acknowledge
                              </Button>
                            )}

                            {canStartWork && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartWork(item.id)}
                                leftIcon={<Play className="w-3.5 h-3.5" />}
                                className="text-stone-800 border-stone-300 hover:border-emerald-800 hover:text-emerald-900 hover:bg-stone-50 transition-colors duration-300"
                              >
                                Start Work
                              </Button>
                            )}

                            {/* MANDATORY PROOF-OF-WORK GATE: "Mark as Done" */}
                            {canMarkDone && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setUploadModalComplaint(item)}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                                className="bg-emerald-900 hover:bg-emerald-800 text-stone-50 font-bold shadow-sm transition-colors duration-300"
                              >
                                Mark as Done
                              </Button>
                            )}

                            {/* If evidence is already submitted */}
                            {(item.status === 'Evidence submitted' || item.status === 'Under verification') && (
                              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                                Proof Staged &bull; In QA Review
                              </span>
                            )}
                          </>
                        )}

                        {/* ========================================= */}
                        {/* DEPARTMENT HEAD & ADMIN: Review Evidence  */}
                        {/* ========================================= */}
                        {(currentRole === 'Hospital Administrator' || currentRole === 'Department Head') &&
                          hasEvidenceToReview && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setReviewModalComplaint(item)}
                              leftIcon={<Eye className="w-4 h-4" />}
                              className="bg-emerald-900 hover:bg-emerald-800 text-stone-50 font-bold shadow-sm transition-colors duration-300 border border-emerald-900"
                            >
                              Review Evidence
                            </Button>
                          )}

                        {/* DEPARTMENT HEAD: Quick Assign if unassigned */}
                        {currentRole === 'Department Head' && !item.assignedStaff && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignStaff(item.id, 'Ramesh K. (Sanitation Officer)')}
                            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                            className="text-amber-800 border-amber-200/60 hover:bg-amber-50 font-semibold transition-colors duration-300"
                          >
                            Quick Assign
                          </Button>
                        )}

                        {/* HOSPITAL ADMIN: Direct Escalate */}
                        {currentRole === 'Hospital Administrator' &&
                          item.status !== 'Escalated' &&
                          item.status !== 'Resolved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEscalateToSuperintendent(item.id)}
                              className="text-amber-700 hover:text-amber-900 hover:bg-amber-50/80"
                            >
                              Dispatch Alert
                            </Button>
                          )}

                        {/* Viewing already resolved audit record */}
                        {item.status === 'Resolved' && item.evidence && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewModalComplaint(item)}
                            leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-800" />}
                            className="text-xs"
                          >
                            View Audit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 min-h-[500px]">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-24 md:bottom-8 right-4 sm:right-8 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-sm font-bold animate-bounce max-w-md ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/40'
              : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{notification.message}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. ROLE-BASED ACCESS CONTROL (RBAC) HEADER & SYNCHRONIZED STATE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-950 border border-emerald-200">
                RBAC Access Tier: {currentRole}
              </span>
              <span className="text-xs text-stone-500 font-mono hidden sm:inline">
                Terminal ID: #CGH-GATE-4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <span>{currentUser?.name || 'Authorized Staff'}</span>
              <span className="text-sm font-semibold text-stone-500 font-mono">
                ({currentUser?.staffId || 'ID-AUTH'})
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-3xl">
              {currentRole === 'Ward Staff' && (
                <span>
                  <strong>Strict Execution View:</strong> Scoped strictly to tickets assigned directly to you ({currentUser?.name}). You cannot view other departments or other staff&apos;s assignments.
                </span>
              )}
              {currentRole === 'Department Head' && (
                <span>
                  <strong>Departmental Authority:</strong> Restricted to <strong>{selectedUnit}</strong>. Oversee team workload, assign unassigned tickets, and review staff proof of work.
                </span>
              )}
              {currentRole === 'Hospital Administrator' && (
                <span>
                  <strong>Global Oversight Tier:</strong> Institutional access across all 5 hospital departments, centralized escalation queue, and master human review authority.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Synchronized Profile Header Card */}
            <div className="hidden sm:block px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-right">
              <div className="text-xs font-bold text-stone-900">
                Operational Unit: {currentRole === 'Hospital Administrator' ? 'All Hospital Departments' : selectedUnit}
              </div>
              <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                Shift: {currentUser?.shift || 'Active Shift'}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-200 flex items-center justify-center font-bold text-sm shadow-xs border border-emerald-800">
              {(currentUser?.name || 'U').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Sub-bar with Dynamic Operational Unit Dropdown & Reset */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-800">Operational Unit:</span>
            <span className="bg-stone-100 px-2.5 py-0.5 rounded-lg font-bold text-stone-900 border border-stone-200">
              {currentRole === 'Hospital Administrator'
                ? 'All Hospital Departments (Global)'
                : selectedUnit}
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-stone-500">
              Shift: <strong>{currentUser?.shift || 'Active Shift'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {currentRole === 'Department Head' && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-700">Change Unit:</span>
                <select
                  aria-label="Managed operational unit"
                  value={selectedUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer shadow-2xs"
                >
                  {ALL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1 font-bold text-stone-600 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data State</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* ROLE 1: HOSPITAL ADMINISTRATOR GLOBAL ACCESS SECTIONS         */}
      {/* ============================================================= */}
      {currentRole === 'Hospital Administrator' && (
        <div className="space-y-6 min-h-[500px]">
          {/* Hospital Administrator Mutually Exclusive Tab Selector */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/90 gap-1.5 shadow-2xs">
              {/* Tab 1: All Departments */}
              <button
                type="button"
                onClick={() => handleAdminTabChange('overview')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isAdminOverviewTab
                    ? 'bg-emerald-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 bg-transparent hover:bg-stone-200/70'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>All Departments</span>
              </button>

              {/* Tab 2: Escalation Queue */}
              <button
                type="button"
                onClick={() => handleAdminTabChange('escalations')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isAdminEscalationsTab
                    ? 'bg-emerald-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 bg-transparent hover:bg-stone-200/70'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500/80" />
                <span>Escalation Queue</span>
                {hospitalEscalationQueue.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdminEscalationsTab
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {hospitalEscalationQueue.length}
                  </span>
                )}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500">
              <ShieldAlert className="w-4 h-4 text-emerald-800" />
              <span>Administrative Oversight Mode</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isAdminEscalationsTab ? (
              <motion.div
                key="admin-escalations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-6 min-h-[500px]"
              >
                {/* 1.1 HOSPITAL-WIDE ESCALATION QUEUE */}
                <section
                  aria-labelledby="admin-escalation-title"
                  className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-stone-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-xs shrink-0 border border-amber-200/60">
                        <Siren className="w-7 h-7 text-amber-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2
                            id="admin-escalation-title"
                            className="text-xl sm:text-2xl font-black uppercase tracking-tight text-stone-50"
                          >
                            Hospital-Wide Escalation Queue
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            {hospitalEscalationQueue.length} CRITICAL SLA BREACHES
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-300 font-medium">
                          Critical patient complaints that have breached departmental SLA across any hospital ward.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-200/90 bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-700">
                        Superintendent Hotline: Active
                      </span>
                    </div>
                  </div>

                  {/* Escalation Cards Grid with Staggered Framer Motion Animation */}
                  {hospitalEscalationQueue.length === 0 ? (
                    <div className="bg-stone-900/50 rounded-2xl p-8 text-center text-stone-300 border border-stone-800">
                      <EmptyState
                        title="No active escalation breaches!"
                        description="All hospital grievances are currently operating within target SLA windows."
                      />
                    </div>
                  ) : (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"
                    >
                      {hospitalEscalationQueue.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: {
                              opacity: 1,
                              y: 0,
                              transition: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 24,
                              },
                            },
                          }}
                          className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 hover:border-amber-400/30 transition space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-200/90 text-sm">{item.id}</span>
                            <div className="flex items-center gap-1.5">
                              {item.overdueDuration && (
                                <span className="px-2 py-0.5 rounded bg-amber-50 text-[11px] font-bold font-mono text-amber-700 border border-amber-200/60 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-amber-600" />
                                  {item.overdueDuration}
                                </span>
                              )}
                              <StatusBadge status={item.status} size="sm" showDot={true} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] uppercase tracking-wider text-amber-200/90 font-bold block truncate">
                              {item.ward || item.wardArea} &bull; {item.assignedDepartment}
                            </span>
                            <p className="text-sm font-bold text-stone-100 line-clamp-2">
                              &quot;{item.summary}&quot;
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs gap-2">
                            <span className="text-stone-300 font-medium truncate">
                              Staff: {item.assignedStaff || 'Unassigned'}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.evidence ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setReviewModalComplaint(item)}
                                  className="text-xs py-1 px-3.5 h-8 bg-emerald-900 hover:bg-emerald-800 text-stone-50 transition-colors duration-300 border border-emerald-900 font-bold"
                                >
                                  Review Proof
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEscalateToSuperintendent(item.id)}
                                  className="text-xs py-1 px-3.5 h-8 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors duration-300 font-bold"
                                >
                                  Dispatch Alert
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="admin-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-8 min-h-[500px]"
              >
                {/* 1.2 ALL DEPARTMENTS OVERVIEW GRID */}
                <section aria-labelledby="all-departments-title" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 id="all-departments-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Hospital Departments Overview
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Cross-departmental operational health, workload volume, and SLA resolution rates.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {ALL_DEPARTMENTS.length} Hospital Services
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ALL_DEPARTMENTS.map((dept) => {
                      const deptComplaintsList = complaints.filter((c) => c.assignedDepartment === dept);
                      const deptOverdue = deptComplaintsList.filter((c) => c.isOverdue || c.status === 'Escalated').length;
                      const deptResolved = deptComplaintsList.filter((c) => c.status === 'Resolved').length;
                      const deptPending = deptComplaintsList.length - deptResolved;

                      return (
                        <Card
                          key={dept}
                          variant="interactive"
                          padding="md"
                          onClick={() => {
                            setDepartmentFilter(dept);
                          }}
                          className={`space-y-3 ${
                            departmentFilter === dept ? 'ring-2 ring-emerald-900 bg-emerald-50/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-stone-600 tracking-wider">
                              Operational Unit
                            </span>
                            {deptOverdue > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                {deptOverdue} Overdue
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                            {dept}
                          </h3>

                          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-stone-100">
                            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                              <div className="text-base font-bold text-stone-800">{deptComplaintsList.length}</div>
                              <div className="text-[10px] text-stone-500 font-semibold uppercase">Total</div>
                            </div>
                            <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                              <div className="text-base font-bold text-amber-800">{deptPending}</div>
                              <div className="text-[10px] text-amber-700 font-semibold uppercase">Pending</div>
                            </div>
                            <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60">
                              <div className="text-base font-bold text-emerald-900">{deptResolved}</div>
                              <div className="text-[10px] text-emerald-800 font-semibold uppercase">Resolved</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold pt-1">
                            <span>{departmentFilter === dept ? 'Filtering below' : 'Filter complaints'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </section>

                {/* 1.3 CENTRAL HUMAN REVIEW QUEUE */}
                <section aria-labelledby="central-review-title" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 id="central-review-title" className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                        <FileCheck2 className="w-6 h-6 text-emerald-800" />
                        <span>Central Human Review Queue</span>
                      </h2>
                      <p className="text-xs text-stone-500 font-medium">
                        Hospital-wide queue of resolution evidence awaiting authorized administrative approval.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300">
                      {centralHumanReviewQueue.length} Pending Review
                    </span>
                  </div>

                  {centralHumanReviewQueue.length === 0 ? (
                    <EmptyState
                      title="All caught up! No pending reviews."
                      description="No pending verification gates across hospital services."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {centralHumanReviewQueue.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3.5 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-emerald-950 text-sm">
                                {item.id}
                              </span>
                              <StatusBadge status={item.status} size="sm" showDot={true} />
                            </div>

                            <div className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                              {item.ward || item.wardArea} &bull; {item.assignedDepartment}
                            </div>

                            <p className="text-sm font-bold text-stone-900 leading-snug">
                              &quot;{item.summary}&quot;
                            </p>

                            {/* AI Advisory Match Preview Strip */}
                            {item.evidence?.aiAssessment && (
                              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                                <div className="flex items-center justify-between font-bold text-emerald-950">
                                  <span className="flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                                    {item.evidence.aiAssessment.matchHeadline}
                                  </span>
                                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-950 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                                    {item.evidence.aiAssessment.confidence}% Match
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-700 line-clamp-1">
                                  Staff Note: &quot;{item.evidence.resolutionNote}&quot;
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                            <span className="text-xs text-stone-500 font-medium">
                              By: <strong>{item.evidence?.staffName}</strong> ({item.evidence?.submittedAt})
                            </span>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setReviewModalComplaint(item)}
                              leftIcon={<Eye className="w-4 h-4" />}
                              className="bg-emerald-900 hover:bg-emerald-800 text-stone-50 font-bold transition-colors duration-300 shadow-sm"
                            >
                              Review &amp; Authorize
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 1.4 Global Complaints Table */}
                {renderGrievancesTable()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================================= */}
      {/* ROLE 2: DEPARTMENT HEAD MUTUALLY EXCLUSIVE TABS & SECTIONS     */}
      {/* ============================================================= */}
      {currentRole === 'Department Head' && (
        <div className="space-y-6 min-h-[500px]">
          {/* Task 2: Main Body Tab Selector (Properly Bound to activeTab: 'grievances' vs 'workload') */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/90 gap-1.5 shadow-2xs">
              {/* Tab 1: Department Grievances */}
              <button
                type="button"
                onClick={() => onTabChange('grievances')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isDeptHeadGrievancesTab
                    ? 'bg-emerald-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 bg-transparent hover:bg-stone-200/70'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Department Grievances</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isDeptHeadGrievancesTab
                      ? 'bg-white/20 text-stone-50'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {deptHeadComplaints.filter((c) => c.status !== 'Resolved').length}
                </span>
              </button>

              {/* Tab 2: Team Workload */}
              <button
                type="button"
                onClick={() => onTabChange('workload')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isDeptHeadWorkloadTab
                    ? 'bg-emerald-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 bg-transparent hover:bg-stone-200/70'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team Workload</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isDeptHeadWorkloadTab
                      ? 'bg-white/20 text-stone-50'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {SANITATION_TEAM_MEMBERS.length}
                </span>
              </button>
            </div>

            <div className="text-xs text-stone-500 font-medium hidden md:block">
              Operational Unit: <strong className="text-stone-900">{selectedUnit}</strong>
            </div>
          </div>

          {/* Task 3: Smooth Rendering via AnimatePresence & soft fade motion.div with min-h-[500px] */}
          <AnimatePresence mode="wait">
            {/* TAB CONTENT A: TEAM WORKLOAD ONLY (When Workload Tab Active) */}
            {isDeptHeadWorkloadTab && (
              <motion.div
                key={`workload-${selectedUnit}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 min-h-[500px]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="team-workload-title" className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                      <Users className="w-6 h-6 text-emerald-900" />
                      <span>{selectedUnit} &bull; Team Workload Distribution</span>
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">
                      Direct supervisory monitoring of staff assignments, active shifts, and capacity.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-stone-100 text-stone-800 px-3 py-1 rounded-full border border-stone-200">
                    Active Duty Scope
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SANITATION_TEAM_MEMBERS.map((member) => {
                    const assignedTickets = deptHeadComplaints.filter(
                      (c) => c.assignedStaff && c.assignedStaff.includes(member.name.split(' ')[0])
                    );
                    const activeCount = assignedTickets.filter((c) => c.status !== 'Resolved').length;
                    const resolvedCount = assignedTickets.filter((c) => c.status === 'Resolved').length;

                    return (
                      <div
                        key={member.name}
                        className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                            >
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-stone-900">{member.name}</h3>
                              <p className="text-[11px] text-stone-500 font-medium">{member.role}</p>
                            </div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-600" title="Active on shift" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-stone-100 text-xs">
                          <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                            <div className="text-base font-bold text-amber-800">{activeCount}</div>
                            <div className="text-[10px] text-amber-700 font-semibold uppercase">Active</div>
                          </div>
                          <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60">
                            <div className="text-base font-bold text-emerald-900">{resolvedCount}</div>
                            <div className="text-[10px] text-emerald-800 font-semibold uppercase">Resolved</div>
                          </div>
                        </div>

                        <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
                          <span>Shift: {member.shift}</span>
                          <span className="font-mono font-bold text-stone-700">
                            {activeCount > 2 ? 'High Load' : 'Optimal'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Unassigned Pool Summary Card */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-amber-700" />
                        <h3 className="font-bold text-sm text-amber-900">Unassigned Pool</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                        {deptUnassignedComplaints.length} Tickets
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/90 font-medium leading-relaxed">
                      Patient voice grievances awaiting dispatch to duty staff.
                    </p>
                    <button
                      type="button"
                      onClick={() => onTabChange('grievances')}
                      className="text-xs font-bold text-amber-800 hover:underline text-left pt-2 border-t border-amber-200/60 flex items-center justify-between cursor-pointer"
                    >
                      <span>Switch to Grievances Tab to Assign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT B: DEPARTMENT GRIEVANCES ONLY (When Grievances Tab Active) */}
            {isDeptHeadGrievancesTab && (
              <motion.div
                key={`grievances-${selectedUnit}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 min-h-[500px]"
              >
                {/* 2.2 UNASSIGNED TICKETS QUEUE */}
                <section aria-labelledby="unassigned-tickets-title" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 id="unassigned-tickets-title" className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-amber-700" />
                        <span>Unassigned Grievances in {selectedUnit}</span>
                      </h2>
                      <p className="text-xs text-stone-500 font-medium">
                        Assign incoming patient complaints directly to duty staff.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      {deptUnassignedComplaints.length} Needing Assignment
                    </span>
                  </div>

                  {deptUnassignedComplaints.length === 0 ? (
                    <EmptyState
                      title="All caught up! No pending grievances here."
                      description={`No unassigned tickets in ${selectedUnit}. All incoming grievances are currently allocated.`}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deptUnassignedComplaints.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-5 border border-amber-200/60 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-900 text-sm">{item.id}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/60">
                              {item.priority} Priority
                            </span>
                          </div>

                          <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                            Location: {item.ward || item.wardArea}
                          </div>

                          <p className="text-sm font-bold text-stone-900 leading-snug">
                            &quot;{item.summary}&quot;
                          </p>

                          {item.transcript && (
                            <p className="text-xs text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                              Transcript ({item.language}): &quot;{item.transcript}&quot;
                            </p>
                          )}

                          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="text-xs font-bold text-stone-700">Assign to Duty Staff:</span>
                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                              <select
                                aria-label={`Assign staff for ${item.id}`}
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignStaff(item.id, e.target.value);
                                  }
                                }}
                                className="bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer flex-1 sm:flex-initial"
                              >
                                <option value="" disabled>
                                  Select team member...
                                </option>
                                {SANITATION_TEAM_MEMBERS.map((m) => (
                                  <option key={m.name} value={`${m.name} (${m.role})`}>
                                    {m.name} ({m.role})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 2.3 DEPARTMENT-SPECIFIC REVIEWS QUEUE */}
                <section aria-labelledby="dept-reviews-title" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 id="dept-reviews-title" className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                        <FileCheck2 className="w-6 h-6 text-emerald-800" />
                        <span>{selectedUnit} &bull; Proof-of-Work Reviews</span>
                      </h2>
                      <p className="text-xs text-stone-500 font-medium">
                        Review photographic evidence and GPS telemetry submitted by your unit&apos;s staff.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300">
                      {deptReviewComplaints.length} Pending
                    </span>
                  </div>

                  {deptReviewComplaints.length === 0 ? (
                    <EmptyState
                      title="All caught up! No pending reviews."
                      description={`No tickets currently awaiting verification in ${selectedUnit}.`}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deptReviewComplaints.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-emerald-950 text-sm">{item.id}</span>
                              <StatusBadge status={item.status} size="sm" showDot={true} />
                            </div>

                            <p className="text-sm font-bold text-stone-900 leading-snug">
                              &quot;{item.summary}&quot;
                            </p>

                            {item.evidence && (
                              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                                <div className="flex items-center gap-2 text-stone-700">
                                  <span className="font-bold text-stone-900">Staff Note:</span>
                                  <span className="italic line-clamp-1">&quot;{item.evidence.resolutionNote}&quot;</span>
                                </div>
                                <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                  {item.evidence.aiAssessment.matchHeadline}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                            <span className="text-xs text-stone-500 font-medium">
                              By: <strong>{item.evidence?.staffName || item.assignedStaff}</strong>
                            </span>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setReviewModalComplaint(item)}
                              leftIcon={<Eye className="w-4 h-4" />}
                              className="bg-emerald-900 hover:bg-emerald-800 text-stone-50 font-bold shadow-sm transition-colors duration-300 border border-emerald-900"
                            >
                              Review Evidence
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 2.4 Department Grievances Table */}
                {renderGrievancesTable()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================================= */}
      {/* ROLE 3: WARD STAFF RESTRICTED EXECUTION VIEW                  */}
      {/* ============================================================= */}
      {currentRole === 'Ward Staff' && (
        <div className="space-y-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`ward-staff-${currentUser?.name || 'staff'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Staff Execution Focus Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-stone-50 rounded-3xl p-6 shadow-sm border border-emerald-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-xs shrink-0 border border-emerald-700">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black">
                        My Assigned Rectification Tasks
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-300 font-medium">
                        Restricted Execution Mode: Showing only grievances assigned directly to <strong>{currentUser?.name || 'Ramesh K.'}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-xs font-mono font-bold text-amber-200 self-start sm:self-auto">
                    Evidence Gate: MANDATORY GPS &amp; PHOTO
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed border-t border-stone-800 pt-2.5">
                  To complete any grievance, click <strong>&quot;Mark as Done&quot;</strong> to upload photographic proof and lock device GPS coordinates. Submissions are vetted by backend multimodal AI before human approval.
                </p>
              </div>

              {/* Staff KPI Counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="subtle" padding="md" className="border-l-4 border-l-emerald-900 bg-white">
                  <span className="text-[11px] font-bold uppercase text-stone-500 tracking-wider">
                    Assigned To Me
                  </span>
                  <div className="text-3xl font-extrabold text-stone-900 mt-1">
                    {wardStaffComplaints.length}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Total tickets in my queue</p>
                </Card>

                <Card variant="subtle" padding="md" className="border-l-4 border-l-amber-500/60 bg-white">
                  <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">
                    Action Required
                  </span>
                  <div className="text-3xl font-extrabold text-amber-800 mt-1">
                    {
                      wardStaffComplaints.filter(
                        (c) => c.status === 'Assigned' || c.status === 'In progress' || c.status === 'Acknowledged' || c.status === 'Reopened'
                      ).length
                    }
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Need work or evidence upload</p>
                </Card>

                <Card variant="subtle" padding="md" className="border-l-4 border-l-stone-600 bg-white">
                  <span className="text-[11px] font-bold uppercase text-stone-500 tracking-wider">
                    Awaiting QA Review
                  </span>
                  <div className="text-3xl font-extrabold text-stone-800 mt-1">
                    {
                      wardStaffComplaints.filter(
                        (c) => c.status === 'Evidence submitted' || c.status === 'Under verification'
                      ).length
                    }
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Proof uploaded &bull; with Head/Admin</p>
                </Card>

                <Card variant="subtle" padding="md" className="border-l-4 border-l-emerald-800 bg-white">
                  <span className="text-[11px] font-bold uppercase text-emerald-900 tracking-wider">
                    Verified &amp; Resolved
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-950 mt-1">
                    {wardStaffComplaints.filter((c) => c.status === 'Resolved').length}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Approved by authority</p>
                </Card>
              </div>

              {/* Main Table for Ward Staff */}
              {renderGrievancesTable()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. STRICT PROOF-OF-WORK MODAL (UploadEvidenceModal)           */}
      {/* ------------------------------------------------------------- */}
      {uploadModalComplaint && (
        <UploadEvidenceModal
          complaint={uploadModalComplaint}
          isOpen={true}
          onClose={() => setUploadModalComplaint(null)}
          onSubmitEvidence={handleUploadEvidenceSubmit}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. AI ANALYSIS & HUMAN REVIEW MODAL (ReviewEvidenceModal)     */}
      {/* ------------------------------------------------------------- */}
      {reviewModalComplaint && (
        <ReviewEvidenceModal
          complaint={reviewModalComplaint}
          isOpen={true}
          onClose={() => setReviewModalComplaint(null)}
          onApproveResolve={handleApproveResolve}
          onRejectReopen={handleRejectReopen}
        />
      )}
    </div>
  );
};

export default DashboardPage;
