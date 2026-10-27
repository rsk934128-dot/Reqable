import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Github,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  X,
  AlertCircle,
  Play,
  QrCode,
  Package,
  HardDriveDownload,
  Settings,
  Share2,
} from 'lucide-react';
import appLogoImg from '../assets/images/app_logo_icon_1786295060681.jpg';

interface AndroidApkReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkReleaseModal: React.FC<AndroidApkReleaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'github_actions' | 'instructions' | 'local_build'>('overview');

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const currentVersion = 'v3.2.22';
  const packageName = 'com.reqable.android';
  const apkFileName = `Reqable-Android-${currentVersion}.apk`;

  const gitTagCmd = `git tag ${currentVersion}\ngit push origin ${currentVersion}`;
  const localBuildCmd = `npm run build:apk`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-emerald-500/70 p-0.5 shadow-lg shadow-emerald-500/25 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={appLogoImg}
                alt="Reqable App Logo"
                className="w-full h-full object-cover rounded-[10px]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow">
                <Smartphone className="w-3 h-3 font-extrabold" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">গিটহাব অ্যান্ড্রয়েড APK রিলিজ হাব</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                  GITHUB ACTIONS READY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                GitHub Repository থেকে সরাসরি Android APK তৈরি ও রিলিজ করার স্বয়ংক্রিয় ব্যবস্থা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-1 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>APK রিলিজ প্রিভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('github_actions')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'github_actions'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Actions ওয়ার্কফ্লো</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'instructions'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>মোবাইলে ইন্সটল গাইড</span>
          </button>

          <button
            onClick={() => setActiveTab('local_build')}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'local_build'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>বিল্ড কমান্ডস</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Highlight Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-sky-950/60 border border-emerald-500/40 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold">
                        LATEST RELEASE
                      </span>
                      <span className="text-emerald-400 font-bold font-mono">{currentVersion}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{apkFileName}</h4>
                    <p className="text-slate-400 text-xs">
                      Reqable Android Standalone APK Package (Universal Architecture: arm64-v8a, armeabi-v7a, x86_64)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy('apkName', apkFileName)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedKey === 'apkName' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'apkName' ? 'কপি হয়েছে' : 'নাম কপি'}</span>
                    </button>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Package ID</div>
                    <div className="text-emerald-300 font-bold truncate">{packageName}</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Min Android</div>
                    <div className="text-sky-300 font-bold">Android 7.0+ (API 24)</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Target SDK</div>
                    <div className="text-amber-300 font-bold">Android 14 (API 34)</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Build Pipeline</div>
                    <div className="text-purple-300 font-bold">GitHub Actions CI/CD</div>
                  </div>
                </div>
              </div>

              {/* Release Features */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <h5 className="font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>অ্যান্ড্রয়েড অ্যাপসে অন্তর্ভুক্ত সুবিধাসমূহ:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ফুল API ট্র্যাফিক ইন্টারসেপ্ট ও ডিবাগিং</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>REST / GraphQL API ক্লায়েন্ট রিকোয়েস্ট</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>MITM মক রুলস এবং রেসপন্স রিরাইট</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Gemini AI ট্র্যাফিক অ্যানালাইসিস কোপাইলট</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>OWASP API সিকিউরিটি স্ক্যানার ও অডিট</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>গুগল ড্রাইভ ও ফায়ারবেস ক্লাউড ডেটা সিঙ্ক</span>
                  </div>
                </div>
              </div>

              {/* Quick Trigger Step */}
              <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-100">গিটহাবে ট্যাগ পুশ করলেই স্বয়ংক্রিয়ভাবে APK রিলিজ হবে!</h5>
                    <p className="text-slate-400 text-[11px]">
                      `.github/workflows/release-android-apk.yml` কনফিগারেশন সম্পূর্ণ অ্যাক্টিভ রয়েছে।
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('github_actions')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shrink-0 cursor-pointer shadow transition-all"
                >
                  কীভাবে করবেন দেখুন
                </button>
              </div>
            </div>
          )}

          {/* GITHUB ACTIONS TAB */}
          {activeTab === 'github_actions' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2">
                    <Github className="w-4 h-4 text-emerald-400" />
                    <span>পদ্ধতি ১: গিট ট্যাগ পুশ করে অটোমেটিক APK রিলিজ (Recommended)</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono text-[10px]">
                    TAG TRIGGER
                  </span>
                </div>
                <p className="text-slate-300">
                  আপনার লোকাল টার্মিনাল বা গিট ক্লায়েন্ট থেকে নিচের কমান্ডগুলো রান করে আপনার গিটহাব রিপোজিটরিতে ট্যাগ পুশ করুন:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-emerald-400 text-xs flex items-center justify-between">
                  <pre className="overflow-x-auto whitespace-pre">{gitTagCmd}</pre>
                  <button
                    onClick={() => handleCopy('gitTag', gitTagCmd)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer shrink-0"
                    title="কমান্ড কপি করুন"
                  >
                    {copiedKey === 'gitTag' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  📌 এটি পুশ করার সাথে সাথে GitHub Actions স্বয়ংক্রিয়ভাবে কোড চেকআউট করবে, Vite দিয়ে অ্যাপ বিল্ড করবে, অ্যান্ড্রয়েড Gradle দিয়ে APK কম্পাইল করবে এবং সরাসরি <strong className="text-slate-200">GitHub Releases</strong> পেজে `.apk` ফাইলটি রিলিজ হিসেবে পাবলিশ করে দেবে!
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2">
                    <Play className="w-4 h-4 text-amber-400" />
                    <span>পদ্ধতি ২: GitHub Actions UI থেকে এক ক্লিকে Manual Run</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono text-[10px]">
                    WORKFLOW DISPATCH
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1">
                  <li>আপনার GitHub রিপোজিটরিতে গিয়ে <strong className="text-white">Actions</strong> ট্যাবে ক্লিক করুন।</li>
                  <li>বামের মেনু থেকে <strong className="text-emerald-400">Release Android APK</strong> ওয়ার্কফ্লোটি সিলেক্ট করুন।</li>
                  <li>ডানের <strong className="text-sky-400">Run workflow</strong> বাটনে ক্লিক করুন।</li>
                  <li>ভার্সন ট্যাগ লিখুন (ডিফল্ট: <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">v3.2.22</code>) এবং <strong className="text-emerald-400">Run workflow</strong> কনফার্ম করুন।</li>
                </ol>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>বিল্ড শেষ হতে আনুমানিক ২-৩ মিনিট সময় লাগবে। সম্পন্ন হলে সরাসরি রিলিজ পেজ থেকে APK ডাউনলোড করা যাবে।</span>
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTIONS TAB */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>অ্যান্ড্রয়েড ফোনে APK ডাউনলোড ও ইন্সটল করার নিয়ম:</span>
                </h4>

                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0">
                      ১
                    </span>
                    <div>
                      <strong className="text-white">APK ফাইল ডাউনলোড করুন:</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        GitHub Releases পেজ অথবা Actions Artifacts থেকে <code className="text-emerald-300 font-mono">Reqable-Android-v3.2.22.apk</code> ফাইলটি আপনার ফোনে ডাউনলোড করুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0">
                      ২
                    </span>
                    <div>
                      <strong className="text-white">Unknown Sources পারমিশন দিন:</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        প্রথমবার ইন্সটল করার সময় অ্যান্ড্রয়েড সিকিউরিটি পপ-আপ আসলে Settings &gt; Allow from this source বা &quot;Install unknown apps&quot; অন করে দিন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0">
                      ৩
                    </span>
                    <div>
                      <strong className="text-white">ইন্সটল এবং ওপেন করুন:</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        ইন্সটল বাটনে ট্যাপ করুন। ইন্সটল সম্পন্ন হলে ওপেন করে রিকুয়েবল-এর সমস্ত ফিচার উপভোগ করুন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h5 className="font-bold text-slate-200">💡 প্রো-টিপ (Network & SSL Debugging):</h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  আমাদের Android Manifest এবং Network Security Config-এ <code className="text-sky-300 font-mono">cleartextTrafficPermitted=&quot;true&quot;</code> এবং <code className="text-emerald-300 font-mono">user CA certificates</code> ট্রাস্টেড করা রয়েছে, যার ফলে আপনি যেকোনো লোকালহোস্ট, স্টেজিং ও প্রোডাকশন API ট্র্যাফিক নির্বিঘ্নে ইন্টারসেপ্ট এবং ক্যাপচার করতে পারবেন।
                </p>
              </div>
            </div>
          )}

          {/* LOCAL BUILD TAB */}
          {activeTab === 'local_build' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>লোকাল মেশিনে Android APK কম্পাইল করার নিয়ম:</span>
                </h4>
                <p className="text-slate-300">
                  আপনার পিসিতে যদি Android Studio বা Android SDK এবং Java 17 ইন্সটল থাকে, তবে সরাসরি নিচের কমান্ড দিয়ে APK বানিয়ে নিতে পারবেন:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-emerald-400 text-xs flex items-center justify-between">
                  <span>{localBuildCmd}</span>
                  <button
                    onClick={() => handleCopy('localCmd', localBuildCmd)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer shrink-0"
                    title="কমান্ড কপি করুন"
                  >
                    {copiedKey === 'localCmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono text-slate-400">
                  <div className="text-slate-300 font-bold">আউটপুট APK লোকেশন:</div>
                  <div className="text-amber-300">android/app/build/outputs/apk/debug/app-debug.apk</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 relative z-10">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>GitHub Actions CI/CD Pipeline Configured (.github/workflows)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCopy('tagAll', gitTagCmd)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedKey === 'tagAll' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>গিট ট্যাগ কপি</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold hover:from-emerald-400 hover:to-teal-400 shadow-md transition-all cursor-pointer"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
