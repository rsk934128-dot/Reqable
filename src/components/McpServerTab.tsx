import React, { useState } from 'react';
import {
  Bot,
  CheckCircle,
  Code,
  Copy,
  Cpu,
  Play,
  Send,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { McpTool } from '../types/reqable';

export const McpServerTab: React.FC = () => {
  const [activeConsoleInput, setActiveConsoleInput] = useState(
    'Show me all intercepted traffic from httpbin.org'
  );
  const [consoleLogs, setConsoleLogs] = useState<
    { role: 'user' | 'mcp_server'; text: string; code?: string; timestamp: string }[]
  >([
    {
      role: 'mcp_server',
      text: 'Reqable Model Context Protocol (MCP) v1.0 Server online at /api/mcp.',
      code: JSON.stringify({ status: 'ACTIVE', endpoint: 'http://localhost:3000/api/mcp' }, null, 2),
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  const toolsList: McpTool[] = [
    {
      name: 'reqable_list_traffic',
      description: 'Lists captured HTTP traffic records filtered by domain or status code.',
      inputSchema: { domain: 'string', status: 'number', limit: 'number' },
    },
    {
      name: 'reqable_get_traffic_detail',
      description: 'Reads full request/response headers, body, and timing breakdown for a traffic ID.',
      inputSchema: { id: 'string' },
    },
    {
      name: 'reqable_execute_request',
      description: 'Dispatches an HTTP request through Reqable C++ network proxy core.',
      inputSchema: { url: 'string', method: 'string', headers: 'object', body: 'string' },
    },
    {
      name: 'reqable_create_rule',
      description: 'Creates a breakpoint, rewrite rule, or map local mock file in MITM engine.',
      inputSchema: { name: 'string', type: 'breakpoint | rewrite | map_local', matchUrl: 'string' },
    },
    {
      name: 'reqable_generate_assertions',
      description: 'Generates automated PM assertions for response JSON using Gemini AI.',
      inputSchema: { responseBody: 'string' },
    },
  ];

  const handleRunConsoleCommand = async () => {
    if (!activeConsoleInput.trim()) return;
    setIsExecuting(true);

    const userMsg = activeConsoleInput;
    setActiveConsoleInput('');

    setConsoleLogs((prev) => [
      ...prev,
      { role: 'user', text: userMsg, timestamp: new Date().toLocaleTimeString() },
    ]);

    try {
      // Simulate natural language MCP tool routing
      let toolToCall = 'reqable_list_traffic';
      let toolArgs: Record<string, unknown> = { limit: 5 };

      if (userMsg.toLowerCase().includes('execute') || userMsg.toLowerCase().includes('send')) {
        toolToCall = 'reqable_execute_request';
        toolArgs = { url: 'https://httpbin.org/get', method: 'GET' };
      } else if (userMsg.toLowerCase().includes('rule') || userMsg.toLowerCase().includes('mock')) {
        toolToCall = 'reqable_create_rule';
        toolArgs = { name: 'MCP Auto Rule', type: 'rewrite', matchUrl: 'https://httpbin.org/*' };
      }

      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolToCall, arguments: toolArgs }),
      });

      const data = await res.json();

      setConsoleLogs((prev) => [
        ...prev,
        {
          role: 'mcp_server',
          text: `Executed MCP tool [${toolToCall}]`,
          code: JSON.stringify(data.result || data, null, 2),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: unknown) {
      setConsoleLogs((prev) => [
        ...prev,
        {
          role: 'mcp_server',
          text: 'MCP Execution Error',
          code: String(err),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div id="mcp-server-view" className="h-[calc(100vh-53px)] bg-slate-950 text-slate-200 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900 border border-purple-800/80 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Built-in Reqable MCP Server</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900 text-purple-300 font-bold border border-purple-700">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Model Context Protocol (MCP) enables AI assistants such as Claude Desktop, GitHub Copilot, and Gemini to interact directly with Reqable to inspect traffic, generate assertions, and create mock rules.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>http://localhost:3000/api/mcp/tools</span>
          </div>
        </div>

        {/* Grid Split: Available Tools vs Live Interactive MCP Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Exposed MCP Tools */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Exposed MCP Primitives
            </div>

            <div className="space-y-2.5">
              {toolsList.map((tool) => (
                <div key={tool.name} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-400">{tool.name}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Tool</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Console */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[420px]">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Interactive MCP Agent Tester
              </span>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear Log
              </button>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs bg-slate-950/60">
              {consoleLogs.map((log, idx) => (
                <div key={`mcp-log-${idx}-${log.timestamp}`} className={`p-3 rounded-lg border ${log.role === 'user' ? 'bg-indigo-950/40 border-indigo-800/80' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold uppercase text-purple-400">{log.role}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-200">{log.text}</p>
                  {log.code && (
                    <pre className="mt-2 p-2 bg-slate-950 text-emerald-400 rounded border border-slate-800 whitespace-pre-wrap break-all text-[11px]">
                      {log.code}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={activeConsoleInput}
                onChange={(e) => setActiveConsoleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunConsoleCommand()}
                placeholder="Type MCP query (e.g. 'Show traffic from httpbin' or 'Execute GET')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRunConsoleCommand}
                disabled={isExecuting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Run</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
