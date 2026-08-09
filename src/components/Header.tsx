import React, { useState } from 'react';
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
  BookOpen,
  FileText,
  Mail,
  Video,
  RefreshCw,
  Database,
  LayoutGrid,
  Menu,
  X,
  Search,
  ChevronRight,
  AppWindow,
} from 'lucide-react';
import { Environment } from '../types/reqable';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: 'debugging' | 'testing' | 'rules' | 'mcp' | 'drive' | 'webhub' | 'auditlog' | 'gmail' | 'security' | 'meet';
  setActiveTab: (tab: 'debugging' | 'testing' | 'rules' | 'mcp' | 'drive' | 'webhub' | 'auditlog' | 'gmail' | 'security' | 'meet') => void;
  environments: Environment[];
  selectedEnvId: string;
  setSelectedEnvId: (id: string) => void;
  isDriveConnected: boolean;
  onOpenDriveModal: () => void;
  onToggleAiCopilot: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenReadmeModal?: () => void;
  interceptorActive: boolean;
  setInterceptorActive: (active: boolean) => void;
  isTrafficSaving?: boolean;
  lastTrafficSaveTime?: Date | null;
  trafficCount?: number;
  firestoreSyncStatus?: 'synced' | 'saving' | 'idle';
  firestoreLastSyncTime?: Date | null;
  onManualSync?: () => void;
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
  onOpenReadmeModal,
  interceptorActive,
  setInterceptorActive,
  isTrafficSaving,
  lastTrafficSaveTime,
  trafficCount,
  firestoreSyncStatus = 'synced',
  firestoreLastSyncTime,
  onManualSync,
}) => {
  const { user, login, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allProgramsList = [
    {
      id: 'debugging',
      bnName: 'ট্রাফিক ক্যাপচার',
      name: 'Traffic Capture & Proxy',
      desc: 'রিয়েল-টাইম HTTP/HTTPS প্রক্সি ট্রাফিক ক্যাপচার, ইন্টারসেপশন ও লাইভ ডিবাগিং।',
      icon: Activity,
      bgClass: 'bg-sky-950 text-sky-400 border border-sky-800',
      iconClass: 'text-sky-400',
      tag: 'Proxy & Debug',
      tagClass: 'bg-sky-950 text-sky-300 border border-sky-800',
      tabId: 'debugging',
    },
    {
      id: 'testing',
      bnName: 'এপিআই ক্লায়েন্ট',
      name: 'API Client & Runner',
      desc: 'Postman বিকল্প REST, GraphQL ও WebSocket রিকোয়েস্ট বিল্ডার ও অটো টেস্ট রানার।',
      icon: Layers,
      bgClass: 'bg-blue-950 text-blue-400 border border-blue-800',
      iconClass: 'text-blue-400',
      tag: 'REST Client',
      tagClass: 'bg-blue-950 text-blue-300 border border-blue-800',
      tabId: 'testing',
    },
    {
      id: 'rules',
      bnName: 'MITM রুলস ইঞ্জিন',
      name: 'MITM Rules Engine',
      desc: 'ট্রাফিক রিরাইট (Rewrite), ব্রেকপয়েন্ট (Breakpoint), ম্যাপ লোকাল ও ম্যাপ রিমোট ট্রাফিক মকিং।',
      icon: Shield,
      bgClass: 'bg-amber-950 text-amber-400 border border-amber-800',
      iconClass: 'text-amber-400',
      tag: 'MITM Mock',
      tagClass: 'bg-amber-950 text-amber-300 border border-amber-800',
      tabId: 'rules',
    },
    {
      id: 'mcp',
      bnName: 'MCP AI সার্ভার হাব',
      name: 'MCP AI Hub',
      desc: 'Model Context Protocol সমৃদ্ধ Gemini AI কোপাইলট ও ডেভেলপার প্রম্পট টুলস।',
      icon: Terminal,
      bgClass: 'bg-purple-950 text-purple-400 border border-purple-800',
      iconClass: 'text-purple-400',
      tag: 'Gemini AI',
      tagClass: 'bg-purple-950 text-purple-300 border border-purple-800',
      tabId: 'mcp',
    },
    {
      id: 'webhub',
      bnName: 'ওয়েব হাব মার্কেটপ্লেস',
      name: 'Web Hub & API Directory',
      desc: 'পাবলিক REST API ক্যাটালগ, লাইভ ওপেনএপিআই স্পেকস ও টেস্ট প্লেগ্রাউন্ড।',
      icon: Globe,
      bgClass: 'bg-teal-950 text-teal-400 border border-teal-800',
      iconClass: 'text-teal-400',
      tag: 'Public APIs',
      tagClass: 'bg-teal-950 text-teal-300 border border-teal-800',
      tabId: 'webhub',
    },
    {
      id: 'auditlog',
      bnName: 'এপিআই অডিট লগ',
      name: 'API Audit Logs',
      desc: 'রিকোয়েস্ট সিকিউরিটি হিস্ট্রি, রেসপন্স অডিট ও কমপ্লায়েন্স লগ ট্র্যাকিং।',
      icon: FileText,
      bgClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
      iconClass: 'text-emerald-400',
      tag: 'Compliance',
      tagClass: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
      tabId: 'auditlog',
    },
    {
      id: 'gmail',
      bnName: 'জিিমেইল REST API',
      name: 'Gmail REST API',
      desc: 'জিিমেইল ইনবক্স ইন্সপেকশন, ইমেল ড্রাফট তৈরি ও ইমেইল পাঠানো অটোমেশন।',
      icon: Mail,
      bgClass: 'bg-rose-950 text-rose-400 border border-rose-800',
      iconClass: 'text-rose-400',
      tag: 'Workspace',
      tagClass: 'bg-rose-950 text-rose-300 border border-rose-800',
      tabId: 'gmail',
    },
    {
      id: 'meet',
      bnName: 'গুগল মিট ও ক্যালেন্ডার',
      name: 'Google Meet & Calendar',
      desc: 'ইনস্ট্যান্ট গুগল মিট তৈরি, মিটিং সময়সূচী নির্ধারণ ও ক্যালেন্ডার এপিআই।',
      icon: Video,
      bgClass: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
      iconClass: 'text-emerald-400',
      tag: 'Video Sync',
      tagClass: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
      tabId: 'meet',
    },
    {
      id: 'security',
      bnName: 'সিকিউরিটি স্ক্যানার',
      name: 'Security Scanner',
      desc: 'অটোমেটেড এপিআই সিকিউরিটি রিস্ক অডিট, CORS, Auth & হেডার অডিট।',
      icon: Shield,
      bgClass: 'bg-indigo-950 text-indigo-400 border border-indigo-800',
      iconClass: 'text-indigo-400',
      tag: 'SecAudit',
      tagClass: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
      tabId: 'security',
    },
    {
      id: 'drive',
      bnName: 'গুগল ড্রাইভ ব্যাকআপ',
      name: 'Google Drive Sync',
      desc: 'ক্লাউড ব্যাকআপ, ফাইল সিঙ্ক ও জেসন রেসপন্স গুগল ড্রাইভে সংরক্ষণ।',
      icon: Cloud,
      bgClass: 'bg-blue-950 text-blue-400 border border-blue-800',
      iconClass: 'text-blue-400',
      tag: 'Cloud Backup',
      tagClass: 'bg-blue-950 text-blue-300 border border-blue-800',
      action: onOpenDriveModal,
    },
  ];

  return (
    <header id="reqable-main-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex items-center justify-between select-none sticky top-0 z-40">
      {/* Brand & Platform Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-sky-500/30 overflow-hidden flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20 shrink-0">
            <img
              src="/src/assets/images/app_logo_icon_1786295060681.jpg"
              alt="Reqable App Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to Zap icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Zap className="w-5 h-5 fill-current text-sky-400 absolute hidden" />
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
      <nav id="reqable-nav-tabs" className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full whitespace-nowrap scrollbar-none">
        {/* All Programs / Menu Button */}
        <button
          id="btn-all-programs-menu"
          onClick={() => setIsMenuOpen(true)}
          className="px-3 py-2.5 min-h-[44px] rounded-md text-xs font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md flex items-center gap-2 shrink-0 transition-all cursor-pointer border border-sky-400/30"
          title="সকল প্রোগ্রাম ও টুলস মেনু খুলুন (All Programs Menu)"
        >
          <LayoutGrid className="w-4 h-4 text-sky-200" />
          <span>সকল প্রোগ্রাম (Menu)</span>
          <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded text-sky-100 font-bold border border-white/20">
            10
          </span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5 shrink-0" />

        <button
          id="tab-btn-debugging"
          onClick={() => setActiveTab('debugging')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'debugging'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Traffic Capture</span>
          {interceptorActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          id="tab-btn-testing"
          onClick={() => setActiveTab('testing')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'testing'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>API Client</span>
        </button>

        <button
          id="tab-btn-rules"
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rules'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>MITM Rules</span>
        </button>

        <button
          id="tab-btn-mcp"
          onClick={() => setActiveTab('mcp')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'mcp'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>MCP Server</span>
          <span className="text-[9px] bg-purple-950 text-purple-300 font-mono px-1 rounded border border-purple-800">AI</span>
        </button>

        <button
          id="tab-btn-webhub"
          onClick={() => setActiveTab('webhub')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'webhub'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Web Hub</span>
        </button>

        <button
          id="tab-btn-auditlog"
          onClick={() => setActiveTab('auditlog')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'auditlog'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Audit Log</span>
        </button>

        <button
          id="tab-btn-gmail"
          onClick={() => setActiveTab('gmail')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'gmail'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 text-rose-400" />
          <span>Gmail</span>
        </button>

        <button
          id="tab-btn-meet"
          onClick={() => setActiveTab('meet')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'meet'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-emerald-400" />
          <span>Google Meet</span>
        </button>

        <button
          id="tab-btn-security"
          onClick={() => setActiveTab('security')}
          className={`px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security Scanner</span>
        </button>
      </nav>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-2">
        {/* Environment Selector */}
        <div id="reqable-env-selector" className="hidden sm:flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 min-h-[44px] rounded-md text-xs">
          <span className="text-slate-500 font-mono text-[10px]">ENV:</span>
          <select
            value={selectedEnvId}
            onChange={(e) => setSelectedEnvId(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none font-medium text-xs cursor-pointer min-h-[36px]"
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
          className={`px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
            interceptorActive
              ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={interceptorActive ? 'Interception Active' : 'Interception Paused'}
        >
          <Play className={`w-3.5 h-3.5 ${interceptorActive ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">{interceptorActive ? 'Intercept ON' : 'Paused'}</span>
        </button>

        {/* Firestore Cloud Sync Indicator Badge */}
        {user && (
          <button
            id="reqable-firestore-sync-badge"
            onClick={onManualSync}
            className={`hidden md:flex items-center gap-1.5 px-3 min-h-[44px] rounded-md text-xs font-medium border transition-all ${
              firestoreSyncStatus === 'saving' || isTrafficSaving
                ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900'
            }`}
            title={
              firestoreLastSyncTime
                ? `Firestore synced to cloud. Last update: ${firestoreLastSyncTime.toLocaleTimeString()}`
                : 'Firestore database connected & active'
            }
          >
            {firestoreSyncStatus === 'saving' || isTrafficSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                <span className="hidden lg:inline text-[11px] font-mono">Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden lg:inline text-[11px] font-mono">Firestore Synced</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </>
            )}
          </button>
        )}

        {/* Firebase Authentication Button */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 min-h-[44px] rounded-md text-xs">
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
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out of Firebase"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => login()}
            disabled={loading}
            className="px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900 flex items-center gap-1.5 transition-all"
            title="Sign in with Firebase / Google"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">{loading ? 'Connecting...' : 'Firebase Auth'}</span>
          </button>
        )}

        {/* Google Drive Sync Trigger */}
        <button
          id="btn-gdrive-sync"
          onClick={onOpenDriveModal}
          className={`px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
            isDriveConnected
              ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 hover:bg-blue-900'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Google Drive Cloud Sync"
        >
          <Cloud className="w-4 h-4" />
          <span className="hidden md:inline">Drive</span>
          {isDriveConnected && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
        </button>

        {/* Keyboard Shortcuts Reference Button */}
        {onOpenShortcutsModal && (
          <button
            id="btn-keyboard-shortcuts"
            onClick={onOpenShortcutsModal}
            className="px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-300 hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Keyboard Shortcuts (Shift + ?)"
          >
            <Keyboard className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline text-[11px] font-mono font-bold text-slate-300 bg-slate-900 px-1 rounded border border-slate-700">⌘/</span>
          </button>
        )}

        {/* Readme Documentation Modal Button */}
        {onOpenReadmeModal && (
          <button
            id="btn-open-readme-modal"
            onClick={onOpenReadmeModal}
            className="px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium bg-slate-950 border border-slate-800 hover:border-sky-700/80 text-sky-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="README Documentation & Gallery"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">README Docs</span>
          </button>
        )}

        {/* AI Copilot Drawer Button */}
        <button
          id="btn-ai-copilot-toggle"
          onClick={onToggleAiCopilot}
          className="px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-current text-amber-300" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Global Theme Mode Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="px-3 min-h-[44px] min-w-[44px] justify-center rounded-md text-xs font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="hidden md:inline font-medium text-slate-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline font-medium text-slate-300">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Programs & Tools Gallery Modal (সকল প্রোগ্রাম ও টুলস মেনু) */}
      {isMenuOpen && (
        <div
          id="modal-all-programs"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100">সকল প্রোগ্রাম ও টুলস (All Programs)</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                      10 Active Modules
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reqable Workspace Suite - যেকোনো প্রোগ্রামে দ্রুত স্যুইচ করতে নির্বাচন করুন
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Filter */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="প্রোগ্রাম খুঁজুন (Search programs)..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 min-h-[38px] text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="বন্ধ করুন (Close)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Programs Grid */}
            <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProgramsList
                .filter(
                  (prog) =>
                    prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prog.bnName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prog.desc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((prog) => {
                  const isActive = activeTab === prog.tabId;
                  const IconComponent = prog.icon;

                  return (
                    <div
                      key={prog.id}
                      onClick={() => {
                        if (prog.action) {
                          prog.action();
                        } else if (prog.tabId) {
                          setActiveTab(prog.tabId as any);
                        }
                        setIsMenuOpen(false);
                      }}
                      className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isActive
                          ? 'bg-sky-950/40 border-sky-500/80 shadow-md shadow-sky-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${prog.bgClass}`}>
                              <IconComponent className={`w-5 h-5 ${prog.iconClass}`} />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                                {prog.bnName}
                              </h3>
                              <p className="text-[11px] font-mono text-slate-400">{prog.name}</p>
                            </div>
                          </div>

                          {isActive && (
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-sky-600 text-white shadow-sm">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {prog.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-mono ${prog.tagClass}`}>
                          {prog.tag}
                        </span>
                        <span className="text-slate-400 group-hover:text-sky-400 flex items-center gap-1 font-medium transition-colors">
                          খুলুন <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

