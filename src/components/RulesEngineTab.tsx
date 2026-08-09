import React, { useState, useRef, useMemo } from 'react';
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
import { RuleType, TrafficRule } from '../types/reqable';
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
}

const SortableRuleItem: React.FC<SortableRuleItemProps> = ({
  rule,
  index,
  allGroups,
  handleToggleRule,
  handleDeleteRule,
  handleEditRule,
  handleAssignGroup,
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase shrink-0 ${
                rule.type === 'breakpoint'
                  ? 'bg-sky-950 text-sky-400 border border-sky-800'
                  : rule.type === 'rewrite'
                  ? 'bg-purple-950 text-purple-400 border border-purple-800'
                  : rule.type === 'map_local'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {rule.type}
            </span>

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
            {rule.action.delayMs ? (
              <span>Delay: {rule.action.delayMs}ms</span>
            ) : null}
            {rule.action.statusCode ? (
              <span>Mock Status: {rule.action.statusCode}</span>
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

      {/* Group Quick Selector & Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-between sm:justify-end">
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

  // Grouping & Filtering State
  const [groupBy, setGroupBy] = useState<'folder' | 'type' | 'status' | 'none'>('folder');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New Group Folder Modal state
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');

  // Form State
  const [formName, setFormName] = useState('New Rewrite Rule');
  const [formType, setFormType] = useState<RuleType>('rewrite');
  const [formGroup, setFormGroup] = useState('Debugging & Headers');
  const [formTags, setFormTags] = useState('debug, custom');
  const [formMatchUrl, setFormMatchUrl] = useState('https://httpbin.org/*');
  const [formStatusCode, setFormStatusCode] = useState<number>(200);
  const [formBodyReplace, setFormBodyReplace] = useState('{\n  "mockedBy": "Reqable MITM Engine"\n}');
  const [formDelayMs, setFormDelayMs] = useState<number>(1000);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Extract all unique group names across rules
  const allGroups = useMemo(() => {
    return Array.from(
      new Set(rules.map((r) => r.group).filter((g): g is string => Boolean(g)))
    ).sort();
  }, [rules]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    return Array.from(
      new Set(rules.flatMap((r) => r.tags || []))
    ).sort();
  }, [rules]);

  // Filter rules based on search & tag selection
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.matchUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.group && r.group.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesTag = !selectedTag || (r.tags && r.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [rules, searchQuery, selectedTag]);

  // Compute grouped rules
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

  const expandAllFolders = () => {
    setCollapsedFolders({});
  };

  const collapseAllFolders = () => {
    const next: Record<string, boolean> = {};
    groupedRules.forEach((g) => {
      next[g.key] = true;
    });
    setCollapsedFolders(next);
  };

  const handleExportRules = () => {
    if (rules.length === 0) {
      triggerNotification('error', 'No rules available to export.');
      return;
    }

    const exportPayload = {
      version: '1.0',
      app: 'Reqable MITM Proxy Rules',
      exportedAt: new Date().toISOString(),
      totalRules: rules.length,
      rules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        group: r.group,
        tags: r.tags,
        enabled: r.enabled,
        matchUrl: r.matchUrl,
        matchMethod: r.matchMethod || 'ALL',
        matchStatus: r.matchStatus,
        hitCount: r.hitCount || 0,
        action: r.action,
      })),
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `reqable-rules-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerNotification(
      'success',
      `Exported ${rules.length} rule${rules.length === 1 ? '' : 's'} to JSON file!`
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
          id: r.id && typeof r.id === 'string'
            ? `imported-${r.id}-${Date.now().toString(36).substring(2, 5)}`
            : `imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          name: String(r.name || `Imported Rule #${idx + 1}`),
          enabled: Boolean(r.enabled ?? true),
          type: ['rewrite', 'breakpoint', 'map_local', 'delay', 'script'].includes(r.type)
            ? r.type
            : 'rewrite',
          group: r.group ? String(r.group) : undefined,
          tags: Array.isArray(r.tags) ? r.tags.map(String) : undefined,
          matchUrl: String(r.matchUrl || '*'),
          matchMethod: r.matchMethod || 'ALL',
          matchStatus: r.matchStatus ? Number(r.matchStatus) : undefined,
          hitCount: typeof r.hitCount === 'number' ? r.hitCount : 0,
          action: {
            statusCode: r.action?.statusCode ? Number(r.action.statusCode) : 200,
            headersToAdd: Array.isArray(r.action?.headersToAdd) ? r.action.headersToAdd : undefined,
            bodyReplace: r.action?.bodyReplace ? String(r.action.bodyReplace) : undefined,
            mapLocalFile: r.action?.mapLocalFile ? String(r.action.mapLocalFile) : undefined,
            delayMs: r.action?.delayMs ? Number(r.action.delayMs) : undefined,
          },
        }));

        setRules((prev) => [...sanitizedRules, ...prev]);

        for (const rule of sanitizedRules) {
          try {
            await fetch('/api/rules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rule),
            });
          } catch (err) {
            console.error('Failed to sync rule to API:', err);
          }
        }

        triggerNotification(
          'success',
          `Batch imported ${sanitizedRules.length} rule${sanitizedRules.length === 1 ? '' : 's'} successfully!`
        );
      } catch (err) {
        console.error('JSON parsing error during rule import:', err);
        triggerNotification('error', 'Failed to parse JSON file. Please ensure it is valid JSON.');
      } finally {
        if (e.target) {
          e.target.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
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

  const handleTriggerHit = (ruleId: string) => {
    setRules((prevRules) =>
      prevRules.map((r) => (r.id === ruleId ? { ...r, hitCount: (r.hitCount || 0) + 1 } : r))
    );
  };

  const handleToggleRule = async (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);
    const target = updated.find((r) => r.id === ruleId);
    if (target) {
      try {
        await fetch(`/api/rules/${ruleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleAllInGroup = async (groupRules: TrafficRule[], enable: boolean) => {
    const targetIds = new Set(groupRules.map((r) => r.id));
    const updated = rules.map((r) => (targetIds.has(r.id) ? { ...r, enabled: enable } : r));
    setRules(updated);
    triggerNotification('success', `${enable ? 'Enabled' : 'Disabled'} ${groupRules.length} rule(s) in group.`);
  };

  const handleAssignGroup = async (ruleId: string, groupName: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, group: groupName || undefined } : r));
    setRules(updated);
    const target = updated.find((r) => r.id === ruleId);
    if (target) {
      try {
        await fetch(`/api/rules/${ruleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
    try {
      await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRule = (rule: TrafficRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormType(rule.type);
    setFormGroup(rule.group || 'Debugging & Headers');
    setFormTags(rule.tags ? rule.tags.join(', ') : '');
    setFormMatchUrl(rule.matchUrl);
    setFormStatusCode(rule.action.statusCode || 200);
    setFormBodyReplace(rule.action.bodyReplace || '{\n  "mockedBy": "Reqable MITM Engine"\n}');
    setFormDelayMs(rule.action.delayMs || 1000);
    setIsModalOpen(true);
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
      matchMethod: 'ALL',
      hitCount: editingRule ? editingRule.hitCount : 0,
      action: {
        statusCode: formStatusCode,
        bodyReplace: formBodyReplace,
        delayMs: formDelayMs,
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
  };

  const handleCreateNewGroupFolder = () => {
    if (!newGroupNameInput.trim()) return;
    const gName = newGroupNameInput.trim();
    // Pre-fill form group to this name and open rule creation
    setEditingRule(null);
    setFormName(`${gName} Mock Rule`);
    setFormGroup(gName);
    setFormTags(gName.toLowerCase().replace(/\s+/g, '-'));
    setIsNewGroupModalOpen(false);
    setNewGroupNameInput('');
    setIsModalOpen(true);
    triggerNotification('success', `Created folder group "${gName}". Create a rule inside it!`);
  };

  return (
    <div id="rules-engine-view" className="h-[calc(100vh-53px)] bg-slate-950 text-slate-200 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title & Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <span>MITM Traffic Interception Rules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure Breakpoints, URL Rewrites, Map Local mocks, Network Delays, and Custom Scripts grouped in collapsible folders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Hidden File Input for Batch Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json,application/json"
              className="hidden"
            />

            <button
              onClick={() => setIsNewGroupModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Add new folder group"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>New Folder</span>
            </button>

            <button
              onClick={handleExportRules}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Export all current rules as a JSON file"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Batch import rules from a JSON file"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import JSON</span>
            </button>

            <button
              id="btn-create-rule"
              onClick={() => {
                setEditingRule(null);
                setFormName('New Rewrite Rule');
                setFormType('rewrite');
                setFormMatchUrl('https://httpbin.org/*');
                setFormGroup(allGroups[0] || 'Debugging & Headers');
                setFormTags('debug');
                setIsModalOpen(true);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          </div>
        </div>

        {/* Notification Toast Banner */}
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
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Rule Type Categories Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-sky-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4" /> Breakpoints
            </div>
            <p className="text-slate-400 text-[11px]">Pause and edit live requests/responses before forwarding.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-purple-400 flex items-center gap-1.5 mb-1">
              <Globe className="w-4 h-4" /> URL Rewrites
            </div>
            <p className="text-slate-400 text-[11px]">Automatically inject headers or rewrite body payloads on the fly.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <FileCode className="w-4 h-4" /> Map Local
            </div>
            <p className="text-slate-400 text-[11px]">Substitute remote API responses with local mock JSON files.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4" /> Delay & Throttling
            </div>
            <p className="text-slate-400 text-[11px]">Simulate 3G/4G network latency and slow connection speeds.</p>
          </div>
        </div>

        {/* Recharts Analytics Bar Chart Widget */}
        <RulesAnalyticsWidget rules={rules} onTriggerHit={handleTriggerHit} />

        {/* Grouping & Search Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules by title, URL pattern, group, or #tag..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
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

            {/* Grouping Mode Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Group By:</span>
              </span>
              <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setGroupBy('folder')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    groupBy === 'folder'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Folders
                </button>
                <button
                  onClick={() => setGroupBy('type')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    groupBy === 'type'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Type
                </button>
                <button
                  onClick={() => setGroupBy('status')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    groupBy === 'status'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Status
                </button>
                <button
                  onClick={() => setGroupBy('none')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    groupBy === 'none'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flat List
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tag Filter & Collapse Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3 text-emerald-400" /> Filter Tag:
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  selectedTag === null
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedTag === tag
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {groupBy !== 'none' && (
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={expandAllFolders}
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  Expand All
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={collapseAllFolders}
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Rules List / Collapsible Folder Groups */}
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {groupedRules.map((group) => {
              const isCollapsed = Boolean(collapsedFolders[group.key]);
              const groupEnabledCount = group.rules.filter((r) => r.enabled).length;
              const groupTotalHits = group.rules.reduce((acc, r) => acc + (r.hitCount || 0), 0);

              return (
                <div
                  key={group.key}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Folder Header */}
                  {groupBy !== 'none' && (
                    <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 select-none">
                      <div
                        onClick={() => toggleFolderCollapse(group.key)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                      >
                        <button className="text-slate-400 hover:text-white">
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-sky-400" />
                          )}
                        </button>

                        {isCollapsed ? (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                        )}

                        <span className="font-bold text-sm text-slate-100 truncate">
                          {group.title}
                        </span>

                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                          {group.rules.length} {group.rules.length === 1 ? 'rule' : 'rules'}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 shrink-0">
                          {groupEnabledCount} active
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800 shrink-0 hidden sm:inline">
                          {groupTotalHits} hits
                        </span>
                      </div>

                      {/* Folder Group Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleAllInGroup(group.rules, true)}
                          className="text-[10px] font-medium font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                          title="Enable all rules in this group"
                        >
                          Enable All
                        </button>
                        <button
                          onClick={() => handleToggleAllInGroup(group.rules, false)}
                          className="text-[10px] font-medium font-mono px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors"
                          title="Disable all rules in this group"
                        >
                          Disable All
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Folder Body Rules List */}
                  {!isCollapsed && (
                    <div className="p-3">
                      {group.rules.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 font-mono">
                          No rules match the current filters in this group.
                        </div>
                      ) : (
                        <SortableContext
                          items={group.rules.map((r) => r.id)}
                          strategy={verticalListSortingStrategy}
                        >
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

      {/* NEW FOLDER GROUP MODAL */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>Create New Folder Group</span>
              </h3>
              <button onClick={() => setIsNewGroupModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-semibold">Folder / Group Name</label>
              <input
                type="text"
                value={newGroupNameInput}
                onChange={(e) => setNewGroupNameInput(e.target.value)}
                placeholder="e.g. Auth Service, Payment Gateway, Rate Limits..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsNewGroupModalOpen(false)}
                className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewGroupFolder}
                className="px-3.5 py-1.5 rounded bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 shadow-md shadow-sky-600/20"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingRule ? 'Edit MITM Interception Rule' : 'Create MITM Interception Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rule Title</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Rule Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as RuleType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="rewrite">URL Rewrite / Header Injection</option>
                    <option value="breakpoint">Breakpoint Intercept</option>
                    <option value="map_local">Map Local Mock File</option>
                    <option value="delay">Network Throttling Delay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Folder Group</label>
                  <input
                    type="text"
                    list="group-suggestions"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    placeholder="e.g. Debugging & Headers"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <datalist id="group-suggestions">
                    {allGroups.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. debug, headers, payment, auth"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Match URL Pattern (Glob or Regex)</label>
                <input
                  type="text"
                  value={formMatchUrl}
                  onChange={(e) => setFormMatchUrl(e.target.value)}
                  placeholder="e.g. https://httpbin.org/* or */checkout*"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {formType === 'delay' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Delay Latency (ms)</label>
                  <input
                    type="number"
                    value={formDelayMs}
                    onChange={(e) => setFormDelayMs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                  />
                </div>
              )}

              {(formType === 'map_local' || formType === 'breakpoint' || formType === 'rewrite') && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Mock Status Code</label>
                    <input
                      type="number"
                      value={formStatusCode}
                      onChange={(e) => setFormStatusCode(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Replacement Body (JSON/Text)</label>
                    <textarea
                      value={formBodyReplace}
                      onChange={(e) => setFormBodyReplace(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 font-mono text-slate-100 resize-none"
                    />
                  </div>
                </>
              )}
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
                className="px-4 py-2 rounded bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 shadow-md shadow-sky-600/20"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
