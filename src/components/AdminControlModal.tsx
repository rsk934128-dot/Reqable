import React, { useState } from 'react';
import { ShieldAlert, UserCheck, Plus, Trash2, CheckCircle2, Lock, Key, Server, Database, Sparkles, X, Mail, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, adminEmails, addAdminEmail, removeAdminEmail } = useAuth();
  const [newEmailInput, setNewEmailInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;
    addAdminEmail(newEmailInput.trim());
    setSuccessMsg(`এডমিন ইমেইল ${newEmailInput.trim()} সফলভাবে যুক্ত করা হয়েছে!`);
    setNewEmailInput('');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleRemoveEmail = (email: string) => {
    removeAdminEmail(email);
    setSuccessMsg(`এডমিন তালিকা থেকে ${email} সরানো হয়েছে।`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">সিস্টেম এডমিন কন্ট্রোল প্যানেল (Admin Portal)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                  <Key className="w-3 h-3" /> SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                অ্যাডমিনিস্ট্রেটর অ্যাকাউন্টের অ্যাক্সেস পারমিশন ও সিস্টেম সিকিউরিটি ম্যানেজমেন্ট
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Logged-in Admin Status */}
        <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                CURRENT SESSION USER
              </span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{user?.email || 'rsk934128@gmail.com (Default Admin)'}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AUTHORIZED
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] text-slate-400 font-mono">Status: SUPER ADMIN</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Access
            </div>
          </div>
        </div>

        {/* Success Toast Notification */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-between animate-fadeIn">
            <span>{successMsg}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Authorized Admin Emails List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>অনুমোদিত এডমিন ইমেইল তালিকা (Admin Access List)</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{adminEmails.length} Admin(s) Authorized</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {adminEmails.map((email) => {
              const isDefaultPrimary = email.toLowerCase() === 'rsk934128@gmail.com' || email.toLowerCase() === 'rubels1k994@gmail.com';
              return (
                <div
                  key={email}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-100 truncate">{email}</span>
                    {isDefaultPrimary && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold font-mono bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                        PRIMARY SUPER ADMIN
                      </span>
                    )}
                  </div>

                  {!isDefaultPrimary && (
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove Admin Permission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Admin Form */}
          <form onSubmit={handleAddEmail} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="নতুন এডমিন ইমেইল লিখুন (e.g. admin@reqable.com)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>এডমিন যোগ করুন</span>
            </button>
          </form>
        </div>

        {/* System Diagnostics & Operational Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <Database className="w-4 h-4 text-sky-400 mx-auto" />
            <div className="text-[10px] text-slate-400 font-mono">FIRESTORE SYNC</div>
            <div className="text-xs font-bold text-emerald-400">ACTIVE & READY</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <Cpu className="w-4 h-4 text-purple-400 mx-auto" />
            <div className="text-[10px] text-slate-400 font-mono">GEMINI AI MODEL</div>
            <div className="text-xs font-bold text-purple-300">2.5 FLASH PRO</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 col-span-2 sm:col-span-1">
            <Server className="w-4 h-4 text-amber-400 mx-auto" />
            <div className="text-[10px] text-slate-400 font-mono">SERVER STATUS</div>
            <div className="text-xs font-bold text-amber-300">PORT 3000 ONLINE</div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span>rsk934128@gmail.com & rubels1k994@gmail.com - Super Admin Auth</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
