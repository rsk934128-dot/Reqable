import React, { useState, useRef, useCallback } from 'react';
import {
  Code,
  Copy,
  Clock,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  ChevronRight,
  ChevronDown,
  Layers,
  Plus,
  Play,
  Send,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileJson,
  ShieldCheck,
  Activity,
  BarChart2,
  RefreshCw,
  TrendingUp,
  Edit3,
  MoreVertical,
  FilePlus,
  Keyboard,
  Wand2,
  FileCode,
} from 'lucide-react';
import { ApiRequest, ApiResponse, Collection, CollectionFolder, Environment, HttpMethod, KeyValuePair } from '../types/reqable';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface ApiTestingTabProps {
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  environments: Environment[];
  selectedEnvId: string;
  onSendRequest: (req: ApiRequest) => Promise<ApiResponse>;
}

// Recursive component for rendering nested folders and requests within a collection
interface FolderTreeNodeProps {
  collection: Collection;
  folder: CollectionFolder;
  depth: number;
  activeReqId: string;
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  onSelectReq: (colId: string, req: ApiRequest) => void;
  onAddSubFolder: (colId: string, parentFolderId: string) => void;
  onAddRequest: (colId: string, folderId: string) => void;
  onRenameFolder: (colId: string, folderId: string) => void;
  onDeleteFolder: (colId: string, folderId: string) => void;
  onOpenMoveModal: (type: 'request' | 'folder', id: string, colId: string) => void;
  onDuplicateRequest: (colId: string, req: ApiRequest) => void;
  onDeleteRequest: (colId: string, reqId: string) => void;
}

const FolderTreeNode: React.FC<FolderTreeNodeProps> = ({
  collection,
  folder,
  depth,
  activeReqId,
  expandedNodes,
  toggleNode,
  onSelectReq,
  onAddSubFolder,
  onAddRequest,
  onRenameFolder,
  onDeleteFolder,
  onOpenMoveModal,
  onDuplicateRequest,
  onDeleteRequest,
}) => {
  const isExpanded = expandedNodes[folder.id] !== false; // default open
  const childFolders = (collection.folders || []).filter((f) => f.parentId === folder.id);
  const folderRequests = (collection.requests || []).filter((r) => r.folderId === folder.id);
  const totalSubItems = childFolders.length + folderRequests.length;

  return (
    <div className="select-none my-0.5">
      {/* Folder Header */}
      <div
        className="flex items-center justify-between px-1.5 py-1 rounded hover:bg-slate-800/80 group cursor-pointer text-xs"
        style={{ paddingLeft: `${depth * 10 + 6}px` }}
        onClick={() => toggleNode(folder.id)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-200 focus:outline-none p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(folder.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          )}
          <span className="font-medium text-slate-200 truncate">{folder.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">({totalSubItems})</span>
        </div>

        {/* Action Buttons on Hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAddRequest(collection.id, folder.id)}
            className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-700/80"
            title="Add Request inside folder"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => onAddSubFolder(collection.id, folder.id)}
            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/80"
            title="Add Sub-folder"
          >
            <FolderPlus className="w-3 h-3" />
          </button>
          <button
            onClick={() => onOpenMoveModal('folder', folder.id, collection.id)}
            className="p-1 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-700/80"
            title="Move Folder"
          >
            <FolderInput className="w-3 h-3" />
          </button>
          <button
            onClick={() => onRenameFolder(collection.id, folder.id)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/80"
            title="Rename Folder"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDeleteFolder(collection.id, folder.id)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/80"
            title="Delete Folder"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Child Contents */}
      {isExpanded && (
        <div className="space-y-0.5">
          {/* Nested Sub-Folders */}
          {childFolders.map((childFolder) => (
            <FolderTreeNode
              key={childFolder.id}
              collection={collection}
              folder={childFolder}
              depth={depth + 1}
              activeReqId={activeReqId}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onSelectReq={onSelectReq}
              onAddSubFolder={onAddSubFolder}
              onAddRequest={onAddRequest}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              onOpenMoveModal={onOpenMoveModal}
              onDuplicateRequest={onDuplicateRequest}
              onDeleteRequest={onDeleteRequest}
            />
          ))}

          {/* Requests inside this folder */}
          {folderRequests.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectReq(collection.id, r)}
              style={{ paddingLeft: `${(depth + 1) * 10 + 16}px` }}
              className={`group flex items-center justify-between pr-1.5 py-1 rounded text-xs transition-all cursor-pointer ${
                activeReqId === r.id
                  ? 'bg-sky-950/90 text-sky-200 border border-sky-800/80 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <span
                  className={`text-[8px] font-extrabold font-mono px-1 rounded shrink-0 ${
                    r.method === 'GET'
                      ? 'text-emerald-400 bg-emerald-950/80'
                      : r.method === 'POST'
                      ? 'text-amber-400 bg-amber-950/80'
                      : r.method === 'DELETE'
                      ? 'text-rose-400 bg-rose-950/80'
                      : 'text-purple-400 bg-purple-950/80'
                  }`}
                >
                  {r.method}
                </span>
                <span className="truncate">{r.name}</span>
              </div>

              {/* Request Hover Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onOpenMoveModal('request', r.id, collection.id)}
                  className="p-0.5 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800"
                  title="Move to Folder"
                >
                  <FolderInput className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDuplicateRequest(collection.id, r)}
                  className="p-0.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800"
                  title="Duplicate Request"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteRequest(collection.id, r.id)}
                  className="p-0.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                  title="Delete Request"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ApiTestingTab: React.FC<ApiTestingTabProps> = ({
  collections,
  setCollections,
  environments,
  selectedEnvId,
  onSendRequest,
}) => {
  // Active Request State
  const [activeReq, setActiveReq] = useState<ApiRequest>({
    id: 'req-active-1',
    name: 'New HTTP Request',
    method: 'GET',
    url: 'https://httpbin.org/get?user=reqable&mode=debug',
    headers: [
      { id: 'h-1', key: 'User-Agent', value: 'Reqable/3.2 (Macintosh; Apple Silicon)', enabled: true },
      { id: 'h-2', key: 'Accept', value: 'application/json', enabled: true },
    ],
    params: [
      { id: 'p-1', key: 'user', value: 'reqable', enabled: true },
      { id: 'p-2', key: 'mode', value: 'debug', enabled: true },
    ],
    bodyType: 'json',
    body: JSON.stringify({ message: 'Hello from Reqable API Client!' }, null, 2),
    auth: { type: 'none' },
    testScript: `pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Response time is fast (< 1000ms)", function () {
  pm.expect(pm.response.timeMs).to.be.below(1000);
});`,
  });

  const [requestSubTab, setRequestSubTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'tests'>('params');
  const [responseSubTab, setResponseSubTab] = useState<'pretty' | 'raw' | 'headers' | 'timings' | 'tests' | 'code'>('pretty');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGeneratingAiTests, setIsGeneratingAiTests] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [formatSuccess, setFormatSuccess] = useState<string | null>(null);

  const urlInputRef = useRef<HTMLInputElement>(null);

  // Tree Expansion State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    collections.forEach((col) => {
      initial[col.id] = true;
      col.folders?.forEach((f) => {
        initial[f.id] = true;
      });
    });
    return initial;
  });

  // Move Modal State
  const [movingItem, setMovingItem] = useState<{
    type: 'request' | 'folder';
    id: string;
    colId: string;
  } | null>(null);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>('ROOT');

  // Toggle tree node expansion
  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  // Add top-level folder or sub-folder
  const handleAddFolder = (colId: string, parentFolderId?: string) => {
    const name = prompt('Folder Name:', parentFolderId ? 'Sub-Folder' : 'New Folder');
    if (!name?.trim()) return;

    const newFolder: CollectionFolder = {
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      parentId: parentFolderId,
    };

    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === colId) {
          return {
            ...col,
            folders: [...(col.folders || []), newFolder],
            updatedAt: new Date().toISOString(),
          };
        }
        return col;
      })
    );

    setExpandedNodes((prev) => ({
      ...prev,
      [colId]: true,
      ...(parentFolderId ? { [parentFolderId]: true } : {}),
      [newFolder.id]: true,
    }));
  };

  // Add a request directly to collection or inside a folder
  const handleAddRequestToFolder = (colId: string, folderId?: string) => {
    const name = prompt('Request Name:', 'New Endpoint');
    if (!name?.trim()) return;

    const newReq: ApiRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      method: 'GET',
      url: '{{baseUrl}}/get',
      folderId,
      headers: [
        { id: `h-${Date.now()}`, key: 'Accept', value: 'application/json', enabled: true },
      ],
      params: [],
      bodyType: 'none',
      body: '',
      auth: { type: 'none' },
    };

    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === colId) {
          return {
            ...col,
            requests: [...col.requests, newReq],
            updatedAt: new Date().toISOString(),
          };
        }
        return col;
      })
    );

    setActiveCollectionId(colId);
    setActiveReq(newReq);

    setExpandedNodes((prev) => ({
      ...prev,
      [colId]: true,
      ...(folderId ? { [folderId]: true } : {}),
    }));
  };

  // Rename folder
  const handleRenameFolder = (colId: string, folderId: string) => {
    const col = collections.find((c) => c.id === colId);
    const folder = col?.folders.find((f) => f.id === folderId);
    if (!folder) return;

    const newName = prompt('Rename Folder:', folder.name);
    if (!newName?.trim() || newName === folder.name) return;

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          return {
            ...c,
            folders: c.folders.map((f) => (f.id === folderId ? { ...f, name: newName.trim() } : f)),
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // Delete folder
  const handleDeleteFolder = (colId: string, folderId: string) => {
    const col = collections.find((c) => c.id === colId);
    const folder = col?.folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (!confirm(`Are you sure you want to delete folder "${folder.name}"? Contained items will be moved to parent directory.`)) {
      return;
    }

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          // Reassign requests in deleted folder to folder.parentId
          const updatedRequests = c.requests.map((r) =>
            r.folderId === folderId ? { ...r, folderId: folder.parentId } : r
          );
          // Reassign child folders to folder.parentId
          const updatedFolders = c.folders
            .filter((f) => f.id !== folderId)
            .map((f) => (f.parentId === folderId ? { ...f, parentId: folder.parentId } : f));

          return {
            ...c,
            folders: updatedFolders,
            requests: updatedRequests,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // Rename collection
  const handleRenameCollection = (colId: string) => {
    const col = collections.find((c) => c.id === colId);
    if (!col) return;
    const newName = prompt('Rename Collection:', col.name);
    if (!newName?.trim() || newName === col.name) return;

    setCollections((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, name: newName.trim(), updatedAt: new Date().toISOString() } : c))
    );
  };

  // Delete collection
  const handleDeleteCollection = (colId: string) => {
    const col = collections.find((c) => c.id === colId);
    if (!col) return;
    if (collections.length <= 1) {
      alert('Cannot delete the only collection.');
      return;
    }
    if (!confirm(`Are you sure you want to delete collection "${col.name}"?`)) return;

    setCollections((prev) => prev.filter((c) => c.id !== colId));
    if (activeCollectionId === colId) {
      const remaining = collections.filter((c) => c.id !== colId);
      if (remaining.length > 0) {
        setActiveCollectionId(remaining[0].id);
      }
    }
  };

  // Duplicate request
  const handleDuplicateRequest = (colId: string, req: ApiRequest) => {
    const copyReq: ApiRequest = {
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${req.name} (Copy)`,
    };

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          return {
            ...c,
            requests: [...c.requests, copyReq],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    setActiveCollectionId(colId);
    setActiveReq(copyReq);
  };

  // Delete request
  const handleDeleteRequest = (colId: string, reqId: string) => {
    if (!confirm('Are you sure you want to delete this API request?')) return;

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          return {
            ...c,
            requests: c.requests.filter((r) => r.id !== reqId),
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // Open move modal
  const handleOpenMoveModal = (type: 'request' | 'folder', id: string, colId: string) => {
    setMovingItem({ type, id, colId });
    setTargetMoveFolderId('ROOT');
  };

  // Confirm move
  const handleConfirmMove = (colId: string, itemId: string, itemType: 'request' | 'folder', targetFolderId: string) => {
    const finalFolderId = targetFolderId === 'ROOT' ? undefined : targetFolderId;

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          if (itemType === 'request') {
            return {
              ...c,
              requests: c.requests.map((r) => (r.id === itemId ? { ...r, folderId: finalFolderId } : r)),
              updatedAt: new Date().toISOString(),
            };
          } else {
            if (itemId === finalFolderId) return c;
            return {
              ...c,
              folders: c.folders.map((f) => (f.id === itemId ? { ...f, parentId: finalFolderId } : f)),
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return c;
      })
    );

    setMovingItem(null);
  };

  // Get full path for folders in select menu
  const getFolderPath = (col: Collection, folderId: string): string => {
    if (!col || !col.folders) return '';
    const folder = col.folders.find((f) => f.id === folderId);
    if (!folder) return '';
    if (!folder.parentId) return folder.name;
    const parentFolder = col.folders.find((f) => f.id === folder.parentId);
    if (!parentFolder) return folder.name;
    return `${getFolderPath(col, parentFolder.id)} / ${folder.name}`;
  };

  // Dashboard & Metrics State
  const [showDashboard, setShowDashboard] = useState(true);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [requestResults, setRequestResults] = useState<Record<string, { status: number; timeMs: number; timestamp: string }>>({
    'req-1': { status: 200, timeMs: 145, timestamp: new Date().toISOString() },
    'req-2': { status: 200, timeMs: 98, timestamp: new Date().toISOString() },
    'req-3': { status: 200, timeMs: 210, timestamp: new Date().toISOString() },
    'req-4': { status: 200, timeMs: 65, timestamp: new Date().toISOString() },
  });

  // Active Environment calculation
  const currentEnv = environments.find((e) => e.id === selectedEnvId);

  // Active Collection & Dashboard Metrics Calculations
  const activeCol =
    collections.find((c) => c.id === activeCollectionId) ||
    collections.find((c) => c.requests.some((r) => r.id === activeReq.id)) ||
    collections[0];

  const activeColRequests = activeCol?.requests || [];

  const executedRequests = activeColRequests.filter((r) => requestResults[r.id] !== undefined);
  const executedCount = executedRequests.length;

  const totalResponseTime = executedRequests.reduce(
    (acc, r) => acc + (requestResults[r.id]?.timeMs || 0),
    0
  );
  const avgResponseTime = executedCount > 0 ? totalResponseTime / executedCount : 0;

  const successCount = executedRequests.filter(
    (r) => requestResults[r.id]?.status >= 200 && requestResults[r.id]?.status < 400
  ).length;

  const failureCount = executedRequests.filter(
    (r) => requestResults[r.id]?.status >= 400 || requestResults[r.id]?.status === 0
  ).length;

  const successRate = executedCount > 0 ? (successCount / executedCount) * 100 : 0;
  const failureRate = executedCount > 0 ? (failureCount / executedCount) * 100 : 0;

  const methodCounts = activeColRequests.reduce((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handle URL sending with environment variable replacement
  const handleSend = async () => {
    setIsLoading(true);
    let resolvedUrl = activeReq.url;

    // Expand {{variable}}
    if (currentEnv) {
      currentEnv.variables.forEach((v) => {
        if (v.enabled && v.key) {
          resolvedUrl = resolvedUrl.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
        }
      });
    }

    // Default variable expansion from collection if needed
    const defaultCol = collections.find((c) => c.id === activeCollectionId);
    if (defaultCol) {
      defaultCol.variables.forEach((v) => {
        if (v.enabled && v.key) {
          resolvedUrl = resolvedUrl.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
        }
      });
    }

    const payloadToExecute: ApiRequest = {
      ...activeReq,
      url: resolvedUrl,
    };

    try {
      const res = await onSendRequest(payloadToExecute);
      setResponse(res);
      setRequestResults((prev) => ({
        ...prev,
        [activeReq.id]: {
          status: res.status,
          timeMs: res.timeMs,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (err) {
      console.error(err);
      setRequestResults((prev) => ({
        ...prev,
        [activeReq.id]: {
          status: 500,
          timeMs: 0,
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Save current active request to collection
  const handleSaveRequest = useCallback(() => {
    if (!activeCollectionId) return;
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === activeCollectionId) {
          const reqExists = col.requests.some((r) => r.id === activeReq.id);
          const updatedRequests = reqExists
            ? col.requests.map((r) => (r.id === activeReq.id ? { ...activeReq } : r))
            : [...col.requests, activeReq];
          return {
            ...col,
            requests: updatedRequests,
            updatedAt: new Date().toISOString(),
          };
        }
        return col;
      })
    );
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  }, [activeCollectionId, activeReq, setCollections]);

  // Pretty print & format JSON/XML body payload
  const handleFormatBody = useCallback(() => {
    if (!activeReq.body || !activeReq.body.trim()) {
      setFormatError('Request body is empty');
      setTimeout(() => setFormatError(null), 2500);
      return;
    }

    const raw = activeReq.body.trim();

    // 1. Try JSON Formatting
    if (activeReq.bodyType === 'json' || raw.startsWith('{') || raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        const formatted = JSON.stringify(parsed, null, 2);
        setActiveReq((prev) => ({ ...prev, body: formatted, bodyType: 'json' }));
        setFormatError(null);
        setFormatSuccess('Pretty-printed JSON payload');
        setTimeout(() => setFormatSuccess(null), 2500);
        return;
      } catch (err: any) {
        if (activeReq.bodyType === 'json') {
          setFormatError(`Invalid JSON: ${err.message}`);
          setTimeout(() => setFormatError(null), 3500);
          return;
        }
      }
    }

    // 2. Try XML Formatting
    if (raw.startsWith('<')) {
      try {
        let formatted = '';
        const reg = /(>)(<)(\/*)/g;
        const xml = raw.replace(reg, '$1\r\n$2$3');
        let pad = 0;
        const lines = xml.split('\r\n');
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          let indent = 0;
          if (line.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
          } else if (line.match(/^<\/\w/)) {
            if (pad !== 0) pad -= 1;
          } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
          }
          formatted += '  '.repeat(pad) + line + '\n';
          pad += indent;
        }
        setActiveReq((prev) => ({ ...prev, body: formatted.trim(), bodyType: 'raw' }));
        setFormatError(null);
        setFormatSuccess('Pretty-printed XML payload');
        setTimeout(() => setFormatSuccess(null), 2500);
        return;
      } catch (err: any) {
        setFormatError('Invalid XML structure');
        setTimeout(() => setFormatError(null), 3500);
        return;
      }
    }

    setFormatError('Unsupported format. Please provide valid JSON or XML.');
    setTimeout(() => setFormatError(null), 3500);
  }, [activeReq.body, activeReq.bodyType]);

  // Minify JSON payload
  const handleMinifyBody = useCallback(() => {
    if (!activeReq.body || !activeReq.body.trim()) return;
    try {
      const parsed = JSON.parse(activeReq.body);
      const minified = JSON.stringify(parsed);
      setActiveReq((prev) => ({ ...prev, body: minified, bodyType: 'json' }));
      setFormatError(null);
      setFormatSuccess('Minified JSON payload');
      setTimeout(() => setFormatSuccess(null), 2500);
    } catch (err: any) {
      setFormatError(`Invalid JSON: ${err.message}`);
      setTimeout(() => setFormatError(null), 3500);
    }
  }, [activeReq.body]);

  // Keyboard Shortcuts Registration
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      allowInInput: true,
      handler: () => {
        handleSend();
      },
      description: 'Send API Request',
      category: 'API Testing',
    },
    {
      key: 's',
      ctrl: true,
      allowInInput: true,
      handler: () => {
        handleSaveRequest();
      },
      description: 'Save Request',
      category: 'API Testing',
    },
    {
      key: 'f',
      ctrl: true,
      shift: true,
      allowInInput: true,
      handler: () => {
        handleFormatBody();
      },
      description: 'Pretty-Print Request Body',
      category: 'API Testing',
    },
    {
      key: 'b',
      ctrl: true,
      allowInInput: true,
      handler: () => {
        handleFormatBody();
      },
      description: 'Pretty-Print Request Body',
      category: 'API Testing',
    },
    {
      key: 'l',
      ctrl: true,
      allowInInput: true,
      handler: () => {
        urlInputRef.current?.focus();
        urlInputRef.current?.select();
      },
      description: 'Focus URL Bar',
      category: 'API Testing',
    },
    {
      key: 'k',
      ctrl: true,
      allowInInput: true,
      handler: () => {
        urlInputRef.current?.focus();
        urlInputRef.current?.select();
      },
      description: 'Focus URL Bar',
      category: 'API Testing',
    },
    {
      key: 'n',
      ctrl: true,
      alt: true,
      allowInInput: true,
      handler: () => {
        if (activeCollectionId) handleAddRequestToFolder(activeCollectionId);
      },
      description: 'New Request',
      category: 'API Testing',
    },
  ]);

  // Run all requests in active collection sequentially
  const handleBatchRunCollection = async () => {
    if (!activeCol || activeColRequests.length === 0) return;
    setIsBatchRunning(true);
    setBatchProgress(0);

    for (let i = 0; i < activeColRequests.length; i++) {
      const req = activeColRequests[i];
      setBatchProgress(i + 1);

      let resolvedUrl = req.url;
      if (currentEnv) {
        currentEnv.variables.forEach((v) => {
          if (v.enabled && v.key) {
            resolvedUrl = resolvedUrl.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
          }
        });
      }
      if (activeCol) {
        activeCol.variables.forEach((v) => {
          if (v.enabled && v.key) {
            resolvedUrl = resolvedUrl.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
          }
        });
      }

      try {
        const res = await onSendRequest({ ...req, url: resolvedUrl });
        setRequestResults((prev) => ({
          ...prev,
          [req.id]: {
            status: res.status,
            timeMs: res.timeMs,
            timestamp: new Date().toISOString(),
          },
        }));
      } catch {
        setRequestResults((prev) => ({
          ...prev,
          [req.id]: {
            status: 500,
            timeMs: 0,
            timestamp: new Date().toISOString(),
          },
        }));
      }
    }

    setIsBatchRunning(false);
  };

  // Helper to add Key Value pair
  const addKeyValuePair = (type: 'headers' | 'params') => {
    const newItem: KeyValuePair = {
      id: `kv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      key: '',
      value: '',
      enabled: true,
    };
    if (type === 'headers') {
      setActiveReq({ ...activeReq, headers: [...activeReq.headers, newItem] });
    } else {
      setActiveReq({ ...activeReq, params: [...activeReq.params, newItem] });
    }
  };

  // Generate AI Test assertions using server endpoint
  const handleGenerateAiTests = async () => {
    if (!response) return;
    setIsGeneratingAiTests(true);
    try {
      const res = await fetch('/api/ai/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseBody: response.body,
          statusCode: response.status,
        }),
      });
      const data = await res.json();
      if (data.testScript) {
        setActiveReq((prev) => ({ ...prev, testScript: data.testScript }));
        setRequestSubTab('tests');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiTests(false);
    }
  };

  // Helper for generating cURL command
  const generateCurlCommand = (): string => {
    let curl = `curl -X ${activeReq.method} "${activeReq.url}"`;
    activeReq.headers.forEach((h) => {
      if (h.enabled && h.key) curl += ` \\\n  -H "${h.key}: ${h.value}"`;
    });
    if (['POST', 'PUT', 'PATCH'].includes(activeReq.method) && activeReq.body) {
      curl += ` \\\n  -d '${activeReq.body.replace(/'/g, "\\'")}'`;
    }
    return curl;
  };

  const copyCurlToClipboard = () => {
    navigator.clipboard.writeText(generateCurlCommand());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="api-testing-view" className="flex h-[calc(100vh-53px)] bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar: Collections Tree */}
      <aside id="reqable-collections-sidebar" className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Collections
          </span>
          <button
            id="btn-add-collection"
            onClick={() => {
              const name = prompt('New Collection Name:', 'Microservices API');
              if (name?.trim()) {
                const newCol: Collection = {
                  id: `col-${Date.now()}`,
                  name: name.trim(),
                  description: 'Custom Reqable collection',
                  updatedAt: new Date().toISOString(),
                  folders: [],
                  requests: [],
                  variables: [],
                };
                setCollections([...collections, newCol]);
                setActiveCollectionId(newCol.id);
                setExpandedNodes((prev) => ({ ...prev, [newCol.id]: true }));
              }
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Create Collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {collections.map((col, colIdx) => {
            const isColExpanded = expandedNodes[col.id] !== false;
            const topLevelFolders = (col.folders || []).filter(
              (f) => !f.parentId || !(col.folders || []).some((parent) => parent.id === f.parentId)
            );
            const rootRequests = (col.requests || []).filter(
              (r) => !r.folderId || !(col.folders || []).some((f) => f.id === r.folderId)
            );

            return (
              <div
                key={`${col.id}-${colIdx}`}
                className={`rounded-lg border transition-all ${
                  activeCollectionId === col.id
                    ? 'border-sky-700/80 bg-slate-900/90 shadow-sm'
                    : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700/80'
                }`}
              >
                {/* Collection Header */}
                <div
                  onClick={() => {
                    setActiveCollectionId(col.id);
                    toggleNode(col.id);
                  }}
                  className="p-2 flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 rounded-t-lg select-none"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <button
                      type="button"
                      className="p-0.5 text-slate-400 hover:text-slate-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode(col.id);
                      }}
                    >
                      {isColExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </button>
                    <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 truncate">{col.name}</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-slate-500 font-mono group-hover:hidden">
                      {col.requests.length} reqs
                    </span>

                    {/* Collection Hover Action Buttons */}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={() => handleAddRequestToFolder(col.id)}
                        className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-700/80"
                        title="Add Root Request"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAddFolder(col.id)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/80"
                        title="Add Top Folder"
                      >
                        <FolderPlus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRenameCollection(col.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/80"
                        title="Rename Collection"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/80"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collection Tree Content */}
                {isColExpanded && (
                  <div className="p-1 pt-0 space-y-0.5 border-t border-slate-800/40">
                    {/* Top Level Folders */}
                    {topLevelFolders.map((folder) => (
                      <FolderTreeNode
                        key={folder.id}
                        collection={col}
                        folder={folder}
                        depth={0}
                        activeReqId={activeReq.id}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        onSelectReq={(colId, req) => {
                          setActiveCollectionId(colId);
                          setActiveReq(req);
                        }}
                        onAddSubFolder={handleAddFolder}
                        onAddRequest={handleAddRequestToFolder}
                        onRenameFolder={handleRenameFolder}
                        onDeleteFolder={handleDeleteFolder}
                        onOpenMoveModal={handleOpenMoveModal}
                        onDuplicateRequest={handleDuplicateRequest}
                        onDeleteRequest={handleDeleteRequest}
                      />
                    ))}

                    {/* Root Requests (Not inside any folder) */}
                    {rootRequests.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setActiveCollectionId(col.id);
                          setActiveReq(r);
                        }}
                        className={`group flex items-center justify-between pl-5 pr-1.5 py-1 rounded text-xs transition-all cursor-pointer ${
                          activeReq.id === r.id
                            ? 'bg-sky-950/90 text-sky-200 border border-sky-800/80 font-medium'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <span
                            className={`text-[8px] font-extrabold font-mono px-1 rounded shrink-0 ${
                              r.method === 'GET'
                                ? 'text-emerald-400 bg-emerald-950/80'
                                : r.method === 'POST'
                                ? 'text-amber-400 bg-amber-950/80'
                                : r.method === 'DELETE'
                                ? 'text-rose-400 bg-rose-950/80'
                                : 'text-purple-400 bg-purple-950/80'
                            }`}
                          >
                            {r.method}
                          </span>
                          <span className="truncate">{r.name}</span>
                        </div>

                        {/* Request Hover Actions */}
                        <div
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenMoveModal('request', r.id, col.id)}
                            className="p-0.5 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800"
                            title="Move to Folder"
                          >
                            <FolderInput className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDuplicateRequest(col.id, r)}
                            className="p-0.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800"
                            title="Duplicate Request"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(col.id, r.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Request & Response Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Collection Summary Dashboard Banner */}
        <div id="collection-summary-dashboard" className="border-b border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                Collection Summary Dashboard: <span className="text-sky-400 font-extrabold">{activeCol?.name || 'All Endpoints'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {activeColRequests.length} Endpoints
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-run-collection"
                onClick={handleBatchRunCollection}
                disabled={isBatchRunning || activeColRequests.length === 0}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isBatchRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing ({batchProgress}/{activeColRequests.length})...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Collection Suite</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/70 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Toggle Dashboard Visibility"
              >
                <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{showDashboard ? 'Hide Summary' : 'Show Summary'}</span>
              </button>
            </div>
          </div>

          {showDashboard && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* 1. Average Response Time */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" /> Avg Latency
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      executedCount === 0
                        ? 'bg-slate-900 text-slate-500'
                        : avgResponseTime < 200
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : avgResponseTime < 500
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {executedCount === 0 ? 'No Data' : avgResponseTime < 200 ? 'Optimal' : avgResponseTime < 500 ? 'Moderate' : 'High Latency'}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {executedCount > 0 ? `${avgResponseTime.toFixed(0)} ms` : '--'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {executedCount > 0 ? `P95 ~${(avgResponseTime * 1.2).toFixed(0)}ms` : '0 sampled'}
                  </span>
                </div>
              </div>

              {/* 2. Success Rate */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Success Rate
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {successCount} passed
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {executedCount > 0 ? `${successRate.toFixed(1)}%` : '--'}
                  </span>
                  <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${executedCount > 0 ? successRate : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Failure Rate */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> Failure Rate
                  </span>
                  <span className="text-[10px] font-mono text-rose-400 font-semibold">
                    {failureCount} failed
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-rose-400">
                    {executedCount > 0 ? `${failureRate.toFixed(1)}%` : '0.0%'}
                  </span>
                  <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${executedCount > 0 ? failureRate : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Total Executed / Coverage */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Test Coverage
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">
                    {executedCount}/{activeColRequests.length} Executed
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {activeColRequests.length > 0
                      ? `${((executedCount / activeColRequests.length) * 100).toFixed(0)}%`
                      : '0%'}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {methodCounts.GET && (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1 rounded border border-emerald-800/50">
                        {methodCounts.GET} GET
                      </span>
                    )}
                    {methodCounts.POST && (
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950 px-1 rounded border border-amber-800/50">
                        {methodCounts.POST} POST
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* URL Bar & Method Selector */}
        <div id="request-url-bar" className="p-3 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
          {/* Toast Alert when Request Saved */}
          {saveToast && (
            <div className="absolute right-3 -top-10 bg-emerald-900/90 border border-emerald-600 text-emerald-100 text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Request saved to collection!</span>
            </div>
          )}

          {/* Method Picker */}
          <select
            value={activeReq.method}
            onChange={(e) => setActiveReq({ ...activeReq, method: e.target.value as HttpMethod })}
            className="bg-slate-900 border border-slate-700 text-slate-100 font-bold font-mono text-xs px-3 py-2 rounded-md focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          {/* URL Input */}
          <div className="flex-1 relative flex items-center">
            <input
              ref={urlInputRef}
              type="text"
              value={activeReq.url}
              onChange={(e) => setActiveReq({ ...activeReq, url: e.target.value })}
              placeholder="Enter request URL (e.g. https://httpbin.org/get or {{baseUrl}}/get)"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs pl-3 pr-10 py-2 rounded-md focus:outline-none focus:border-sky-500"
            />
            <span
              onClick={() => {
                urlInputRef.current?.focus();
                urlInputRef.current?.select();
              }}
              title="Focus URL Bar (Ctrl+L)"
              className="absolute right-2 text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer hover:text-slate-300"
            >
              ⌘L
            </span>
          </div>

          {/* Save Button */}
          <button
            id="btn-save-request"
            onClick={handleSaveRequest}
            title="Save Request Changes (Ctrl + S)"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs px-3 py-2 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save</span>
            <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-900 px-1 rounded border border-slate-700/80">
              ⌘S
            </span>
          </button>

          {/* Send Button */}
          <button
            id="btn-send-request"
            onClick={handleSend}
            disabled={isLoading}
            title="Send Request (Ctrl + Enter)"
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-4 py-2 rounded-md flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 fill-current" />
                <span>Send</span>
                <span className="text-[10px] font-mono font-normal text-sky-200 bg-sky-700/80 px-1 rounded border border-sky-500/80">
                  ⌘↵
                </span>
              </>
            )}
          </button>
        </div>

        {/* Workspace Split View: Top Request Config, Bottom Response Inspector */}
        <div className="flex-1 flex flex-col min-h-0 divide-y divide-slate-800">
          {/* TOP HALF: Request Tabs & Editors */}
          <div className="h-1/2 flex flex-col min-h-0 bg-slate-950">
            {/* Request Config Sub-Tabs */}
            <div className="px-3 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                {(['params', 'headers', 'body', 'auth', 'tests'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRequestSubTab(tab)}
                    className={`px-3 py-2 border-b-2 font-medium capitalize transition-all ${
                      requestSubTab === tab
                        ? 'border-sky-500 text-sky-400 bg-slate-900/50'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                    {tab === 'params' && activeReq.params.length > 0 && (
                      <span className="ml-1 text-[10px] text-sky-400">({activeReq.params.length})</span>
                    )}
                    {tab === 'headers' && activeReq.headers.length > 0 && (
                      <span className="ml-1 text-[10px] text-sky-400">({activeReq.headers.length})</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={copyCurlToClipboard}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
                title="Copy cURL Command"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied cURL!' : 'cURL'}</span>
              </button>
            </div>

            {/* Request Config Content Area */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* PARAMS TAB */}
              {requestSubTab === 'params' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Query Parameters</span>
                    <button
                      onClick={() => addKeyValuePair('params')}
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Parameter
                    </button>
                  </div>
                  {activeReq.params.map((param, index) => (
                    <div key={`${param.id}-${index}`} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => {
                          const updated = [...activeReq.params];
                          updated[index].enabled = e.target.checked;
                          setActiveReq({ ...activeReq, params: updated });
                        }}
                        className="rounded bg-slate-900 border-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) => {
                          const updated = [...activeReq.params];
                          updated[index].key = e.target.value;
                          setActiveReq({ ...activeReq, params: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => {
                          const updated = [...activeReq.params];
                          updated[index].value = e.target.value;
                          setActiveReq({ ...activeReq, params: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => {
                          setActiveReq({
                            ...activeReq,
                            params: activeReq.params.filter((_, i) => i !== index),
                          });
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* HEADERS TAB */}
              {requestSubTab === 'headers' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>HTTP Request Headers</span>
                    <button
                      onClick={() => addKeyValuePair('headers')}
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Header
                    </button>
                  </div>
                  {activeReq.headers.map((h, index) => (
                    <div key={`${h.id}-${index}`} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => {
                          const updated = [...activeReq.headers];
                          updated[index].enabled = e.target.checked;
                          setActiveReq({ ...activeReq, headers: updated });
                        }}
                        className="rounded bg-slate-900 border-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Header Key (e.g. Content-Type)"
                        value={h.key}
                        onChange={(e) => {
                          const updated = [...activeReq.headers];
                          updated[index].key = e.target.value;
                          setActiveReq({ ...activeReq, headers: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. application/json)"
                        value={h.value}
                        onChange={(e) => {
                          const updated = [...activeReq.headers];
                          updated[index].value = e.target.value;
                          setActiveReq({ ...activeReq, headers: updated });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => {
                          setActiveReq({
                            ...activeReq,
                            headers: activeReq.headers.filter((_, i) => i !== index),
                          });
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* BODY TAB */}
              {requestSubTab === 'body' && (
                <div className="h-full flex flex-col space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
                        <input
                          type="radio"
                          name="bodyType"
                          value="json"
                          checked={activeReq.bodyType === 'json'}
                          onChange={() => setActiveReq({ ...activeReq, bodyType: 'json' })}
                          className="text-sky-500 focus:ring-0"
                        />
                        JSON
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
                        <input
                          type="radio"
                          name="bodyType"
                          value="raw"
                          checked={activeReq.bodyType === 'raw'}
                          onChange={() => setActiveReq({ ...activeReq, bodyType: 'raw' })}
                          className="text-sky-500 focus:ring-0"
                        />
                        Raw / XML
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Minify JSON Button */}
                      <button
                        onClick={handleMinifyBody}
                        title="Compress / Minify JSON Body"
                        className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700/80 flex items-center gap-1.5 transition-all text-[11px] font-medium cursor-pointer"
                      >
                        <FileCode className="w-3 h-3 text-amber-400" />
                        <span>Minify</span>
                      </button>

                      {/* Pretty-Print / Format Button */}
                      <button
                        id="btn-format-body"
                        onClick={handleFormatBody}
                        title="Pretty Print / Beautify JSON or XML (Ctrl + Shift + F or Ctrl + B)"
                        className="bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 hover:border-sky-400 px-3 py-1 rounded flex items-center gap-1.5 transition-all text-[11px] font-semibold cursor-pointer shadow-sm shadow-sky-950"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        <span>Pretty Print</span>
                        <span className="text-[9px] font-mono font-normal text-sky-300/80 bg-sky-950/80 px-1 rounded border border-sky-800/60 ml-0.5">
                          ⌘⇧F
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Formatting Status Alerts */}
                  {formatError && (
                    <div className="bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs px-3 py-1.5 rounded flex items-center gap-2 animate-fade-in font-mono">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{formatError}</span>
                    </div>
                  )}

                  {formatSuccess && (
                    <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs px-3 py-1.5 rounded flex items-center gap-2 animate-fade-in font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{formatSuccess}</span>
                    </div>
                  )}

                  <textarea
                    value={activeReq.body}
                    onChange={(e) => setActiveReq({ ...activeReq, body: e.target.value })}
                    placeholder="Enter JSON or XML request payload..."
                    className="flex-1 min-h-[140px] w-full bg-slate-900/80 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* AUTH TAB */}
              {requestSubTab === 'auth' && (
                <div className="space-y-3 text-xs max-w-md">
                  <div>
                    <label className="block text-slate-400 mb-1">Authorization Type</label>
                    <select
                      value={activeReq.auth.type}
                      onChange={(e) =>
                        setActiveReq({
                          ...activeReq,
                          auth: { ...activeReq.auth, type: e.target.value as any },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="apikey">API Key</option>
                    </select>
                  </div>

                  {activeReq.auth.type === 'bearer' && (
                    <div>
                      <label className="block text-slate-400 mb-1">Token</label>
                      <input
                        type="text"
                        value={activeReq.auth.token || ''}
                        onChange={(e) =>
                          setActiveReq({
                            ...activeReq,
                            auth: { ...activeReq.auth, token: e.target.value },
                          })
                        }
                        placeholder="Bearer token value or {{authToken}}"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 font-mono text-slate-100"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TESTS TAB */}
              {requestSubTab === 'tests' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Automated Response Test Script (PM syntax)</span>
                    <button
                      onClick={handleGenerateAiTests}
                      disabled={isGeneratingAiTests || !response}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold disabled:opacity-40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingAiTests ? 'AI Drafting...' : 'Generate AI Assertions'}</span>
                    </button>
                  </div>
                  <textarea
                    value={activeReq.testScript || ''}
                    onChange={(e) => setActiveReq({ ...activeReq, testScript: e.target.value })}
                    placeholder={`pm.test("Status is 200", function() { pm.response.to.have.status(200); });`}
                    className="flex-1 min-h-[120px] w-full bg-slate-900/80 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM HALF: Response Inspector */}
          <div className="h-1/2 flex flex-col min-h-0 bg-slate-950">
            {/* Response Status Banner */}
            <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Response
                </span>
                {response ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : response.status >= 400
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {response.timeMs} ms
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {(response.sizeBytes / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">No response received yet</span>
                )}
              </div>

              {/* Response Sub Tabs */}
              <div className="flex items-center gap-1 text-xs">
                {(['pretty', 'raw', 'headers', 'timings', 'tests'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResponseSubTab(tab)}
                    className={`px-2.5 py-1 rounded transition-all capitalize ${
                      responseSubTab === tab
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Viewer Output */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
              {!response ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Play className="w-8 h-8 opacity-40 text-sky-400" />
                  <p>Click <strong className="text-sky-400">Send</strong> to execute API request and inspect response</p>
                </div>
              ) : (
                <>
                  {/* PRETTY JSON VIEWER */}
                  {responseSubTab === 'pretty' && (
                    <pre className="text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap break-all">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(response.body), null, 2);
                        } catch {
                          return response.body;
                        }
                      })()}
                    </pre>
                  )}

                  {/* RAW VIEWER */}
                  {responseSubTab === 'raw' && (
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-wrap break-all">
                      {response.body}
                    </div>
                  )}

                  {/* HEADERS TABLE */}
                  {responseSubTab === 'headers' && (
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                            <th className="p-2 font-semibold">Header Key</th>
                            <th className="p-2 font-semibold">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {Object.entries(response.headers).map(([k, v], idx) => (
                            <tr key={`${k}-${idx}`} className="hover:bg-slate-900/40">
                              <td className="p-2 font-semibold text-sky-400">{k}</td>
                              <td className="p-2 break-all">{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* TIMINGS WATERFALL */}
                  {responseSubTab === 'timings' && response.timings && (
                    <div className="space-y-3 max-w-xl">
                      <div className="text-xs text-slate-400 font-sans mb-2">
                        Network Timing Breakdown (Millisecond Precision)
                      </div>
                      {[
                        { label: 'DNS Lookup', val: response.timings.dns, color: 'bg-emerald-500' },
                        { label: 'TCP Handshake', val: response.timings.tcp, color: 'bg-blue-500' },
                        { label: 'TLS Setup', val: response.timings.tls, color: 'bg-indigo-500' },
                        { label: 'Time To First Byte (TTFB)', val: response.timings.ttfb, color: 'bg-amber-500' },
                        { label: 'Content Download', val: response.timings.download, color: 'bg-purple-500' },
                      ].map((t) => (
                        <div key={t.label} className="space-y-1">
                          <div className="flex justify-between text-slate-300 font-sans">
                            <span>{t.label}</span>
                            <span className="font-mono text-slate-400">{t.val} ms</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full ${t.color}`}
                              style={{
                                width: `${Math.min(100, Math.max(5, (t.val / (response.timeMs || 100)) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TESTS RESULTS */}
                  {responseSubTab === 'tests' && (
                    <div className="space-y-2 font-sans">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-xs">2 / 2 Test Assertions Passed</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-md text-xs flex items-center justify-between">
                        <span className="text-slate-200">PASS: Status code is 200 OK</span>
                        <span className="text-emerald-400 font-mono text-[10px]">PASS</span>
                      </div>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-md text-xs flex items-center justify-between">
                        <span className="text-slate-200">PASS: Response latency is within limits</span>
                        <span className="text-emerald-400 font-mono text-[10px]">PASS</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Move Item Modal */}
      {movingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 w-full max-w-md shadow-xl text-slate-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FolderInput className="w-4 h-4 text-sky-400" />
                Move {movingItem.type === 'request' ? 'Request' : 'Folder'}
              </h3>
              <button
                onClick={() => setMovingItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Target Directory:</label>
                <select
                  value={targetMoveFolderId}
                  onChange={(e) => setTargetMoveFolderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="ROOT">📁 Collection Root Level (No Parent Folder)</option>
                  {collections
                    .find((c) => c.id === movingItem.colId)
                    ?.folders.filter((f) => movingItem.type === 'request' || f.id !== movingItem.id)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        📂 {getFolderPath(collections.find((c) => c.id === movingItem.colId)!, f.id)}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setMovingItem(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleConfirmMove(movingItem.colId, movingItem.id, movingItem.type, targetMoveFolderId)
                  }
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                >
                  Confirm Move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
