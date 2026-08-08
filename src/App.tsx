import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ApiTestingTab } from './components/ApiTestingTab';
import { ApiDebuggingTab } from './components/ApiDebuggingTab';
import { RulesEngineTab } from './components/RulesEngineTab';
import { McpServerTab } from './components/McpServerTab';
import { WebHubTab } from './components/WebHubTab';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { PerformanceWidget } from './components/PerformanceWidget';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { INITIAL_COLLECTIONS, INITIAL_ENVIRONMENTS, INITIAL_RULES, INITIAL_TRAFFIC } from './data/initialData';
import { ApiRequest, ApiResponse, Collection, Environment, TrafficItem, TrafficRule } from './types/reqable';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

function ReqableApp() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'debugging' | 'testing' | 'rules' | 'mcp' | 'drive' | 'webhub'>('debugging');
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS);
  const [selectedEnvId, setSelectedEnvId] = useState<string>(INITIAL_ENVIRONMENTS[0]?.id || 'none');
  const [traffic, setTraffic] = useState<TrafficItem[]>(() => {
    try {
      const saved = localStorage.getItem('reqable_captured_traffic');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRAFFIC;
  });
  const [rules, setRules] = useState<TrafficRule[]>(INITIAL_RULES);

  const [isTrafficSaving, setIsTrafficSaving] = useState(false);
  const [lastTrafficSaveTime, setLastTrafficSaveTime] = useState<Date | null>(null);
  const savedTrafficIdsRef = React.useRef<Set<string>>(new Set());

  const [interceptorActive, setInterceptorActive] = useState(true);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [selectedTrafficForAi, setSelectedTrafficForAi] = useState<TrafficItem | null>(null);

  // Register Global Keyboard Shortcuts across all views
  useKeyboardShortcuts([
    {
      key: '1',
      alt: true,
      allowInInput: true,
      handler: () => setActiveTab('testing'),
      description: 'API Testing Workspace',
      category: 'Navigation',
    },
    {
      key: '2',
      alt: true,
      allowInInput: true,
      handler: () => setActiveTab('debugging'),
      description: 'Debugging & Sniffing',
      category: 'Navigation',
    },
    {
      key: '3',
      alt: true,
      allowInInput: true,
      handler: () => setActiveTab('rules'),
      description: 'Rules Engine',
      category: 'Navigation',
    },
    {
      key: '4',
      alt: true,
      allowInInput: true,
      handler: () => setActiveTab('mcp'),
      description: 'MCP Server',
      category: 'Navigation',
    },
    {
      key: '5',
      alt: true,
      allowInInput: true,
      handler: () => setActiveTab('webhub'),
      description: 'Web Hub',
      category: 'Navigation',
    },
    {
      key: 'i',
      ctrl: true,
      shift: true,
      allowInInput: true,
      handler: () => setIsAiCopilotOpen((prev) => !prev),
      description: 'Toggle AI Copilot',
      category: 'Global',
    },
    {
      key: 't',
      alt: true,
      allowInInput: true,
      handler: () => toggleTheme(),
      description: 'Toggle Light / Dark Mode Theme',
      category: 'Global',
    },
    {
      key: '?',
      shift: true,
      allowInInput: false,
      handler: () => setIsShortcutsModalOpen((prev) => !prev),
      description: 'Shortcuts Help Modal',
      category: 'Global',
    },
    {
      key: '/',
      ctrl: true,
      allowInInput: true,
      handler: () => setIsShortcutsModalOpen((prev) => !prev),
      description: 'Shortcuts Help Modal',
      category: 'Global',
    },
  ]);

  // Firestore Sync when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Listen to user collections in Firestore
    const collectionsRef = collection(db, 'users', user.uid, 'collections');
    const unsubCollections = onSnapshot(
      collectionsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedCols: Collection[] = snapshot.docs.map((d) => d.data() as Collection);
          setCollections(loadedCols);
        } else {
          // Seed initial collections to Firestore for user
          INITIAL_COLLECTIONS.forEach(async (col) => {
            try {
              await setDoc(doc(db, 'users', user.uid, 'collections', col.id), {
                ...col,
                userId: user.uid,
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/collections/${col.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/collections`);
      }
    );

    // Listen to user rules in Firestore
    const rulesRef = collection(db, 'users', user.uid, 'rules');
    const unsubRules = onSnapshot(
      rulesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedRules: TrafficRule[] = snapshot.docs.map((d) => d.data() as TrafficRule);
          setRules(loadedRules);
        } else {
          // Seed initial rules to Firestore for user
          INITIAL_RULES.forEach(async (rule) => {
            try {
              await setDoc(doc(db, 'users', user.uid, 'rules', rule.id), {
                ...rule,
                userId: user.uid,
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/rules/${rule.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/rules`);
      }
    );

    // Listen to user captured traffic in Firestore
    const trafficRef = collection(db, 'users', user.uid, 'traffic');
    const unsubTraffic = onSnapshot(
      trafficRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedTraffic: TrafficItem[] = snapshot.docs.map((d) => d.data() as TrafficItem);
          setTraffic(loadedTraffic);
          loadedTraffic.forEach((t) => savedTrafficIdsRef.current.add(t.id));
          localStorage.setItem('reqable_captured_traffic', JSON.stringify(loadedTraffic));
          fetch('/api/traffic/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ traffic: loadedTraffic }),
          }).catch(() => {});
        } else {
          // Seed initial traffic to Firestore for user
          INITIAL_TRAFFIC.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'users', user.uid, 'traffic', item.id), {
                ...item,
                userId: user.uid,
              });
              savedTrafficIdsRef.current.add(item.id);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/traffic/${item.id}`);
            }
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/traffic`);
      }
    );

    return () => {
      unsubCollections();
      unsubRules();
      unsubTraffic();
    };
  }, [user]);

  // Background process: periodically saves session traffic items to Firestore & localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reqable_captured_traffic', JSON.stringify(traffic));
    } catch (e) {
      console.error(e);
    }

    if (!user) return;

    const saveTrafficToFirestore = async () => {
      if (!user || traffic.length === 0) return;

      const unsavedItems = traffic.filter((item) => !savedTrafficIdsRef.current.has(item.id));
      if (unsavedItems.length === 0) return;

      setIsTrafficSaving(true);
      try {
        await Promise.all(
          unsavedItems.map(async (item) => {
            const itemRef = doc(db, 'users', user.uid, 'traffic', item.id);
            await setDoc(
              itemRef,
              {
                ...item,
                userId: user.uid,
              },
              { merge: true }
            );
            savedTrafficIdsRef.current.add(item.id);
          })
        );
        setLastTrafficSaveTime(new Date());
      } catch (err) {
        console.error('Failed to auto-save traffic to Firestore:', err);
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/traffic`);
      } finally {
        setIsTrafficSaving(false);
      }
    };

    saveTrafficToFirestore();
    const interval = setInterval(saveTrafficToFirestore, 5000);
    return () => clearInterval(interval);
  }, [user, traffic]);

  // Poll for backend proxy traffic changes periodically
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const trafficRes = await fetch('/api/traffic').catch(() => null);
        if (trafficRes && trafficRes.ok) {
          const trafficData = await trafficRes.json().catch(() => null);
          if (trafficData?.traffic && Array.isArray(trafficData.traffic)) {
            setTraffic((prev) => {
              const existingIds = new Set(prev.map((t) => t.id));
              const newServerItems = trafficData.traffic.filter((t: TrafficItem) => !existingIds.has(t.id));
              if (newServerItems.length > 0) {
                return [...newServerItems, ...prev];
              }
              return prev;
            });
          }
        }

        const rulesRes = await fetch('/api/rules').catch(() => null);
        if (rulesRes && rulesRes.ok) {
          const rulesData = await rulesRes.json().catch(() => null);
          if (rulesData?.rules && Array.isArray(rulesData.rules)) {
            setRules(rulesData.rules);
          }
        }
      } catch (err) {
        console.warn('Polling error ignored:', err);
      }
    };

    fetchBackendData();
    const interval = setInterval(fetchBackendData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for OAuth postMessage events from popup
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GDRIVE_AUTH_SUCCESS') {
        setIsDriveConnected(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send request through backend proxy endpoint
  const handleSendRequest = async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: req.url,
          method: req.method,
          headers: req.headers,
          body: req.body,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        let parsedJson;
        try {
          parsedJson = JSON.parse(errText);
        } catch {}
        return {
          status: res.status,
          statusText: res.statusText || 'Proxy Request Error',
          headers: { 'content-type': 'application/json' },
          body: parsedJson ? JSON.stringify(parsedJson, null, 2) : (errText || 'Failed to fetch target URL'),
          sizeBytes: 0,
          timeMs: 0,
          timings: { dns: 0, tcp: 0, tls: 0, ttfb: 0, download: 0, total: 0 },
          contentType: 'application/json',
          timestamp: new Date().toISOString(),
        };
      }

      const data = await res.json().catch(() => null);

      // Refresh captured traffic from server
      try {
        const tRes = await fetch('/api/traffic').catch(() => null);
        if (tRes && tRes.ok) {
          const tData = await tRes.json().catch(() => null);
          if (tData?.traffic) setTraffic(tData.traffic);
        }
      } catch (e) {
        console.warn('Traffic refresh notice:', e);
      }

      return data || {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'Request succeeded' }),
        sizeBytes: 0,
        timeMs: 0,
        timings: { dns: 0, tcp: 0, tls: 0, ttfb: 0, download: 0, total: 0 },
        contentType: 'application/json',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('Proxy request error:', err);
      return {
        status: 502,
        statusText: 'Bad Gateway / Failed to Fetch',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: err?.message || 'Failed to fetch target URL' }),
        sizeBytes: 0,
        timeMs: 0,
        timings: { dns: 0, tcp: 0, tls: 0, ttfb: 0, download: 0, total: 0 },
        contentType: 'application/json',
        timestamp: new Date().toISOString(),
      };
    }
  };

  // Replay captured traffic item in API Client tab
  const handleReplayInTesting = (item: TrafficItem) => {
    let urlPath = item.url;
    try {
      urlPath = new URL(item.url).pathname;
    } catch {
      // fallback if invalid URL
    }

    const uniqueId = `req-replay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newReq: ApiRequest = {
      id: uniqueId,
      name: `Replayed: ${item.method} ${urlPath}`,
      method: item.method,
      url: item.url,
      headers: Object.entries(item.requestHeaders || {}).map(([k, v], i) => ({
        id: `h-replay-${i}-${Math.random().toString(36).substring(2, 9)}`,
        key: k,
        value: v,
        enabled: true,
      })),
      params: [],
      bodyType: item.requestBody ? 'json' : 'none',
      body: item.requestBody || '',
      auth: { type: 'none' },
    };

    // Append to active collection immutably
    setCollections((prev) => {
      if (prev.length === 0) return prev;
      const updated = prev.map((col, index) => {
        if (index === 0) {
          const newCol = {
            ...col,
            requests: [newReq, ...col.requests],
          };
          if (user) {
            setDoc(doc(db, 'users', user.uid, 'collections', col.id), {
              ...newCol,
              userId: user.uid,
            }).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/collections/${col.id}`));
          }
          return newCol;
        }
        return col;
      });
      return updated;
    });

    setActiveTab('testing');
  };

  // Analyze traffic item with AI
  const handleAnalyzeWithAi = (item: TrafficItem) => {
    setSelectedTrafficForAi(item);
    setIsAiCopilotOpen(true);
  };

  // Create Mock Rule from Traffic item
  const handleCreateRuleFromTraffic = (item: TrafficItem) => {
    let host = item.url;
    try {
      host = new URL(item.url).hostname;
    } catch {
      // fallback
    }

    const newRule: TrafficRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `Mock Rule for ${host}`,
      enabled: true,
      type: 'rewrite',
      matchUrl: item.url,
      action: {
        statusCode: item.responseStatus,
        bodyReplace: item.responseBody,
      },
    };
    setRules((prev) => {
      const updated = [newRule, ...prev];
      if (user) {
        setDoc(doc(db, 'users', user.uid, 'rules', newRule.id), {
          ...newRule,
          userId: user.uid,
        }).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/rules/${newRule.id}`));
      }
      return updated;
    });
    setActiveTab('rules');
  };

  // Local Backup Export Download
  const handleExportLocalJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ collections, environments, rules, trafficSample: traffic.slice(0, 10) }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reqable_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="reqable-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        environments={environments}
        selectedEnvId={selectedEnvId}
        setSelectedEnvId={setSelectedEnvId}
        isDriveConnected={isDriveConnected}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onToggleAiCopilot={() => setIsAiCopilotOpen(!isAiCopilotOpen)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        interceptorActive={interceptorActive}
        setInterceptorActive={setInterceptorActive}
        isTrafficSaving={isTrafficSaving}
        lastTrafficSaveTime={lastTrafficSaveTime}
        trafficCount={traffic.length}
      />

      {/* Main Workspace View Switcher */}
      <div className="flex-1 min-h-0 relative">
        {activeTab === 'debugging' && (
          <ApiDebuggingTab
            traffic={traffic}
            setTraffic={setTraffic}
            interceptorActive={interceptorActive}
            setInterceptorActive={setInterceptorActive}
            onSelectForReplay={handleReplayInTesting}
            onAnalyzeWithAi={handleAnalyzeWithAi}
            onCreateRuleFromTraffic={handleCreateRuleFromTraffic}
          />
        )}

        {activeTab === 'testing' && (
          <ApiTestingTab
            collections={collections}
            setCollections={(cols) => {
              setCollections(cols);
              if (user && Array.isArray(cols)) {
                cols.forEach((col) => {
                  setDoc(doc(db, 'users', user.uid, 'collections', col.id), {
                    ...col,
                    userId: user.uid,
                  }).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/collections/${col.id}`));
                });
              }
            }}
            environments={environments}
            selectedEnvId={selectedEnvId}
            onSendRequest={handleSendRequest}
          />
        )}

        {activeTab === 'rules' && (
          <RulesEngineTab
            rules={rules}
            setRules={(r) => {
              setRules(r);
              if (user && Array.isArray(r)) {
                r.forEach((rule) => {
                  setDoc(doc(db, 'users', user.uid, 'rules', rule.id), {
                    ...rule,
                    userId: user.uid,
                  }).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/rules/${rule.id}`));
                });
              }
            }}
          />
        )}

        {activeTab === 'mcp' && <McpServerTab />}

        {activeTab === 'webhub' && <WebHubTab />}
      </div>

      {/* Footer Performance Meter */}
      <PerformanceWidget />

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        isDriveConnected={isDriveConnected}
        setIsDriveConnected={setIsDriveConnected}
        onExportLocalJson={handleExportLocalJson}
      />

      {/* AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        selectedTrafficItem={selectedTrafficForAi}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReqableApp />
    </AuthProvider>
  );
}

