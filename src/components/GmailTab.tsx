import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Inbox,
  SendHorizontal,
  FileText,
  Tag,
  User,
  X,
  Code2,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCachedAccessToken } from '../lib/firebase';
import { ApiRequest, TrafficItem } from '../types/reqable';

interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: GmailHeader[];
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    }>;
  };
  // Parsed fields
  from?: string;
  subject?: string;
  date?: string;
  bodyText?: string;
  isUnread?: boolean;
}

interface GmailTabProps {
  onImportToReqable?: (req: Partial<ApiRequest>) => void;
  onLogTraffic?: (item: TrafficItem) => void;
}

export const GmailTab: React.FC<GmailTabProps> = ({
  onImportToReqable,
  onLogTraffic,
}) => {
  const { user, login, accessToken, setAccessToken } = useAuth();
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeLabel, setActiveLabel] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Mandatory Confirmation Dialog States (Per Skill Requirements)
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    type: 'send' | 'delete';
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  // Helper to get active access token
  const getToken = useCallback(() => {
    return accessToken || getCachedAccessToken();
  }, [accessToken]);

  // Decode Base64URL string safely
  const decodeBase64Url = (input: string) => {
    try {
      let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c: string) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch {
      return input;
    }
  };

  // Extract text body from Gmail message payload
  const parseMessageBody = (payload: GmailMessage['payload']): string => {
    if (!payload) return '';

    if (payload.body?.data) {
      return decodeBase64Url(payload.body.data);
    }

    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return decodeBase64Url(part.body.data);
        }
        if (part.parts) {
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/plain' && subPart.body?.data) {
              return decodeBase64Url(subPart.body.data);
            }
          }
        }
      }
      // Fallback to HTML if no plain text found
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return decodeBase64Url(part.body.data);
        }
      }
    }

    return '';
  };

  // Helper to log Traffic into Reqable Audit Log
  const recordApiTraffic = (
    method: 'GET' | 'POST' | 'DELETE',
    url: string,
    reqBody: string,
    status: number,
    resBody: string,
    durationMs: number
  ) => {
    if (!onLogTraffic) return;
    const item: TrafficItem = {
      id: `traffic-gmail-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      method,
      url,
      protocol: 'https',
      requestHeaders: {
        Authorization: 'Bearer [REDACTED_GMAIL_TOKEN]',
        'Content-Type': 'application/json',
      },
      requestBody: reqBody,
      responseStatus: status,
      responseHeaders: { 'content-type': 'application/json; charset=UTF-8' },
      responseBody: resBody.slice(0, 5000),
      durationMs,
      sizeBytes: resBody.length,
      clientIp: '127.0.0.1',
      status: 'captured',
      ruleApplied: 'Gmail OAuth Integration',
      timingBreakdown: {
        dns: 5,
        tcp: 12,
        tls: 18,
        ttfb: durationMs - 5,
        download: 5,
        total: durationMs,
      },
    };
    onLogTraffic(item);
  };

  // Fetch Gmail Profile
  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const startTime = Date.now();
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const duration = Date.now() - startTime;
      recordApiTraffic('GET', 'https://gmail.googleapis.com/gmail/v1/users/me/profile', '', res.status, JSON.stringify(data), duration);

      if (res.ok) {
        setProfile(data);
        setErrorMsg(null);
      } else {
        if (res.status === 401) {
          setErrorMsg('Session expired. Please click "Sign in with Google" to re-authenticate.');
          setAccessToken(null);
        } else {
          setErrorMsg(data.error?.message || 'Failed to load Gmail profile');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error fetching Gmail profile');
    }
  }, [getToken, setAccessToken]);

  // Fetch Messages List
  const fetchMessages = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setErrorMsg(null);
    const startTime = Date.now();

    try {
      let query = activeLabel ? `labelIds=${activeLabel}` : '';
      if (searchQuery.trim()) {
        const encodedQ = encodeURIComponent(searchQuery.trim());
        query += query ? `&q=${encodedQ}` : `q=${encodedQ}`;
      }
      query += query ? '&maxResults=15' : 'maxResults=15';

      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${query}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const duration = Date.now() - startTime;
      recordApiTraffic('GET', url, '', res.status, JSON.stringify(data), duration);

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg('Authentication token expired. Please click "Sign in with Google".');
          setAccessToken(null);
        } else {
          setErrorMsg(data.error?.message || 'Failed to list Gmail messages');
        }
        setMessages([]);
        setLoading(false);
        return;
      }

      if (!data.messages || data.messages.length === 0) {
        setMessages([]);
        setSelectedMessage(null);
        setLoading(false);
        return;
      }

      // Fetch detail for each message
      const detailedMessages: GmailMessage[] = await Promise.all(
        data.messages.slice(0, 15).map(async (item: { id: string }) => {
          const mRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const mData = await mRes.json();
          if (!mRes.ok) return item as GmailMessage;

          const headers: GmailHeader[] = mData.payload?.headers || [];
          const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
          const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
          const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
          const bodyText = parseMessageBody(mData.payload);
          const isUnread = mData.labelIds?.includes('UNREAD');

          return {
            ...mData,
            from,
            subject,
            date,
            bodyText,
            isUnread,
          };
        })
      );

      setMessages(detailedMessages);
      if (detailedMessages.length > 0 && !selectedMessage) {
        setSelectedMessage(detailedMessages[0]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to Gmail API');
    } finally {
      setLoading(false);
    }
  }, [getToken, activeLabel, searchQuery, selectedMessage, setAccessToken]);

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      const res = await login();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        setSuccessMsg('Successfully authenticated with Gmail API!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign-in failed');
    }
  };

  // Initial load
  useEffect(() => {
    const token = getToken();
    if (user || token) {
      fetchProfile();
      fetchMessages();
    }
  }, [user, accessToken, activeLabel, fetchProfile, fetchMessages]);

  // Request Send Email with Mandatory Confirmation Dialog
  const handleRequestSendEmail = () => {
    if (!composeTo.trim()) {
      setErrorMsg('Please specify a recipient email address.');
      return;
    }
    if (!composeSubject.trim()) {
      setErrorMsg('Please specify an email subject.');
      return;
    }

    setPendingConfirmAction({
      type: 'send',
      title: 'Confirm Send Email',
      description: `Are you sure you want to send this email via Gmail to "${composeTo}" with subject "${composeSubject}"?`,
      action: async () => {
        await executeSendEmail();
      },
    });
  };

  // Execute Send Email
  const executeSendEmail = async () => {
    const token = getToken();
    if (!token) {
      setErrorMsg('Missing OAuth access token. Please sign in with Google.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    const startTime = Date.now();

    try {
      // Construct RFC 2822 raw MIME message
      const mimeMessage = [
        `To: ${composeTo}`,
        `Subject: ${composeSubject}`,
        `Content-Type: text/plain; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        composeBody,
      ].join('\r\n');

      // Convert to Base64URL
      const base64Encoded = btoa(
        encodeURIComponent(mimeMessage).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      )
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
      const payload = JSON.stringify({ raw: base64Encoded });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      const data = await res.json();
      const duration = Date.now() - startTime;
      recordApiTraffic('POST', url, payload, res.status, JSON.stringify(data), duration);

      if (res.ok) {
        setSuccessMsg(`Email successfully sent to ${composeTo}! (Message ID: ${data.id})`);
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        fetchMessages();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error?.message || 'Failed to send email via Gmail API');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error executing Gmail send request');
    } finally {
      setIsSending(false);
    }
  };

  // Request Trash Message with Mandatory Confirmation Dialog
  const handleRequestTrashMessage = (msg: GmailMessage) => {
    setPendingConfirmAction({
      type: 'delete',
      title: 'Confirm Move to Trash',
      description: `Are you sure you want to move email "${msg.subject}" from ${msg.from} to Trash?`,
      action: async () => {
        await executeTrashMessage(msg.id);
      },
    });
  };

  // Execute Trash Message
  const executeTrashMessage = async (msgId: string) => {
    const token = getToken();
    if (!token) return;

    const startTime = Date.now();
    try {
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}/trash`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const duration = Date.now() - startTime;
      recordApiTraffic('POST', url, '', res.status, JSON.stringify(data), duration);

      if (res.ok) {
        setSuccessMsg('Message moved to Trash.');
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        if (selectedMessage?.id === msgId) {
          setSelectedMessage(null);
        }
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(data.error?.message || 'Failed to trash email');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error trashing message');
    }
  };

  // Import Gmail API Call into Reqable HTTP Client Workbench
  const handleImportToReqable = (msg: GmailMessage) => {
    if (!onImportToReqable) return;
    const token = getToken();

    const req: Partial<ApiRequest> = {
      name: `Gmail: ${msg.subject || 'Get Message'}`,
      method: 'GET',
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      headers: [
        {
          id: 'h-auth',
          key: 'Authorization',
          value: `Bearer ${token || 'YOUR_GMAIL_ACCESS_TOKEN'}`,
          enabled: true,
          description: 'Gmail OAuth 2.0 Bearer Token',
        },
        {
          id: 'h-accept',
          key: 'Accept',
          value: 'application/json',
          enabled: true,
        },
      ],
      params: [
        {
          id: 'p-fmt',
          key: 'format',
          value: 'full',
          enabled: true,
          description: 'Return full email headers and mime payload',
        },
      ],
      bodyType: 'none',
      body: '',
      auth: {
        type: 'bearer',
        token: token || '',
      },
    };

    onImportToReqable(req);
    setSuccessMsg('Gmail API endpoint imported to Reqable HTTP Client Debugger!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const hasToken = Boolean(getToken());

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header Banner */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-950 text-rose-400 rounded-xl border border-rose-800/80 shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Gmail Workspace Integration</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                  hasToken
                    ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hasToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {hasToken ? 'Connected (OAuth Active)' : 'OAuth Required'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Read, compose, send, and audit live Gmail API requests in Reqable
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {profile && (
            <div className="hidden md:flex items-center gap-3 text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono">
              <span className="text-slate-400">{profile.emailAddress}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400">{profile.messagesTotal.toLocaleString()} emails</span>
            </div>
          )}

          {!hasToken ? (
            <button
              onClick={handleGoogleSignIn}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-medium text-xs rounded-lg shadow-md flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Compose Email</span>
              </button>

              <button
                onClick={() => {
                  fetchProfile();
                  fetchMessages();
                }}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
                title="Refresh Gmail Messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 py-2 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex items-center gap-2">
            {(errorMsg.includes('popup') || errorMsg.includes('blocked') || errorMsg.includes('tab')) && (
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-2 py-1 bg-rose-800 hover:bg-rose-700 text-white text-[11px] font-medium rounded border border-rose-600 flex items-center gap-1 transition-all shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in New Tab</span>
              </button>
            )}
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!hasToken ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-1">Google Workspace OAuth Required</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Authorize your Gmail account to search messages, send emails, and inspect live Gmail API HTTP network traffic inside Reqable.
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Shield className="w-4 h-4" />
            <span>Authorize Gmail Access with Google</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Filter Labels & Mail List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/50">
            {/* Filter Tabs */}
            <div className="p-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto text-xs">
              {[
                { id: 'INBOX', label: 'Inbox', icon: Inbox },
                { id: 'UNREAD', label: 'Unread', icon: Mail },
                { id: 'SENT', label: 'Sent', icon: SendHorizontal },
                { id: 'STARRED', label: 'Starred', icon: Star },
                { id: 'TRASH', label: 'Trash', icon: Trash2 },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeLabel === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveLabel(tab.id);
                      setSelectedMessage(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar */}
            <div className="p-2 border-b border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchMessages();
                }}
                className="relative"
              >
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search email (e.g. from:boss, is:unread)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-sans placeholder:text-slate-600"
                />
              </form>
            </div>

            {/* Messages List Container */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                  <span>Fetching Gmail messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <Mail className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-400">No emails found</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try switching filters or adjusting your search query.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-3 cursor-pointer transition-colors relative ${
                        isSelected
                          ? 'bg-rose-950/30 border-l-2 border-l-rose-500'
                          : msg.isUnread
                          ? 'bg-slate-900/80 hover:bg-slate-800/80'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-xs truncate max-w-[180px] ${
                            msg.isUnread ? 'font-bold text-slate-100' : 'font-medium text-slate-300'
                          }`}
                        >
                          {msg.from || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <h4
                        className={`text-xs truncate mb-1 ${
                          msg.isUnread ? 'font-semibold text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.subject || '(No Subject)'}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                        {msg.snippet || 'No text content snippet.'}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2">
                        {msg.isUnread && (
                          <span className="text-[9px] bg-sky-950 text-sky-400 px-1.5 py-0.2 rounded border border-sky-800 font-semibold">
                            UNREAD
                          </span>
                        )}
                        {msg.labelIds?.slice(0, 2).map((lbl) => (
                          <span
                            key={lbl}
                            className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Message Detail & Debugger View */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {selectedMessage ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Detail Bar Toolbar */}
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleImportToReqable(selectedMessage)}
                      className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Send this Gmail API endpoint directly into Reqable API client"
                    >
                      <Code2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Inspect in Reqable Debugger</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestTrashMessage(selectedMessage)}
                      className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all"
                      title="Move Message to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Trash Email</span>
                    </button>
                  </div>
                </div>

                {/* Email Subject & Meta */}
                <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/30">
                  <h2 className="text-base font-bold text-slate-100">{selectedMessage.subject}</h2>

                  <div className="flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold">{selectedMessage.from}</span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] pl-5">
                        Message ID: {selectedMessage.id}
                      </div>
                    </div>

                    <div className="text-slate-400 text-right font-mono text-[11px]">
                      {selectedMessage.date}
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-5 overflow-y-auto font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-rose-900 selection:text-rose-100">
                  {selectedMessage.bodyText ? (
                    selectedMessage.bodyText
                  ) : (
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs">
                      {selectedMessage.snippet || 'No plain text payload found in email body.'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Mail className="w-10 h-10 text-slate-700 mb-3" />
                <p className="font-semibold text-slate-400">Select an email to view details</p>
                <p className="text-xs text-slate-600 mt-1">
                  Choose a message from the left inbox panel to read its content or inspect the endpoint in Reqable.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-950 text-rose-400 rounded-lg border border-rose-800">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm">Compose New Email (Gmail API)</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">To (Recipient Email)</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Reqable API Test Report"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Email Body</label>
                <textarea
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your email body here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-[10px] text-slate-500 font-mono">
                API: POST /gmail/v1/users/me/messages/send
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestSendEmail}
                  disabled={isSending}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Modal (Per Workspace Skill Rules) */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border-l-4 border-l-rose-500">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-950 text-rose-400 rounded-xl border border-rose-800">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-sm">{pendingConfirmAction.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {pendingConfirmAction.description}
            </p>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-amber-400/90 font-mono">
              ⚠️ Workspace Security Policy: Confirming this action will execute a live Gmail API request.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPendingConfirmAction(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const act = pendingConfirmAction.action;
                  setPendingConfirmAction(null);
                  await act();
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
