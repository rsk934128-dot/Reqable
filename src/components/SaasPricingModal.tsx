import React, { useState } from 'react';
import { DollarSign, Check, Zap, Sparkles, Shield, Rocket, CreditCard, Gift, Layers, X, HelpCircle } from 'lucide-react';

interface SaasPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaasPricingModal: React.FC<SaasPricingModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'ltd'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Developer',
      bnName: 'ফ্রি ডেভেলপার প্ল্যান',
      priceMonthly: '$0',
      priceYearly: '$0',
      priceLtd: '$0',
      period: 'Forever Free',
      desc: 'মৌলিক এপিআই ডেবগিং, এইচটিটিপি ট্রাফিক ক্যাপচার এবং টেস্ট রানার।',
      features: [
        '১৫০ ক্যাপচার্ড এইচটিটিপি/এইচটিটিপিএস ট্রাফিক/দিন',
        'মৌলিক রুলস ইঞ্জিন ও মক রেসপন্স',
        '১০টি এআই কোপাইলট অ্যাসিস্ট প্রম্পট/দিন',
        'গুগল ড্রাইভ ও জিমেইল সিঙ্ক (১ জিবি)',
        'কমিউনিটি সাপোর্ট',
      ],
      badge: 'COMMUNITY',
      color: 'from-slate-700 to-slate-800',
      border: 'border-slate-800',
      buttonText: 'Current Plan (ফ্রি)',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Engineer',
      bnName: 'প্রো ইঞ্জিনিয়ার প্ল্যান',
      priceMonthly: '$19',
      priceYearly: '$15',
      priceLtd: '$49',
      period: billingCycle === 'ltd' ? 'One-time Lifetime Deal' : billingCycle === 'yearly' ? 'per month (billed annually)' : 'per month',
      desc: 'আনলিমিটেড এআই কোপাইলট, OWASP সিকিউরিটি স্ক্যানার ও এডভান্সড মকিং।',
      features: [
        'আনলিমিটেড ট্রাফিক ক্যাপচার ও MITM ডিসেকশন',
        'Gemini 2.5 Flash AI Copilot (Unlimited)',
        'অটোমেটেড OWASP এপিআই সিকিউরিটি অডিট',
        'MCP (Model Context Protocol) সার্ভার ইন্টিগ্রেশন',
        'OpenAPI / Swagger ১-ক্লিক অটো জেনারেটর',
        '২৪/৭ প্রায়োরিটি সাপোর্ট',
      ],
      badge: billingCycle === 'ltd' ? 'APPSUMO LTD DEAL' : 'MOST POPULAR',
      color: 'from-amber-500 via-orange-500 to-amber-600',
      border: 'border-amber-500/60 shadow-amber-500/10',
      buttonText: billingCycle === 'ltd' ? 'Get Lifetime Access ($49)' : 'Upgrade to Pro ($19/mo)',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Team & Enterprise',
      bnName: 'টিম ও এন্টারপ্রাইজ প্ল্যান',
      priceMonthly: '$49',
      priceYearly: '$39',
      priceLtd: '$149',
      period: billingCycle === 'ltd' ? 'One-time Lifetime Deal' : billingCycle === 'yearly' ? 'per user/month' : 'per user/month',
      desc: 'টিম কোলাবোরেশন, অন-প্রিমাইস ফায়ারস্টোর ক্লাস্টার ও প্রাইজ সাপোর্ট।',
      features: [
        'Pro প্ল্যানের সকল সুবিধা অন্তর্ভুক্ত',
        'রিয়েলটাইম টিম ওয়ার্কস্পেস ও লাইভ ট্রাফিক শেয়ারিং',
        'এন্টারপ্রাইজ অন-প্রিমাইস সিকিউরিটি অ্যান্ড কমপ্লায়েন্স',
        'কাস্টম ব্যাকএন্ড ডোমেইন ও মক রুট জেনারেটর',
        'SLA guarantee & Dedicated Account Manager',
      ],
      badge: 'ENTERPRISE VIP',
      color: 'from-purple-500 via-indigo-500 to-purple-600',
      border: 'border-purple-500/50',
      buttonText: 'Contact Sales / Upgrade',
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-8">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Rocket className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg">মনিটাইজেশন ও সাবস্ক্রিপশন প্ল্যান (SaaS Plans)</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  FREEMIUM & LTD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Reqable & API Intelligence Suite - গ্লোবাল মার্কেটে লঞ্চ করার উপযোগী সাবস্ক্রিপশন প্ল্যান
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

        {/* Billing Selector Toggle */}
        <div className="flex justify-center relative z-10">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Yearly (Save 20%)</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-slate-950 text-amber-300 rounded font-mono">SAVE 20%</span>
            </button>
            <button
              onClick={() => setBillingCycle('ltd')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ltd'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AppSumo LTD ($49)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {plans.map((p) => {
            const price = billingCycle === 'ltd' ? p.priceLtd : billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-5 rounded-2xl bg-slate-950 border ${p.border} flex flex-col justify-between transition-all cursor-pointer relative ${
                  p.popular ? 'ring-2 ring-amber-500/50 scale-[1.02] shadow-xl' : 'hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold font-mono tracking-wider shadow-md uppercase">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-white">{p.name}</h4>
                    <p className="text-xs font-bold text-amber-400">{p.bnName}</p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">{p.desc}</p>
                  </div>

                  {/* Price Header */}
                  <div className="pt-2 border-t border-slate-900">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">{price}</span>
                      <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      WHAT IS INCLUDED:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    p.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{p.buttonText}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Pitch Summary & Acquisition Value */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-white">AppSumo / Acquire.com Pitch Ready</h5>
              <p className="text-[11px] text-slate-400">
                LTD ডিল এবং এআই কোপাইলট টোকেন সিস্টেম দিয়ে সাবস্ক্রিপশন জেনারেট করার জন্য সম্পুর্ন প্রস্তুত।
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-all shrink-0 cursor-pointer"
          >
            ফিরে যান (Back to App)
          </button>
        </div>
      </div>
    </div>
  );
};
