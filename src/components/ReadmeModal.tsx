import React, { useState } from 'react';
import reqablePlatformBannerImg from '../assets/images/reqable_platform_banner_1786291996003.jpg';
import trafficDebuggerPreviewImg from '../assets/images/traffic_debugger_preview_1786292019481.jpg';
import mockRulesEnginePreviewImg from '../assets/images/mock_rules_engine_preview_1786292041296.jpg';
import zkpDistrictNodesPreviewImg from '../assets/images/zkp_district_nodes_preview_1786292063708.jpg';
import {
  BookOpen,
  X,
  Globe,
  Shield,
  Zap,
  Activity,
  Layers,
  Terminal,
  Cpu,
  Download,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const images = {
    banner: reqablePlatformBannerImg,
    debugger: trafficDebuggerPreviewImg,
    rules: mockRulesEnginePreviewImg,
    zkp: zkpDistrictNodesPreviewImg,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-100 text-base">
                  {lang === 'bn' ? 'রেডমি ফাইল ও ডকু নির্দেশিকা (README Documentation)' : 'Reqable & RubelBank Official README Guide'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
                  v3.2.22
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'অ্যাপের ফিচারসমূহ, ৬৪-জেলা নোড ক্যানভাস এবং স্ক্রিনশট সম্বলিত ডকিুমেন্টেশন'
                  : 'Interactive architecture specs, visual screenshot previews, and platform docs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  lang === 'bn'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇧🇩 বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 text-slate-200">
          {/* Main Hero Banner Picture */}
          <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
            <img
              src={images.banner}
              alt="Reqable Platform Hero Banner"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[320px] object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => setSelectedImage(images.banner)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-5 flex flex-col justify-end">
              <span className="text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
                {lang === 'bn' ? 'অল-ইন-ওয়ান ফিনটেক ও এপিআই ইঞ্জিন' : 'All-in-One FinTech Operations'}
              </span>
              <h2 className="text-xl font-bold text-white">
                Reqable & RubelBank FinTech Platform
              </h2>
            </div>
          </div>

          {/* Intro Section */}
          {lang === 'bn' ? (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>সংক্ষিপ্ত বিবরণ</span>
              </h4>
              <p className="text-xs leading-relaxed text-slate-300">
                <strong>Reqable & RubelBank</strong> হলো একটি অত্যাধুনিক, ফুল-স্ট্যাক এপিআই ডিবাগিং, টেস্ট অটোমেশন এবং জিরো-নলেজ প্রুফ (ZKP) ফিনটেক নেটওয়ার্ক প্ল্যাটফর্ম। এটি ডেভলপারদের জন্য রিয়েল-টাইম ট্রাফিক ক্যাপচার, কাস্টম মক রুলস ইঞ্জিন, ড্র্যাগ-অ্যান্ড-ড্রপ অগ্রাধিকার সেটআপ, ৬৪-জেলা নোড মনিটরিং, ফায়ারবেস ফায়ারস্টোর ক্লাউড সিঙ্ক এবং জেমিনি এআই কোপাইলট (Gemini AI Copilot) সুবিধা প্রদান করে।
              </p>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Overview</span>
              </h4>
              <p className="text-xs leading-relaxed text-slate-300">
                <strong>Reqable & RubelBank</strong> is a full-stack API debugging, testing automation, and Zero-Knowledge Proof (ZKP) FinTech corridor operations applet. It offers real-time HTTP/HTTPS traffic capturing, drag-and-drop rule reordering, folder grouping, 64-district node monitoring, Firebase Firestore sync, and Gemini AI Copilot features.
              </p>
            </div>
          )}

          {/* Embedded Picture Gallery Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'গ্যালারি ও পিকচারসমূহ (Interactive Screenshots)' : 'App Preview Screenshots'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1 Image Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-slate-700 transition-all">
                <div className="relative overflow-hidden aspect-video bg-slate-900">
                  <img
                    src={images.debugger}
                    alt="Traffic Capture Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedImage(images.debugger)}
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 border border-slate-700">
                    Click to Zoom
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>{lang === 'bn' ? '১. ট্রাফিক ক্যাপচার ডিবাগার' : '1. Traffic Capture Debugger'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn'
                      ? 'লাইভ রিকোয়েস্ট/রেসপন্স স্নিফিং, হেডার এডিটর ও টাইমিং ভিজ্যুয়ালাইজেশন।'
                      : 'Live traffic inspection with header editor and latency timing metrics.'}
                  </p>
                </div>
              </div>

              {/* Feature 2 Image Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-slate-700 transition-all">
                <div className="relative overflow-hidden aspect-video bg-slate-900">
                  <img
                    src={images.rules}
                    alt="Mock Rules Engine Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedImage(images.rules)}
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-purple-400 border border-slate-700">
                    Click to Zoom
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lang === 'bn' ? '২. মক রুলস ও ড্র্যাগ-অ্যান্ড-ড্রপ' : '2. Mock Rules & Reordering'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn'
                      ? 'ড্র্যাগ-অ্যান্ড-ড্রপ প্রাইওরিটি সেটআপ, ফোল্ডার গ্রুপিং ও বার চার্ট ড্যাশবোর্ড।'
                      : 'Drag-and-drop rule priority ranking with folder grouping & hit analytics.'}
                  </p>
                </div>
              </div>

              {/* Feature 3 Image Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-slate-700 transition-all">
                <div className="relative overflow-hidden aspect-video bg-slate-900">
                  <img
                    src={images.zkp}
                    alt="ZKP District Nodes Map"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedImage(images.zkp)}
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-700">
                    Click to Zoom
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? '৩. ৬৪-জেলা ZKP করিডোর' : '3. 64-District ZKP Map'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn'
                      ? 'সমগ্র বাংলাদেশের ৬৪ জেলা নোডের রিয়েল-টাইম টিপিএস ও জিরো-নলেজ প্রুফ সিকিউরিটি।'
                      : 'Real-time ZKP security vault and inter-node latency canvas across 64 districts.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features List */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'অ্যাপের টেকনোলজি স্ট্যাক ও সুবিধাসমূহ' : 'Core Architecture & Capabilities'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-sky-400">Frontend & Styling</span>
                <p className="text-slate-400">React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-purple-400">Interactivity & Drag-and-Drop</span>
                <p className="text-slate-400">@dnd-kit/core, @dnd-kit/sortable, Recharts Bar Charts</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-emerald-400">Cloud Persistence & Auth</span>
                <p className="text-slate-400">Firebase Firestore DB, Firebase Authentication, Google Drive API</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-amber-400">AI Intelligence</span>
                <p className="text-slate-400">Google Gemini API (@google/genai) AI Copilot Assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>© 2026 Reqable & RubelBank Ecosystem</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors shadow-sm"
          >
            {lang === 'bn' ? 'বন্ধ করুন (Close)' : 'Close Docs'}
          </button>
        </div>
      </div>

      {/* LIGHTBOX IMAGE ZOOM MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-sky-400 text-sm font-semibold flex items-center gap-1"
            >
              <X className="w-5 h-5" /> Close Zoom
            </button>
            <img
              src={selectedImage}
              alt="Zoomed Preview"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
