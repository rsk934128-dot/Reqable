import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Copy, Check, AlertCircle, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { SchemaDiscrepancy } from '../utils/jsonSchemaValidator';

interface JsonDiscrepancyViewerProps {
  jsonString: string;
  discrepancies: SchemaDiscrepancy[];
  highlightEnabled: boolean;
  onToggleHighlight: (enabled: boolean) => void;
  selectedDiscrepancyPath?: string | null;
}

export const JsonDiscrepancyViewer: React.FC<JsonDiscrepancyViewerProps> = ({
  jsonString,
  discrepancies,
  highlightEnabled,
  onToggleHighlight,
  selectedDiscrepancyPath,
}) => {
  const [copied, setCopied] = useState(false);
  const [currentErrorIndex, setCurrentErrorIndex] = useState<number>(0);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Parse and format JSON with line numbering
  const { lines, errorLineIndices } = useMemo(() => {
    let formattedText = jsonString;
    try {
      const parsed = JSON.parse(jsonString);
      formattedText = JSON.stringify(parsed, null, 2);
    } catch {
      // not valid JSON, return as is
      return {
        lines: [{ text: jsonString, disc: null, lineNum: 1 }],
        errorLineIndices: [] as number[],
      };
    }

    const rawLines = formattedText.split('\n');
    const matchedIndices: number[] = [];

    // Map each line to relevant discrepancy by tracking object key stack
    const mapped = rawLines.map((line, idx) => {
      const lineNum = idx + 1;
      let matchedDisc: SchemaDiscrepancy | null = null;

      if (discrepancies.length > 0) {
        // Check if line contains a key matching any discrepancy
        for (const disc of discrepancies) {
          const pathSegments = disc.path.replace(/^#\/?/, '').split('/');
          const lastKey = pathSegments[pathSegments.length - 1];

          if (lastKey) {
            // Check for `"key":` in the line or exact match
            const keyRegex = new RegExp(`"${lastKey}"\\s*:`);
            if (keyRegex.test(line)) {
              matchedDisc = disc;
              break;
            }
          }
        }
      }

      if (matchedDisc) {
        matchedIndices.push(idx);
      }

      return {
        text: line,
        disc: matchedDisc,
        lineNum,
      };
    });

    return { lines: mapped, errorLineIndices: matchedIndices };
  }, [jsonString, discrepancies]);

  // Jump to selected discrepancy when clicked from schema tab
  useEffect(() => {
    if (!selectedDiscrepancyPath) return;
    const targetIdx = lines.findIndex(
      (l) => l.disc && l.disc.path === selectedDiscrepancyPath
    );
    if (targetIdx !== -1 && lineRefs.current[targetIdx]) {
      lineRefs.current[targetIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDiscrepancyPath, lines]);

  const handleCopy = () => {
    try {
      const parsed = JSON.parse(jsonString);
      navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
    } catch {
      navigator.clipboard.writeText(jsonString);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJumpNextError = () => {
    if (errorLineIndices.length === 0) return;
    const nextIdx = (currentErrorIndex + 1) % errorLineIndices.length;
    setCurrentErrorIndex(nextIdx);
    const lineIndex = errorLineIndices[nextIdx];
    lineRefs.current[lineIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleJumpPrevError = () => {
    if (errorLineIndices.length === 0) return;
    const prevIdx =
      (currentErrorIndex - 1 + errorLineIndices.length) % errorLineIndices.length;
    setCurrentErrorIndex(prevIdx);
    const lineIndex = errorLineIndices[prevIdx];
    lineRefs.current[lineIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 gap-2 flex-wrap font-sans">
        <div className="flex items-center gap-3">
          {discrepancies.length > 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={highlightEnabled}
                onChange={(e) => onToggleHighlight(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span
                className={`font-semibold ${
                  highlightEnabled ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                Highlight Schema Discrepancies
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                {discrepancies.length}
              </span>
            </label>
          )}

          {highlightEnabled && errorLineIndices.length > 0 && (
            <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
              <span className="text-[11px] text-slate-400">
                Error {currentErrorIndex + 1} of {errorLineIndices.length}
              </span>
              <button
                type="button"
                onClick={handleJumpPrevError}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                title="Previous discrepancy"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleJumpNextError}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                title="Next discrepancy"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
          title="Copy formatted JSON response"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Lines Container */}
      <div className="flex-1 overflow-auto p-2 leading-relaxed bg-slate-950/80">
        <div className="min-w-full inline-block">
          {lines.map((item, idx) => {
            const hasError = highlightEnabled && !!item.disc;
            const isSelected =
              highlightEnabled &&
              selectedDiscrepancyPath &&
              item.disc?.path === selectedDiscrepancyPath;

            return (
              <div
                key={idx}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                className={`flex items-start group px-2 py-0.5 rounded transition-colors ${
                  isSelected
                    ? 'bg-rose-950/70 border-l-2 border-rose-400 font-semibold shadow-inner'
                    : hasError
                    ? 'bg-rose-950/30 border-l-2 border-rose-500/80'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                {/* Line number gutter */}
                <div className="w-9 shrink-0 text-right pr-3 select-none text-[11px] text-slate-600 font-mono flex items-center justify-end gap-1">
                  {hasError && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                  <span>{item.lineNum}</span>
                </div>

                {/* Line content */}
                <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4 font-mono">
                  <span
                    className={`whitespace-pre ${
                      hasError ? 'text-rose-200' : 'text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>

                  {/* Inline Discrepancy Badge */}
                  {hasError && item.disc && (
                    <div
                      className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-900/90 text-rose-200 border border-rose-700 text-[10px] font-sans font-medium"
                      title={item.disc.message}
                    >
                      <AlertCircle className="w-3 h-3 text-rose-300" />
                      <span className="font-mono uppercase font-bold text-[9px]">
                        [{item.disc.keyword}]
                      </span>
                      <span className="truncate max-w-xs">{item.disc.message}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
