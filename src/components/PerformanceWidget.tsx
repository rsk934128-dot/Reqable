import React from 'react';
import { Cpu, Zap, HardDrive, Gauge } from 'lucide-react';

export const PerformanceWidget: React.FC = () => {
  return (
    <footer id="reqable-footer-stats" className="bg-slate-950 border-t border-slate-800 text-slate-400 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Cold Start: <strong className="text-emerald-400">12ms</strong></span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span>Footprint: <strong className="text-sky-400">&lt; 100 MB</strong></span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-300">
          <Gauge className="w-3.5 h-3.5 text-purple-400" />
          <span>RAM Usage: <strong className="text-purple-400">186 MB</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden lg:inline text-slate-500">Non-Electron Flutter & C++ Architecture</span>
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Engine Ready
        </span>
      </div>
    </footer>
  );
};
