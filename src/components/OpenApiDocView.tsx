import React, { useState, useMemo } from 'react';
import { TrafficItem, ApiRequest } from '../types/reqable';
import {
  generateOpenApiSpec,
  specToJsonString,
  specToYamlString,
  OpenApiSpec,
} from '../utils/openapiGenerator';
import {
  FileText,
  Code,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  Server,
  Sparkles,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Layers,
  Send,
  Edit3,
  CheckCircle2,
  Database,
  ExternalLink,
} from 'lucide-react';

interface OpenApiDocViewProps {
  traffic: TrafficItem[];
  onImportToReqable?: (req: Partial<ApiRequest>) => void;
}

export const OpenApiDocView: React.FC<OpenApiDocViewProps> = ({
  traffic,
  onImportToReqable,
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'json' | 'yaml'>('interactive');
  const [title, setTitle] = useState('Reqable Live OpenAPI Spec');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState(
    'Auto-generated Swagger/OpenAPI 3.0 specification generated in real-time from intercepted API traffic in Reqable.'
  );
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedHost, setSelectedHost] = useState<string>('ALL');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Extract unique hosts from traffic
  const availableHosts = useMemo(() => {
    const hosts = new Set<string>();
    traffic.forEach((item) => {
      try {
        hosts.add(new URL(item.url).origin);
      } catch {}
    });
    return Array.from(hosts);
  }, [traffic]);

  // Generate OpenAPI spec object
  const openApiSpec: OpenApiSpec = useMemo(() => {
    return generateOpenApiSpec(traffic, {
      title,
      version,
      description,
      filterHost: selectedHost !== 'ALL' ? selectedHost : undefined,
    });
  }, [traffic, title, version, description, selectedHost]);

  // Convert spec to JSON & YAML strings
  const jsonSpecString = useMemo(() => specToJsonString(openApiSpec), [openApiSpec]);
  const yamlSpecString = useMemo(() => specToYamlString(openApiSpec), [openApiSpec]);

  // Flatten endpoints for interactive list
  const endpointList = useMemo(() => {
    const list: {
      path: string;
      method: string;
      operation: any;
      key: string;
    }[] = [];

    Object.entries(openApiSpec.paths || {}).forEach(([pathStr, pathObj]) => {
      Object.entries(pathObj || {}).forEach(([methodStr, opObj]) => {
        list.push({
          path: pathStr,
          method: methodStr.toUpperCase(),
          operation: opObj,
          key: `${methodStr.toUpperCase()}:${pathStr}`,
        });
      });
    });

    return list;
  }, [openApiSpec]);

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return endpointList.filter((ep) => {
      const matchesMethod = selectedMethod === 'ALL' || ep.method === selectedMethod;
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !queryLower ||
        ep.path.toLowerCase().includes(queryLower) ||
        ep.method.toLowerCase().includes(queryLower) ||
        (ep.operation.summary && ep.operation.summary.toLowerCase().includes(queryLower));
      return matchesMethod && matchesQuery;
    });
  }, [endpointList, selectedMethod, searchQuery]);

  const toggleExpand = (key: string) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    endpointList.forEach((ep) => {
      allExpanded[ep.key] = true;
    });
    setExpandedEndpoints(allExpanded);
  };

  const collapseAll = () => {
    setExpandedEndpoints({});
  };

  const handleCopySpec = () => {
    const textToCopy = viewMode === 'yaml' ? yamlSpecString : jsonSpecString;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const isYaml = viewMode === 'yaml';
    const content = isYaml ? yamlSpecString : jsonSpecString;
    const extension = isYaml ? 'yaml' : 'json';
    const mimeType = isYaml ? 'text/yaml' : 'application/json';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openapi-spec.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'POST':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'PUT':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'DELETE':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'PATCH':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const code = parseInt(status, 10);
    if (code >= 200 && code < 300) return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    if (code >= 300 && code < 400) return 'bg-sky-950 text-sky-300 border-sky-800';
    if (code >= 400 && code < 500) return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-rose-950 text-rose-300 border-rose-800';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Banner Control Panel */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 space-y-4">
        {/* Header Metadata Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isEditingMeta ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-950 border border-sky-500 rounded px-2 py-0.5 text-sm text-white font-bold"
                    />
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="bg-slate-950 border border-sky-500 rounded px-2 py-0.5 text-xs text-sky-300 font-mono w-20"
                    />
                    <button
                      onClick={() => setIsEditingMeta(false)}
                      className="p-1 bg-emerald-600 text-white rounded text-xs"
                      title="Save Metadata"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-slate-100">{title}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                      v{version}
                    </span>
                    <button
                      onClick={() => setIsEditingMeta(true)}
                      className="text-slate-400 hover:text-sky-300 text-xs transition-colors p-1"
                      title="Edit Spec Title & Version"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">{description}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Selector Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('interactive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'interactive'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Swagger UI</span>
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === 'json'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON Spec</span>
              </button>
              <button
                onClick={() => setViewMode('yaml')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  viewMode === 'yaml'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>YAML Spec</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopySpec}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              title="Copy OpenAPI Specification"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Spec'}</span>
            </button>

            {/* Download Spec Button */}
            <button
              onClick={handleDownloadSpec}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-500/10 transition-all cursor-pointer"
            >
              {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>Download .{viewMode === 'yaml' ? 'yaml' : 'json'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Stats Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Search Box */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints by path or keyword (e.g. /users, GET)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Method Filter */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>

            {/* Server Host Filter */}
            <select
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono max-w-[200px] truncate"
            >
              <option value="ALL">All Target Servers</option>
              {availableHosts.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Controls & Stats */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <strong className="text-slate-200">{filteredEndpoints.length}</strong> / {endpointList.length} Endpoints
            </span>

            {viewMode === 'interactive' && (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <button
                  onClick={expandAll}
                  className="hover:text-slate-100 transition-colors cursor-pointer"
                >
                  Expand All
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={collapseAll}
                  className="hover:text-slate-100 transition-colors cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Spec Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* VIEW 1: Interactive Swagger UI View */}
        {viewMode === 'interactive' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Servers List Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Server className="w-4 h-4 text-sky-400" />
                <span>Base API Target Servers ({openApiSpec.servers?.length || 0})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {openApiSpec.servers?.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-200"
                  >
                    <span className="text-teal-300 truncate font-semibold">{srv.url}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      HTTP/S
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredEndpoints.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">No OpenAPI endpoints match filters</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing your search query or trigger requests in the Debugger/Testing workspace to auto-capture endpoints into the OpenAPI spec.
                </p>
              </div>
            )}

            {/* Endpoint Cards Accordion List */}
            {filteredEndpoints.map((item) => {
              const isExpanded = !!expandedEndpoints[item.key];
              const op = item.operation;

              return (
                <div
                  key={item.key}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  {/* Endpoint Header Bar */}
                  <div
                    onClick={() => toggleExpand(item.key)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getMethodBadgeClass(
                          item.method
                        )}`}
                      >
                        {item.method}
                      </span>

                      <span className="text-sm font-mono font-bold text-slate-100">{item.path}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 truncate max-w-xs hidden md:inline">
                        {op.summary || 'Captured Endpoint'}
                      </span>

                      {/* Action Button: Import to Reqable */}
                      {onImportToReqable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImportToReqable({
                              name: `${item.method} ${item.path}`,
                              method: item.method as any,
                              url: (openApiSpec.servers?.[0]?.url || 'https://api.example.com') + item.path,
                            });
                          }}
                          className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Test Endpoint</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Endpoint Details */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4 text-xs">
                      {/* Description & Summary */}
                      <div className="space-y-1">
                        <div className="text-slate-300 font-semibold">{op.summary}</div>
                        <p className="text-slate-500 text-[11px] font-mono">{op.description}</p>
                      </div>

                      {/* Parameters Table */}
                      {op.parameters && op.parameters.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span>Request Parameters ({op.parameters.length})</span>
                          </h4>
                          <div className="overflow-x-auto border border-slate-800 rounded-xl">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                                <tr>
                                  <th className="p-2.5">Name</th>
                                  <th className="p-2.5">In</th>
                                  <th className="p-2.5">Type</th>
                                  <th className="p-2.5">Required</th>
                                  <th className="p-2.5">Sample Example</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800 text-slate-200">
                                {op.parameters.map((p: any, pIdx: number) => (
                                  <tr key={pIdx} className="hover:bg-slate-900/50">
                                    <td className="p-2.5 font-bold text-teal-300">{p.name}</td>
                                    <td className="p-2.5 text-slate-400">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                                        {p.in}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-sky-400">{p.schema?.type || 'string'}</td>
                                    <td className="p-2.5">
                                      {p.required ? (
                                        <span className="text-rose-400 font-bold">Yes</span>
                                      ) : (
                                        <span className="text-slate-500">No</span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-slate-400 truncate max-w-xs">
                                      {String(p.schema?.example ?? '-')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body Schema */}
                      {op.requestBody && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                            Request Body Payload
                          </h4>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 overflow-x-auto max-h-48">
                            <pre className="text-sky-300">
                              {JSON.stringify(op.requestBody.content?.['application/json']?.example || op.requestBody, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Responses List */}
                      {op.responses && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                            Response Status Codes
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(op.responses).map(([code, resp]: [string, any]) => (
                              <div
                                key={code}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getStatusBadgeClass(
                                      code
                                    )}`}
                                  >
                                    HTTP {code}
                                  </span>
                                  <span className="text-xs text-slate-300 font-medium">{resp.description}</span>
                                </div>

                                {/* Response Example Payload */}
                                {resp.content && (
                                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48">
                                    <div className="text-[10px] text-slate-500 mb-1">
                                      Content-Type: {Object.keys(resp.content)[0]}
                                    </div>
                                    <pre className="text-emerald-300">
                                      {JSON.stringify(
                                        resp.content[Object.keys(resp.content)[0]]?.example ||
                                          resp.content[Object.keys(resp.content)[0]]?.schema,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: Raw JSON Spec View */}
        {viewMode === 'json' && (
          <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">openapi-spec.json</span>
              <button
                onClick={handleCopySpec}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-teal-300 overflow-x-auto max-h-[600px] leading-relaxed">
              {jsonSpecString}
            </pre>
          </div>
        )}

        {/* VIEW 3: Raw YAML Spec View */}
        {viewMode === 'yaml' && (
          <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">openapi-spec.yaml</span>
              <button
                onClick={handleCopySpec}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy YAML'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-sky-300 overflow-x-auto max-h-[600px] leading-relaxed">
              {yamlSpecString}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
