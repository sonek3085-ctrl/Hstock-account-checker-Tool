import React, { useState, useMemo } from 'react';
import { AccountCheckResult, AccountStatus, SocialPlatform, ResultCategory } from '../types/status';
import { StatusBadge } from './StatusBadge';
import { PlatformBadgeIcon } from './PlatformIcons';
import { getCategoryFromStatus } from '../services/checkerApi';
import { LiveBannedSeparatorCard } from './LiveBannedSeparatorCard';
import {
  Search,
  RefreshCw,
  Download,
  Trash2,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Layers,
  Pause,
  Play,
  XCircle,
  HelpCircle,
  LayoutGrid,
  List,
  Ban,
  CheckCircle2,
  Lock,
  RotateCcw,
  Square,
  CheckSquare,
  AlertOctagon,
  Copy,
  Check,
  ChevronDown,
  SlidersHorizontal,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface ResultsTableViewProps {
  results: AccountCheckResult[];
  isChecking: boolean;
  isPaused: boolean;
  progress: { current: number; total: number; currentItem?: string } | null;
  onPause: () => void;
  onResume: () => void;
  onCancel?: () => void;
  onRefreshItem: (item: AccountCheckResult) => void;
  onRefreshSelected: (selectedIds: string[]) => void;
  onRetryFailed: () => void;
  onDeleteItem: (id: string) => void;
  onDeleteSelected: (selectedIds: string[]) => void;
  onRemoveCategory: (category: 'LIVE' | 'SUSPENDED' | 'NOT_FOUND' | 'UNVERIFIED' | 'PRIVATE') => void;
  onClearAll: () => void;
  onExportCsv: (items?: AccountCheckResult[]) => void;
  onUpdateStatus?: (id: string, newStatus: AccountStatus) => void;
}

export const ResultsTableView: React.FC<ResultsTableViewProps> = ({
  results,
  isChecking,
  isPaused,
  progress,
  onPause,
  onResume,
  onCancel,
  onRefreshItem,
  onRefreshSelected,
  onRetryFailed,
  onDeleteItem,
  onDeleteSelected,
  onRemoveCategory,
  onClearAll,
  onExportCsv,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResultCategory>('ALL');
  const [platformFilter, setPlatformFilter] = useState<'ALL' | SocialPlatform>('ALL');
  const [sortBy, setSortBy] = useState<'time' | 'username' | 'status' | 'platform'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'sections' | 'unified'>('sections');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Exact category counts
  const counts = useMemo(() => {
    return {
      total: results.length,
      live: results.filter((r) => getCategoryFromStatus(r.status) === 'LIVE').length,
      suspended: results.filter((r) => getCategoryFromStatus(r.status) === 'SUSPENDED').length,
      notFound: results.filter((r) => getCategoryFromStatus(r.status) === 'NOT_FOUND').length,
      unverified: results.filter((r) => getCategoryFromStatus(r.status) === 'UNVERIFIED').length,
      private: results.filter((r) => getCategoryFromStatus(r.status) === 'PRIVATE').length,
    };
  }, [results]);

  // Status breakdown configuration and chart data for Recharts Pie Chart
  const STATUS_CONFIG: Record<
    'LIVE' | 'SUSPENDED' | 'NOT_FOUND' | 'UNVERIFIED' | 'PRIVATE',
    { label: string; color: string; bg: string; text: string; border: string; desc: string }
  > = {
    LIVE: {
      label: 'LIVE',
      color: '#10b981',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
      desc: 'Active & Accessible',
    },
    SUSPENDED: {
      label: 'SUSPENDED',
      color: '#f43f5e',
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      desc: 'Banned / Suspended',
    },
    NOT_FOUND: {
      label: 'NOT FOUND',
      color: '#ef4444',
      bg: 'bg-red-500/10 dark:bg-red-950/40',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-300 dark:border-red-800',
      desc: 'Deleted / Broken handle',
    },
    UNVERIFIED: {
      label: 'UNVERIFIED',
      color: '#f59e0b',
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
      desc: 'Rate limited / Unknown',
    },
    PRIVATE: {
      label: 'PRIVATE',
      color: '#8b5cf6',
      bg: 'bg-purple-500/10 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-800',
      desc: 'Follow required',
    },
  };

  const chartData = useMemo(() => {
    const list: Array<{ name: string; value: number; color: string; category: ResultCategory }> = [
      { name: 'LIVE', value: counts.live, color: STATUS_CONFIG.LIVE.color, category: 'LIVE' },
      { name: 'SUSPENDED', value: counts.suspended, color: STATUS_CONFIG.SUSPENDED.color, category: 'SUSPENDED' },
      { name: 'NOT FOUND', value: counts.notFound, color: STATUS_CONFIG.NOT_FOUND.color, category: 'NOT_FOUND' },
      { name: 'UNVERIFIED', value: counts.unverified, color: STATUS_CONFIG.UNVERIFIED.color, category: 'UNVERIFIED' },
      { name: 'PRIVATE', value: counts.private, color: STATUS_CONFIG.PRIVATE.color, category: 'PRIVATE' },
    ];
    return list.filter((item) => item.value > 0);
  }, [counts]);

  const liveRate = counts.total > 0 ? ((counts.live / counts.total) * 100).toFixed(1) : '0';
  const closedRate = counts.total > 0 ? (((counts.suspended + counts.notFound) / counts.total) * 100).toFixed(1) : '0';

  // Filtered and sorted results for Unified View
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        const cat = getCategoryFromStatus(r.status);
        const matchesCategory =
          activeCategory === 'ALL' ||
          (activeCategory === 'LIVE_AND_BANNED'
            ? cat === 'LIVE' || cat === 'SUSPENDED'
            : cat === activeCategory);
        const matchesPlatform = platformFilter === 'ALL' || r.platform === platformFilter;
        const matchesSearch =
          r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.profileUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.details.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesPlatform && matchesSearch;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'time') {
          cmp = new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime();
        } else if (sortBy === 'username') {
          cmp = a.username.localeCompare(b.username);
        } else if (sortBy === 'status') {
          cmp = a.status.localeCompare(b.status);
        } else if (sortBy === 'platform') {
          cmp = a.platform.localeCompare(b.platform);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [results, searchTerm, activeCategory, platformFilter, sortBy, sortOrder]);

  // Grouped results for the 4 Dedicated Categorized Sections View
  const groupedSections = useMemo(() => {
    const filterBySearchAndPlatform = (list: AccountCheckResult[]) => {
      return list.filter((r) => {
        const matchesPlatform = platformFilter === 'ALL' || r.platform === platformFilter;
        const matchesSearch =
          r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.profileUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.details.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPlatform && matchesSearch;
      });
    };

    const sections = [
      {
        id: 'LIVE' as const,
        title: 'LIVE Accounts',
        subtitle: 'Confirmed active and publicly accessible',
        description: 'Account exists, server verified active status, and public profile is accessible.',
        badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
        headerBorder: 'border-l-4 border-l-emerald-500',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        items: filterBySearchAndPlatform(results.filter((r) => getCategoryFromStatus(r.status) === 'LIVE')),
      },
      {
        id: 'SUSPENDED' as const,
        title: 'SUSPENDED Accounts',
        subtitle: 'Confirmed suspended or disabled by Instagram',
        description: 'Account suspension or disabling is verified by platform enforcement policies or termination notices.',
        badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40',
        headerBorder: 'border-l-4 border-l-rose-500',
        icon: Ban,
        iconColor: 'text-rose-600 dark:text-rose-400',
        items: filterBySearchAndPlatform(results.filter((r) => getCategoryFromStatus(r.status) === 'SUSPENDED')),
      },
      {
        id: 'NOT_FOUND' as const,
        title: 'NOT FOUND Accounts',
        subtitle: 'Genuinely cannot be found (HTTP 404 / Nonexistent)',
        description: 'Profile confirmed nonexistent, username does not exist on Instagram, or account was deleted.',
        badgeBg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/60',
        headerBorder: 'border-l-4 border-l-red-500',
        icon: XCircle,
        iconColor: 'text-red-500 dark:text-red-400',
        items: filterBySearchAndPlatform(results.filter((r) => getCategoryFromStatus(r.status) === 'NOT_FOUND')),
      },
      {
        id: 'UNVERIFIED' as const,
        title: 'UNVERIFIED Accounts',
        subtitle: 'Rate limited or login challenge (Never marked fake dead or suspended)',
        description: 'Instagram automated checkpoint challenged or rate-limited. Click profile link or recheck individually.',
        badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40',
        headerBorder: 'border-l-4 border-l-amber-500',
        icon: HelpCircle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        items: filterBySearchAndPlatform(results.filter((r) => getCategoryFromStatus(r.status) === 'UNVERIFIED')),
      },
    ];

    if (activeCategory === 'LIVE') return sections.filter((s) => s.id === 'LIVE');
    if (activeCategory === 'SUSPENDED') return sections.filter((s) => s.id === 'SUSPENDED');
    if (activeCategory === 'NOT_FOUND') return sections.filter((s) => s.id === 'NOT_FOUND');
    if (activeCategory === 'UNVERIFIED') return sections.filter((s) => s.id === 'UNVERIFIED');
    if (activeCategory === 'LIVE_AND_BANNED') return sections.filter((s) => s.id === 'LIVE' || s.id === 'SUSPENDED');

    return sections;
  }, [results, searchTerm, platformFilter, activeCategory]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredResults.length && filteredResults.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map((r) => r.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to permanently remove ${selectedIds.size} selected account(s)? This will delete them from both the website and backend storage.`)) {
      onDeleteSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleRecheckSelected = () => {
    if (selectedIds.size === 0) return;
    onRefreshSelected(Array.from(selectedIds));
  };

  const handleExportSelected = () => {
    const selectedItems = results.filter((r) => selectedIds.has(r.id));
    if (selectedItems.length > 0) {
      onExportCsv(selectedItems);
    } else {
      onExportCsv(filteredResults);
    }
  };

  const toggleSort = (col: 'time' | 'username' | 'status' | 'platform') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const copyUsername = async (handle: string, id: string) => {
    try {
      await navigator.clipboard.writeText(handle);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Card with Recharts Pie Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Status Distribution</h3>
                {counts.total > 0 && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {counts.total} Total
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live breakdown of accounts categorized by status (LIVE, SUSPENDED, NOT FOUND, UNVERIFIED, PRIVATE)
              </p>
            </div>
          </div>

          {/* Quick Analytics Rates & Active Filter Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Rate:</span>
              <span className="font-bold font-mono">{liveRate}%</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-700 dark:text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Closed / Banned:</span>
              <span className="font-bold font-mono">{closedRate}%</span>
            </div>
            {activeCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActiveCategory('ALL')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Reset status filter to ALL"
              >
                <span>Filter: <strong className="text-indigo-600 dark:text-indigo-400">{activeCategory}</strong></span>
                <RotateCcw className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Card Content: Donut Pie Chart + Category Breakdown */}
        <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Chart Section */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {counts.total === 0 ? (
              <div className="h-[210px] w-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <PieChartIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No accounts checked yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Start verification to visualize account distribution
                </p>
              </div>
            ) : (
              <div className="relative w-full max-w-[260px] h-[210px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={chartData.length > 1 ? 3 : 0}
                      strokeWidth={2}
                      stroke="currentColor"
                      className="text-white dark:text-slate-900 outline-none"
                      cursor="pointer"
                      onClick={(entry) => {
                        const target = entry as unknown as { category?: ResultCategory };
                        if (target && target.category) {
                          setActiveCategory(activeCategory === target.category ? 'ALL' : target.category);
                        }
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activeCategory === 'ALL' || activeCategory === entry.category ? 1 : 0.35}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as { name: string; value: number; color: string; category: ResultCategory };
                          const pct = counts.total > 0 ? ((data.value / counts.total) * 100).toFixed(1) : '0';
                          return (
                            <div className="bg-slate-900 text-white border border-slate-700 px-3 py-2 rounded-lg shadow-xl text-xs z-50">
                              <div className="flex items-center gap-1.5 mb-1 font-semibold">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                <span>{data.name}</span>
                              </div>
                              <div className="font-mono text-slate-300">
                                <span className="text-white font-bold">{data.value}</span> ({pct}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered Donut Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-2xl font-black font-mono text-slate-800 dark:text-white leading-none">
                    {counts.total}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mt-1">
                    Accounts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Category Breakdown & Clickable Legend */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500 pb-1">
              <span>STATUS CATEGORY</span>
              <span>COUNT & RATIO (CLICK TO FILTER)</span>
            </div>

            {([
              { key: 'LIVE', label: 'LIVE', count: counts.live, conf: STATUS_CONFIG.LIVE },
              { key: 'SUSPENDED', label: 'SUSPENDED', count: counts.suspended, conf: STATUS_CONFIG.SUSPENDED },
              { key: 'NOT_FOUND', label: 'NOT FOUND', count: counts.notFound, conf: STATUS_CONFIG.NOT_FOUND },
              { key: 'UNVERIFIED', label: 'UNVERIFIED', count: counts.unverified, conf: STATUS_CONFIG.UNVERIFIED },
              { key: 'PRIVATE', label: 'PRIVATE', count: counts.private, conf: STATUS_CONFIG.PRIVATE },
            ] as const).map((item) => {
              const isSelected = activeCategory === item.key;
              const pct = counts.total > 0 ? ((item.count / counts.total) * 100).toFixed(1) : '0';
              const pctNum = counts.total > 0 ? (item.count / counts.total) * 100 : 0;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveCategory(isSelected ? 'ALL' : item.key)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-400/40'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.conf.color }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                          • {item.conf.desc}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="w-24 hidden sm:block bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pctNum}%`, backgroundColor: item.conf.color }}
                      />
                    </div>
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white mr-1.5">
                        {item.count}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Dashboard Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Accounts */}
        <div
          onClick={() => setActiveCategory('ALL')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeCategory === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-slate-400 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div className="text-[11px] font-bold tracking-wider uppercase opacity-80">Total Accounts</div>
          <div className="text-2xl font-black mt-1 font-mono">{counts.total}</div>
          <div className="text-[10px] opacity-70 mt-0.5">All checked records</div>
        </div>

        {/* Live Accounts (Green) */}
        <div
          onClick={() => setActiveCategory('LIVE')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeCategory === 'LIVE'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md'
              : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-wider uppercase">LIVE</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-emerald-700 dark:text-emerald-300">
            {counts.live}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Active & Accessible</div>
        </div>

        {/* Suspended Accounts (Red) */}
        <div
          onClick={() => setActiveCategory('SUSPENDED')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeCategory === 'SUSPENDED'
              ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-md'
              : 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-wider uppercase">SUSPENDED</span>
            <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-rose-700 dark:text-rose-300">
            {counts.suspended}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Platform Banned</div>
        </div>

        {/* Not Found (Dark Red / Slate) */}
        <div
          onClick={() => setActiveCategory('NOT_FOUND')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeCategory === 'NOT_FOUND'
              ? 'bg-red-700 text-white ring-2 ring-red-400 shadow-md'
              : 'bg-red-500/10 dark:bg-red-950/30 border-red-300 dark:border-red-900/50 text-red-900 dark:text-red-200 hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-wider uppercase">NOT FOUND</span>
            <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-red-700 dark:text-red-300">
            {counts.notFound}
          </div>
          <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">Does Not Exist (404)</div>
        </div>

        {/* Unverified Accounts (Amber / Yellow) */}
        <div
          onClick={() => setActiveCategory('UNVERIFIED')}
          className={`cursor-pointer p-4 rounded-xl border transition-all col-span-2 sm:col-span-1 ${
            activeCategory === 'UNVERIFIED'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-md'
              : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-wider uppercase">UNVERIFIED</span>
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-amber-700 dark:text-amber-300">
            {counts.unverified}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Rate Limit / Challenge</div>
        </div>
      </div>

      {/* 2. Real-Time Checking Progress Bar */}
      {isChecking && progress && (
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-950 dark:text-blue-100">
                <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${!isPaused ? 'animate-spin' : ''}`} />
                <span>
                  {isPaused ? 'Batch Checking Paused' : 'Checking Accounts in Real Time (100 to 1,000 Support)...'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200/70 dark:bg-blue-900 text-blue-900 dark:text-blue-200 text-[11px] font-mono font-black">
                  {progress.current} of {progress.total} ({Math.round((progress.current / Math.max(1, progress.total)) * 100)}%)
                </span>
              </div>
              {progress.currentItem && (
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-mono truncate max-w-md">
                  Current Account: <strong>{progress.currentItem}</strong>
                </p>
              )}
            </div>

            {/* Pause / Resume / Cancel Controls */}
            <div className="flex items-center gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Stop Batch</span>
                </button>
              )}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                isPaused ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 3. Dedicated Account Removal & Clear Management Bar (Permanently removes from frontend + backend) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Permanent Account Removal &amp; Clear Options</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deletes records permanently from both website UI and backend storage. Records will NOT return upon refresh.
            </p>
          </div>

          {/* Action buttons with all 5 removal options */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Clear All Accounts */}
            <button
              type="button"
              onClick={onClearAll}
              disabled={results.length === 0 || isChecking}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Delete all uploaded and checked accounts permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Accounts ({counts.total})</span>
            </button>

            {/* Remove LIVE Accounts */}
            <button
              type="button"
              onClick={() => onRemoveCategory('LIVE')}
              disabled={counts.live === 0 || isChecking}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Remove all LIVE accounts"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Remove LIVE ({counts.live})</span>
            </button>

            {/* Remove SUSPENDED Accounts */}
            <button
              type="button"
              onClick={() => onRemoveCategory('SUSPENDED')}
              disabled={counts.suspended === 0 || isChecking}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Remove all SUSPENDED accounts"
            >
              <Ban className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>Remove SUSPENDED ({counts.suspended})</span>
            </button>

            {/* Remove NOT FOUND Accounts */}
            <button
              type="button"
              onClick={() => onRemoveCategory('NOT_FOUND')}
              disabled={counts.notFound === 0 || isChecking}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-red-300 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Remove all NOT FOUND accounts"
            >
              <XCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
              <span>Remove NOT FOUND ({counts.notFound})</span>
            </button>

            {/* Remove UNVERIFIED Accounts */}
            <button
              type="button"
              onClick={() => onRemoveCategory('UNVERIFIED')}
              disabled={counts.unverified === 0 || isChecking}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Remove all UNVERIFIED accounts"
            >
              <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Remove UNVERIFIED ({counts.unverified})</span>
            </button>

            {/* Clear Selected */}
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={isChecking}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-rose-800 hover:bg-rose-900 text-white shadow-xs transition-colors cursor-pointer"
                title="Remove checked/selected accounts"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Selected ({selectedIds.size})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live & Banned Usernames Separator Hub (Instant Copy & Download) */}
      <LiveBannedSeparatorCard
        results={results}
        onFilterLiveOnly={() => setActiveCategory('LIVE')}
        onFilterBannedOnly={() => setActiveCategory('SUSPENDED')}
      />

      {/* 5. Main Results Card: Category Tabs, Search, and Tables */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
              Verification Dashboard
            </h2>

            {/* View Switcher: 4 Separate Sections vs Unified Table */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('sections')}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === 'sections'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="View results divided into separate categorized sections"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Separate Sections</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === 'unified'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="View all results in a unified sortable table"
              >
                <List className="w-3.5 h-3.5" />
                <span>Unified Table</span>
              </button>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Retry Unverified */}
            {counts.unverified > 0 && (
              <button
                type="button"
                onClick={onRetryFailed}
                disabled={isChecking}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-700/60 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 transition-colors disabled:opacity-40 cursor-pointer"
                title="Recheck unverified or rate-limited accounts"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Retry Unverified ({counts.unverified})</span>
              </button>
            )}

            {/* Recheck Selected */}
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleRecheckSelected}
                disabled={isChecking}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-300 dark:border-blue-700/60 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Recheck Selected ({selectedIds.size})</span>
              </button>
            )}

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportSelected}
              disabled={results.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
              title="Export results to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : 'Export CSV'}</span>
            </button>

            {/* Options Dropdown Menu (Clear All, Remove LIVE, Remove SUSPENDED, Remove NOT FOUND, Remove UNVERIFIED) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptionsMenu((prev) => !prev)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors shadow-xs cursor-pointer"
                title="Account removal and clear management options"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>Options</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showOptionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOptionsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-2 text-xs divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Removal &amp; Clear Options
                    </div>
                    
                    <div className="py-1 space-y-0.5">
                      {/* Clear All Accounts */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onClearAll();
                        }}
                        disabled={results.length === 0 || isChecking}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors disabled:opacity-40 cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear All Accounts</span>
                        </div>
                        <span className="font-mono text-[11px] opacity-75">({counts.total})</span>
                      </button>

                      {/* Remove LIVE */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onRemoveCategory('LIVE');
                        }}
                        disabled={counts.live === 0 || isChecking}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold transition-colors disabled:opacity-40 cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Remove LIVE</span>
                        </div>
                        <span className="font-mono text-[11px] opacity-75">({counts.live})</span>
                      </button>

                      {/* Remove SUSPENDED */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onRemoveCategory('SUSPENDED');
                        }}
                        disabled={counts.suspended === 0 || isChecking}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors disabled:opacity-40 cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          <span>Remove SUSPENDED</span>
                        </div>
                        <span className="font-mono text-[11px] opacity-75">({counts.suspended})</span>
                      </button>

                      {/* Remove NOT FOUND */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onRemoveCategory('NOT_FOUND');
                        }}
                        disabled={counts.notFound === 0 || isChecking}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold transition-colors disabled:opacity-40 cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span>Remove NOT FOUND</span>
                        </div>
                        <span className="font-mono text-[11px] opacity-75">({counts.notFound})</span>
                      </button>

                      {/* Remove UNVERIFIED */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onRemoveCategory('UNVERIFIED');
                        }}
                        disabled={counts.unverified === 0 || isChecking}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold transition-colors disabled:opacity-40 cursor-pointer text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Remove UNVERIFIED</span>
                        </div>
                        <span className="font-mono text-[11px] opacity-75">({counts.unverified})</span>
                      </button>
                    </div>

                    {selectedIds.size > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOptionsMenu(false);
                            handleDeleteSelected();
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 font-black cursor-pointer text-left"
                        >
                          <div className="flex items-center space-x-2">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear Selected</span>
                          </div>
                          <span className="font-mono text-[11px]">({selectedIds.size})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username, URL, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Platform filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="gmail">Gmail</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>

        {/* Category Tabs Quick Bar */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
          <span className="text-slate-400 font-semibold whitespace-nowrap mr-1">Category Tab:</span>

          {/* ALL */}
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Accounts ({counts.total})
          </button>

          {/* LIVE */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'LIVE' ? 'ALL' : 'LIVE')}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'LIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE Accounts ({counts.live})</span>
          </button>

          {/* SUSPENDED */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'SUSPENDED' ? 'ALL' : 'SUSPENDED')}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'SUSPENDED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60'
            }`}
          >
            <Ban className="w-3 h-3" />
            <span>SUSPENDED Accounts ({counts.suspended})</span>
          </button>

          {/* NOT FOUND */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'NOT_FOUND' ? 'ALL' : 'NOT_FOUND')}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'NOT_FOUND'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-700/60'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>NOT FOUND Accounts ({counts.notFound})</span>
          </button>

          {/* UNVERIFIED */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'UNVERIFIED' ? 'ALL' : 'UNVERIFIED')}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'UNVERIFIED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
            }`}
          >
            <HelpCircle className="w-3 h-3" />
            <span>UNVERIFIED Accounts ({counts.unverified})</span>
          </button>
        </div>

        {/* 6. Display Results: 4 Separate Sections View OR Unified Table View */}
        {results.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No accounts checked yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Enter or upload up to 1,000 usernames above, or click "Load 100 Test Accounts" to verify public accessibility and suspension statuses in real time.
            </p>
          </div>
        ) : viewMode === 'sections' ? (
          /* ========================================================
             SEPARATE RESULTS: 4 DEDICATED DISTINCT SECTIONS
             ======================================================== */
          <div className="p-4 sm:p-6 space-y-6">
            {groupedSections.map((section) => (
              <div
                key={section.id}
                className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/50 shadow-xs ${section.headerBorder}`}
              >
                {/* Section Header */}
                <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <section.icon className={`w-5 h-5 shrink-0 ${section.iconColor}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tracking-wide font-heading">
                          {section.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-black border ${section.badgeBg}`}>
                          {section.items.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {section.subtitle} &bull; {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Section Actions: Remove Category & Export */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {section.items.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => onRemoveCategory(section.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold border border-rose-200 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 cursor-pointer"
                          title={`Permanently remove all ${section.title}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Section ({section.items.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onExportCsv(section.items)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export CSV</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Section Accounts Table */}
                {section.items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No accounts currently in this section.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                          <th className="py-2.5 px-3 w-8">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="py-2.5 px-3">Account / Handle</th>
                          <th className="py-2.5 px-3">Profile Link</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 min-w-[200px]">Verification Details</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {section.items.map((item) => {
                          const isSelected = selectedIds.has(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-3 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(item.id)}
                                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>

                              {/* Username */}
                              <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                                <div className="flex items-center space-x-2">
                                  <span className="truncate">{item.username}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyUsername(item.username, item.id)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                    title="Copy username"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                {item.metadata?.authorName && item.metadata.authorName !== item.username && (
                                  <div className="text-[11px] font-normal text-slate-500 font-sans">
                                    {item.metadata.authorName}
                                  </div>
                                )}
                              </td>

                              {/* Profile Link */}
                              <td className="py-3 px-3 max-w-xs truncate">
                                <a
                                  href={item.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px]"
                                >
                                  <span className="truncate max-w-[160px]">{item.profileUrl}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <StatusBadge status={item.status} />
                              </td>

                              {/* Details */}
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-xs">
                                <p className="leading-relaxed">{item.details}</p>
                              </td>

                              {/* Individual Remove & Recheck Buttons */}
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => onRefreshItem(item)}
                                    disabled={isChecking}
                                    title="Recheck account status"
                                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onDeleteItem(item.id)}
                                    disabled={isChecking}
                                    title="Permanently remove this account (individual delete)"
                                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-40"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================
             UNIFIED TABLE VIEW WITH GLOBAL SORT & BULK ACTIONS
             ======================================================== */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/75 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={filteredResults.length > 0 && selectedIds.size === filteredResults.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Select / Deselect All Filtered"
                    />
                  </th>
                  <th
                    onClick={() => toggleSort('platform')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Platform</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('username')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Account / Handle</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Profile URL</th>
                  <th
                    onClick={() => toggleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('time')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Checked</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[200px]">Verification Details</th>
                  <th className="py-3 px-4 text-right">Individual Removal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredResults.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <PlatformBadgeIcon platform={item.platform} />
                          <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                            {item.platform}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        <div className="flex items-center space-x-2">
                          <span className="truncate">{item.username}</span>
                          <button
                            type="button"
                            onClick={() => copyUsername(item.username, item.id)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Copy username"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {item.metadata?.authorName && item.metadata.authorName !== item.username && (
                          <div className="text-[11px] font-normal text-slate-500 font-sans">
                            {item.metadata.authorName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate">
                        <a
                          href={item.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-mono text-[11px]"
                        >
                          <span className="truncate max-w-[160px]">{item.profileUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.checkedAt ? new Date(item.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recently'}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                        <p className="leading-relaxed">{item.details}</p>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => onRefreshItem(item)}
                            disabled={isChecking}
                            title="Recheck account status"
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            disabled={isChecking}
                            title="Permanently remove this account (individual delete)"
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
