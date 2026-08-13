import React, { useState, useRef, useMemo } from 'react';
import mockRulesEnginePreviewImg from '../assets/images/mock_rules_engine_preview_1786292041296.jpg';
import {
  Clock,
  Code,
  FileCode,
  Globe,
  Plus,
  Shield,
  Trash2,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  BarChart2,
  GripVertical,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  X,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Tag,
  Search,
  Layers,
  SlidersHorizontal,
  Edit2,
  ListFilter,
  Server,
  Play,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
  Terminal,
  Send,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HttpMethod, KeyValuePair, RuleType, TrafficRule } from '../types/reqable';
import { RulesAnalyticsWidget } from './RulesAnalyticsWidget';

interface RulesEngineTabProps {
  rules: TrafficRule[];
  setRules: React.Dispatch<React.SetStateAction<TrafficRule[]>>;
}

interface SortableRuleItemProps {
  rule: TrafficRule;
  index: number;
  allGroups: string[];
  handleToggleRule: (id: string) => void;
  handleDeleteRule: (id: string) => void;
  handleEditRule: (rule: TrafficRule) => void;
  handleAssignGroup: (ruleId: string, groupName: string) => void;
  handleRunTestEndpoint: (rule: TrafficRule) => void;
  handleCopyMockUrl: (rule: TrafficRule) => void;
}

const SortableRuleItem: React.FC<SortableRuleItemProps> = ({
  rule,
  index,
  allGroups,
  handleToggleRule,
  handleDeleteRule,
  handleEditRule,
  handleAssignGroup,
  handleRunTestEndpoint,
  handleCopyMockUrl,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isMockType = rule.type === 'mock_server' || rule.type === 'map_local';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDragging
          ? 'z-50 shadow-2xl opacity-90 border-sky-500 bg-slate-800 ring-2 ring-sky-500/30'
          : rule.enabled
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
          : 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-60'
      }`}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 text-slate-500 hover:text-sky-400 cursor-grab active:cursor-grabbing rounded hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
          title="Drag to reorder rule priority"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Priority Badge */}
        <span
          className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 min-w-[28px] text-center shrink-0"
          title={`Priority Rank: #${index + 1}`}
        >
          #{index + 1}
        </span>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase shrink-0 flex items-center gap-1 ${
                rule.type === 'mock_server'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : rule.type === 'breakpoint'
                  ? 'bg-sky-950 text-sky-400 border border-sky-800'
                  : rule.type === 'rewrite'
                  ? 'bg-purple-950 text-purple-400 border border-purple-800'
                  : rule.type === 'map_local'
                  ? 'bg-teal-950 text-teal-400 border border-teal-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {rule.type === 'mock_server' && <Server className="w-3 h-3 text-emerald-400" />}
              {rule.type === 'mock_server' ? 'API MOCK SERVER' : rule.type}
            </span>

            {rule.matchMethod && rule.matchMethod !== 'ALL' && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-sky-400 border border-slate-800 uppercase shrink-0">
                {rule.matchMethod}
              </span>
            )}

            <span className="font-bold text-sm text-slate-100 truncate">{rule.name}</span>

            {/* Folder / Group badge */}
            {rule.group && (
              <span className="text-[10px] font-medium font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1 shrink-0">
                <Folder className="w-3 h-3 text-sky-400" />
                <span>{rule.group}</span>
              </span>
            )}

            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800 shrink-0">
              Hits: {rule.hitCount || 0}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
            <span className="truncate">
              Match: <strong className="text-sky-300">{rule.matchUrl}</strong>
            </span>
            {rule.action.delayMs ? <span>Delay: {rule.action.delayMs}ms</span> : null}
            {rule.action.statusCode ? <span>Status: {rule.action.statusCode}</span> : null}
            {rule.action.failureRate ? (
              <span className="text-rose-400">Chaos: {rule.action.failureRate}%</span>
            ) : null}

            {/* Tags */}
            {rule.tags && rule.tags.length > 0 && (
              <div className="flex items-center gap-1 my-0.5">
                {rule.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-slate-800/80 text-sky-300 border border-slate-700/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Test Endpoint */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-between sm:justify-end">
        {/* Mock Server Test & Copy Buttons */}
        {isMockType && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCopyMockUrl(rule)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-xs transition-colors flex items-center gap-1"
              title="Copy Mock Endpoint URL"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline text-[10px] font-mono">Copy URL</span>
            </button>

            <button
              onClick={() => handleRunTestEndpoint(rule)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded flex items-center gap-1 transition-all"
              title="Send a live test request to this mock endpoint"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Test Mock</span>
            </button>
          </div>
        )}

        {/* Quick Folder Assignment */}
        <select
          value={rule.group || ''}
          onChange={(e) => handleAssignGroup(rule.id, e.target.value)}
          className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
          title="Move rule to folder group"
        >
          <option value="">(No Folder)</option>
          {allGroups.map((grp) => (
            <option key={grp} value={grp}>
              📂 {grp}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleEditRule(rule)}
            className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 text-xs font-medium px-2 py-1 transition-colors"
            title="Edit Rule"
          >
            Edit
          </button>

          <button
            onClick={() => handleToggleRule(rule.id)}
            className="text-slate-400 hover:text-white transition-colors"
            title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
          >
            {rule.enabled ? (
              <ToggleRight className="w-6 h-6 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-600" />
            )}
          </button>

          <button
            onClick={() => handleDeleteRule(rule.id)}
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
            title="Delete Rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const RulesEngineTab: React.FC<RulesEngineTabProps> = ({ rules, setRules }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrafficRule | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter & View State
  const [ruleTypeFilter, setRuleTypeFilter] = useState<'all' | 'mock_server' | 'interception'>('all');
  const [groupBy, setGroupBy] = useState<'folder' | 'type' | 'status' | 'none'>('folder');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New Group Folder Modal state
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');

  // Presets Modal State
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  // Test Runner Drawer State
  const [testResult, setTestResult] = useState<{
    ruleName: string;
    url: string;
    status: number;
    timeMs: number;
    headers: Record<string, string>;
    body: string;
  } | null>(null);
  const [isTestingRule, setIsTestingRule] = useState(false);

  // Form State
  const [formName, setFormName] = useState('New API Mock Endpoint');
  const [formType, setFormType] = useState<RuleType>('mock_server');
  const [formMethod, setFormMethod] = useState<HttpMethod | 'ALL'>('GET');
  const [formGroup, setFormGroup] = useState('API Mock Endpoints');
  const [formTags, setFormTags] = useState('mock-server, v1, json');
  const [formMatchUrl, setFormMatchUrl] = useState('/api/mock/v1/users/*');
  const [formStatusCode, setFormStatusCode] = useState<number>(200);
  const [formContentType, setFormContentType] = useState<string>('application/json');
  const [formBodyReplace, setFormBodyReplace] = useState(
    JSON.stringify(
      {
        id: '{{$guid}}',
        name: '{{$randomName}}',
        email: '{{$randomEmail}}',
        status: 'ACTIVE',
        createdAt: '{{$timestamp}}',
      },
      null,
      2
    )
  );
  const [formDelayMs, setFormDelayMs] = useState<number>(100);
  const [formFailureRate, setFormFailureRate] = useState<number>(0);
  const [formHeadersToAdd, setFormHeadersToAdd] = useState<KeyValuePair[]>([
    { id: 'h1', key: 'X-Mock-Engine', value: 'Reqable-Server', enabled: true },
  ]);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Extract unique groups & tags
  const allGroups = useMemo(() => {
    return Array.from(
      new Set(rules.map((r) => r.group).filter((g): g is string => Boolean(g)))
    ).sort();
  }, [rules]);

  const allTags = useMemo(() => {
    return Array.from(new Set(rules.flatMap((r) => r.tags || []))).sort();
  }, [rules]);

  // Filter rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      // Type Filter
      if (ruleTypeFilter === 'mock_server' && r.type !== 'mock_server' && r.type !== 'map_local') {
        return false;
      }
      if (
        ruleTypeFilter === 'interception' &&
        (r.type === 'mock_server' || r.type === 'map_local')
      ) {
        return false;
      }

      const matchesSearch =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.matchUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.group && r.group.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesTag = !selectedTag || (r.tags && r.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [rules, ruleTypeFilter, searchQuery, selectedTag]);

  // Grouped rules computation
  const groupedRules = useMemo(() => {
    if (groupBy === 'none') {
      return [{ title: 'All Rules', key: 'all', rules: filteredRules }];
    }

    if (groupBy === 'folder') {
      const map: Record<string, TrafficRule[]> = {};
      const ungrouped: TrafficRule[] = [];

      filteredRules.forEach((r) => {
        if (r.group) {
          if (!map[r.group]) map[r.group] = [];
          map[r.group].push(r);
        } else {
          ungrouped.push(r);
        }
      });

      const result = Object.keys(map).map((groupName) => ({
        title: groupName,
        key: `folder-${groupName}`,
        rules: map[groupName],
      }));

      if (ungrouped.length > 0) {
        result.push({
          title: 'Ungrouped Rules',
          key: 'folder-ungrouped',
          rules: ungrouped,
        });
      }

      return result;
    }

    if (groupBy === 'type') {
      const typeLabels: Record<RuleType, string> = {
        mock_server: '⚡ API Mock Server Endpoints',
        rewrite: 'URL Rewrite & Header Injection',
        breakpoint: 'Breakpoint Intercept',
        map_local: 'Map Local File Mock',
        delay: 'Network Latency Delay',
        script: 'Custom Scripting',
      };
      const map: Record<string, TrafficRule[]> = {};
      filteredRules.forEach((r) => {
        const label = typeLabels[r.type] || r.type;
        if (!map[label]) map[label] = [];
        map[label].push(r);
      });

      return Object.keys(map).map((label) => ({
        title: label,
        key: `type-${label}`,
        rules: map[label],
      }));
    }

    if (groupBy === 'status') {
      const enabledRules = filteredRules.filter((r) => r.enabled);
      const disabledRules = filteredRules.filter((r) => !r.enabled);
      const res = [];
      if (enabledRules.length > 0) {
        res.push({
          title: 'Enabled Active Rules',
          key: 'status-enabled',
          rules: enabledRules,
        });
      }
      if (disabledRules.length > 0) {
        res.push({
          title: 'Disabled Rules',
          key: 'status-disabled',
          rules: disabledRules,
        });
      }
      return res;
    }

    return [{ title: 'All Rules', key: 'all', rules: filteredRules }];
  }, [filteredRules, groupBy]);

  const toggleFolderCollapse = (key: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExportRules = () => {
    if (rules.length === 0) {
      triggerNotification('error', 'No rules available to export.');
      return;
    }

    const exportPayload = {
      version: '1.0',
      app: 'Reqable MITM & API Mock Engine',
      exportedAt: new Date().toISOString(),
      totalRules: rules.length,
      rules,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `reqable-mock-rules-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerNotification(
      'success',
      `Exported ${rules.length} rule${rules.length === 1 ? '' : 's'} to JSON!`
    );
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const importedArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.rules)
          ? parsed.rules
          : null;

        if (!importedArray || importedArray.length === 0) {
          triggerNotification('error', 'Import failed: No valid rules found in JSON file.');
          return;
        }

        const sanitizedRules: TrafficRule[] = importedArray.map((r: any, idx: number) => ({
          id: r.id && typeof r.id === 'string' ? r.id : `imp-${Date.now()}-${idx}`,
          name: String(r.name || `Imported Rule #${idx + 1}`),
          enabled: Boolean(r.enabled ?? true),
          type: ['rewrite', 'breakpoint', 'map_local', 'delay', 'mock_server'].includes(r.type)
            ? r.type
            : 'mock_server',
          group: r.group ? String(r.group) : undefined,
          tags: Array.isArray(r.tags) ? r.tags.map(String) : undefined,
          matchUrl: String(r.matchUrl || '*'),
          matchMethod: r.matchMethod || 'ALL',
          hitCount: typeof r.hitCount === 'number' ? r.hitCount : 0,
          action: {
            statusCode: r.action?.statusCode ? Number(r.action.statusCode) : 200,
            contentType: r.action?.contentType ? String(r.action.contentType) : 'application/json',
            headersToAdd: Array.isArray(r.action?.headersToAdd) ? r.action.headersToAdd : undefined,
            bodyReplace: r.action?.bodyReplace ? String(r.action.bodyReplace) : undefined,
            delayMs: r.action?.delayMs ? Number(r.action.delayMs) : undefined,
            failureRate: r.action?.failureRate ? Number(r.action.failureRate) : undefined,
          },
        }));

        setRules((prev) => [...sanitizedRules, ...prev]);
        triggerNotification('success', `Imported ${sanitizedRules.length} rules successfully!`);
      } catch (err) {
        triggerNotification('error', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRules((prevRules) => {
        const oldIndex = prevRules.findIndex((item) => item.id === active.id);
        const newIndex = prevRules.findIndex((item) => item.id === over.id);
        return arrayMove(prevRules, oldIndex, newIndex);
      });
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);
  };

  const handleToggleAllInGroup = async (groupRules: TrafficRule[], enable: boolean) => {
    const targetIds = new Set(groupRules.map((r) => r.id));
    const updated = rules.map((r) => (targetIds.has(r.id) ? { ...r, enabled: enable } : r));
    setRules(updated);
    triggerNotification('success', `${enable ? 'Enabled' : 'Disabled'} ${groupRules.length} rule(s).`);
  };

  const handleAssignGroup = async (ruleId: string, groupName: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, group: groupName || undefined } : r));
    setRules(updated);
  };

  const handleDeleteRule = async (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  const handleCopyMockUrl = (rule: TrafficRule) => {
    let mockPath = rule.matchUrl;
    if (!mockPath.startsWith('http://') && !mockPath.startsWith('https://')) {
      if (!mockPath.startsWith('/')) mockPath = '/' + mockPath;
      if (!mockPath.startsWith('/api/mock/')) {
        mockPath = '/api/mock' + mockPath;
      }
    }
    const fullUrl = `${window.location.origin}${mockPath.replace(/\*/g, '123')}`;
    navigator.clipboard.writeText(fullUrl);
    triggerNotification('success', `Copied Mock URL: ${fullUrl}`);
  };

  const handleRunTestEndpoint = async (rule: TrafficRule) => {
    setIsTestingRule(true);
    const startTime = Date.now();
    let targetUrl = rule.matchUrl;

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (!targetUrl.startsWith('/')) targetUrl = '/' + targetUrl;
      targetUrl = targetUrl.replace(/\*/g, '101');
      if (!targetUrl.startsWith('/api/mock/')) {
        targetUrl = '/api/mock' + targetUrl;
      }
    }

    try {
      const method = rule.matchMethod && rule.matchMethod !== 'ALL' ? rule.matchMethod : 'GET';
      const res = await fetch(targetUrl, { method });
      const duration = Date.now() - startTime;
      const resText = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      setTestResult({
        ruleName: rule.name,
        url: targetUrl,
        status: res.status,
        timeMs: duration,
        headers: resHeaders,
        body: resText,
      });

      // Increment hit count
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, hitCount: (r.hitCount || 0) + 1 } : r))
      );

      triggerNotification('success', `Tested mock endpoint: Status ${res.status} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - startTime;
      setTestResult({
        ruleName: rule.name,
        url: targetUrl,
        status: 500,
        timeMs: duration,
        headers: {},
        body: JSON.stringify({ error: 'Failed to execute mock request', details: String(err) }, null, 2),
      });
      triggerNotification('error', `Failed to send request: ${String(err)}`);
    } finally {
      setIsTestingRule(false);
    }
  };

  const handleEditRule = (rule: TrafficRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormType(rule.type);
    setFormMethod(rule.matchMethod || 'GET');
    setFormGroup(rule.group || 'API Mock Endpoints');
    setFormTags(rule.tags ? rule.tags.join(', ') : '');
    setFormMatchUrl(rule.matchUrl);
    setFormStatusCode(rule.action.statusCode || 200);
    setFormContentType(rule.action.contentType || 'application/json');
    setFormBodyReplace(
      rule.action.bodyReplace || '{\n  "message": "Mock response from Reqable Server"\n}'
    );
    setFormDelayMs(rule.action.delayMs || 100);
    setFormFailureRate(rule.action.failureRate || 0);
    setFormHeadersToAdd(rule.action.headersToAdd || []);
    setIsModalOpen(true);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(formBodyReplace);
      setFormBodyReplace(JSON.stringify(parsed, null, 2));
      triggerNotification('success', 'JSON body formatted cleanly!');
    } catch {
      triggerNotification('error', 'Invalid JSON payload. Check syntax.');
    }
  };

  const handleInsertVariable = (varName: string) => {
    setFormBodyReplace((prev) => prev + varName);
  };

  const handleSaveRule = async () => {
    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newRule: TrafficRule = {
      id: editingRule ? editingRule.id : `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: formName,
      enabled: editingRule ? editingRule.enabled : true,
      type: formType,
      group: formGroup.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      matchUrl: formMatchUrl,
      matchMethod: formMethod,
      hitCount: editingRule ? editingRule.hitCount : 0,
      action: {
        statusCode: formStatusCode,
        contentType: formContentType,
        bodyReplace: formBodyReplace,
        delayMs: formDelayMs,
        failureRate: formFailureRate,
        headersToAdd: formHeadersToAdd,
      },
    };

    if (editingRule) {
      setRules(rules.map((r) => (r.id === editingRule.id ? newRule : r)));
    } else {
      setRules([newRule, ...rules]);
      try {
        await fetch('/api/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRule),
        });
      } catch (e) {
        console.error(e);
      }
    }

    setIsModalOpen(false);
    setEditingRule(null);
    triggerNotification('success', `Saved rule "${formName}"!`);
  };

  const handleLoadPreset = (preset: {
    name: string;
    type: RuleType;
    method: HttpMethod | 'ALL';
    group: string;
    tags: string[];
    matchUrl: string;
    statusCode: number;
    contentType: string;
    delayMs: number;
    body: string;
  }) => {
    setEditingRule(null);
    setFormName(preset.name);
    setFormType(preset.type);
    setFormMethod(preset.method);
    setFormGroup(preset.group);
    setFormTags(preset.tags.join(', '));
    setFormMatchUrl(preset.matchUrl);
    setFormStatusCode(preset.statusCode);
    setFormContentType(preset.contentType);
    setFormDelayMs(preset.delayMs);
    setFormBodyReplace(preset.body);
    setIsPresetsModalOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div id="rules-engine-view" className="h-[calc(100vh-53px)] bg-slate-950 text-slate-200 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/20 shrink-0 bg-slate-900">
              <img
                src={mockRulesEnginePreviewImg}
                alt="Reqable Mock Rules Engine Visual"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Rules Engine & API Mock Server</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate backend API endpoints with custom response bodies, dynamic variables, network latency, and chaos engineering.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json,application/json"
              className="hidden"
            />

            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Load pre-built API Mock presets"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Mock Presets</span>
            </button>

            <button
              onClick={handleExportRules}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import</span>
            </button>

            <button
              id="btn-create-rule"
              onClick={() => {
                setEditingRule(null);
                setFormName('New API Mock Endpoint');
                setFormType('mock_server');
                setFormMethod('GET');
                setFormMatchUrl('/api/mock/v1/users/*');
                setFormGroup('API Mock Endpoints');
                setFormTags('mock-server, v1');
                setIsModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Mock Endpoint</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs shadow-lg transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-200'
                : 'bg-rose-950/80 border-rose-800/80 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Analytics Section */}
        <RulesAnalyticsWidget rules={rules} />

        {/* Filter Bar & Sub-Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          {/* Sub-tab view filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setRuleTypeFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                ruleTypeFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Rules ({rules.length})
            </button>
            <button
              onClick={() => setRuleTypeFilter('mock_server')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                ruleTypeFilter === 'mock_server'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>API Mock Endpoints</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-emerald-300 font-mono">
                {rules.filter((r) => r.type === 'mock_server' || r.type === 'map_local').length}
              </span>
            </button>
            <button
              onClick={() => setRuleTypeFilter('interception')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                ruleTypeFilter === 'interception'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>MITM Interceptors</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mock endpoints by path, title, tag, or folder..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Rules List by Folders */}
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {groupedRules.map((group) => {
              const isCollapsed = collapsedFolders[group.key];
              const groupEnabledCount = group.rules.filter((r) => r.enabled).length;

              return (
                <div
                  key={group.key}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
                    <div
                      onClick={() => toggleFolderCollapse(group.key)}
                      className="flex items-center gap-2 cursor-pointer hover:text-sky-300 transition-colors flex-1 min-w-0"
                    >
                      {isCollapsed ? (
                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-bold text-sm text-slate-100 truncate">{group.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                        {group.rules.length} {group.rules.length === 1 ? 'rule' : 'rules'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAllInGroup(group.rules, true)}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => handleToggleAllInGroup(group.rules, false)}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-3">
                      {group.rules.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 font-mono">
                          No rules match the current filters in this folder.
                        </div>
                      ) : (
                        <SortableContext items={group.rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2.5">
                            {group.rules.map((rule, idx) => (
                              <SortableRuleItem
                                key={rule.id}
                                rule={rule}
                                index={idx}
                                allGroups={allGroups}
                                handleToggleRule={handleToggleRule}
                                handleDeleteRule={handleDeleteRule}
                                handleEditRule={handleEditRule}
                                handleAssignGroup={handleAssignGroup}
                                handleRunTestEndpoint={handleRunTestEndpoint}
                                handleCopyMockUrl={handleCopyMockUrl}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </DndContext>
        </div>
      </div>

      {/* TEST MOCK ENDPOINT RESULT MODAL */}
      {testResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  Live Mock Response Test — {testResult.ruleName}
                </h3>
              </div>
              <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400 truncate max-w-md">{testResult.url}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      testResult.status === 200 || testResult.status === 201
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    STATUS {testResult.status}
                  </span>
                  <span className="text-slate-400 text-[10px]">{testResult.timeMs}ms</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Response Body Payload</label>
                <textarea
                  readOnly
                  rows={8}
                  value={testResult.body}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 font-mono text-emerald-300 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setTestResult(null)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Test Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESETS MODAL */}
      {isPresetsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Select Pre-built API Mock Preset</span>
              </h3>
              <button onClick={() => setIsPresetsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  name: 'User Profile GET API',
                  type: 'mock_server' as RuleType,
                  method: 'GET' as const,
                  group: 'API Mock Endpoints',
                  tags: ['users', 'mock', 'v1'],
                  matchUrl: '/api/mock/v1/users/*',
                  statusCode: 200,
                  contentType: 'application/json',
                  delayMs: 150,
                  body: JSON.stringify(
                    {
                      id: '{{$guid}}',
                      name: '{{$randomName}}',
                      email: '{{$randomEmail}}',
                      role: 'Lead Full-Stack Developer',
                      status: 'ACTIVE',
                      updatedAt: '{{$timestamp}}',
                    },
                    null,
                    2
                  ),
                },
                {
                  name: 'Auth JWT Login POST API',
                  type: 'mock_server' as RuleType,
                  method: 'POST' as const,
                  group: 'API Mock Endpoints',
                  tags: ['auth', 'login', 'token'],
                  matchUrl: '/api/mock/v1/auth/login',
                  statusCode: 200,
                  contentType: 'application/json',
                  delayMs: 200,
                  body: JSON.stringify(
                    {
                      token_type: 'Bearer',
                      access_token: 'reqable_jwt_{{$guid}}',
                      expires_in: 3600,
                      refresh_token: 'reqable_refresh_{{$guid}}',
                      issued_at: '{{$timestamp}}',
                    },
                    null,
                    2
                  ),
                },
                {
                  name: 'E-Commerce Products GET Catalog',
                  type: 'mock_server' as RuleType,
                  method: 'GET' as const,
                  group: 'API Mock Endpoints',
                  tags: ['products', 'catalog', 'json'],
                  matchUrl: '/api/mock/v1/products',
                  statusCode: 200,
                  contentType: 'application/json',
                  delayMs: 100,
                  body: JSON.stringify(
                    {
                      total: 2,
                      products: [
                        { id: 'p-1', name: 'Reqable Pro Key', price: '{{$randomPrice}}', stock: 100 },
                        { id: 'p-2', name: 'MITM Hardware Proxy', price: '{{$randomPrice}}', stock: 25 },
                      ],
                    },
                    null,
                    2
                  ),
                },
                {
                  name: '500 Server Error Simulation',
                  type: 'mock_server' as RuleType,
                  method: 'ALL' as const,
                  group: 'Error Simulations',
                  tags: ['error', '500', 'chaos'],
                  matchUrl: '/api/mock/v1/error/500',
                  statusCode: 500,
                  contentType: 'application/json',
                  delayMs: 300,
                  body: JSON.stringify(
                    {
                      error: 'InternalServerError',
                      message: 'Simulated 500 server crash from Reqable Mock Engine',
                      timestamp: '{{$timestamp}}',
                    },
                    null,
                    2
                  ),
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadPreset(p)}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-200 group-hover:text-emerald-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {p.method} {p.matchUrl}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-mono font-bold">
                    Load
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MOCK RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>{editingRule ? 'Edit Mock / Interceptor Rule' : 'Create API Mock Server Rule'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rule / Endpoint Title</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. User Profile API Endpoint"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Rule Category / Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as RuleType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mock_server">⚡ API Mock Server Endpoint</option>
                    <option value="rewrite">URL Rewrite / Header Injection</option>
                    <option value="breakpoint">Breakpoint Intercept</option>
                    <option value="map_local">Map Local Mock File</option>
                    <option value="delay">Network Throttling Delay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">HTTP Method Match</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as HttpMethod | 'ALL')}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">ALL Methods (*)</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Mock Endpoint Path / Match URL Pattern</label>
                <input
                  type="text"
                  value={formMatchUrl}
                  onChange={(e) => setFormMatchUrl(e.target.value)}
                  placeholder="e.g. /api/mock/v1/users/* or https://httpbin.org/*"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Folder / Group Name</label>
                  <input
                    type="text"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    placeholder="e.g. API Mock Endpoints"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. users, mock, v1"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Status Code & Content Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mock Response Status Code</label>
                  <select
                    value={formStatusCode}
                    onChange={(e) => setFormStatusCode(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                  >
                    <option value={200}>200 OK</option>
                    <option value={201}>201 Created</option>
                    <option value={204}>204 No Content</option>
                    <option value={400}>400 Bad Request</option>
                    <option value={401}>401 Unauthorized</option>
                    <option value={403}>403 Forbidden</option>
                    <option value={404}>404 Not Found</option>
                    <option value={422}>422 Unprocessable Entity</option>
                    <option value={500}>500 Internal Server Error</option>
                    <option value={503}>503 Service Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Content Type</label>
                  <select
                    value={formContentType}
                    onChange={(e) => setFormContentType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                  >
                    <option value="application/json">application/json</option>
                    <option value="text/plain">text/plain</option>
                    <option value="application/xml">application/xml</option>
                    <option value="text/html">text/html</option>
                  </select>
                </div>
              </div>

              {/* Delay & Chaos Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Network Delay Latency (ms)</label>
                  <input
                    type="number"
                    value={formDelayMs}
                    onChange={(e) => setFormDelayMs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Chaos Failure Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formFailureRate}
                    onChange={(e) => setFormFailureRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Dynamic Variables helper pills */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-semibold">Insert Dynamic Template Variables</label>
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono underline"
                  >
                    Format JSON
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    '{{$guid}}',
                    '{{$timestamp}}',
                    '{{$randomInt}}',
                    '{{$randomName}}',
                    '{{$randomEmail}}',
                    '{{$randomPrice}}',
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 hover:bg-slate-800"
                    >
                      + {v}
                    </button>
                  ))}
                </div>

                <textarea
                  value={formBodyReplace}
                  onChange={(e) => setFormBodyReplace(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 font-mono text-emerald-300 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                className="px-4 py-2 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
              >
                Save Mock Endpoint Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
