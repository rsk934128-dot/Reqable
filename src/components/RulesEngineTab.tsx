import React, { useState } from 'react';
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
} from 'lucide-react';
import { RuleType, TrafficRule } from '../types/reqable';

interface RulesEngineTabProps {
  rules: TrafficRule[];
  setRules: React.Dispatch<React.SetStateAction<TrafficRule[]>>;
}

export const RulesEngineTab: React.FC<RulesEngineTabProps> = ({ rules, setRules }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrafficRule | null>(null);

  // Form State
  const [formName, setFormName] = useState('New Rewrite Rule');
  const [formType, setFormType] = useState<RuleType>('rewrite');
  const [formMatchUrl, setFormMatchUrl] = useState('https://httpbin.org/*');
  const [formStatusCode, setFormStatusCode] = useState<number>(200);
  const [formBodyReplace, setFormBodyReplace] = useState('{\n  "mockedBy": "Reqable MITM Engine"\n}');
  const [formDelayMs, setFormDelayMs] = useState<number>(1000);

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

  const handleDeleteRule = async (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
    try {
      await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRule = async () => {
    const newRule: TrafficRule = {
      id: editingRule ? editingRule.id : `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: formName,
      enabled: true,
      type: formType,
      matchUrl: formMatchUrl,
      matchMethod: 'ALL',
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

  return (
    <div id="rules-engine-view" className="h-[calc(100vh-53px)] bg-slate-950 text-slate-200 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Title & Intro */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <span>MITM Traffic Interception Rules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure Breakpoints, URL Rewrites, Map Local mocks, Network Delays, and Custom Scripts for active HTTP(S) proxy traffic.
            </p>
          </div>

          <button
            id="btn-create-rule"
            onClick={() => {
              setEditingRule(null);
              setFormName('New Rewrite Rule');
              setFormType('rewrite');
              setFormMatchUrl('https://httpbin.org/*');
              setIsModalOpen(true);
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>

        {/* Rule Type Categories Grid */}
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

        {/* Active Rules List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Rules ({rules.length})
          </div>

          {rules.map((rule, idx) => (
            <div
              key={`${rule.id}-${idx}`}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                rule.enabled
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-60'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
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
                  <span className="font-bold text-sm text-slate-100">{rule.name}</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Match: <strong className="text-sky-300">{rule.matchUrl}</strong></span>
                  {rule.action.delayMs ? (
                    <span>Delay: {rule.action.delayMs}ms</span>
                  ) : null}
                  {rule.action.statusCode ? (
                    <span>Mock Status: {rule.action.statusCode}</span>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className="text-slate-400 hover:text-white"
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
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Create MITM Interception Rule</h3>
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
