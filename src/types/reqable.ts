export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'WS' | 'SSE' | 'GRPC';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
  isSecret?: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
  body: string;
  auth: {
    type: 'none' | 'bearer' | 'basic' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apiKeyKey?: string;
    apiKeyValue?: string;
    apiKeyIn?: 'header' | 'query';
  };
  preRequestScript?: string;
  testScript?: string;
  folderId?: string;
}

export interface Timings {
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  download: number;
  total: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  sizeBytes: number;
  timeMs: number;
  timings?: Timings;
  contentType: string;
  timestamp: string;
  testResults?: { name: string; passed: boolean; message?: string }[];
}

export interface TrafficItem {
  id: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  protocol: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  durationMs: number;
  sizeBytes: number;
  clientIp: string;
  status: 'captured' | 'modified' | 'blocked' | 'replayed';
  ruleApplied?: string;
  timingBreakdown: Timings;
}

export type RuleType = 'breakpoint' | 'rewrite' | 'map_local' | 'script' | 'delay' | 'mock_server';

export interface TrafficRule {
  id: string;
  name: string;
  enabled: boolean;
  type: RuleType;
  group?: string;
  tags?: string[];
  matchUrl: string; // glob, regex, or mock path e.g. /api/mock/v1/users
  matchMethod?: HttpMethod | 'ALL';
  matchStatus?: number;
  hitCount?: number;
  action: {
    targetField?: 'status' | 'headers' | 'body' | 'url';
    statusCode?: number;
    contentType?: string;
    headersToAdd?: KeyValuePair[];
    bodyReplace?: string;
    mapLocalFile?: string;
    delayMs?: number;
    scriptCode?: string;
    templateVariables?: boolean;
    failureRate?: number;
  };
}

export interface CollectionFolder {
  id: string;
  name: string;
  parentId?: string;
}

export interface CollectionVersion {
  id: string;
  version: string;
  name?: string;
  description?: string;
  requests: ApiRequest[];
  folders?: CollectionFolder[];
  variables?: KeyValuePair[];
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  version?: string;
  versions?: CollectionVersion[];
  folders: CollectionFolder[];
  requests: ApiRequest[];
  variables: KeyValuePair[];
  updatedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
  isGlobal?: boolean;
}

export interface DriveBackup {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
