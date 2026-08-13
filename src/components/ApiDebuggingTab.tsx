import React, { useState, useMemo, useRef, useEffect } from 'react';
import trafficDebuggerPreviewImg from '../assets/images/traffic_debugger_preview_1786292019481.jpg';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Filter,
  Play,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  X,
  Layers,
  Clock,
  Cpu,
  Globe,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Zap,
  Tag,
  ChevronDown,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { TrafficItem } from '../types/reqable';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface ApiDebuggingTabProps {
  traffic: TrafficItem[];
  setTraffic: React.Dispatch<React.SetStateAction<TrafficItem[]>>;
  interceptorActive: boolean;
  setInterceptorActive: (active: boolean) => void;
  onSelectForReplay: (item: TrafficItem) => void;
  onAnalyzeWithAi: (item: TrafficItem) => void;
  onCreateRuleFromTraffic: (item: TrafficItem) => void;
}

export const ApiDebuggingTab: React.FC<ApiDebuggingTabProps> = ({
  traffic,
  setTraffic,
  interceptorActive,
  setInterceptorActive,
  onSelectForReplay,
  onAnalyzeWithAi,
  onCreateRuleFromTraffic,
}) => {
  const [selectedItem, setSelectedItem] = useState<TrafficItem | null>(traffic[0] || null);
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'url' | 'status_method' | 'body'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [latencyFilter, setLatencyFilter] = useState<number>(0); // min latency in ms
  const [ruleOnlyFilter, setRuleOnlyFilter] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'request' | 'response' | 'timings'>('overview');
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts Registration
  useKeyboardShortcuts([
    {
      key: 'f',
      ctrl: true,
      allowInInput: false,
      handler: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
      description: 'Focus Search Bar',
      category: 'Debugging',
    },
    {
      key: '/',
      allowInInput: false,
      handler: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
      description: 'Focus Search Bar',
      category: 'Debugging',
    },
    {
      key: 'Enter',
      ctrl: true,
      allowInInput: true,
      handler: () => {
        if (selectedItem) {
          onSelectForReplay(selectedItem);
        }
      },
      description: 'Replay Selected Request',
      category: 'Debugging',
    },
    {
      key: 'x',
      ctrl: true,
      shift: true,
      allowInInput: true,
      handler: () => {
        handleClear();
      },
      description: 'Clear Traffic Logs',
      category: 'Debugging',
    },
    {
      key: 'e',
      ctrl: true,
      shift: true,
      allowInInput: true,
      handler: () => {
        handleExportCsv(filteredTraffic);
      },
      description: 'Export Traffic as CSV',
      category: 'Debugging',
    },
  ]);

  // Unique domains extracted from traffic
  const availableDomains = useMemo(() => {
    const domains = new Set<string>();
    traffic.forEach((item) => {
      try {
        const parsed = new URL(item.url);
        if (parsed.hostname) domains.add(parsed.hostname);
      } catch {
        const match = item.url.match(/https?:\/\/([^/:]+)/i);
        if (match && match[1]) domains.add(match[1]);
      }
    });
    return Array.from(domains);
  }, [traffic]);

  // Method Counts
  const methodCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: traffic.length };
    traffic.forEach((item) => {
      const m = item.method.toUpperCase();
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [traffic]);

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = { ALL: traffic.length, '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    traffic.forEach((item) => {
      if (item.responseStatus >= 200 && item.responseStatus < 300) counts['2xx']++;
      else if (item.responseStatus >= 300 && item.responseStatus < 400) counts['3xx']++;
      else if (item.responseStatus >= 400 && item.responseStatus < 500) counts['4xx']++;
      else if (item.responseStatus >= 500) counts['5xx']++;
    });
    return counts;
  }, [traffic]);

  // Comprehensive Traffic Filtering logic
  const filteredTraffic = useMemo(() => {
    return traffic.filter((item) => {
      // Search term matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        let matches = false;

        if (searchScope === 'url') {
          matches = item.url.toLowerCase().includes(query);
        } else if (searchScope === 'status_method') {
          matches =
            item.method.toLowerCase().includes(query) ||
            String(item.responseStatus).includes(query);
        } else if (searchScope === 'body') {
          matches =
            (item.requestBody && item.requestBody.toLowerCase().includes(query)) ||
            (item.responseBody && item.responseBody.toLowerCase().includes(query)) ||
            JSON.stringify(item.requestHeaders || {}).toLowerCase().includes(query) ||
            JSON.stringify(item.responseHeaders || {}).toLowerCase().includes(query);
        } else {
          // 'all'
          matches =
            item.url.toLowerCase().includes(query) ||
            item.method.toLowerCase().includes(query) ||
            String(item.responseStatus).includes(query) ||
            (item.clientIp && item.clientIp.toLowerCase().includes(query)) ||
            (item.ruleApplied ? item.ruleApplied.toLowerCase().includes(query) : false) ||
            (item.requestBody && item.requestBody.toLowerCase().includes(query)) ||
            (item.responseBody && item.responseBody.toLowerCase().includes(query)) ||
            JSON.stringify(item.requestHeaders || {}).toLowerCase().includes(query) ||
            JSON.stringify(item.responseHeaders || {}).toLowerCase().includes(query);
        }

        if (!matches) return false;
      }

      // Method filter
      if (methodFilter !== 'ALL' && item.method.toUpperCase() !== methodFilter.toUpperCase()) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === '2xx' && (item.responseStatus < 200 || item.responseStatus >= 300)) return false;
        if (statusFilter === '3xx' && (item.responseStatus < 300 || item.responseStatus >= 400)) return false;
        if (statusFilter === '4xx' && (item.responseStatus < 400 || item.responseStatus >= 500)) return false;
        if (statusFilter === '5xx' && item.responseStatus < 500) return false;
        if (!['2xx', '3xx', '4xx', '5xx'].includes(statusFilter) && String(item.responseStatus) !== statusFilter) {
          return false;
        }
      }

      // Domain filter
      if (domainFilter !== 'ALL' && !item.url.includes(domainFilter)) {
        return false;
      }

      // Latency filter
      if (latencyFilter > 0 && item.durationMs < latencyFilter) {
        return false;
      }

      // Rule applied filter
      if (ruleOnlyFilter && !item.ruleApplied) {
        return false;
      }

      return true;
    });
  }, [traffic, searchTerm, searchScope, methodFilter, statusFilter, domainFilter, latencyFilter, ruleOnlyFilter]);

  // Keep selected item valid
  useEffect(() => {
    if (selectedItem && !filteredTraffic.find((t) => t.id === selectedItem.id)) {
      setSelectedItem(filteredTraffic[0] || null);
    } else if (!selectedItem && filteredTraffic.length > 0) {
      setSelectedItem(filteredTraffic[0]);
    }
  }, [filteredTraffic, selectedItem]);

  // Calculate active filter count
  const activeFiltersCount = [
    searchTerm.trim() !== '',
    methodFilter !== 'ALL',
    statusFilter !== 'ALL',
    domainFilter !== 'ALL',
    latencyFilter > 0,
    ruleOnlyFilter,
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchTerm('');
    setSearchScope('all');
    setMethodFilter('ALL');
    setStatusFilter('ALL');
    setDomainFilter('ALL');
    setLatencyFilter(0);
    setRuleOnlyFilter(false);
  };

  // CSV Field Escaper
  const escapeCsvCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export Traffic Logs to CSV File
  const handleExportCsv = (itemsToExport: TrafficItem[] = filteredTraffic) => {
    if (!itemsToExport || itemsToExport.length === 0) {
      setExportToast('No traffic logs available to export');
      setTimeout(() => setExportToast(null), 2500);
      return;
    }

    const headers = [
      'ID',
      'Timestamp',
      'Method',
      'Status Code',
      'URL',
      'Duration (ms)',
      'Size (Bytes)',
      'Protocol',
      'Client IP',
      'Intercept State',
      'Applied Rule',
      'Request Headers',
      'Request Body',
      'Response Headers',
      'Response Body',
    ];

    const rows = itemsToExport.map((item) => [
      escapeCsvCell(item.id),
      escapeCsvCell(item.timestamp),
      escapeCsvCell(item.method),
      escapeCsvCell(item.responseStatus),
      escapeCsvCell(item.url),
      escapeCsvCell(item.durationMs),
      escapeCsvCell(item.sizeBytes),
      escapeCsvCell(item.protocol || 'HTTP/1.1'),
      escapeCsvCell(item.clientIp || '127.0.0.1'),
      escapeCsvCell(item.status),
      escapeCsvCell(item.ruleApplied || 'None'),
      escapeCsvCell(item.requestHeaders ? JSON.stringify(item.requestHeaders) : ''),
      escapeCsvCell(item.requestBody || ''),
      escapeCsvCell(item.responseHeaders ? JSON.stringify(item.responseHeaders) : ''),
      escapeCsvCell(item.responseBody || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `traffic_logs_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToast(`Exported ${itemsToExport.length} log(s) to CSV`);
    setTimeout(() => setExportToast(null), 3000);
  };

  // Clear Logs
  const handleClear = async () => {
    setTraffic([]);
    setSelectedItem(null);
    try {
      await fetch('/api/traffic', { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate Traffic Burst for Testing
  const handleSimulateBurst = async () => {
    const sampleUrls = [
      'https://httpbin.org/get?source=reqable_mobile',
      'https://httpbin.org/post',
      'https://httpbin.org/status/401',
      'https://httpbin.org/status/500',
      'https://api.github.com/users/octocat',
      'https://httpbin.org/delay/1',
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const randomMethod = randomUrl.includes('post') ? 'POST' : 'GET';

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: randomUrl,
          method: randomMethod,
          headers: [{ key: 'User-Agent', value: 'Reqable MITM Tester' }],
          body: randomMethod === 'POST' ? JSON.stringify({ test: 'burst', timestamp: Date.now() }) : '',
        }),
      });

      const trafficRes = await fetch('/api/traffic');
      const data = await trafficRes.json();
      if (data.traffic) {
        setTraffic(data.traffic);
        if (data.traffic.length > 0) setSelectedItem(data.traffic[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="api-debugging-view" className="flex h-[calc(100vh-53px)] bg-slate-950 text-slate-200 overflow-hidden">
      {/* Left List Pane: Captured Traffic Items Table */}
      <div className={`flex-1 flex-col min-w-0 border-r border-slate-800 ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}>
        {/* Main Search & Action Bar */}
        <div id="traffic-toolbar" className="p-3 bg-slate-900/80 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Interception Toggle & Simulate */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInterceptorActive(!interceptorActive)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                  interceptorActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${interceptorActive ? 'fill-current' : ''}`} />
                <span>{interceptorActive ? 'Interception Active' : 'Interception Paused'}</span>
              </button>

              <button
                onClick={handleSimulateBurst}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md flex items-center gap-1.5 border border-slate-700/50"
                title="Send Simulated Traffic Request"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Simulate Traffic</span>
              </button>
            </div>

            {/* Central Search Input Box */}
            <div className="flex-1 max-w-md relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search URL, status, method, headers, or body... (/)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-16 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono shadow-inner placeholder:text-slate-500"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-0.5 text-slate-500 hover:text-white rounded"
                    title="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded">
                  /
                </kbd>
              </div>
            </div>

            {/* Quick Filters & Controls */}
            <div className="flex items-center gap-1.5">
              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-md px-2 py-1.5 font-mono cursor-pointer hover:border-slate-700 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">Method: All ({methodCounts['ALL'] || 0})</option>
                <option value="GET">GET ({methodCounts['GET'] || 0})</option>
                <option value="POST">POST ({methodCounts['POST'] || 0})</option>
                <option value="PUT">PUT ({methodCounts['PUT'] || 0})</option>
                <option value="DELETE">DELETE ({methodCounts['DELETE'] || 0})</option>
                <option value="PATCH">PATCH ({methodCounts['PATCH'] || 0})</option>
                <option value="OPTIONS">OPTIONS ({methodCounts['OPTIONS'] || 0})</option>
              </select>

              {/* Status Code Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-md px-2 py-1.5 font-mono cursor-pointer hover:border-slate-700 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">Status: All</option>
                <option value="2xx">2xx Success ({statusCounts['2xx']})</option>
                <option value="3xx">3xx Redirect ({statusCounts['3xx']})</option>
                <option value="4xx">4xx Client Error ({statusCounts['4xx']})</option>
                <option value="5xx">5xx Server Error ({statusCounts['5xx']})</option>
              </select>

              {/* Advanced Filter Drawer Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  showAdvancedFilters || activeFiltersCount > 0
                    ? 'bg-sky-950 border-sky-800 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Advanced Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-600 text-white text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Export CSV Button & Dropdown */}
              <div className="relative">
                <div className="flex items-center rounded-md border border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                  <button
                    id="btn-export-csv"
                    onClick={() => handleExportCsv(filteredTraffic)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    title="Export filtered traffic logs as CSV file (Ctrl + Shift + E)"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="text-[10px] font-mono text-sky-400/90 bg-sky-950/80 px-1 py-0.2 rounded border border-sky-800/60">
                      {filteredTraffic.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-1 py-1.5 text-slate-400 hover:text-white border-l border-slate-800 cursor-pointer"
                    title="Export Options"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showExportMenu && (
                  <div
                    className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-30 text-xs animate-fade-in"
                    onMouseLeave={() => setShowExportMenu(false)}
                  >
                    <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-800">
                      Export Options
                    </div>
                    <button
                      onClick={() => {
                        handleExportCsv(filteredTraffic);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                        <span>Filtered Logs</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {filteredTraffic.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        handleExportCsv(traffic);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                        <span>All Traffic Logs</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {traffic.length}
                      </span>
                    </button>

                    {selectedItem && (
                      <button
                        onClick={() => {
                          handleExportCsv([selectedItem]);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800/80 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Selected Request Only</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Clear Traffic Logs */}
              <button
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
                title="Clear Traffic Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-2.5 rounded-lg text-xs">
              {/* Search Scope Selector */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold block">Search Target Scope</label>
                <select
                  value={searchScope}
                  onChange={(e) => setSearchScope(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">Search All Fields</option>
                  <option value="url">URL & Endpoint Only</option>
                  <option value="status_method">Status Code & Method Only</option>
                  <option value="body">Headers & Body Content</option>
                </select>
              </div>

              {/* Domain / Host Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold block">Domain / Host</label>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Domains</option>
                  {availableDomains.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Latency Threshold Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold block">Min Latency (ms)</label>
                <select
                  value={latencyFilter}
                  onChange={(e) => setLatencyFilter(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
                >
                  <option value={0}>Any Duration</option>
                  <option value={100}>&gt; 100 ms</option>
                  <option value={300}>&gt; 300 ms</option>
                  <option value={500}>&gt; 500 ms (Slow)</option>
                  <option value={1000}>&gt; 1000 ms (1s+)</option>
                </select>
              </div>

              {/* Rules & Special Toggles */}
              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 py-1">
                  <input
                    type="checkbox"
                    checked={ruleOnlyFilter}
                    onChange={(e) => setRuleOnlyFilter(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Show Mocked / Rule-Applied Only</span>
                </label>
              </div>
            </div>
          )}

          {/* Quick Domain & Preset Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 text-[11px] scrollbar-none">
            <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3" /> Presets:
            </span>

            {/* Quick Preset: Errors */}
            <button
              onClick={() => {
                setStatusFilter(statusFilter === '4xx' ? 'ALL' : '4xx');
              }}
              className={`px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                statusFilter === '4xx' || statusFilter === '5xx'
                  ? 'bg-rose-950 border-rose-800 text-rose-300 font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              Client Errors (4xx)
            </button>

            {/* Quick Preset: Slow requests */}
            <button
              onClick={() => {
                setLatencyFilter(latencyFilter === 500 ? 0 : 500);
              }}
              className={`px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                latencyFilter >= 500
                  ? 'bg-amber-950 border-amber-800 text-amber-300 font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              Slow (&gt;500ms)
            </button>

            {/* Quick Preset: Rule Applied */}
            <button
              onClick={() => {
                setRuleOnlyFilter(!ruleOnlyFilter);
              }}
              className={`px-2 py-0.5 rounded-full border transition-all shrink-0 ${
                ruleOnlyFilter
                  ? 'bg-purple-950 border-purple-800 text-purple-300 font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              Mocked Rules
            </button>

            {/* Domain Chips */}
            {availableDomains.length > 0 && (
              <>
                <div className="h-3 w-px bg-slate-800 mx-1 shrink-0" />
                <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                  <Globe className="w-3 h-3" /> Domains:
                </span>
                {availableDomains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setDomainFilter(domainFilter === dom ? 'ALL' : dom)}
                    className={`px-2 py-0.5 rounded-full border transition-all truncate max-w-[140px] shrink-0 ${
                      domainFilter === dom
                        ? 'bg-sky-950 border-sky-800 text-sky-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={dom}
                  >
                    {dom}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Active Filter Summary Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400">
                  Showing <strong className="text-sky-400 font-mono">{filteredTraffic.length}</strong> of{' '}
                  <strong className="text-slate-300 font-mono">{traffic.length}</strong> requests
                </span>

                {searchTerm && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {methodFilter !== 'ALL' && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]">
                    Method: {methodFilter}
                    <button onClick={() => setMethodFilter('ALL')} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {statusFilter !== 'ALL' && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('ALL')} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {domainFilter !== 'ALL' && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]">
                    Domain: {domainFilter}
                    <button onClick={() => setDomainFilter('ALL')} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {latencyFilter > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]">
                    Latency: &gt;{latencyFilter}ms
                    <button onClick={() => setLatencyFilter(0)} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {ruleOnlyFilter && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px]">
                    Mocked Rules Only
                    <button onClick={() => setRuleOnlyFilter(false)} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={resetAllFilters}
                className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline shrink-0 font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Traffic Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead className="bg-slate-900/90 sticky top-0 z-10 text-slate-400 border-b border-slate-800 text-[11px] backdrop-blur">
              <tr>
                <th className="p-2.5 font-semibold w-16">Method</th>
                <th className="p-2.5 font-semibold w-16">Status</th>
                <th className="p-2.5 font-semibold">URL Path & Host</th>
                <th className="p-2.5 font-semibold w-20 text-right">Time</th>
                <th className="p-2.5 font-semibold w-20 text-right">Size</th>
                <th className="p-2.5 font-semibold w-28">Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTraffic.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-sans">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30 text-sky-400" />
                    <p className="text-slate-400 font-medium text-sm">No traffic items matched your criteria.</p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetAllFilters}
                        className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs rounded-md font-medium transition-colors inline-flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear search & filter settings</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTraffic.map((item, idx) => (
                  <tr
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      setSelectedItem(item);
                      setMobileShowDetail(true);
                    }}
                    className={`cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? 'bg-sky-950/70 border-l-2 border-l-sky-500 text-slate-100'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-2.5 font-bold">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          item.method === 'GET'
                            ? 'bg-emerald-950 text-emerald-400'
                            : item.method === 'POST'
                            ? 'bg-amber-950 text-amber-400'
                            : item.method === 'DELETE'
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-purple-950 text-purple-400'
                        }`}
                      >
                        {item.method}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`font-semibold ${
                          item.responseStatus >= 200 && item.responseStatus < 300
                            ? 'text-emerald-400'
                            : item.responseStatus >= 400
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {item.responseStatus}
                      </span>
                    </td>
                    <td className="p-2.5 truncate max-w-xs text-slate-200" title={item.url}>
                      {item.url}
                    </td>
                    <td className="p-2.5 text-right text-slate-400">{item.durationMs}ms</td>
                    <td className="p-2.5 text-right text-slate-400">
                      {(item.sizeBytes / 1024).toFixed(1)}KB
                    </td>
                    <td className="p-2.5">
                      {item.ruleApplied ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800 truncate block max-w-[100px]">
                          {item.ruleApplied}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Details Inspector Panel */}
      {selectedItem ? (
        <aside id="traffic-details-panel" className={`w-full lg:w-[420px] xl:w-[480px] bg-slate-900/80 border-l border-slate-800 flex-col shrink-0 min-h-0 ${mobileShowDetail ? 'flex' : 'hidden lg:flex'}`}>
          {/* Detail Header & Action Tools */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setMobileShowDetail(false)}
                className="lg:hidden p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                title="Back to Traffic Logs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="font-bold text-xs text-slate-200 shrink-0">{selectedItem.method}</span>
              <span className="text-xs text-slate-400 font-mono truncate" title={selectedItem.url}>
                {selectedItem.url}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onSelectForReplay(selectedItem)}
                className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium flex items-center gap-1"
                title="Send to API Client for editing & replay"
              >
                <Layers className="w-3 h-3" />
                <span>Replay</span>
              </button>

              <button
                onClick={() => onCreateRuleFromTraffic(selectedItem)}
                className="px-2 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded text-xs font-medium flex items-center gap-1"
                title="Create Rewrite / Breakpoint Rule"
              >
                <Shield className="w-3 h-3" />
                <span>Mock Rule</span>
              </button>

              <button
                onClick={() => onAnalyzeWithAi(selectedItem)}
                className="px-2 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded text-xs font-medium flex items-center gap-1"
                title="Analyze with Gemini AI"
              >
                <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                <span>AI</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="px-3 bg-slate-950 border-b border-slate-800 flex items-center gap-1 text-xs">
            {(['overview', 'request', 'response', 'timings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`px-3 py-2 border-b-2 capitalize transition-all ${
                  detailTab === tab
                    ? 'border-sky-500 text-sky-400 font-medium'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Detail Content Area */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-3">
            {/* OVERVIEW TAB */}
            {detailTab === 'overview' && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-sans text-[11px] font-semibold uppercase">General Info</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">URL</span>
                      <span className="break-all text-sky-300">{selectedItem.url}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Client IP</span>
                      <span>{selectedItem.clientIp}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Protocol</span>
                      <span>{selectedItem.protocol}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Timestamp</span>
                      <span>{selectedItem.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-sans text-[11px] font-semibold uppercase">Response Overview</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-emerald-400">{selectedItem.responseStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Duration</span>
                    <span className="text-sky-400">{selectedItem.durationMs} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Response Size</span>
                    <span>{(selectedItem.sizeBytes / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>
            )}

            {/* REQUEST TAB */}
            {detailTab === 'request' && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-sans text-[11px] font-semibold mb-2">Request Headers</div>
                  <div className="space-y-1">
                    {Object.entries(selectedItem.requestHeaders || {}).map(([k, v], idx) => (
                      <div key={`${k}-${idx}`} className="flex gap-2">
                        <span className="text-sky-400 font-semibold">{k}:</span>
                        <span className="text-slate-300 break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItem.requestBody && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-sans text-[11px] font-semibold mb-2">Request Body</div>
                    <pre className="text-slate-200 whitespace-pre-wrap break-all">
                      {selectedItem.requestBody}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* RESPONSE TAB */}
            {detailTab === 'response' && (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-sans text-[11px] font-semibold mb-2">Response Headers</div>
                  <div className="space-y-1">
                    {Object.entries(selectedItem.responseHeaders || {}).map(([k, v], idx) => (
                      <div key={`${k}-${idx}`} className="flex gap-2">
                        <span className="text-sky-400 font-semibold">{k}:</span>
                        <span className="text-slate-300 break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-sans text-[11px] font-semibold mb-2">Response Body</div>
                  <pre className="text-slate-200 whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedItem.responseBody), null, 2);
                      } catch {
                        return selectedItem.responseBody;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}

            {/* TIMINGS TAB */}
            {detailTab === 'timings' && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                <div className="text-slate-400 font-sans text-[11px] font-semibold">Latency & Network Metrics</div>
                {Object.entries(selectedItem.timingBreakdown || {}).map(([key, val]) => {
                  const numVal = Number(val) || 0;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-slate-300 capitalize">
                        <span>{key}</span>
                        <span className="text-sky-400 font-mono">{numVal} ms</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500"
                          style={{ width: `${Math.min(100, Math.max(5, (numVal / (selectedItem.durationMs || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      ) : (
        <aside className="w-[320px] lg:w-[380px] bg-slate-900/60 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center shrink-0">
          <div className="w-full max-w-[260px] rounded-xl overflow-hidden border border-slate-800 shadow-xl mb-4 bg-slate-950">
            <img
              src={trafficDebuggerPreviewImg}
              alt="Reqable Traffic Debugger Preview"
              className="w-full h-36 object-cover opacity-90 hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No Request Selected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
            Select any intercepted HTTP request from the left table to inspect headers, JSON payloads, timing breakdown, or generate AI mock rules.
          </p>
        </aside>
      )}

      {/* CSV Export Success Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-sky-500/50 text-sky-200 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-bounce font-mono backdrop-blur-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportToast}</span>
        </div>
      )}
    </div>
  );
};
