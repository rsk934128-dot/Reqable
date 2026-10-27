import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  Check,
  Wand2,
  FileCode,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  SchemaDiscrepancy,
  ValidationResult,
  SCHEMA_TEMPLATES,
  inferJsonSchema,
} from '../utils/jsonSchemaValidator';

interface SchemaEditorProps {
  schemaText: string;
  onChangeSchema: (newSchema: string) => void;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  responseBody?: string;
  onFormatSchema: () => void;
  formatStatus?: { success?: string; error?: string } | null;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  schemaText,
  onChangeSchema,
  isEnabled,
  onToggleEnabled,
  responseBody,
  onFormatSchema,
  formatStatus,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [copied, setCopied] = useState(false);

  // Check syntax of schema in real-time
  const syntaxCheck = useMemo(() => {
    if (!schemaText.trim()) {
      return { status: 'empty', message: 'No schema defined yet' };
    }
    try {
      const parsed = JSON.parse(schemaText);
      if (typeof parsed !== 'object' || parsed === null) {
        return { status: 'error', message: 'Schema must be a JSON object' };
      }
      return { status: 'valid', message: 'Valid JSON Schema object', parsed };
    } catch (e: any) {
      return { status: 'error', message: `Syntax error: ${e.message}` };
    }
  }, [schemaText]);

  // Handle inferring from response
  const handleInferFromResponse = () => {
    if (!responseBody || !responseBody.trim()) {
      alert('No response body available to infer schema from. Send an API request first.');
      return;
    }
    try {
      const parsedBody = JSON.parse(responseBody);
      const inferred = inferJsonSchema(parsedBody, 'InferredApiResponseSchema');
      onChangeSchema(JSON.stringify(inferred, null, 2));
      if (!isEnabled) {
        onToggleEnabled(true);
      }
    } catch {
      alert('Current response body is not valid JSON. Cannot infer schema.');
    }
  };

  const handleApplyTemplate = (templateName: string) => {
    const template = SCHEMA_TEMPLATES.find((t) => t.name === templateName);
    if (!template) return;
    onChangeSchema(JSON.stringify(template.schema, null, 2));
    setSelectedTemplate('');
    if (!isEnabled) {
      onToggleEnabled(true);
    }
  };

  const handleCopySchema = () => {
    if (!schemaText) return;
    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearSchema = () => {
    if (confirm('Clear current JSON Schema?')) {
      onChangeSchema('');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3 font-sans">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        {/* Enable Toggle & Syntax Indicator */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200">
              Validate Response Body
            </span>
          </label>

          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border">
            {syntaxCheck.status === 'valid' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-semibold">Schema Syntax Valid</span>
              </>
            )}
            {syntaxCheck.status === 'error' && (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-rose-400 font-semibold truncate max-w-xs" title={syntaxCheck.message}>
                  {syntaxCheck.message}
                </span>
              </>
            )}
            {syntaxCheck.status === 'empty' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-500">Empty (Not Enforced)</span>
              </>
            )}
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Infer from Response Button */}
          <button
            type="button"
            onClick={handleInferFromResponse}
            disabled={!responseBody}
            title="Auto-generate Draft-07 JSON Schema from the current API response"
            className="px-2.5 py-1 text-xs font-medium rounded bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-700/60 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Infer from Response</span>
          </button>

          {/* Template Selector */}
          <select
            value={selectedTemplate}
            onChange={(e) => handleApplyTemplate(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-sky-500 cursor-pointer"
            title="Insert a standard schema template"
          >
            <option value="">Load Schema Template...</option>
            {SCHEMA_TEMPLATES.map((tmpl) => (
              <option key={tmpl.name} value={tmpl.name}>
                {tmpl.name}
              </option>
            ))}
          </select>

          {/* Pretty Print Schema */}
          <button
            type="button"
            onClick={onFormatSchema}
            title="Pretty-print and format JSON Schema"
            className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Wand2 className="w-3 h-3 text-sky-400" />
            <span>Format</span>
          </button>

          {/* Copy Schema */}
          <button
            type="button"
            onClick={handleCopySchema}
            disabled={!schemaText.trim()}
            title="Copy Schema JSON"
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors disabled:opacity-30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Schema */}
          <button
            type="button"
            onClick={handleClearSchema}
            disabled={!schemaText.trim()}
            title="Clear Schema"
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Format Alerts */}
      {formatStatus?.error && (
        <div className="bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs px-3 py-1.5 rounded flex items-center gap-2 font-mono">
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{formatStatus.error}</span>
        </div>
      )}
      {formatStatus?.success && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs px-3 py-1.5 rounded flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{formatStatus.success}</span>
        </div>
      )}

      {/* Code Textarea */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <textarea
          value={schemaText}
          onChange={(e) => onChangeSchema(e.target.value)}
          placeholder={`{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "required": ["id", "status"],\n  "properties": {\n    "id": { "type": "number" },\n    "status": { "type": "string", "enum": ["active", "pending"] }\n  }\n}`}
          className="flex-1 min-h-[170px] w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Quick Reference Chips */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-500 font-medium">
          <BookOpen className="w-3 h-3" /> Keywords:
        </span>
        {['type', 'required', 'properties', 'items', 'enum', 'minimum', 'pattern', 'format', 'additionalProperties'].map(
          (kw) => (
            <span
              key={kw}
              className="bg-slate-900 text-slate-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-800 cursor-help"
              title={`JSON Schema '${kw}' keyword`}
            >
              {kw}
            </span>
          )
        )}
      </div>
    </div>
  );
};

interface ResponseSchemaInspectorProps {
  validationResult: ValidationResult | null;
  schemaText: string;
  responseBody: string;
  onOpenSchemaEditor: () => void;
  onSelectDiscrepancy?: (discrepancy: SchemaDiscrepancy) => void;
}

export const ResponseSchemaInspector: React.FC<ResponseSchemaInspectorProps> = ({
  validationResult,
  schemaText,
  responseBody,
  onOpenSchemaEditor,
  onSelectDiscrepancy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [keywordFilter, setKeywordFilter] = useState<string>('ALL');
  const [copiedReport, setCopiedReport] = useState(false);

  // If no schema is defined
  if (!schemaText.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <FileCode className="w-6 h-6 text-slate-400" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="text-sm font-semibold text-slate-200">No JSON Schema Defined</h4>
          <p className="text-xs text-slate-400">
            Define a JSON Schema to automatically validate API responses and identify contract regressions.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onOpenSchemaEditor}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Configure Schema in Request Tab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // If schema is defined but no validation has run yet (e.g. no response received)
  if (!validationResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans space-y-2">
        <ShieldCheck className="w-8 h-8 text-slate-500" />
        <h4 className="text-sm font-medium text-slate-300">Ready to Validate</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Send the request to validate the returned response against your defined JSON schema.
        </p>
      </div>
    );
  }

  const { valid, discrepancies, validatedAt, fieldCount, schemaTitle } = validationResult;

  // Filter discrepancies
  const filteredDiscrepancies = discrepancies.filter((d) => {
    const matchesSearch =
      !searchTerm ||
      d.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.humanPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.keyword.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKeyword =
      keywordFilter === 'ALL' || d.keyword.toLowerCase() === keywordFilter.toLowerCase();

    return matchesSearch && matchesKeyword;
  });

  // Discrepancy counts by keyword
  const keywordCounts = discrepancies.reduce((acc, d) => {
    acc[d.keyword] = (acc[d.keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Copy Markdown validation report
  const handleCopyReport = () => {
    const lines = [
      `# Schema Validation Report: ${valid ? 'PASSED ✅' : 'FAILED ❌'}`,
      `- **Schema**: ${schemaTitle || 'JSON Schema'}`,
      `- **Validated At**: ${new Date(validatedAt).toLocaleString()}`,
      `- **Discrepancies**: ${discrepancies.length}`,
      `- **Checked Fields**: ${fieldCount}`,
      '',
    ];

    if (discrepancies.length > 0) {
      lines.push('## Discrepancies');
      discrepancies.forEach((d, idx) => {
        lines.push(`### ${idx + 1}. [${d.keyword.toUpperCase()}] at \`${d.humanPath}\` (\`${d.path}\`)`);
        lines.push(`- **Issue**: ${d.message}`);
        lines.push(`- **Expected**: ${d.expected}`);
        lines.push(`- **Actual**: ${d.actual}`);
        lines.push('');
      });
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-3 font-sans">
      {/* Top Hero Banner */}
      {valid ? (
        <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-lg p-3 text-emerald-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-700/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-300">Schema Validation Passed</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-700">
                  0 Discrepancies
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Response body conforms 100% to schema definition ({fieldCount} rules checked)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300/70">
            <span>{new Date(validatedAt).toLocaleTimeString()}</span>
            <button
              onClick={handleCopyReport}
              className="px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-sans flex items-center gap-1 border border-emerald-700 transition-colors"
            >
              {copiedReport ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copiedReport ? 'Report Copied' : 'Copy Report'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-rose-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-900/60 border border-rose-700/80 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-300">Schema Discrepancies Detected</span>
                <span className="text-[10px] font-mono uppercase bg-rose-900/80 text-rose-200 px-1.5 py-0.5 rounded border border-rose-700 font-bold">
                  {discrepancies.length} Error{discrepancies.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-rose-300/80">
                Response body violates contract constraints in {discrepancies.length} field
                {discrepancies.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-rose-300/70">
            <span>{new Date(validatedAt).toLocaleTimeString()}</span>
            <button
              onClick={handleCopyReport}
              className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-sans flex items-center gap-1 border border-rose-700 transition-colors cursor-pointer"
            >
              {copiedReport ? <Check className="w-3 h-3 text-rose-300" /> : <Copy className="w-3 h-3" />}
              <span>{copiedReport ? 'Report Copied' : 'Copy Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Discrepancies Filter Bar (if there are discrepancies) */}
      {discrepancies.length > 0 && (
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          {/* Keyword Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setKeywordFilter('ALL')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                keywordFilter === 'ALL'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({discrepancies.length})
            </button>
            {Object.entries(keywordCounts).map(([kw, count]) => (
              <button
                key={kw}
                onClick={() => setKeywordFilter(kw)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  keywordFilter.toLowerCase() === kw.toLowerCase()
                    ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {kw} ({count})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by path or error..."
              className="bg-slate-900 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500 w-48"
            />
          </div>
        </div>
      )}

      {/* Discrepancies List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {discrepancies.length === 0 ? (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-400 text-xs text-center">
            All response properties matched their expected schema definitions.
          </div>
        ) : filteredDiscrepancies.length === 0 ? (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-400 text-xs text-center">
            No discrepancies match current search or keyword filter.
          </div>
        ) : (
          filteredDiscrepancies.map((disc, index) => (
            <div
              key={disc.id || index}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg p-3 transition-colors text-xs space-y-2"
            >
              {/* Header: Path & Keyword Tag */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 truncate">
                    {disc.humanPath}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 truncate" title="JSON Pointer Path">
                    {disc.path}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                      disc.keyword === 'type'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : disc.keyword === 'required'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : disc.keyword === 'enum'
                        ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                        : 'bg-purple-950 text-purple-400 border-purple-800'
                    }`}
                  >
                    {disc.keyword}
                  </span>

                  {onSelectDiscrepancy && (
                    <button
                      onClick={() => onSelectDiscrepancy(disc)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                      title="Inspect field in Pretty JSON view"
                    >
                      <Eye className="w-3 h-3 text-sky-400" />
                      <span>Inspect</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="text-slate-200 font-medium">{disc.message}</div>

              {/* Expected vs Actual Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-950/80 rounded p-2 border border-slate-800 font-mono text-[11px]">
                  <span className="text-[10px] font-sans font-semibold text-emerald-400 block mb-0.5">
                    Expected by Contract:
                  </span>
                  <span className="text-slate-300 break-all">{disc.expected}</span>
                </div>

                <div className="bg-slate-950/80 rounded p-2 border border-slate-800 font-mono text-[11px]">
                  <span className="text-[10px] font-sans font-semibold text-rose-400 block mb-0.5">
                    Actual Value / Type:
                  </span>
                  <span className="text-rose-300 break-all">{disc.actual}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
