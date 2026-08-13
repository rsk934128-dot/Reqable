import { Collection, Environment, TrafficItem, TrafficRule } from '../types/reqable';

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Petstore & Auth API',
    description: 'Sample e-commerce and identity endpoints for API testing',
    version: 'v1.0.0',
    versions: [
      {
        id: 'ver-col1-v100',
        version: 'v1.0.0',
        name: 'v1.0.0 (Stable)',
        description: 'Legacy v1 stable API collection release',
        createdAt: new Date().toISOString(),
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
            testScript: `// Reqable Automated Assertions\npm.test("Status code is 200 OK", function () {\n  pm.response.to.have.status(200);\n});\npm.test("Response contains json body", function () {\n  var jsonData = pm.response.json();\n  pm.expect(jsonData).to.have.property("json");\n});`,
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
            testScript: `pm.test("Status code is 200", function () {\n  pm.response.to.have.status(200);\n});`,
          },
        ],
      },
      {
        id: 'ver-col1-v200',
        version: 'v2.0.0-beta',
        name: 'v2.0.0 (Beta Next-Gen)',
        description: 'Next-generation v2 GraphQL & REST endpoint specs',
        createdAt: new Date().toISOString(),
        folders: [
          { id: 'f-v2-1', name: 'v2 Identity & MFA' },
          { id: 'f-v2-2', name: 'v2 Billing & Webhooks' },
        ],
        requests: [
          {
            id: 'req-v2-1',
            name: 'v2 OAuth 2.1 Passwordless Login',
            method: 'POST',
            url: '{{baseUrl}}/post?api_version=v2',
            folderId: 'f-v2-1',
            headers: [
              { id: 'h-v2-1', key: 'X-API-Version', value: 'v2.0.0-beta', enabled: true },
              { id: 'h-v2-2', key: 'Content-Type', value: 'application/json', enabled: true },
            ],
            params: [{ id: 'p-v2-1', key: 'api_version', value: 'v2', enabled: true }],
            bodyType: 'json',
            body: JSON.stringify({ email: 'user@example.com', mfaCode: '987654' }, null, 2),
            auth: { type: 'none' },
          },
          {
            id: 'req-v2-2',
            name: 'v2 Stream Payment Webhooks',
            method: 'POST',
            url: '{{baseUrl}}/post?stream=true',
            folderId: 'f-v2-2',
            headers: [
              { id: 'h-v2-3', key: 'X-Webhook-Signature', value: 'sha256=abc123xyz', enabled: true },
            ],
            params: [],
            bodyType: 'json',
            body: JSON.stringify({ event: 'payment.succeeded', amount: 4900, currency: 'USD' }, null, 2),
            auth: { type: 'none' },
          },
        ],
      },
    ],
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
    id: 'mock-rule-1',
    name: 'User Profile API Mock Endpoint',
    enabled: true,
    type: 'mock_server',
    group: 'API Mock Endpoints',
    tags: ['users', 'mock-server', 'v1'],
    matchUrl: '/api/mock/v1/users/*',
    matchMethod: 'GET',
    hitCount: 58,
    action: {
      statusCode: 200,
      contentType: 'application/json',
      delayMs: 150,
      templateVariables: true,
      headersToAdd: [
        { id: 'm1', key: 'X-Mock-Server', value: 'Reqable-Engine/3.2', enabled: true },
        { id: 'm2', key: 'Cache-Control', value: 'no-cache', enabled: true },
      ],
      bodyReplace: JSON.stringify(
        {
          id: '{{$guid}}',
          name: '{{$randomName}}',
          email: '{{$randomEmail}}',
          role: 'Senior Software Engineer',
          status: 'ACTIVE',
          accountCreated: '{{$timestamp}}',
          preferences: {
            theme: 'dark',
            notifications: true,
            apiTier: 'Pro Plan',
          },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'mock-rule-2',
    name: 'Authentication OAuth Token Mock',
    enabled: true,
    type: 'mock_server',
    group: 'API Mock Endpoints',
    tags: ['auth', 'login', 'token'],
    matchUrl: '/api/mock/v1/auth/login',
    matchMethod: 'POST',
    hitCount: 112,
    action: {
      statusCode: 200,
      contentType: 'application/json',
      delayMs: 200,
      templateVariables: true,
      bodyReplace: JSON.stringify(
        {
          token_type: 'Bearer',
          access_token: 'reqable_jwt_{{$guid}}',
          expires_in: 3600,
          refresh_token: 'reqable_refresh_{{$guid}}',
          issued_at: '{{$timestamp}}',
        },
        null,
        2
      ),
    },
  },
  {
    id: 'mock-rule-3',
    name: 'E-Commerce Products Catalog List Mock',
    enabled: true,
    type: 'mock_server',
    group: 'API Mock Endpoints',
    tags: ['products', 'catalog', 'json'],
    matchUrl: '/api/mock/v1/products',
    matchMethod: 'GET',
    hitCount: 43,
    action: {
      statusCode: 200,
      contentType: 'application/json',
      delayMs: 100,
      templateVariables: true,
      bodyReplace: JSON.stringify(
        {
          total: 3,
          page: 1,
          limit: 10,
          data: [
            { id: 'prod-001', name: 'Reqable Pro Interceptor Key', price: 49.99, stock: 120 },
            { id: 'prod-002', name: 'High-Performance MITM Proxy Dongle', price: 89.00, stock: 45 },
            { id: 'prod-003', name: 'SSL Certificate Authority Token', price: 19.50, stock: 300 },
          ],
        },
        null,
        2
      ),
    },
  },
  {
    id: 'rule-1',
    name: 'Inject Debug Headers & Mock Key',
    enabled: true,
    type: 'rewrite',
    group: 'Debugging & Headers',
    tags: ['debug', 'headers', 'httpbin'],
    matchUrl: 'https://httpbin.org/*',
    matchMethod: 'ALL',
    hitCount: 142,
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
    group: 'Payment Services',
    tags: ['checkout', 'intercept'],
    matchUrl: '*/payment*',
    matchMethod: 'POST',
    hitCount: 89,
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
    group: 'User Identity Mocks',
    tags: ['user', 'profile', 'local-file'],
    matchUrl: '*/user/profile',
    matchMethod: 'GET',
    hitCount: 34,
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
    group: 'Network Throttling',
    tags: ['slow-3g', 'latency'],
    matchUrl: '*',
    matchMethod: 'ALL',
    hitCount: 12,
    action: {
      delayMs: 1500,
    },
  },
];
