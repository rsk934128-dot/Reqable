import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, Activity, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { TrafficRule } from '../types/reqable';

interface RulesAnalyticsWidgetProps {
  rules: TrafficRule[];
  onTriggerHit?: (ruleId: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  rewrite: '#a855f7', // purple-500
  breakpoint: '#38bdf8', // sky-400
  map_local: '#34d399', // emerald-400
  mock_server: '#10b981', // emerald-500
  delay: '#fbbf24', // amber-400
  script: '#f43f5e', // rose-500
};

export const RulesAnalyticsWidget: React.FC<RulesAnalyticsWidgetProps> = ({ rules, onTriggerHit }) => {
  const [metricView, setMetricView] = useState<'hits' | 'frequency'>('hits');

  const totalHits = rules.reduce((sum, r) => sum + (r.hitCount || 0), 0);

  const chartData = rules.map((rule) => {
    const hits = rule.hitCount || 0;
    const frequency = totalHits > 0 ? Number(((hits / totalHits) * 100).toFixed(1)) : 0;
    return {
      id: rule.id,
      rawName: rule.name,
      shortName: rule.name.length > 22 ? `${rule.name.substring(0, 20)}...` : rule.name,
      type: rule.type,
      enabled: rule.enabled,
      matchUrl: rule.matchUrl,
      hits,
      frequency,
      color: TYPE_COLORS[rule.type] || '#94a3b8',
    };
  });

  const activeHits = rules
    .filter((r) => r.enabled)
    .reduce((sum, r) => sum + (r.hitCount || 0), 0);

  const topRule = [...rules].sort((a, b) => (b.hitCount || 0) - (a.hitCount || 0))[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>Rules Analytics & Interception Frequency</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                Recharts Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live visualization of hit-counts and relative traffic interception frequency per mock rule.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMetricView('hits')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              metricView === 'hits'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hit Count
          </button>
          <button
            onClick={() => setMetricView('frequency')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              metricView === 'frequency'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Frequency (%)
          </button>
        </div>
      </div>

      {/* Summary Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <Activity className="w-3.5 h-3.5 text-sky-400" /> Total Interceptions
          </div>
          <div className="text-lg font-bold font-mono text-white">{totalHits.toLocaleString()}</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Active Rules Share
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {totalHits > 0 ? ((activeHits / totalHits) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <Zap className="w-3.5 h-3.5 text-purple-400" /> Top Rule
          </div>
          <div className="text-xs font-semibold text-purple-300 truncate" title={topRule?.name || 'N/A'}>
            {topRule ? `${topRule.name} (${topRule.hitCount || 0})` : 'None'}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Avg. Hits / Rule
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            {rules.length > 0 ? Math.round(totalHits / rules.length) : 0}
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-64 w-full pt-2">
        {rules.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-lg">
            No rules configured to display analytics.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="shortName"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                unit={metricView === 'frequency' ? '%' : ''}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-lg shadow-2xl text-xs space-y-1.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{data.rawName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          URL: <span className="text-sky-300">{data.matchUrl}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300 pt-1 border-t border-slate-800 font-mono text-[11px]">
                          <span>
                            Hits: <strong className="text-white">{data.hits}</strong>
                          </span>
                          <span>
                            Share: <strong className="text-sky-400">{data.frequency}%</strong>
                          </span>
                          <span>
                            Status:{' '}
                            <strong className={data.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                              {data.enabled ? 'Active' : 'Disabled'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={metricView === 'hits' ? 'hits' : 'frequency'}
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.enabled ? entry.color : '#475569'}
                    opacity={entry.enabled ? 0.9 : 0.4}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Interactive Trigger Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Rule Types:</span>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1 capitalize">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span>{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {onTriggerHit && rules.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Simulate Rule Hit:</span>
            {rules.slice(0, 3).map((r) => (
              <button
                key={`btn-hit-${r.id}`}
                onClick={() => onTriggerHit(r.id)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded font-mono text-[10px] border border-slate-700 transition-colors"
                title={`Simulate request matching "${r.name}"`}
              >
                +1 {r.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
