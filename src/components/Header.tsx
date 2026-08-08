import React from 'react';
import {
  Activity,
  CheckCircle,
  Cloud,
  Cpu,
  Globe,
  Layers,
  Play,
  Shield,
  Sparkles,
  Terminal,
  Zap,
  Keyboard,
  LogIn,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { Environment } from '../types/reqable';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: 'debugging' | 'testing' | 'rules' | 'mcp' | 'drive' | 'webhub';
  setActiveTab: (tab: 'debugging' | 'testing' | 'rules' | 'mcp' | 'drive' | 'webhub') => void;
  environments: Environment[];
  selectedEnvId: string;
  setSelectedEnvId: (id: string) => void;
  isDriveConnected: boolean;
  onOpenDriveModal: () => void;
  onToggleAiCopilot: () => void;
  onOpenShortcutsModal?: () => void;
  interceptorActive: boolean;
  setInterceptorActive: (active: boolean) => void;
  isTrafficSaving?: boolean;
  lastTrafficSaveTime?: Date | null;
  trafficCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  environments,
  selectedEnvId,
  setSelectedEnvId,
  isDriveConnected,
  onOpenDriveModal,
  onToggleAiCopilot,
  onOpenShortcutsModal,
  interceptorActive,
  setInterceptorActive,
  isTrafficSaving,
  lastTrafficSaveTime,
  trafficCount,
}) => {
  const { user, login, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header id="reqable-main-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex items-center justify-between select-none sticky top-0 z-40">
      {/* Brand & Platform Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
            <Zap className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Reqable</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
                v3.2.22
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              API Debugging & Testing Platform
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden md:block" />

        {/* Core Architecture Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800/80 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Flutter & C++ Core</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Cloud Auto-Save Badge */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-400">
          <Cloud className={`w-3.5 h-3.5 ${isTrafficSaving ? 'text-amber-400 animate-bounce' : user ? 'text-emerald-400' : 'text-sky-400'}`} />
          <span>
            {isTrafficSaving
              ? 'Saving Traffic...'
              : user
              ? 'Firestore Persisted'
              : 'Local Auto-Saved'}
          </span>
          {trafficCount !== undefined && (
            <span className="text-[10px] bg-slate-900 px-1.5 rounded text-slate-300 font-mono">
              {trafficCount}
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav id="reqable-nav-tabs" className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-800">
        <button
          id="tab-btn-debugging"
          onClick={() => setActiveTab('debugging')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'debugging'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Traffic Capture</span>
          {interceptorActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          id="tab-btn-testing"
          onClick={() => setActiveTab('testing')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'testing'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>API Client</span>
        </button>

        <button
          id="tab-btn-rules"
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>MITM Rules</span>
        </button>

        <button
          id="tab-btn-mcp"
          onClick={() => setActiveTab('mcp')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'mcp'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>MCP Server</span>
          <span className="text-[9px] bg-purple-950 text-purple-300 font-mono px-1 rounded border border-purple-800">AI</span>
        </button>

        <button
          id="tab-btn-webhub"
          onClick={() => setActiveTab('webhub')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'webhub'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Web Hub</span>
        </button>
      </nav>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-2">
        {/* Environment Selector */}
        <div id="reqable-env-selector" className="hidden sm:flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-md text-xs">
          <span className="text-slate-500 font-mono text-[10px]">ENV:</span>
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none font-medium text-xs cursor-pointer"
          >
            <option value="none" className="bg-slate-900">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id} className="bg-slate-900">
                {env.name}
              </option>
            ))}
          </select>
        </div>

        {/* Interceptor Toggle Quick Control */}
        <button
          id="btn-interceptor-toggle"
          onClick={() => setInterceptorActive(!interceptorActive)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
            interceptorActive
              ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={interceptorActive ? 'Interception Active' : 'Interception Paused'}
        >
          <Play className={`w-3 h-3 ${interceptorActive ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">{interceptorActive ? 'Intercept ON' : 'Paused'}</span>
        </button>

        {/* Firebase Authentication Button */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2 py-1 rounded-md text-xs">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
            ) : (
              <UserIcon className="w-4 h-4 text-sky-400" />
            )}
            <span className="hidden xl:inline text-slate-200 font-medium truncate max-w-[100px]">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <button
              onClick={() => logout()}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out of Firebase"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => login()}
            disabled={loading}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900 flex items-center gap-1.5 transition-all"
            title="Sign in with Firebase / Google"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{loading ? 'Connecting...' : 'Firebase Auth'}</span>
          </button>
        )}

        {/* Google Drive Sync Trigger */}
        <button
          id="btn-gdrive-sync"
          onClick={onOpenDriveModal}
          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
            isDriveConnected
              ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 hover:bg-blue-900'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Google Drive Cloud Sync"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Drive</span>
          {isDriveConnected && <CheckCircle className="w-3 h-3 text-blue-400" />}
        </button>

        {/* Keyboard Shortcuts Reference Button */}
        {onOpenShortcutsModal && (
          <button
            id="btn-keyboard-shortcuts"
            onClick={onOpenShortcutsModal}
            className="px-2 py-1 rounded-md text-xs font-medium bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-300 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Keyboard Shortcuts (Shift + ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline text-[11px] font-mono font-bold text-slate-300 bg-slate-900 px-1 rounded border border-slate-700">⌘/</span>
          </button>
        )}

        {/* AI Copilot Drawer Button */}
        <button
          id="btn-ai-copilot-toggle"
          onClick={onToggleAiCopilot}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Global Theme Mode Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline font-medium text-slate-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline font-medium text-slate-300">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

