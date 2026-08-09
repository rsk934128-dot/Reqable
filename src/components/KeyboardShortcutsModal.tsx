import React from 'react';
import { Keyboard, X, Command, Zap, Send, Save, Search, RefreshCw, Trash2, Layers, Cpu, Bot, Wand2, Globe, Download, Sun, FileText, Mail, Shield } from 'lucide-react';
import { getShortcutDisplay } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keyCombo: { ctrl?: boolean; shift?: boolean; alt?: boolean; key: string };
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface ShortcutGroup {
  category: string;
  items: ShortcutItem[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'API Testing Workspace',
    items: [
      {
        keyCombo: { ctrl: true, key: 'Enter' },
        label: 'Send Request',
        description: 'Execute active API request immediately from any field',
        icon: <Send className="w-3.5 h-3.5 text-sky-400" />,
      },
      {
        keyCombo: { ctrl: true, shift: true, key: 'f' },
        label: 'Pretty Print Body',
        description: 'Format & beautify JSON or XML request payload',
        icon: <Wand2 className="w-3.5 h-3.5 text-sky-400" />,
      },
      {
        keyCombo: { ctrl: true, key: 's' },
        label: 'Save Request',
        description: 'Save current URL, method, headers & body modifications to collection',
        icon: <Save className="w-3.5 h-3.5 text-emerald-400" />,
      },
      {
        keyCombo: { ctrl: true, key: 'l' },
        label: 'Focus URL Bar',
        description: 'Instantly jump cursor into the URL address input field',
        icon: <Command className="w-3.5 h-3.5 text-purple-400" />,
      },
      {
        keyCombo: { ctrl: true, alt: true, key: 'n' },
        label: 'New Request',
        description: 'Add a new request into the currently active collection',
        icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      },
    ],
  },
  {
    category: 'Debugging & Sniffing',
    items: [
      {
        keyCombo: { ctrl: true, key: 'f' },
        label: 'Focus Search',
        description: 'Jump cursor to traffic search filter box (or press /)',
        icon: <Search className="w-3.5 h-3.5 text-sky-400" />,
      },
      {
        keyCombo: { ctrl: true, key: 'Enter' },
        label: 'Replay Selected',
        description: 'Load selected intercepted traffic item into API testing runner',
        icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />,
      },
      {
        keyCombo: { ctrl: true, shift: true, key: 'x' },
        label: 'Clear Log',
        description: 'Purge all captured HTTP/HTTPS traffic history items',
        icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
      },
      {
        keyCombo: { ctrl: true, shift: true, key: 'e' },
        label: 'Export CSV',
        description: 'Download active or selected traffic logs as CSV spreadsheet',
        icon: <Download className="w-3.5 h-3.5 text-sky-400" />,
      },
    ],
  },
  {
    category: 'Navigation & Global',
    items: [
      {
        keyCombo: { alt: true, key: '1' },
        label: 'API Testing Tab',
        description: 'Switch workspace view to API Testing & Collections',
        icon: <Layers className="w-3.5 h-3.5 text-sky-400" />,
      },
      {
        keyCombo: { alt: true, key: '2' },
        label: 'Debugging Tab',
        description: 'Switch workspace view to Real-time Sniffing & Traffic Logs',
        icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      },
      {
        keyCombo: { alt: true, key: '3' },
        label: 'Rules Engine Tab',
        description: 'Switch workspace view to Breakpoints & Rewrite Rules',
        icon: <Command className="w-3.5 h-3.5 text-emerald-400" />,
      },
      {
        keyCombo: { alt: true, key: '4' },
        label: 'MCP Server Tab',
        description: 'Switch workspace view to Model Context Protocol',
        icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
      },
      {
        keyCombo: { alt: true, key: '5' },
        label: 'Web Hub Tab',
        description: 'Embedded iframe viewer for Shurukkha Hub & external sites',
        icon: <Globe className="w-3.5 h-3.5 text-sky-400" />,
      },
      {
        keyCombo: { alt: true, key: '6' },
        label: 'API Audit Log Tab',
        description: 'Read-only chronological ledger for network traffic auditing',
        icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
      },
      {
        keyCombo: { alt: true, key: '7' },
        label: 'Gmail Tab',
        description: 'Google Workspace Gmail API integration for email search, sending & debugging',
        icon: <Mail className="w-3.5 h-3.5 text-rose-400" />,
      },
      {
        keyCombo: { alt: true, key: '8' },
        label: 'Security Scanner Tab',
        description: 'Scan API requests for SQLi, XSS, insecure HTTP & missing headers with code patches',
        icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
      },
      {
        keyCombo: { ctrl: true, shift: true, key: 'i' },
        label: 'Toggle AI Copilot',
        description: 'Open or collapse Gemini AI diagnostic sidebar assistant',
        icon: <Bot className="w-3.5 h-3.5 text-indigo-400" />,
      },
      {
        keyCombo: { alt: true, key: 't' },
        label: 'Toggle Global Theme',
        description: 'Switch application between Light and Dark mode',
        icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
      },
      {
        keyCombo: { shift: true, key: '?' },
        label: 'Shortcuts Help',
        description: 'Toggle this keyboard shortcut reference sheet anytime',
        icon: <Keyboard className="w-3.5 h-3.5 text-teal-400" />,
      },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Reqable Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-400">High-productivity hotkeys for API testing and traffic debugging</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/80 pb-1">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700/80 transition-all"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                      </div>
                    </div>

                    <kbd className="shrink-0 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono font-bold text-sky-300 shadow-inner">
                      {getShortcutDisplay(item.keyCombo)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px]">Shift + ?</kbd> anywhere to open this modal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
