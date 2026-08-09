import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Clock,
  ShieldCheck,
  Download,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Eye,
  Layers,
  Database,
  Calendar,
  X,
  Server,
  Activity,
  Zap,
} from 'lucide-react';
import { TrafficItem, HttpMethod } from '../types/reqable';

interface ApiAuditLogTabProps {
  traffic: TrafficItem[];
}

export const ApiAuditLogTab: React.FC<ApiAuditLogTabProps> = ({ traffic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusCategoryFilter, setStatusCategoryFilter] = useState<string>('ALL');
  const [trafficTypeFilter, setTrafficTypeFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedLog, setSelectedLog] = useState<TrafficItem | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'request' | 'response' | 'timings'>('response');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & Sort traffic items chronologically
  const filteredTraffic = useMemo(() => {
    return traffic
      .filter((item) => {
        // Method filter
        if (methodFilter !== 'ALL' && item.method !== methodFilter) return false;

        // Status code category filter
        if (statusCategoryFilter === '2xx' && (item.responseStatus < 200 || item.responseStatus >= 300)) return false;
        if (statusCategoryFilter === '3xx' && (item.responseStatus < 300 || item.responseStatus >= 400)) return false;
        if (statusCategoryFilter === '4xx' && (item.responseStatus < 400 || item.responseStatus >= 500)) return false;
        if (statusCategoryFilter === '5xx' && item.responseStatus < 500) return false;

        // Traffic type filter
        if (trafficTypeFilter !== 'ALL' && item.status !== trafficTypeFilter) return false;

        // Free text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchUrl = item.url.toLowerCase().includes(q);
          const matchMethod = item.method.toLowerCase().includes(q);
          const matchStatus = String(item.responseStatus).includes(q);
          const matchReqBody = item.requestBody ? item.requestBody.toLowerCase().includes(q) : false;
          const matchResBody = item.responseBody ? item.responseBody.toLowerCase().includes(q) : false;
          const matchIp = item.clientIp ? item.clientIp.toLowerCase().includes(q) : false;
          const matchRule = item.ruleApplied ? item.ruleApplied.toLowerCase().includes(q) : false;

          return matchUrl || matchMethod || matchStatus || matchReqBody || matchResBody || matchIp || matchRule;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [traffic, searchQuery, methodFilter, statusCategoryFilter, trafficTypeFilter, sortOrder]);

  // Aggregate Audit Statistics
  const stats = useMemo(() => {
    const total = traffic.length;
    if (total === 0) return { total: 0, avgDuration: 0, successRate: 100, totalBytes: 0, errors: 0 };

    const totalBytes = traffic.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
    const totalDuration = traffic.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);
    const errors = traffic.filter((t) => t.responseStatus >= 400).length;
    const successRate = Math.round(((total - errors) / total) * 100);
    const avgDuration = Math.round(totalDuration / total);

    return { total, avgDuration, successRate, totalBytes, errors };
  }, [traffic]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const handleExportCsv = () => {
    if (filteredTraffic.length === 0) {
      showToast('No log records available to export.');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Method', 'URL', 'Status', 'Duration (ms)', 'Size (bytes)', 'Client IP', 'Type', 'Rule Applied'];
    const csvRows = [headers.join(',')];

    filteredTraffic.forEach((t) => {
      const row = [
        `"${t.id}"`,
        `"${t.timestamp}"`,
        `"${t.method}"`,
        `"${t.url.replace(/"/g, '""')}"`,
        t.responseStatus,
        t.durationMs,
        t.sizeBytes,
        `"${t.clientIp || ''}"`,
        `"${t.status}"`,
        `"${t.ruleApplied || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `api_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredTraffic.length} audit records to CSV!`);
  };

  const handleExportJson = () => {
    if (filteredTraffic.length === 0) {
      showToast('No log records available to export.');
      return;
    }

    const jsonString = JSON.stringify(filteredTraffic, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredTraffic.length} audit records to JSON!`);
  };

  const getMethodBadgeClass = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'POST':
        return 'bg-sky-950 text-sky-400 border-sky-800';
      case 'PUT':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'DELETE':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'PATCH':
        return 'bg-purple-950 text-purple-400 border-purple-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
    if (status >= 300 && status < 400) return 'bg-sky-950/80 text-sky-400 border-sky-800/80';
    if (status >= 400 && status < 500) return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
    if (status >= 500) return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
    return 'bg-slate-900 text-slate-400 border-slate-800';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return ts;
    }
  };

  return (
    <div id="api-audit-log-view" className="h-[calc(100vh-53px)] bg-slate-950 text-slate-200 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Read-Only Compliance Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>API Request & Response Audit Log</span>
                  <span className="text-[10px] uppercase font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Immutable Read-Only Trail
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological network traffic ledger tracking all HTTP/HTTPS interactions, status codes, and execution timings.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-export-audit-csv"
              onClick={handleExportCsv}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Export filtered log as CSV"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-export-audit-json"
              onClick={handleExportJson}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Export filtered log as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-sky-950/90 border border-sky-800 text-sky-200 text-xs rounded-lg flex items-center justify-between shadow-lg animate-in fade-in duration-200">
            <span className="font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Audit Metrics Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> Total Requests Logged
            </div>
            <div className="text-xl font-bold font-mono text-white">{stats.total}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Displaying {filteredTraffic.length} filtered
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Average Latency
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">{stats.avgDuration} ms</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Total execution time
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Success Rate
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.successRate}%</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {stats.errors} failed request(s)
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" /> Total Data Transferred
            </div>
            <div className="text-xl font-bold font-mono text-purple-300">{formatBytes(stats.totalBytes)}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Request + Response payload
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="input-audit-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by URL, HTTP method, status code, payload content, client IP..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
              {/* Method Filter */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-500 text-[11px] font-mono">Method:</span>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">ALL Methods</option>
                  <option value="GET" className="bg-slate-900">GET</option>
                  <option value="POST" className="bg-slate-900">POST</option>
                  <option value="PUT" className="bg-slate-900">PUT</option>
                  <option value="DELETE" className="bg-slate-900">DELETE</option>
                  <option value="PATCH" className="bg-slate-900">PATCH</option>
                </select>
              </div>

              {/* Status Code Filter */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-500 text-[11px] font-mono">Status:</span>
                <select
                  value={statusCategoryFilter}
                  onChange={(e) => setStatusCategoryFilter(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">ALL Statuses</option>
                  <option value="2xx" className="bg-slate-900">2xx Success</option>
                  <option value="3xx" className="bg-slate-900">3xx Redirect</option>
                  <option value="4xx" className="bg-slate-900">4xx Client Error</option>
                  <option value="5xx" className="bg-slate-900">5xx Server Error</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-500 text-[11px] font-mono">Type:</span>
                <select
                  value={trafficTypeFilter}
                  onChange={(e) => setTrafficTypeFilter(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">ALL Types</option>
                  <option value="captured" className="bg-slate-900">Captured</option>
                  <option value="modified" className="bg-slate-900">Modified</option>
                  <option value="replayed" className="bg-slate-900">Replayed</option>
                  <option value="blocked" className="bg-slate-900">Blocked</option>
                </select>
              </div>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-mono"
                title={`Sort order: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Read-Only Searchable Audit Table View */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-44">Timestamp</th>
                  <th className="py-3 px-4 w-24">Method</th>
                  <th className="py-3 px-4">Endpoint / URL</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-24 text-right">Latency</th>
                  <th className="py-3 px-4 w-24 text-right">Size</th>
                  <th className="py-3 px-4 w-28 text-center">Type</th>
                  <th className="py-3 px-4 w-20 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTraffic.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-400">No API audit records found</p>
                        <p className="text-[11px] text-slate-500 max-w-sm">
                          Send requests via the API Client tab or capture live network traffic to populate the audit ledger.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTraffic.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedLog(item)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        selectedLog?.id === item.id ? 'bg-sky-950/40 border-l-2 border-l-sky-500' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center text-slate-500 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getMethodBadgeClass(
                            item.method
                          )}`}
                        >
                          {item.method}
                        </span>
                      </td>

                      {/* Endpoint URL */}
                      <td className="py-3 px-4 text-slate-100 max-w-md truncate font-medium">
                        <span className="text-slate-300 hover:text-sky-300 transition-colors" title={item.url}>
                          {item.url}
                        </span>
                      </td>

                      {/* Status Code */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(
                            item.responseStatus
                          )}`}
                        >
                          {item.responseStatus || 0}
                        </span>
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-4 text-right text-slate-300">
                        {item.durationMs || 0} ms
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatBytes(item.sizeBytes || 0)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase ${
                            item.status === 'modified'
                              ? 'bg-purple-950 text-purple-400 border-purple-800'
                              : item.status === 'replayed'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : item.status === 'blocked'
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(item);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                          title="Inspect full read-only audit log details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* READ-ONLY AUDIT DETAIL INSPECTION DRAWER / MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-2xl h-full sm:h-[92vh] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${getMethodBadgeClass(selectedLog.method)}`}>
                  {selectedLog.method}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${getStatusBadgeClass(selectedLog.responseStatus)}`}>
                  {selectedLog.responseStatus}
                </span>
                <span className="text-xs font-bold text-slate-100 truncate font-mono" title={selectedLog.url}>
                  {selectedLog.url}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Audit Log Overview Info Bar */}
            <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 shrink-0">
              <div>
                <span className="text-slate-500">Log ID: </span>
                <span className="text-slate-200 font-semibold">{selectedLog.id.slice(0, 8)}...</span>
              </div>
              <div>
                <span className="text-slate-500">Duration: </span>
                <span className="text-amber-400 font-semibold">{selectedLog.durationMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500">Size: </span>
                <span className="text-purple-300 font-semibold">{formatBytes(selectedLog.sizeBytes)}</span>
              </div>
              <div>
                <span className="text-slate-500">IP: </span>
                <span className="text-slate-200 font-semibold">{selectedLog.clientIp || '127.0.0.1'}</span>
              </div>
            </div>

            {/* Detail Navigation Tabs */}
            <div className="px-4 bg-slate-950 border-b border-slate-800 flex items-center gap-2 shrink-0 text-xs">
              <button
                onClick={() => setActiveDetailTab('response')}
                className={`py-2.5 font-semibold transition-colors border-b-2 ${
                  activeDetailTab === 'response'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Response Body & Headers
              </button>
              <button
                onClick={() => setActiveDetailTab('request')}
                className={`py-2.5 font-semibold transition-colors border-b-2 ${
                  activeDetailTab === 'request'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Request Payload & Headers
              </button>
              <button
                onClick={() => setActiveDetailTab('timings')}
                className={`py-2.5 font-semibold transition-colors border-b-2 ${
                  activeDetailTab === 'timings'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Network Timings
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
              {activeDetailTab === 'response' && (
                <div className="space-y-4">
                  {/* Response Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-400 font-semibold">Response Body Payload</span>
                      <button
                        onClick={() => handleCopyText(selectedLog.responseBody || '', 'Response Body')}
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Body
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] overflow-x-auto max-h-60 leading-relaxed font-mono whitespace-pre-wrap">
                      {selectedLog.responseBody || '(Empty Response Body)'}
                    </pre>
                  </div>

                  {/* Response Headers */}
                  <div>
                    <span className="block text-slate-400 font-semibold mb-1.5">Response Headers</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedLog.responseHeaders && Object.keys(selectedLog.responseHeaders).length > 0 ? (
                            Object.entries(selectedLog.responseHeaders).map(([k, v]) => (
                              <tr key={k}>
                                <td className="py-1.5 px-3 text-slate-400 font-semibold w-1/3">{k}</td>
                                <td className="py-1.5 px-3 text-slate-200 break-all">{v}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="py-2 px-3 text-slate-500">No response headers captured</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'request' && (
                <div className="space-y-4">
                  {/* Request Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-400 font-semibold">Request Body Payload</span>
                      <button
                        onClick={() => handleCopyText(selectedLog.requestBody || '', 'Request Body')}
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Body
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] overflow-x-auto max-h-60 leading-relaxed font-mono whitespace-pre-wrap">
                      {selectedLog.requestBody || '(Empty Request Body)'}
                    </pre>
                  </div>

                  {/* Request Headers */}
                  <div>
                    <span className="block text-slate-400 font-semibold mb-1.5">Request Headers</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedLog.requestHeaders && Object.keys(selectedLog.requestHeaders).length > 0 ? (
                            Object.entries(selectedLog.requestHeaders).map(([k, v]) => (
                              <tr key={k}>
                                <td className="py-1.5 px-3 text-slate-400 font-semibold w-1/3">{k}</td>
                                <td className="py-1.5 px-3 text-slate-200 break-all">{v}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="py-2 px-3 text-slate-500">No request headers captured</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'timings' && (
                <div className="space-y-4">
                  <span className="block text-slate-400 font-semibold">Latency & Network Phase Breakdown</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    {selectedLog.timingBreakdown ? (
                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">DNS Resolution</span>
                          <span className="text-sky-400 font-semibold">{selectedLog.timingBreakdown.dns} ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">TCP Handshake</span>
                          <span className="text-sky-400 font-semibold">{selectedLog.timingBreakdown.tcp} ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">TLS Encryption</span>
                          <span className="text-purple-400 font-semibold">{selectedLog.timingBreakdown.tls} ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Time To First Byte (TTFB)</span>
                          <span className="text-amber-400 font-semibold">{selectedLog.timingBreakdown.ttfb} ms</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-2 font-bold">
                          <span className="text-slate-200">Total Latency</span>
                          <span className="text-emerald-400">{selectedLog.durationMs} ms</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[11px]">
                        Total duration: <strong className="text-slate-300">{selectedLog.durationMs} ms</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-mono">Timestamp: {formatTimestamp(selectedLog.timestamp)}</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
