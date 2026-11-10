import React, { useState, useId, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Lock,
  EyeOff,
  CheckCircle2,
  Clock,
  FileCheck,
  Activity,
  Sparkles,
  Wrench,
  Pill,
  FileText,
  Building2,
  AlertCircle,
  X,
  Shield,
  Layers,
  Award,
  TrendingUp,
  Info,
  MapPin,
  Filter,
  ArrowRight,
  Droplets,
  Compass,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { SatisfactionReview } from '../components/SatisfactionReview';
import {
  MOCK_PUBLIC_COMPLAINTS,
  MOCK_HOSPITAL_KPIS,
  MOCK_DEPARTMENT_METRICS,
} from '../data/mockPublicData';
import { PublicComplaintRecord, DepartmentMetric } from '../types/complaint';
import { GrievanceStatus } from '../types/status';

const STATUS_FILTER_OPTIONS = [
  'All',
  'Resolved',
  'In progress',
  'Under verification',
  'Evidence submitted',
  'Assigned',
] as const;

const CATEGORY_OPTIONS = [
  { value: 'All', label: 'All Categories' },
  { value: 'Sanitation & Hygiene', label: 'Sanitation & Hygiene' },
  { value: 'Facility Maintenance', label: 'Facility Maintenance' },
  { value: 'Patient Transport & Wheelchairs', label: 'Patient Transport & Wheelchairs' },
  { value: 'Pharmacy & Medicine Dispensing', label: 'Pharmacy & Medicine Dispensing' },
  { value: 'Administrative & Billing Desk', label: 'Administrative & Billing Desk' },
  { value: 'Drinking Water & Cafeteria', label: 'Drinking Water & Cafeteria' },
  { value: 'Signage & Wayfinding', label: 'Signage & Wayfinding' },
];

export const PublicPage: React.FC = () => {
  const searchInputId = useId();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedId, setSearchedId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<PublicComplaintRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Feed Filter States
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Department icon resolver
  const getDepartmentIcon = (iconName: DepartmentMetric['iconName']) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'wrench':
        return <Wrench className="w-5 h-5 text-sky-600" />;
      case 'pill':
        return <Pill className="w-5 h-5 text-purple-600" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-teal-600" />;
      case 'file-text':
      default:
        return <FileText className="w-5 h-5 text-indigo-600" />;
    }
  };

  // Category Icon Resolver for grievance feed cards
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('sanitation') || cat.includes('hygiene')) {
      return <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (cat.includes('facility') || cat.includes('maintenance')) {
      return <Wrench className="w-4 h-4 text-sky-600 shrink-0" />;
    }
    if (cat.includes('transport') || cat.includes('wheelchair') || cat.includes('mobility')) {
      return <Activity className="w-4 h-4 text-teal-600 shrink-0" />;
    }
    if (cat.includes('pharmacy') || cat.includes('medicine')) {
      return <Pill className="w-4 h-4 text-purple-600 shrink-0" />;
    }
    if (cat.includes('billing') || cat.includes('admin') || cat.includes('account')) {
      return <FileText className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
    if (cat.includes('water') || cat.includes('cafeteria')) {
      return <Droplets className="w-4 h-4 text-blue-600 shrink-0" />;
    }
    if (cat.includes('signage') || cat.includes('wayfinding')) {
      return <Compass className="w-4 h-4 text-amber-600/70 shrink-0" />;
    }
    return <Building2 className="w-4 h-4 text-slate-600 shrink-0" />;
  };

  // Normalize complaint ID for robust search
  const normalizeId = (raw: string): string => {
    let clean = raw.trim().toUpperCase();
    if (!clean.startsWith('#')) {
      if (!clean.startsWith('VOC-')) {
        clean = `VOC-${clean}`;
      }
      clean = `#${clean}`;
    }
    return clean;
  };

  const handleSearch = (overrideId?: string) => {
    const targetQuery = overrideId !== undefined ? overrideId : searchQuery;
    if (!targetQuery.trim()) {
      setSearchError('Please enter a Complaint ID (e.g. #VOC-8291).');
      return;
    }

    setSearchError(null);
    const normalized = normalizeId(targetQuery);
    setSearchedId(normalized);
    setHasSearched(true);

    const found = MOCK_PUBLIC_COMPLAINTS.find(
      (c) => c.id.toUpperCase() === normalized.toUpperCase()
    );

    if (found) {
      setActiveResult(found);
    } else {
      setActiveResult(null);
    }
  };

  const handleTrackFromFeed = (id: string) => {
    setSearchQuery(id);
    handleSearch(id);
    // Smooth scroll up to search results
    const el = document.getElementById('search-results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchedId(null);
    setActiveResult(null);
    setHasSearched(false);
    setSearchError(null);
  };

  // Filtered complaints for public feed
  const filteredComplaints = useMemo(() => {
    return MOCK_PUBLIC_COMPLAINTS.filter((item) => {
      // Status filter
      const matchesStatus =
        activeFilter === 'All' ||
        item.status.trim().toLowerCase() === activeFilter.trim().toLowerCase();

      // Category filter
      const matchesCategory =
        activeCategory === 'All' ||
        item.category.trim().toLowerCase() === activeCategory.trim().toLowerCase();

      return matchesStatus && matchesCategory;
    });
  }, [activeFilter, activeCategory]);

  // Count helper for status tabs
  const getStatusCount = (statusName: string) => {
    if (statusName === 'All') {
      if (activeCategory === 'All') return MOCK_PUBLIC_COMPLAINTS.length;
      return MOCK_PUBLIC_COMPLAINTS.filter(
        (c) => c.category.trim().toLowerCase() === activeCategory.trim().toLowerCase()
      ).length;
    }
    return MOCK_PUBLIC_COMPLAINTS.filter((c) => {
      const matchCat =
        activeCategory === 'All' ||
        c.category.trim().toLowerCase() === activeCategory.trim().toLowerCase();
      return matchCat && c.status.trim().toLowerCase() === statusName.trim().toLowerCase();
    }).length;
  };

  // Determine stage progress index (0 to 4) for lifecycle stepper
  const getLifecycleStage = (status: GrievanceStatus): number => {
    switch (status) {
      case 'Received':
      case 'Needs review':
        return 0;
      case 'Assigned':
      case 'Acknowledged':
        return 1;
      case 'In progress':
        return 2;
      case 'Evidence submitted':
      case 'Under verification':
        return 3;
      case 'Resolved':
        return 4;
      case 'Reopened':
      case 'Escalated':
        return 2;
      default:
        return 1;
    }
  };

  const lifecycleStages = [
    { title: 'Received', desc: 'Logged into system' },
    { title: 'Assigned', desc: 'Routed to department' },
    { title: 'In Progress', desc: 'Corrective crew active' },
    { title: 'Verification', desc: 'Supervised QA audit' },
    { title: 'Resolved', desc: 'Confirmed closed' },
  ];

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-16 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & PROMINENT ID SEARCH                                     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 w-full">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-96 bg-gradient-to-b from-hospital-50/80 via-teal-50/30 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6 w-full">
          {/* Trust Banner / Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 text-emerald-950 border border-emerald-200/80 text-xs sm:text-sm font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Public Accountability &amp; Grievance Tracking</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600/70 animate-pulse hidden sm:inline" />
            <span className="text-emerald-900 hidden sm:inline font-medium">
              100% Privacy Preserved
            </span>
          </div>

          {/* Clean Hero Heading (Task 1: Deep Emerald Green text-emerald-900) */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-900 tracking-tight leading-tight">
              Hospital Service Transparency{' '}
              <span className="text-emerald-800 underline decoration-amber-500/40 decoration-wavy decoration-2">
                Portal
              </span>
            </h1>
          </div>

          {/* Key Privacy Guardrail Commitments */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600 pt-1">
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200/90 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              Zero Patient PII Stored
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200/90 shadow-2xs">
              <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
              Voice Recordings Redacted
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200/90 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified SLA Accountability
            </span>
          </div>

          {/* Prominent Search Bar (Task 1: White data card with muted champagne ring-amber-500/40) */}
          <div className="max-w-2xl mx-auto pt-2 w-full">
            <div
              className="p-2 sm:p-2.5 bg-white border border-stone-200/90 rounded-2xl shadow-xl hover:shadow-2xl focus-within:ring-2 focus-within:ring-amber-500/40 focus-within:border-amber-400/50 transition-all w-full"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0"
              >
                <div className="relative flex-1 flex items-center min-w-0">
                  <label htmlFor={searchInputId} className="sr-only">
                    Search by Complaint ID
                  </label>
                  <Search className="w-5 h-5 text-stone-400 absolute left-3.5 pointer-events-none shrink-0" />
                  <input
                    id={searchInputId}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (searchError) setSearchError(null);
                    }}
                    placeholder="Enter Complaint ID (e.g. #VOC-8291)"
                    className="w-full pl-11 pr-9 py-3.5 text-base sm:text-lg font-mono font-medium text-slate-900 placeholder-stone-400 bg-white rounded-2xl focus:outline-none focus:ring-0 min-w-0"
                    autoComplete="off"
                    aria-describedby="search-hint"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition"
                      aria-label="Clear search input"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Search className="w-4 h-4 text-amber-600/70" />}
                  className="shrink-0 px-7 sm:px-8 py-3 text-base font-bold shadow-md w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white border border-emerald-950 hover:border-amber-500/40 rounded-xl transition-all"
                >
                  Track Status
                </Button>
              </form>
            </div>

            {searchError && (
              <p className="mt-2 text-sm text-rose-600 font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {searchError}
              </p>
            )}

            <p id="search-hint" className="mt-2 text-[11px] text-slate-500">
              Enter your unique 8-character ID (printed on your receipt or sent via SMS token) to
              track real-time status.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRIVACY-SAFE SEARCH RESULTS CARD (APPEARS WHEN SEARCHED)               */}
      {/* ========================================================================= */}
      {hasSearched && (
        <section
          id="search-results-section"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
          aria-label="Search Results"
        >
          <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Search Inquiry Result</span>
                {searchedId && (
                  <span className="font-mono text-sm font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    {searchedId}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Public Redaction Enforced
                </span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs text-hospital-600 hover:text-hospital-800 font-semibold underline underline-offset-2 ml-2"
                >
                  Close Result
                </button>
              </div>
            </div>

            {activeResult ? (
              <div className="space-y-4 w-full">
                <Card
                  variant="accent"
                  padding="none"
                  className="border-slate-200 shadow-lg overflow-hidden transition-all duration-300 w-full"
                >
                {/* Result Card Top Bar */}
                <div className="bg-slate-50/90 border-b border-slate-200 px-4 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {activeResult.id}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider bg-hospital-100 text-hospital-800 px-2.5 py-0.5 rounded-full border border-hospital-200">
                        Anonymous Token
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Logged via City General Hospital Grievance System
                    </p>
                  </div>

                  {/* Status Badge from shared component */}
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      status={activeResult.status}
                      size="lg"
                      showIcon={true}
                      showDot={true}
                    />
                  </div>
                </div>

                {/* CRUCIAL PRIVACY GUARDRAIL BANNER */}
                <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 sm:px-7 py-3 flex items-start gap-3 w-full">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-0.5 min-w-0">
                    <p className="font-bold tracking-tight">
                      PRIVACY GUARDRAIL ACTIVE &bull; NON-PII RECORD
                    </p>
                    <p className="text-emerald-800/90 leading-relaxed">
                      Patient names, telephone numbers, audio recordings, and medical details are
                      permanently stripped from public view under hospital transparency regulations.
                    </p>
                  </div>
                </div>

                {/* Core Public Metadata Grid (Responsive columns) */}
                <div className="p-4 sm:p-7 space-y-6 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                    {/* Category */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        General Category
                      </span>
                      <span className="font-bold text-slate-900 text-sm sm:text-base truncate block">
                        {activeResult.category}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Assigned Department
                      </span>
                      <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 truncate">
                        <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{activeResult.department}</span>
                      </span>
                    </div>

                    {/* Zone (High-level non-identifying) */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Campus Area / Zone
                      </span>
                      <span className="font-semibold text-slate-800 text-sm truncate block">
                        {activeResult.zone}
                      </span>
                    </div>

                    {/* Logged Date */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Registered Time
                      </span>
                      <span className="font-medium text-slate-700 text-sm flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {activeResult.loggedDate}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Last Activity
                      </span>
                      <span className="font-medium text-slate-700 text-sm truncate block">
                        {activeResult.lastUpdated}
                      </span>
                    </div>

                    {/* SLA Progress */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        SLA Target
                      </span>
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            activeResult.isResolved ? 'bg-emerald-500' : 'bg-hospital-500'
                          }`}
                        />
                        <span className="truncate">
                          {activeResult.isResolved
                            ? `Resolved in ${activeResult.elapsedHours}h (SLA: ${activeResult.slaTargetHours}h)`
                            : `Elapsed: ${activeResult.elapsedHours}h / SLA: ${activeResult.slaTargetHours}h`}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Operational Summary (strictly non-personal) */}
                  <div className="p-4 rounded-xl bg-hospital-50/60 border border-hospital-100 space-y-1.5 w-full">
                    <div className="flex items-center gap-1.5 text-hospital-800 font-bold text-xs uppercase tracking-wider">
                      <Info className="w-4 h-4 text-hospital-600 shrink-0" />
                      <span>Public Operational Progress Summary</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-normal">
                      {activeResult.publicResolutionSummary}
                    </p>
                    <p className="text-xs text-slate-500 font-medium pt-1">
                      Milestone: {activeResult.operationalMilestone}
                    </p>
                  </div>

                  {/* Lifecycle Progression Stepper (Responsive Grid) */}
                  <div className="space-y-3 pt-2 w-full">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Resolution Lifecycle Progression
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 w-full">
                      {lifecycleStages.map((stage, idx) => {
                        const currentStageIdx = getLifecycleStage(activeResult.status);
                        const isCompleted = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div
                            key={stage.title}
                            className={`p-3 rounded-xl border text-center transition-all min-w-0 ${
                              isCompleted
                                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-2xs'
                                : isCurrent
                                ? 'bg-hospital-100 border-hospital-300 text-hospital-950 ring-2 ring-hospital-400 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-1">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isCurrent ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-hospital-600 animate-ping" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300" />
                              )}
                            </div>
                            <p className="font-bold text-xs truncate">{stage.title}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {stage.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explicit Redacted Fields Visual Confirmation */}
                  <div className="border-t border-slate-200 pt-4 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 w-full">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                        <Lock className="w-3.5 h-3.5 text-hospital-600" />
                        Guaranteed Redactions:
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 line-through">
                        Patient Name
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 line-through">
                        Phone / Contact
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 line-through">
                        Voice Audio
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 line-through">
                        Medical File
                      </span>
                      <span className="text-hospital-700 font-semibold text-[11px] flex items-center gap-1 shrink-0">
                        <Shield className="w-3.5 h-3.5 text-hospital-600" />
                        100% Protected
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Task 2: Patient Satisfaction Review System (only rendered when status is Resolved) */}
              {(activeResult.status.toLowerCase() === 'resolved' || activeResult.isResolved) && (
                <SatisfactionReview
                  ticketId={activeResult.id}
                  category={activeResult.category}
                />
              )}
            </div>
          ) : (
              /* No matching ID found card */
              <Card
                variant="subtle"
                padding="lg"
                className="border-dashed border-2 border-slate-300 text-center py-10 space-y-4 w-full"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">Complaint ID Not Found</CardTitle>
                  <CardDescription className="text-slate-600">
                    We could not find any active or historical public record for{' '}
                    <code className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {searchedId}
                    </code>
                    .
                  </CardDescription>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Please verify your 8-digit tracking token printed on your receipt or received via
                  SMS. For assistance, contact the Hospital Help Desk at Gate 1.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleClearSearch}>
                    Browse Recent Updates
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. TASK 2: RECENT HOSPITAL UPDATES (PUBLIC GRIEVANCE FEED & FILTERS)       */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 w-full" aria-label="Recent Hospital Updates">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-hospital-100 text-hospital-700">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                Recent Hospital Updates
              </h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
              Live, privacy-safe public feed of verified hospital grievance tickets and current
              operational milestones. Patient identities and sensitive medical data remain strictly
              redacted.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium shrink-0 self-start sm:self-end">
            Showing <span className="font-bold text-slate-900">{filteredComplaints.length}</span> of{' '}
            <span className="font-bold text-slate-900">{MOCK_PUBLIC_COMPLAINTS.length}</span> public tickets
          </div>
        </div>

        {/* Filter Bar: Status Buttons + Category Selector (Task 2 & 3 Responsive) */}
        <div className="bg-stone-100/70 p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 space-y-3.5 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
            {/* Status Filter Buttons */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                Filter by Status:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {STATUS_FILTER_OPTIONS.map((status) => {
                  const isActive = activeFilter.toLowerCase() === status.toLowerCase();
                  const count = getStatusCount(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm ring-1 ring-emerald-800'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span>{status}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-emerald-950 text-emerald-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex flex-col gap-1.5 shrink-0 min-w-0">
              <label
                htmlFor="category-filter"
                className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block"
              >
                Filter by Category:
              </label>
              <div className="relative">
                <select
                  id="category-filter"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full md:w-64 px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 bg-white border border-stone-300 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/50 appearance-none cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Clear Indicator if filters active */}
          {(activeFilter !== 'All' || activeCategory !== 'All') && (
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-500">Active filters:</span>
                {activeFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium">
                    Status: <strong className="text-hospital-700">{activeFilter}</strong>
                  </span>
                )}
                {activeCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium">
                    Category: <strong className="text-hospital-700">{activeCategory}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('All');
                  setActiveCategory('All');
                }}
                className="text-xs text-hospital-700 hover:text-hospital-900 font-semibold underline underline-offset-2 shrink-0 ml-2"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Grievance Feed Grid (Task 3: Responsive columns grid-cols-1 md:grid-cols-2 lg:grid-cols-3) */}
        {filteredComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            {filteredComplaints.map((item) => {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card hover:border-hospital-300 transition-all duration-200 p-5 flex flex-col justify-between space-y-4 w-full min-w-0"
                >
                  {/* Card Header: Category + Status */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
                          {item.category}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        <StatusBadge status={item.status} size="sm" showIcon={true} />
                      </div>
                    </div>

                    {/* Ward / Location (Privacy Safe) */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Ward &bull; Campus Location
                      </span>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-hospital-600 shrink-0" />
                        <span className="truncate">{item.zone}</span>
                      </p>
                    </div>

                    {/* Non-PII Operational Resolution Action */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Operational Update:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                        {item.publicResolutionSummary}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Reference Token + Milestone + Action */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.id}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.lastUpdated}
                      </span>
                    </div>

                    {/* Direct Track Button */}
                    <button
                      type="button"
                      onClick={() => handleTrackFromFeed(item.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-hospital-700 bg-hospital-50 hover:bg-hospital-100 active:bg-hospital-200 py-2 rounded-xl border border-hospital-200 transition group"
                    >
                      <span>Track Lifecycle Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-hospital-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Filter State */
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3 w-full">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No Public Grievances Found Matching Selection
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no public grievance tickets with status{' '}
              <strong className="text-slate-700">"{activeFilter}"</strong> in category{' '}
              <strong className="text-slate-700">"{activeCategory}"</strong>.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveFilter('All');
                  setActiveCategory('All');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. AGGREGATE STATISTICS SECTION (HOSPITAL SERVICE PERFORMANCE)             */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        <div className="text-center sm:text-left space-y-2 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="p-1.5 rounded-lg bg-hospital-100 text-hospital-700">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
              Hospital Service Performance &amp; Analytics
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl">
            Real-time aggregate performance indicators across all non-clinical and civic departments
            at City General Hospital. All statistics are compiled from verified resolution logs.
          </p>
        </div>

        {/* Top-Level KPI Cards Grid (Task 3: Responsive columns grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {/* KPI 1: SLA Resolution Rate */}
          <Card
            variant="default"
            padding="md"
            className="border-slate-200/90 shadow-soft hover:shadow-card transition relative overflow-hidden min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SLA Resolution Rate
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {MOCK_HOSPITAL_KPIS.slaResolutionRate}%
              </div>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span>+2.1% from previous month</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Target Benchmark:</span>
              <span className="font-bold text-slate-700">&gt; 95.0%</span>
            </div>
          </Card>

          {/* KPI 2: Average Turnaround Time */}
          <Card
            variant="default"
            padding="md"
            className="border-slate-200/90 shadow-soft hover:shadow-card transition relative overflow-hidden min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avg. Turnaround Time
              </span>
              <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {MOCK_HOSPITAL_KPIS.avgTurnaroundHours}h
              </div>
              <p className="text-xs text-hospital-700 font-semibold flex items-center gap-1">
                <span>35 mins faster than target SLA</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Standard Ceiling:</span>
              <span className="font-bold text-slate-700">&lt; 4.0 hours</span>
            </div>
          </Card>

          {/* KPI 3: Grievances Addressed */}
          <Card
            variant="default"
            padding="md"
            className="border-slate-200/90 shadow-soft hover:shadow-card transition relative overflow-hidden min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Grievances Addressed
              </span>
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {MOCK_HOSPITAL_KPIS.totalGrievancesAddressed.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                <span className="text-hospital-600">{MOCK_HOSPITAL_KPIS.activeGrievances}</span>
                <span>in-flight tickets right now</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Audit Period:</span>
              <span className="font-bold text-slate-700">Past 30 Days</span>
            </div>
          </Card>

          {/* KPI 4: Privacy Compliance Score */}
          <Card
            variant="default"
            padding="md"
            className="border-slate-200/90 shadow-soft hover:shadow-card transition relative overflow-hidden min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Privacy Compliance
              </span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {MOCK_HOSPITAL_KPIS.privacyComplianceScore}%
              </div>
              <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                <span>0 PII Exposure Incidents</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Security Protocol:</span>
              <span className="font-bold text-slate-700">Zero-Retention</span>
            </div>
          </Card>
        </div>

        {/* Department-wise Resolution Rates Section (Responsive grid-cols-1 lg:grid-cols-3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Main Chart Column: CSS Progress Bars */}
          <div className="lg:col-span-2 min-w-0">
            <Card variant="default" padding="lg" className="border-slate-200/90 shadow-soft h-full w-full">
              <CardHeader
                title="Department-wise Resolution Rates"
                description="Comparative resolution compliance percentage against the 95% hospital benchmark target."
                action={
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    5 Departments
                  </span>
                }
              />

              <div className="space-y-6 pt-2 w-full">
                {MOCK_DEPARTMENT_METRICS.map((dept) => {
                  const isAboveTarget = dept.resolutionRate >= dept.slaTargetRate;
                  return (
                    <div key={dept.id} className="space-y-2 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                            {getDepartmentIcon(dept.iconName)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block leading-tight truncate">
                              {dept.departmentName}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">{dept.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:justify-end text-right shrink-0">
                          <span className="text-xs text-slate-500">
                            Avg. {dept.avgTurnaroundHours}h &bull; {dept.resolvedComplaints}/
                            {dept.totalComplaints} resolved
                          </span>
                          <span
                            className={`font-mono text-base font-black px-2 py-0.5 rounded-md ${
                              isAboveTarget
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-amber-50/90 text-amber-900 border border-amber-300/40'
                            }`}
                          >
                            {dept.resolutionRate}%
                          </span>
                        </div>
                      </div>

                      {/* CSS Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/80 relative">
                        {/* Target SLA Indicator Marker at 95% */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                          style={{ left: `${dept.slaTargetRate}%` }}
                          title={`SLA Target: ${dept.slaTargetRate}%`}
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isAboveTarget
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xs'
                              : 'bg-gradient-to-r from-sky-500 to-teal-500 shadow-xs'
                          }`}
                          style={{ width: `${dept.resolutionRate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                        <span>Target SLA: {dept.slaTargetRate}%</span>
                        <span
                          className={
                            isAboveTarget ? 'text-emerald-700 font-bold' : 'text-amber-600/70 font-bold'
                          }
                        >
                          {isAboveTarget
                            ? `+${(dept.resolutionRate - dept.slaTargetRate).toFixed(1)}% above goal`
                            : `${(dept.slaTargetRate - dept.resolutionRate).toFixed(1)}% below goal`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend / Footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>&gt; 95% SLA Target Met</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-teal-500" />
                    <span>90% - 95% Satisfactory</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Data updated hourly from hospital operational logs
                </span>
              </div>
            </Card>
          </div>

          {/* Right Column: Public Civic Accountability Charter & Status Distribution */}
          <div className="space-y-6 min-w-0">
            {/* Status Distribution Summary Card */}
            <Card variant="default" padding="lg" className="border-slate-200/90 shadow-soft w-full">
              <CardTitle className="text-lg">Overall Resolution Status</CardTitle>
              <CardDescription className="text-xs">
                Aggregate breakdown of all grievances processed this month.
              </CardDescription>

              {/* Visual Segmented Progress Bar */}
              <div className="mt-4 space-y-2 w-full">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: '88.4%' }}
                    className="bg-emerald-500 h-full"
                    title="Resolved: 88.4%"
                  />
                  <div
                    style={{ width: '6.8%' }}
                    className="bg-teal-500 h-full"
                    title="In Progress: 6.8%"
                  />
                  <div
                    style={{ width: '3.2%' }}
                    className="bg-purple-500 h-full"
                    title="Verification: 3.2%"
                  />
                  <div
                    style={{ width: '1.6%' }}
                    className="bg-amber-500/60 h-full"
                    title="Assigned/Received: 1.6%"
                  />
                </div>

                <div className="space-y-2.5 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Resolved &amp; Closed</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">88.4% (1,262)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      <span>In Active Progress</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">6.8% (97)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Under QA Verification</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">3.2% (46)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                      <span>Queued / Assigned</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">1.6% (23)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Public Trust & Transparency Charter */}
            <Card
              variant="subtle"
              padding="md"
              className="bg-gradient-to-br from-hospital-50 to-slate-50 border-hospital-200/80 w-full"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-hospital-800">
                  <Award className="w-5 h-5 text-hospital-600 shrink-0" />
                  <h3 className="font-bold text-sm text-hospital-950">Civic Transparency Charter</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every grievance registered at City General Hospital is backed by an enforceable
                  Service Level Agreement. Resolution times and evidence are audited by an
                  independent hospital ombudsman.
                </p>
                <div className="pt-2 border-t border-hospital-200/60 flex items-center justify-between text-[11px] font-semibold text-hospital-800 flex-wrap gap-1">
                  <span>Hospital Ombudsman Office</span>
                  <span className="font-mono text-slate-700">Room 104, Admin Block</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW VOICECARE TRANSPARENCY WORKS (EDUCATIONAL CIVIC SECTION)            */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-soft p-6 sm:p-8 space-y-6 w-full">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-950">
              How VoiceCare Protects Your Privacy
            </h3>
            <p className="text-sm text-slate-500">
              Our 4-step pipeline ensures full public accountability with zero personal data
              compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 w-full">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-center min-w-0">
              <div className="w-9 h-9 rounded-xl bg-hospital-100 text-hospital-700 font-bold flex items-center justify-center mx-auto text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-800 truncate">Token Generation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Citizens receive a random, anonymous tracking ID (e.g. #VOC-8291).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-center min-w-0">
              <div className="w-9 h-9 rounded-xl bg-hospital-100 text-hospital-700 font-bold flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-800 truncate">PII Stripping</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated NLP strips names, phone numbers, and voice recordings into an anonymous token.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-center min-w-0">
              <div className="w-9 h-9 rounded-xl bg-hospital-100 text-hospital-700 font-bold flex items-center justify-center mx-auto text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-800 truncate">Department SLA</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Action dispatched to duty staff with strict countdown timers and verification evidence.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-center min-w-0">
              <div className="w-9 h-9 rounded-xl bg-hospital-100 text-hospital-700 font-bold flex items-center justify-center mx-auto text-sm">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-800 truncate">Public Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Citizens track resolution progress openly on this read-only public transparency board.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicPage;
