import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Reqable Uncaught Application Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-rose-500 selection:text-white">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Reqable Mobile Recovery</h2>
                <p className="text-xs text-slate-400">An unexpected runtime error was caught safely</p>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs font-mono text-rose-300 mb-6 max-h-48 overflow-y-auto break-all">
              <div className="flex items-center gap-1.5 text-slate-400 font-sans mb-1.5 font-medium">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                <span>Error Details:</span>
              </div>
              {this.state.error?.message || 'Unknown runtime error'}
              {this.state.errorInfo?.componentStack && (
                <div className="text-[10px] text-slate-500 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack.slice(0, 400)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Reqable
              </button>
              <button
                onClick={this.handleResetAndReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
