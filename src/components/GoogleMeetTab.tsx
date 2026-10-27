import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Calendar,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  Users,
  AlertCircle,
  Terminal,
  Code2,
  Trash2,
  Sparkles,
  Link2,
  Shield,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCachedAccessToken } from '../lib/firebase';
import { ApiRequest, TrafficItem } from '../types/reqable';

interface MeetEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  attendees?: Array<{ email: string; responseStatus?: string }>;
  status?: string;
}

interface GoogleMeetTabProps {
  onImportToReqable?: (req: Partial<ApiRequest>) => void;
  onLogTraffic?: (item: TrafficItem) => void;
}

export const GoogleMeetTab: React.FC<GoogleMeetTabProps> = ({
  onImportToReqable,
  onLogTraffic,
}) => {
  const { user, login, accessToken } = useAuth();
  const [events, setEvents] = useState<MeetEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Meeting Form States
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [meetingAgenda, setMeetingAgenda] = useState<string>('');
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [attendeeEmails, setAttendeeEmails] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Confirmation Modal
  const [pendingConfirm, setPendingConfirm] = useState<{
    type: 'create' | 'delete';
    title: string;
    description: string;
    eventId?: string;
    action: () => Promise<void>;
  } | null>(null);

  const getToken = useCallback(() => {
    return accessToken || getCachedAccessToken();
  }, [accessToken]);

  // Fetch Calendar Events with Meet links
  const fetchUpcomingMeetings = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setErrorMsg('Google OAuth token required. Please sign in or reconnect.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const nowIso = new Date().toISOString();
    const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
      nowIso
    )}&maxResults=20&conferenceDataVersion=1`;

    const startTimeReq = Date.now();
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const latency = Date.now() - startTimeReq;

      // Log traffic in Reqable
      if (onLogTraffic) {
        onLogTraffic({
          id: `trf-meet-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          method: 'GET',
          url: endpoint,
          protocol: 'HTTP/2.0',
          requestHeaders: { Authorization: 'Bearer [HIDDEN]' },
          requestBody: '',
          responseStatus: res.status,
          responseHeaders: { 'content-type': 'application/json' },
          responseBody: '',
          durationMs: latency,
          sizeBytes: 1024,
          clientIp: '127.0.0.1',
          status: 'captured',
          timingBreakdown: { dns: 2, tcp: 8, tls: 14, ttfb: Math.max(1, latency - 10), download: 10, total: latency },
        });
      }

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Google OAuth token expired or insufficient permissions. Please reconnect.');
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${res.status}: Failed to fetch events.`);
      }

      const data = await res.json();
      const items: MeetEvent[] = data.items || [];
      setEvents(items);
    } catch (err: any) {
      console.error('Failed to load Google Meet events:', err);
      setErrorMsg(err.message || 'Error connecting to Google Calendar API.');
    } finally {
      setLoading(false);
    }
  }, [getToken, onLogTraffic]);

  useEffect(() => {
    if (user) {
      fetchUpcomingMeetings();
    }
  }, [user, fetchUpcomingMeetings]);

  // Handle Create Meeting with Google Meet Video Link
  const executeCreateMeeting = async () => {
    const token = getToken();
    if (!token) {
      setErrorMsg('Google OAuth token missing. Please sign in.');
      return;
    }

    if (!meetingTitle.trim()) {
      setErrorMsg('Meeting title is required.');
      return;
    }

    setIsCreating(true);
    setErrorMsg(null);

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const parsedAttendees = attendeeEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
      .map((email) => ({ email }));

    const eventPayload = {
      summary: meetingTitle,
      description: meetingAgenda || 'Scheduled via Reqable API Workspace',
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() },
      attendees: parsedAttendees,
      conferenceData: {
        createRequest: {
          requestId: `reqable-meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const endpoint = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';
    const reqStart = Date.now();

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      const latency = Date.now() - reqStart;

      if (onLogTraffic) {
        onLogTraffic({
          id: `trf-meet-create-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          method: 'POST',
          url: endpoint,
          protocol: 'HTTP/2.0',
          requestHeaders: { Authorization: 'Bearer [HIDDEN]', 'Content-Type': 'application/json' },
          requestBody: JSON.stringify(eventPayload),
          responseStatus: res.status,
          responseHeaders: { 'content-type': 'application/json' },
          responseBody: '',
          durationMs: latency,
          sizeBytes: JSON.stringify(eventPayload).length,
          clientIp: '127.0.0.1',
          status: 'captured',
          timingBreakdown: { dns: 2, tcp: 8, tls: 14, ttfb: Math.max(1, latency - 10), download: 10, total: latency },
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}: Meeting creation failed.`);
      }

      const createdEvent: MeetEvent = await res.json();
      setSuccessMsg(`Google Meet created successfully! Link: ${createdEvent.hangoutLink || 'Generated'}`);
      setMeetingTitle('');
      setMeetingAgenda('');
      setAttendeeEmails('');
      setIsScheduleOpen(false);
      fetchUpcomingMeetings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create Google Meet space.');
    } finally {
      setIsCreating(false);
      setPendingConfirm(null);
    }
  };

  // Delete Meeting Confirmation
  const executeDeleteMeeting = async (eventId: string) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete event (HTTP ${res.status})`);
      }

      setSuccessMsg('Meeting canceled and removed from Google Calendar.');
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete meeting.');
    } finally {
      setLoading(false);
      setPendingConfirm(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportReqToReqable = (method: string, url: string, body?: any) => {
    if (onImportToReqable) {
      onImportToReqable({
        id: `meet-req-${Date.now()}`,
        name: `Google Meet API: ${method} Event`,
        method: method as any,
        url: url,
        headers: [
          { id: 'h1', key: 'Authorization', value: 'Bearer {{oauth_access_token}}', enabled: true },
          { id: 'h2', key: 'Content-Type', value: 'application/json', enabled: true },
        ],
        params: [],
        auth: { type: 'bearer', token: '{{oauth_access_token}}' },
        body: body ? JSON.stringify(body, null, 2) : '',
        bodyType: body ? 'json' : 'none',
      });
    }
  };

  return (
    <div id="google-meet-tab-root" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">Google Meet & Calendar</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                Workspace API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Schedule Google Meet spaces, join video calls, and debug Google Workspace REST endpoints directly inside Reqable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-meet"
            onClick={fetchUpcomingMeetings}
            disabled={loading}
            className="px-3 min-h-[44px] min-w-[44px] justify-center rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
            title="Refresh Meetings"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="btn-open-schedule-modal"
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 min-h-[44px] min-w-[44px] justify-center rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Google Meet</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800/80 text-rose-200 p-3.5 rounded-lg text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-200 min-h-[36px] min-w-[36px] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 p-3.5 rounded-lg text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-400 hover:text-emerald-200 min-h-[36px] min-w-[36px] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upcoming Google Meet Meetings List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">Upcoming Google Meet Calls ({events.length})</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {events.filter((e) => e.hangoutLink).length} with active Meet links
          </span>
        </div>

        {loading && events.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            <p className="text-xs">Fetching upcoming meetings from Google Calendar API...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <Video className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <p className="text-sm text-slate-400 font-medium">No upcoming Google Meet calls found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create an instant Google Meet space or schedule a video meeting using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => {
              const meetUrl = evt.hangoutLink || evt.conferenceData?.entryPoints?.find((ep) => ep.uri)?.uri;
              const startTimeStr = evt.start?.dateTime
                ? new Date(evt.start.dateTime).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'All Day';

              return (
                <div
                  key={evt.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">{evt.summary || 'Untitled Meeting'}</h3>
                      {meetUrl ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80 shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Meet Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 shrink-0">
                          No Video Link
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{startTimeStr}</span>
                    </div>

                    {evt.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                        {evt.description}
                      </p>
                    )}

                    {evt.attendees && evt.attendees.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{evt.attendees.length} Attendees</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    {meetUrl ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 min-h-[44px] min-w-[44px] rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meet</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>

                        <button
                          onClick={() => handleCopy(meetUrl, evt.id)}
                          className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-all"
                          title="Copy Google Meet Link"
                        >
                          {copiedId === evt.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No video call link attached</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleExportReqToReqable(
                            'GET',
                            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${evt.id}`
                          )
                        }
                        className="px-2.5 py-1.5 min-h-[44px] rounded-md text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 flex items-center gap-1 transition-all"
                        title="Import request to Reqable API Client"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reqable API</span>
                      </button>

                      <button
                        onClick={() =>
                          setPendingConfirm({
                            type: 'delete',
                            title: 'Cancel Google Meet Call?',
                            description: `Are you sure you want to delete "${evt.summary}" from Google Calendar?`,
                            eventId: evt.id,
                            action: () => executeDeleteMeeting(evt.id),
                          })
                        }
                        className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                        title="Cancel Meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Meet API Code Generator & Snippets */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Google Meet REST API Code Snippets</h2>
          </div>
          <span className="text-xs text-slate-400">Copy or test in Reqable API Client</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Create Meet Space cURL */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 font-mono">POST /v3/calendars/primary/events</span>
              <button
                onClick={() =>
                  handleExportReqToReqable(
                    'POST',
                    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
                    {
                      summary: 'Sample Google Meet Session',
                      start: { dateTime: new Date().toISOString() },
                      end: { dateTime: new Date(Date.now() + 1800000).toISOString() },
                      conferenceData: {
                        createRequest: {
                          requestId: 'reqable-sample',
                          conferenceSolutionKey: { type: 'hangoutsMeet' },
                        },
                      },
                    }
                  )
                }
                className="text-[11px] min-h-[36px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import to API Client</span>
              </button>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono bg-slate-900 p-3 rounded overflow-x-auto border border-slate-800/80 leading-relaxed">
{`curl -X POST "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "summary": "Debug Session with Reqable",
    "conferenceData": {
      "createRequest": {
        "requestId": "meet-12345",
        "conferenceSolutionKey": { "type": "hangoutsMeet" }
      }
    }
  }'`}
            </pre>
          </div>

          {/* Google Meet Spaces v2 API */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-400 font-mono">POST /v2/spaces (Meet Spaces API)</span>
              <button
                onClick={() =>
                  handleExportReqToReqable('POST', 'https://meetings.googleapis.com/v2/spaces', {
                    config: { accessType: 'OPEN' },
                  })
                }
                className="text-[11px] min-h-[36px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import to API Client</span>
              </button>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono bg-slate-900 p-3 rounded overflow-x-auto border border-slate-800/80 leading-relaxed">
{`curl -X POST "https://meetings.googleapis.com/v2/spaces" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "config": {
      "accessType": "OPEN"
    }
  }'`}
            </pre>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Schedule Google Meet Call</h3>
              </div>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. API Security Review & Debug Sync"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 min-h-[44px] text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Agenda / Description</label>
                <textarea
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="Add meeting notes or discussion points..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 min-h-[44px] text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 min-h-[44px] text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Attendee Emails (comma separated)</label>
                <input
                  type="text"
                  value={attendeeEmails}
                  onChange={(e) => setAttendeeEmails(e.target.value)}
                  placeholder="e.g. dev@example.com, security@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 min-h-[44px] text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="px-4 min-h-[44px] rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!meetingTitle.trim()) {
                    setErrorMsg('Please enter a meeting title.');
                    return;
                  }
                  setPendingConfirm({
                    type: 'create',
                    title: 'Confirm Schedule Google Meet',
                    description: `Create Google Meet "${meetingTitle}" and send invites?`,
                    action: executeCreateMeeting,
                  });
                }}
                className="px-5 min-h-[44px] rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Create Google Meet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog (Mandatory per Workspace Skill Guidelines) */}
      {pendingConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">{pendingConfirm.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{pendingConfirm.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPendingConfirm(null)}
                disabled={isCreating || loading}
                className="px-4 min-h-[44px] rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-all"
              >
                Back
              </button>
              <button
                onClick={pendingConfirm.action}
                disabled={isCreating || loading}
                className="px-5 min-h-[44px] rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm & Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
