import React, { useState } from 'react';
import { Ticket, Gift, Check, Copy, Sparkles, X, Tag, ShieldCheck, Zap } from 'lucide-react';
import appLogoImg from '../assets/images/app_logo_icon_1786295060681.jpg';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const vouchers = [
    {
      code: 'REQABLE-VIP-2026',
      title: 'Reqable Pro Full License Voucher',
      bnTitle: 'রিকুয়েবল প্রো লাইসেন্স ভাউচার (১০০% ছাড়)',
      discount: '100% FREE',
      desc: 'Unlocks all Pro features: Unlimited MITM inspection, API Mocking, AI Copilot, and Cloud Firestore sync.',
      badge: 'POPULAR VOUCHER',
      color: 'from-amber-500 via-orange-500 to-amber-600',
      border: 'border-amber-500/50',
    },
    {
      code: 'SPECIAL-OFFER-FREE',
      title: 'AI Copilot & Security Voucher',
      bnTitle: 'এআই কোপাইলট ও সিকিউরিটি স্ক্যানার ভাউচার',
      discount: 'FREE PASS',
      desc: 'Free access to Gemini 2.5 Flash Traffic Intelligence and automated OWASP API security audits.',
      badge: 'SPECIAL OFFER',
      color: 'from-emerald-500 via-teal-500 to-emerald-600',
      border: 'border-emerald-500/50',
    },
    {
      code: 'MOCK-SERVER-PRO',
      title: 'Mock Server & MCP Suite Voucher',
      bnTitle: 'মক সার্ভার ও এমসিপি প্রিমিয়াম ভাউচার',
      discount: 'UNLIMITED',
      desc: 'Enable full backend mock route generator, template variables, chaos engineering & MCP server tools.',
      badge: 'PRO VIP',
      color: 'from-purple-500 via-indigo-500 to-purple-600',
      border: 'border-purple-500/50',
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-hidden relative">
        {/* Background Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Ticket className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">আমাদের বিশেষ স্পেশাল ভাউচার (Vouchers)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ওয়েবসাইট ভিজিট করার জন্য আপনার জন্য অ্যাক্টিভ প্রিমিয়াম ভাউচার কোডসমূহ
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

        {/* Voucher List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 relative z-10">
          {vouchers.map((v, idx) => {
            const isCopied = copiedCode === v.code;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl bg-slate-950 border ${v.border} relative overflow-hidden transition-all hover:scale-[1.01] shadow-md group`}
              >
                {/* Coupon Ticket Cutout Edges */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-slate-800" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-slate-800" />

                <div className="pl-3 pr-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-extrabold font-mono uppercase px-2 py-0.5 rounded text-white bg-gradient-to-r ${v.color}`}>
                        {v.badge}
                      </span>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{v.discount}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{v.bnTitle}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                  </div>

                  {/* Voucher Code Box */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-dashed border-slate-800 pt-2 sm:pt-0">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-amber-300 tracking-wider select-all">
                      {v.code}
                    </div>

                    <button
                      onClick={() => handleCopy(v.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>সকল ভাউচার অটোমেটিক ভ্যালিডেটেড এবং অ্যাক্টিভেটেড</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold hover:from-amber-400 hover:to-orange-400 shadow-md transition-all"
          >
            ভাউচার ব্যবহার করুন
          </button>
        </div>
      </div>
    </div>
  );
};
