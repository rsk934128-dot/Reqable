import { Collection, Environment, TrafficItem, TrafficRule } from '../types/reqable';

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Petstore & Auth API',
    description: 'Sample e-commerce and identity endpoints for API testing',
    updatedAt: new Date().toISOString(),
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://httpbin.org', enabled: true },
      { id: 'v2', key: 'authToken', value: 'bearer-xyz-123456789', enabled: true, isSecret: true },
    ],
    folders: [
      { id: 'f-1', name: 'Authentication' },
      { id: 'f-1-1', name: 'OAuth 2.0 & Tokens', parentId: 'f-1' },
      { id: 'f-2', name: 'Users & Profile' },
      { id: 'f-2-1', name: 'Admin Operations', parentId: 'f-2' },
      { id: 'f-3', name: 'Mock Payments' },
    ],
    requests: [
      {
        id: 'req-1',
        name: 'Login & Retrieve Token',
        method: 'POST',
        url: '{{baseUrl}}/post',
        folderId: 'f-1',
        headers: [
          { id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true },
          { id: 'h2', key: 'User-Agent', value: 'Reqable/3.2 (Macintosh; Apple Silicon)', enabled: true },
        ],
        params: [],
        bodyType: 'json',
        body: JSON.stringify({ username: 'demo_developer', password: 'secretPassword123!' }, null, 2),
        auth: { type: 'none' },
        testScript: `// Reqable Automated Assertions
pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Response contains json body", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("json");
});`,
      },
      {
        id: 'req-1-sub',
        name: 'Refresh OAuth Access Token',
        method: 'POST',
        url: '{{baseUrl}}/post',
        folderId: 'f-1-1',
        headers: [
          { id: 'h1sub', key: 'Content-Type', value: 'application/json', enabled: true },
        ],
        params: [],
        bodyType: 'json',
        body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: 'ref_abc_987654321' }, null, 2),
        auth: { type: 'none' },
      },
      {
        id: 'req-2',
        name: 'Get Current User Profile',
        method: 'GET',
        url: '{{baseUrl}}/get?userId=10928&role=admin',
        folderId: 'f-2',
        headers: [
          { id: 'h3', key: 'Authorization', value: 'Bearer {{authToken}}', enabled: true },
          { id: 'h4', key: 'Accept', value: 'application/json', enabled: true },
        ],
        params: [
          { id: 'p1', key: 'userId', value: '10928', enabled: true },
          { id: 'p2', key: 'role', value: 'admin', enabled: true },
        ],
        bodyType: 'none',
        body: '',
        auth: { type: 'bearer', token: '{{authToken}}' },
        testScript: `pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});`,
      },
      {
        id: 'req-2-admin',
        name: 'Audit User Security Logs',
        method: 'GET',
        url: '{{baseUrl}}/get?action=security_audit',
        folderId: 'f-2-1',
        headers: [
          { id: 'h3admin', key: 'Authorization', value: 'Bearer {{authToken}}', enabled: true },
        ],
        params: [
          { id: 'p2admin', key: 'action', value: 'security_audit', enabled: true },
        ],
        bodyType: 'none',
        body: '',
        auth: { type: 'bearer', token: '{{authToken}}' },
      },
      {
        id: 'req-3',
        name: 'Simulate Payment Processing',
        method: 'POST',
        url: '{{baseUrl}}/status/200',
        folderId: 'f-3',
        headers: [
          { id: 'h5', key: 'Content-Type', value: 'application/json', enabled: true },
          { id: 'h6', key: 'X-Idempotency-Key', value: 'idem_9921_abc8', enabled: true },
        ],
        params: [],
        bodyType: 'json',
        body: JSON.stringify({ amount: 49.99, currency: 'USD', cardToken: 'tok_visa_4242' }, null, 2),
        auth: { type: 'none' },
      },
    ],
  },
  {
    id: 'col-2',
    name: 'Reqable System & MCP Tools',
    description: 'Internal debugging & Model Context Protocol validation suite',
    updatedAt: new Date().toISOString(),
    variables: [
      { id: 'v3', key: 'mcpHost', value: 'http://localhost:3000', enabled: true },
    ],
    folders: [
      { id: 'f-4', name: 'MCP Diagnostics' },
    ],
    requests: [
      {
        id: 'req-4',
        name: 'List Available MCP Tools',
        method: 'GET',
        url: '{{mcpHost}}/api/mcp/tools',
        folderId: 'f-4',
        headers: [
          { id: 'h7', key: 'Accept', value: 'application/json', enabled: true },
        ],
        params: [],
        bodyType: 'none',
        body: '',
        auth: { type: 'none' },
      },
    ],
  },
];

export const INITIAL_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-prod',
    name: 'Production Environment',
    variables: [
      { id: 'ev1', key: 'baseUrl', value: 'https://httpbin.org', enabled: true },
      { id: 'ev2', key: 'apiKey', value: 'req_live_8f3a9d21c0b', enabled: true, isSecret: true },
      { id: 'ev3', key: 'timeout', value: '5000', enabled: true },
    ],
  },
  {
    id: 'env-staging',
    name: 'Staging & Sandbox',
    variables: [
      { id: 'ev4', key: 'baseUrl', value: 'https://httpbin.org', enabled: true },
      { id: 'ev5', key: 'apiKey', value: 'req_sandbox_testKey123', enabled: true, isSecret: true },
      { id: 'ev6', key: 'timeout', value: '10000', enabled: true },
    ],
  },
];

export const INITIAL_TRAFFIC: TrafficItem[] = [
  {
    id: 'tf-101',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    method: 'GET',
    url: 'https://api.github.com/repos/reqable/reqable-app',
    protocol: 'HTTP/2.0',
    requestHeaders: {
      'Host': 'api.github.com',
      'User-Agent': 'Reqable/3.2 (macOS M5 Apple Silicon)',
      'Accept': 'application/vnd.github.v3+json',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    requestBody: '',
    responseStatus: 200,
    responseHeaders: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=60',
      'x-ratelimit-limit': '60',
      'x-ratelimit-remaining': '58',
      'server': 'GitHub.com',
    },
    responseBody: JSON.stringify(
      {
        id: 481920192,
        name: 'reqable-app',
        full_name: 'reqable/reqable-app',
        private: false,
        stargazers_count: 6600,
        forks_count: 261,
        open_issues_count: 776,
        description: 'Reqable issue tracking, feedback, release notes, and MCP server documentation.',
        license: { key: 'mit', name: 'MIT License' },
        html_url: 'https://github.com/reqable/reqable-app',
      },
      null,
      2
    ),
    durationMs: 142,
    sizeBytes: 1248,
    clientIp: '127.0.0.1:58210',
    status: 'captured',
    timingBreakdown: { dns: 12, tcp: 24, tls: 38, ttfb: 58, download: 10, total: 142 },
  },
  {
    id: 'tf-102',
    timestamp: new Date(Date.now() - 90000).toLocaleTimeString(),
    method: 'POST',
    url: 'https://api.reqable.com/v1/auth/login',
    protocol: 'HTTP/1.1',
    requestHeaders: {
      'Host': 'api.reqable.com',
      'Content-Type': 'application/json',
      'User-Agent': 'Reqable Mobile/3.2 (Android 14)',
    },
    requestBody: JSON.stringify({ email: 'developer@reqable.com', device: 'MacBook Pro M5' }, null, 2),
    responseStatus: 200,
    responseHeaders: {
      'content-type': 'application/json',
      'set-cookie': 'session=reqable_sess_9921827a; Secure; HttpOnly',
      'x-reqable-engine': 'Flutter C++ core v3.2',
    },
    responseBody: JSON.stringify(
      {
        success: true,
        user: { id: 'usr_8819', email: 'developer@reqable.com', tier: 'Community' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 86400,
      },
      null,
      2
    ),
    durationMs: 88,
    sizeBytes: 520,
    clientIp: '192.168.1.105:61102',
    status: 'captured',
    timingBreakdown: { dns: 8, tcp: 15, tls: 22, ttfb: 35, download: 8, total: 88 },
  },
  {
    id: 'tf-103',
    timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
    method: 'POST',
    url: 'https://httpbin.org/status/500',
    protocol: 'HTTP/1.1',
    requestHeaders: {
      'Host': 'httpbin.org',
      'Content-Type': 'application/json',
      'X-Requested-With': 'Reqable Client',
    },
    requestBody: JSON.stringify({ triggerError: true }),
    responseStatus: 500,
    responseHeaders: {
      'content-type': 'text/html; charset=utf-8',
      'server': 'gunicorn/19.9.0',
    },
    responseBody: '500 Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.',
    durationMs: 310,
    sizeBytes: 150,
    clientIp: '127.0.0.1:58430',
    status: 'captured',
    timingBreakdown: { dns: 20, tcp: 45, tls: 85, ttfb: 150, download: 10, total: 310 },
  },
  {
    id: 'tf-104',
    timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
    method: 'GET',
    url: 'https://httpbin.org/get?mock=active',
    protocol: 'HTTP/1.1',
    requestHeaders: {
      'Host': 'httpbin.org',
      'User-Agent': 'Reqable Interceptor',
      'X-Rewrite-Engine': 'Active',
    },
    requestBody: '',
    responseStatus: 200,
    responseHeaders: {
      'content-type': 'application/json',
      'x-reqable-modified': 'true',
      'x-mock-rule': 'Rule #1 - Inject Debug Headers',
    },
    responseBody: JSON.stringify(
      {
        args: { mock: 'active' },
        headers: { Host: 'httpbin.org', 'X-Reqable-Interception': 'MITM Active' },
        origin: '127.0.0.1',
        url: 'https://httpbin.org/get?mock=active',
        reqableNotice: 'This request was modified by Reqable Rewrite Rule',
      },
      null,
      2
    ),
    durationMs: 42,
    sizeBytes: 310,
    clientIp: '127.0.0.1:58990',
    status: 'modified',
    ruleApplied: 'Rule #1 - Inject Debug Headers',
    timingBreakdown: { dns: 2, tcp: 5, tls: 10, ttfb: 22, download: 3, total: 42 },
  },
];

export const INITIAL_RULES: TrafficRule[] = [
  {
    id: 'rule-1',
    name: 'Inject Debug Headers & Mock Key',
    enabled: true,
    type: 'rewrite',
    matchUrl: 'https://httpbin.org/*',
    matchMethod: 'ALL',
    action: {
      targetField: 'headers',
      headersToAdd: [
        { id: 'rh1', key: 'X-Reqable-Debug', value: 'Enabled', enabled: true },
        { id: 'rh2', key: 'X-Mock-Engine', value: 'Reqable-C++', enabled: true },
      ],
    },
  },
  {
    id: 'rule-2',
    name: 'Breakpoint on Payment Checkout',
    enabled: true,
    type: 'breakpoint',
    matchUrl: '*/payment*',
    matchMethod: 'POST',
    action: {
      statusCode: 200,
      bodyReplace: JSON.stringify({ status: 'INTERCEPTED_PAUSED', message: 'Paused by Reqable Breakpoint' }),
    },
  },
  {
    id: 'rule-3',
    name: 'Map Local User Profile Mock',
    enabled: false,
    type: 'map_local',
    matchUrl: '*/user/profile',
    matchMethod: 'GET',
    action: {
      statusCode: 200,
      mapLocalFile: 'user_profile_mock.json',
      bodyReplace: JSON.stringify({ id: 'usr_mock_99', name: 'Reqable Developer', status: 'VIP Gold' }, null, 2),
    },
  },
  {
    id: 'rule-4',
    name: 'Simulate 3G Network Delay (1500ms)',
    enabled: false,
    type: 'delay',
    matchUrl: '*',
    matchMethod: 'ALL',
    action: {
      delayMs: 1500,
    },
  },
];
