import React, { useState, useRef } from 'react';
import apiHubBannerImg from '../assets/images/api_hub_banner_1786299828338.jpg';
import { TrafficItem, ApiRequest } from '../types/reqable';
import { OpenApiDocView } from './OpenApiDocView';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Shield,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  AlertCircle,
  Bookmark,
  Sparkles,
  FileText,
  Layers,
} from 'lucide-react';

interface WebHubTabProps {
  initialUrl?: string;
  traffic?: TrafficItem[];
  onImportToReqable?: (req: Partial<ApiRequest>) => void;
}

export const WebHubTab: React.FC<WebHubTabProps> = ({
  initialUrl = 'https://shurukkha-hub-9xp1.vecel.app',
  traffic = [],
  onImportToReqable,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'webframe' | 'swagger_doc'>('webframe');
  const [url, setUrl] = useState<string>(initialUrl);
  const [iframeUrl, setIframeUrl] = useState<string>(initialUrl);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const presets = [
    { name: 'Shurukkha Hub', url: 'https://shurukkha-hub-9xp1.vecel.app' },
    { name: 'Shurukkha Vercel', url: 'https://shurukkha-hub-9xp1.vercel.app' },
    { name: 'HttpBin Testing', url: 'https://httpbin.org' },
    { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com' },
  ];

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
      setUrl(formatted);
    }
    setIsLoading(true);
    setHasError(false);
    setIframeUrl(formatted);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeUrl;
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(iframeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Viewport Container Widths
  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[395px] h-[720px] rounded-2xl border-4 border-slate-700 shadow-2xl my-auto';
      case 'tablet':
        return 'max-w-[768px] h-[850px] rounded-xl border-2 border-slate-700 shadow-2xl my-auto';
      case 'desktop':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-slate-100 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-950' : ''}`}>
      {/* Visual Hub Banner */}
      {!isFullscreen && (
        <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-teal-500/40 shadow-lg shadow-teal-500/10 shrink-0 bg-slate-950">
              <img
                src={apiHubBannerImg}
                alt="Web Hub Marketplace"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">ওয়েব হাব ও এপিআই ডিরেক্টরি (Web Hub & API Directory)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  LIVE EMBED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                পাবলিক REST API ক্যাটালগ, শ সুরক্ষা হাব প্লেগ্রাউন্ড ও ওয়েব ভিউয়ার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10">
            {/* Sub-tab Navigation Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSubTab('webframe')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'webframe'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web Frame Embed</span>
              </button>

              <button
                onClick={() => setActiveSubTab('swagger_doc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'swagger_doc'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>OpenAPI / Swagger Docs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-teal-300 font-mono font-bold ml-0.5">
                  {traffic.length}
                </span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>HTTPS Encrypted Proxy Frame</span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW ACCORDING TO SUB-TAB */}
      {activeSubTab === 'swagger_doc' ? (
        <div className="flex-1 overflow-hidden min-h-0">
          <OpenApiDocView traffic={traffic} onImportToReqable={onImportToReqable} />
        </div>
      ) : (
        <>
          {/* Top Header Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* URL Address Input Bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs shrink-0">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200 hidden sm:inline">Iframe Hub</span>
          </div>

          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL to integrate (e.g. https://shurukkha-hub-9xp1.vecel.app)"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono pl-3 pr-20 py-2 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-md transition-all cursor-pointer shadow-sm"
            >
              Go
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Frame"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </form>

        {/* Viewport & Preset Actions */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          {/* Quick Presets */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <Bookmark className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
            {presets.map((preset) => (
              <button
                key={preset.url}
                onClick={() => {
                  setUrl(preset.url);
                  setIframeUrl(preset.url);
                  setIsLoading(true);
                }}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  iframeUrl === preset.url
                    ? 'bg-sky-950 text-sky-300 border border-sky-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Viewport Size Controls */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop View"
              className={`p-1.5 rounded transition-colors ${
                viewport === 'desktop' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded transition-colors ${
                viewport === 'tablet' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile View (395px)"
              className={`p-1.5 rounded transition-colors ${
                viewport === 'mobile' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* External Link */}
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in external browser tab"
            className="p-2 text-slate-400 hover:text-sky-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyUrl}
            title="Copy Page URL"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Frame'}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-header status bar */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Target:</span>
          <span className="font-mono text-slate-200 font-semibold">{iframeUrl}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Interactive Web Frame</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="capitalize">{viewport} Mode</span>
        </div>
      </div>

      {/* Main Iframe Viewer Container */}
      <div className="flex-1 bg-slate-950 p-2 md:p-4 overflow-auto flex items-center justify-center relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 text-slate-300">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <div className="text-sm font-medium">Loading embedded web page...</div>
            <div className="text-xs text-slate-500 font-mono">{iframeUrl}</div>
          </div>
        )}

        <div className={`transition-all duration-300 flex flex-col ${getViewportWidthClass()}`}>
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title="Embedded Web Page Hub"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            className="w-full h-full rounded-lg bg-white border border-slate-800 shadow-inner"
          />
        </div>
      </div>

      {/* Fallback Notice for Security CSP / X-Frame-Options Header Restrictions */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            If the page fails to display, the domain may restrict embedding via <code className="text-slate-300 font-mono">X-Frame-Options</code> or <code className="text-slate-300 font-mono">Content-Security-Policy</code> headers.
          </span>
        </div>
        <a
          href={iframeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
        >
          <span>Launch Directly</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
        </>
      )}
    </div>
  );
};
