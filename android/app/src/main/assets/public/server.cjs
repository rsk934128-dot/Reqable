var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/data/initialData.ts
var INITIAL_COLLECTIONS = [
  {
    id: "col-1",
    name: "Petstore & Auth API",
    description: "Sample e-commerce and identity endpoints for API testing",
    version: "v1.0.0",
    versions: [
      {
        id: "ver-col1-v100",
        version: "v1.0.0",
        name: "v1.0.0 (Stable)",
        description: "Legacy v1 stable API collection release",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        folders: [
          { id: "f-1", name: "Authentication" },
          { id: "f-1-1", name: "OAuth 2.0 & Tokens", parentId: "f-1" },
          { id: "f-2", name: "Users & Profile" },
          { id: "f-2-1", name: "Admin Operations", parentId: "f-2" },
          { id: "f-3", name: "Mock Payments" }
        ],
        requests: [
          {
            id: "req-1",
            name: "Login & Retrieve Token",
            method: "POST",
            url: "{{baseUrl}}/post",
            folderId: "f-1",
            headers: [
              { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
              { id: "h2", key: "User-Agent", value: "Reqable/3.2 (Macintosh; Apple Silicon)", enabled: true }
            ],
            params: [],
            bodyType: "json",
            body: JSON.stringify({ username: "demo_developer", password: "secretPassword123!" }, null, 2),
            auth: { type: "none" },
            testScript: `// Reqable Automated Assertions
pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Response contains json body", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("json");
});`,
            jsonSchema: JSON.stringify(
              {
                $schema: "http://json-schema.org/draft-07/schema#",
                title: "LoginResponseSchema",
                type: "object",
                required: ["json", "url"],
                properties: {
                  json: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                      username: { type: "string", minLength: 3 },
                      password: { type: "string", minLength: 8 }
                    }
                  },
                  url: { type: "string", format: "uri" }
                }
              },
              null,
              2
            ),
            schemaValidationEnabled: true
          },
          {
            id: "req-2",
            name: "Get Current User Profile",
            method: "GET",
            url: "{{baseUrl}}/get?userId=10928&role=admin",
            folderId: "f-2",
            headers: [
              { id: "h3", key: "Authorization", value: "Bearer {{authToken}}", enabled: true },
              { id: "h4", key: "Accept", value: "application/json", enabled: true }
            ],
            params: [
              { id: "p1", key: "userId", value: "10928", enabled: true },
              { id: "p2", key: "role", value: "admin", enabled: true }
            ],
            bodyType: "none",
            body: "",
            auth: { type: "bearer", token: "{{authToken}}" },
            testScript: `pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});`,
            jsonSchema: JSON.stringify(
              {
                $schema: "http://json-schema.org/draft-07/schema#",
                title: "UserProfileResponseSchema",
                type: "object",
                required: ["args", "headers", "url"],
                properties: {
                  args: {
                    type: "object",
                    required: ["userId", "role"],
                    properties: {
                      userId: { type: "string", pattern: "^\\d+$" },
                      role: { type: "string", enum: ["admin", "moderator", "member"] }
                    }
                  },
                  url: { type: "string", format: "uri" }
                }
              },
              null,
              2
            ),
            schemaValidationEnabled: true
          }
        ]
      },
      {
        id: "ver-col1-v200",
        version: "v2.0.0-beta",
        name: "v2.0.0 (Beta Next-Gen)",
        description: "Next-generation v2 GraphQL & REST endpoint specs",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        folders: [
          { id: "f-v2-1", name: "v2 Identity & MFA" },
          { id: "f-v2-2", name: "v2 Billing & Webhooks" }
        ],
        requests: [
          {
            id: "req-v2-1",
            name: "v2 OAuth 2.1 Passwordless Login",
            method: "POST",
            url: "{{baseUrl}}/post?api_version=v2",
            folderId: "f-v2-1",
            headers: [
              { id: "h-v2-1", key: "X-API-Version", value: "v2.0.0-beta", enabled: true },
              { id: "h-v2-2", key: "Content-Type", value: "application/json", enabled: true }
            ],
            params: [{ id: "p-v2-1", key: "api_version", value: "v2", enabled: true }],
            bodyType: "json",
            body: JSON.stringify({ email: "user@example.com", mfaCode: "987654" }, null, 2),
            auth: { type: "none" }
          },
          {
            id: "req-v2-2",
            name: "v2 Stream Payment Webhooks",
            method: "POST",
            url: "{{baseUrl}}/post?stream=true",
            folderId: "f-v2-2",
            headers: [
              { id: "h-v2-3", key: "X-Webhook-Signature", value: "sha256=abc123xyz", enabled: true }
            ],
            params: [],
            bodyType: "json",
            body: JSON.stringify({ event: "payment.succeeded", amount: 4900, currency: "USD" }, null, 2),
            auth: { type: "none" }
          }
        ]
      }
    ],
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    variables: [
      { id: "v1", key: "baseUrl", value: "https://httpbin.org", enabled: true },
      { id: "v2", key: "authToken", value: "bearer-xyz-123456789", enabled: true, isSecret: true }
    ],
    folders: [
      { id: "f-1", name: "Authentication" },
      { id: "f-1-1", name: "OAuth 2.0 & Tokens", parentId: "f-1" },
      { id: "f-2", name: "Users & Profile" },
      { id: "f-2-1", name: "Admin Operations", parentId: "f-2" },
      { id: "f-3", name: "Mock Payments" }
    ],
    requests: [
      {
        id: "req-1",
        name: "Login & Retrieve Token",
        method: "POST",
        url: "{{baseUrl}}/post",
        folderId: "f-1",
        headers: [
          { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
          { id: "h2", key: "User-Agent", value: "Reqable/3.2 (Macintosh; Apple Silicon)", enabled: true }
        ],
        params: [],
        bodyType: "json",
        body: JSON.stringify({ username: "demo_developer", password: "secretPassword123!" }, null, 2),
        auth: { type: "none" },
        testScript: `// Reqable Automated Assertions
pm.test("Status code is 200 OK", function () {
  pm.response.to.have.status(200);
});
pm.test("Response contains json body", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("json");
});`
      },
      {
        id: "req-1-sub",
        name: "Refresh OAuth Access Token",
        method: "POST",
        url: "{{baseUrl}}/post",
        folderId: "f-1-1",
        headers: [
          { id: "h1sub", key: "Content-Type", value: "application/json", enabled: true }
        ],
        params: [],
        bodyType: "json",
        body: JSON.stringify({ grant_type: "refresh_token", refresh_token: "ref_abc_987654321" }, null, 2),
        auth: { type: "none" }
      },
      {
        id: "req-2",
        name: "Get Current User Profile",
        method: "GET",
        url: "{{baseUrl}}/get?userId=10928&role=admin",
        folderId: "f-2",
        headers: [
          { id: "h3", key: "Authorization", value: "Bearer {{authToken}}", enabled: true },
          { id: "h4", key: "Accept", value: "application/json", enabled: true }
        ],
        params: [
          { id: "p1", key: "userId", value: "10928", enabled: true },
          { id: "p2", key: "role", value: "admin", enabled: true }
        ],
        bodyType: "none",
        body: "",
        auth: { type: "bearer", token: "{{authToken}}" },
        testScript: `pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});`
      },
      {
        id: "req-2-admin",
        name: "Audit User Security Logs",
        method: "GET",
        url: "{{baseUrl}}/get?action=security_audit",
        folderId: "f-2-1",
        headers: [
          { id: "h3admin", key: "Authorization", value: "Bearer {{authToken}}", enabled: true }
        ],
        params: [
          { id: "p2admin", key: "action", value: "security_audit", enabled: true }
        ],
        bodyType: "none",
        body: "",
        auth: { type: "bearer", token: "{{authToken}}" }
      },
      {
        id: "req-3",
        name: "Simulate Payment Processing",
        method: "POST",
        url: "{{baseUrl}}/status/200",
        folderId: "f-3",
        headers: [
          { id: "h5", key: "Content-Type", value: "application/json", enabled: true },
          { id: "h6", key: "X-Idempotency-Key", value: "idem_9921_abc8", enabled: true }
        ],
        params: [],
        bodyType: "json",
        body: JSON.stringify({ amount: 49.99, currency: "USD", cardToken: "tok_visa_4242" }, null, 2),
        auth: { type: "none" }
      }
    ]
  },
  {
    id: "col-2",
    name: "Reqable System & MCP Tools",
    description: "Internal debugging & Model Context Protocol validation suite",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    variables: [
      { id: "v3", key: "mcpHost", value: "http://localhost:3000", enabled: true }
    ],
    folders: [
      { id: "f-4", name: "MCP Diagnostics" }
    ],
    requests: [
      {
        id: "req-4",
        name: "List Available MCP Tools",
        method: "GET",
        url: "{{mcpHost}}/api/mcp/tools",
        folderId: "f-4",
        headers: [
          { id: "h7", key: "Accept", value: "application/json", enabled: true }
        ],
        params: [],
        bodyType: "none",
        body: "",
        auth: { type: "none" }
      }
    ]
  }
];
var INITIAL_ENVIRONMENTS = [
  {
    id: "env-prod",
    name: "Production Environment",
    variables: [
      { id: "ev1", key: "baseUrl", value: "https://httpbin.org", enabled: true },
      { id: "ev2", key: "apiKey", value: "req_live_8f3a9d21c0b", enabled: true, isSecret: true },
      { id: "ev3", key: "timeout", value: "5000", enabled: true }
    ]
  },
  {
    id: "env-staging",
    name: "Staging & Sandbox",
    variables: [
      { id: "ev4", key: "baseUrl", value: "https://httpbin.org", enabled: true },
      { id: "ev5", key: "apiKey", value: "req_sandbox_testKey123", enabled: true, isSecret: true },
      { id: "ev6", key: "timeout", value: "10000", enabled: true }
    ]
  }
];
var INITIAL_TRAFFIC = [
  {
    id: "tf-101",
    timestamp: new Date(Date.now() - 12e4).toLocaleTimeString(),
    method: "GET",
    url: "https://api.github.com/repos/reqable/reqable-app",
    protocol: "HTTP/2.0",
    requestHeaders: {
      "Host": "api.github.com",
      "User-Agent": "Reqable/3.2 (macOS M5 Apple Silicon)",
      "Accept": "application/vnd.github.v3+json",
      "Accept-Encoding": "gzip, deflate, br"
    },
    requestBody: "",
    responseStatus: 200,
    responseHeaders: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60",
      "x-ratelimit-limit": "60",
      "x-ratelimit-remaining": "58",
      "server": "GitHub.com"
    },
    responseBody: JSON.stringify(
      {
        id: 481920192,
        name: "reqable-app",
        full_name: "reqable/reqable-app",
        private: false,
        stargazers_count: 6600,
        forks_count: 261,
        open_issues_count: 776,
        description: "Reqable issue tracking, feedback, release notes, and MCP server documentation.",
        license: { key: "mit", name: "MIT License" },
        html_url: "https://github.com/reqable/reqable-app"
      },
      null,
      2
    ),
    durationMs: 142,
    sizeBytes: 1248,
    clientIp: "127.0.0.1:58210",
    status: "captured",
    timingBreakdown: { dns: 12, tcp: 24, tls: 38, ttfb: 58, download: 10, total: 142 }
  },
  {
    id: "tf-102",
    timestamp: new Date(Date.now() - 9e4).toLocaleTimeString(),
    method: "POST",
    url: "https://api.reqable.com/v1/auth/login",
    protocol: "HTTP/1.1",
    requestHeaders: {
      "Host": "api.reqable.com",
      "Content-Type": "application/json",
      "User-Agent": "Reqable Mobile/3.2 (Android 14)"
    },
    requestBody: JSON.stringify({ email: "developer@reqable.com", device: "MacBook Pro M5" }, null, 2),
    responseStatus: 200,
    responseHeaders: {
      "content-type": "application/json",
      "set-cookie": "session=reqable_sess_9921827a; Secure; HttpOnly",
      "x-reqable-engine": "Flutter C++ core v3.2"
    },
    responseBody: JSON.stringify(
      {
        success: true,
        user: { id: "usr_8819", email: "developer@reqable.com", tier: "Community" },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        expiresIn: 86400
      },
      null,
      2
    ),
    durationMs: 88,
    sizeBytes: 520,
    clientIp: "192.168.1.105:61102",
    status: "captured",
    timingBreakdown: { dns: 8, tcp: 15, tls: 22, ttfb: 35, download: 8, total: 88 }
  },
  {
    id: "tf-103",
    timestamp: new Date(Date.now() - 45e3).toLocaleTimeString(),
    method: "POST",
    url: "https://httpbin.org/status/500",
    protocol: "HTTP/1.1",
    requestHeaders: {
      "Host": "httpbin.org",
      "Content-Type": "application/json",
      "X-Requested-With": "Reqable Client"
    },
    requestBody: JSON.stringify({ triggerError: true }),
    responseStatus: 500,
    responseHeaders: {
      "content-type": "text/html; charset=utf-8",
      "server": "gunicorn/19.9.0"
    },
    responseBody: "500 Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.",
    durationMs: 310,
    sizeBytes: 150,
    clientIp: "127.0.0.1:58430",
    status: "captured",
    timingBreakdown: { dns: 20, tcp: 45, tls: 85, ttfb: 150, download: 10, total: 310 }
  },
  {
    id: "tf-104",
    timestamp: new Date(Date.now() - 15e3).toLocaleTimeString(),
    method: "GET",
    url: "https://httpbin.org/get?mock=active",
    protocol: "HTTP/1.1",
    requestHeaders: {
      "Host": "httpbin.org",
      "User-Agent": "Reqable Interceptor",
      "X-Rewrite-Engine": "Active"
    },
    requestBody: "",
    responseStatus: 200,
    responseHeaders: {
      "content-type": "application/json",
      "x-reqable-modified": "true",
      "x-mock-rule": "Rule #1 - Inject Debug Headers"
    },
    responseBody: JSON.stringify(
      {
        args: { mock: "active" },
        headers: { Host: "httpbin.org", "X-Reqable-Interception": "MITM Active" },
        origin: "127.0.0.1",
        url: "https://httpbin.org/get?mock=active",
        reqableNotice: "This request was modified by Reqable Rewrite Rule"
      },
      null,
      2
    ),
    durationMs: 42,
    sizeBytes: 310,
    clientIp: "127.0.0.1:58990",
    status: "modified",
    ruleApplied: "Rule #1 - Inject Debug Headers",
    timingBreakdown: { dns: 2, tcp: 5, tls: 10, ttfb: 22, download: 3, total: 42 }
  }
];
var INITIAL_RULES = [
  {
    id: "mock-rule-1",
    name: "User Profile API Mock Endpoint",
    enabled: true,
    type: "mock_server",
    group: "API Mock Endpoints",
    tags: ["users", "mock-server", "v1"],
    matchUrl: "/api/mock/v1/users/*",
    matchMethod: "GET",
    hitCount: 58,
    action: {
      statusCode: 200,
      contentType: "application/json",
      delayMs: 150,
      templateVariables: true,
      headersToAdd: [
        { id: "m1", key: "X-Mock-Server", value: "Reqable-Engine/3.2", enabled: true },
        { id: "m2", key: "Cache-Control", value: "no-cache", enabled: true }
      ],
      bodyReplace: JSON.stringify(
        {
          id: "{{$guid}}",
          name: "{{$randomName}}",
          email: "{{$randomEmail}}",
          role: "Senior Software Engineer",
          status: "ACTIVE",
          accountCreated: "{{$timestamp}}",
          preferences: {
            theme: "dark",
            notifications: true,
            apiTier: "Pro Plan"
          }
        },
        null,
        2
      )
    }
  },
  {
    id: "mock-rule-2",
    name: "Authentication OAuth Token Mock",
    enabled: true,
    type: "mock_server",
    group: "API Mock Endpoints",
    tags: ["auth", "login", "token"],
    matchUrl: "/api/mock/v1/auth/login",
    matchMethod: "POST",
    hitCount: 112,
    action: {
      statusCode: 200,
      contentType: "application/json",
      delayMs: 200,
      templateVariables: true,
      bodyReplace: JSON.stringify(
        {
          token_type: "Bearer",
          access_token: "reqable_jwt_{{$guid}}",
          expires_in: 3600,
          refresh_token: "reqable_refresh_{{$guid}}",
          issued_at: "{{$timestamp}}"
        },
        null,
        2
      )
    }
  },
  {
    id: "mock-rule-3",
    name: "E-Commerce Products Catalog List Mock",
    enabled: true,
    type: "mock_server",
    group: "API Mock Endpoints",
    tags: ["products", "catalog", "json"],
    matchUrl: "/api/mock/v1/products",
    matchMethod: "GET",
    hitCount: 43,
    action: {
      statusCode: 200,
      contentType: "application/json",
      delayMs: 100,
      templateVariables: true,
      bodyReplace: JSON.stringify(
        {
          total: 3,
          page: 1,
          limit: 10,
          data: [
            { id: "prod-001", name: "Reqable Pro Interceptor Key", price: 49.99, stock: 120 },
            { id: "prod-002", name: "High-Performance MITM Proxy Dongle", price: 89, stock: 45 },
            { id: "prod-003", name: "SSL Certificate Authority Token", price: 19.5, stock: 300 }
          ]
        },
        null,
        2
      )
    }
  },
  {
    id: "rule-1",
    name: "Inject Debug Headers & Mock Key",
    enabled: true,
    type: "rewrite",
    group: "Debugging & Headers",
    tags: ["debug", "headers", "httpbin"],
    matchUrl: "https://httpbin.org/*",
    matchMethod: "ALL",
    hitCount: 142,
    action: {
      targetField: "headers",
      headersToAdd: [
        { id: "rh1", key: "X-Reqable-Debug", value: "Enabled", enabled: true },
        { id: "rh2", key: "X-Mock-Engine", value: "Reqable-C++", enabled: true }
      ]
    }
  },
  {
    id: "rule-2",
    name: "Breakpoint on Payment Checkout",
    enabled: true,
    type: "breakpoint",
    group: "Payment Services",
    tags: ["checkout", "intercept"],
    matchUrl: "*/payment*",
    matchMethod: "POST",
    hitCount: 89,
    action: {
      statusCode: 200,
      bodyReplace: JSON.stringify({ status: "INTERCEPTED_PAUSED", message: "Paused by Reqable Breakpoint" })
    }
  },
  {
    id: "rule-3",
    name: "Map Local User Profile Mock",
    enabled: false,
    type: "map_local",
    group: "User Identity Mocks",
    tags: ["user", "profile", "local-file"],
    matchUrl: "*/user/profile",
    matchMethod: "GET",
    hitCount: 34,
    action: {
      statusCode: 200,
      mapLocalFile: "user_profile_mock.json",
      bodyReplace: JSON.stringify({ id: "usr_mock_99", name: "Reqable Developer", status: "VIP Gold" }, null, 2)
    }
  },
  {
    id: "rule-4",
    name: "Simulate 3G Network Delay (1500ms)",
    enabled: false,
    type: "delay",
    group: "Network Throttling",
    tags: ["slow-3g", "latency"],
    matchUrl: "*",
    matchMethod: "ALL",
    hitCount: 12,
    action: {
      delayMs: 1500
    }
  }
];

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)({ origin: true, credentials: true }));
app.use((0, import_cookie_parser.default)());
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
var trafficStore = [...INITIAL_TRAFFIC];
var rulesStore = [...INITIAL_RULES];
var collectionsStore = [...INITIAL_COLLECTIONS];
var environmentsStore = [...INITIAL_ENVIRONMENTS];
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new import_genai.GoogleGenAI({ apiKey });
}
function renderMockTemplate(templateStr, reqInfo) {
  if (!templateStr) return templateStr;
  let result = templateStr;
  result = result.replace(
    /\{\{\$guid\}\}/g,
    () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    })
  );
  result = result.replace(/\{\{\$timestamp\}\}/g, () => (/* @__PURE__ */ new Date()).toISOString());
  result = result.replace(/\{\{\$isoDate\}\}/g, () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  result = result.replace(/\{\{\$randomInt\}\}/g, () => Math.floor(Math.random() * 1e3).toString());
  result = result.replace(/\{\{\$randomPrice\}\}/g, () => (Math.random() * 100 + 5).toFixed(2));
  const names = ["Alex Johnson", "Samantha Smith", "David Chen", "Maria Garcia", "Liam Wilson", "Elena Rostova"];
  result = result.replace(/\{\{\$randomName\}\}/g, () => names[Math.floor(Math.random() * names.length)]);
  const emails = ["alex@example.com", "samantha@test.org", "david.chen@dev.io", "m.garcia@company.com"];
  result = result.replace(/\{\{\$randomEmail\}\}/g, () => emails[Math.floor(Math.random() * emails.length)]);
  if (reqInfo?.query) {
    Object.entries(reqInfo.query).forEach(([k, v]) => {
      const reg = new RegExp(`\\{\\{\\$request\\.query\\.${k}\\}\\}`, "g");
      result = result.replace(reg, String(v));
    });
  }
  return result;
}
function applyRules(url, method, reqHeaders, reqBody) {
  let matchedRule = null;
  let modifiedHeaders = { ...reqHeaders };
  let modifiedBody = reqBody;
  let injectedStatus = null;
  let delayMs = 0;
  for (const rule of rulesStore) {
    if (!rule.enabled) continue;
    let isMatch = false;
    if (rule.matchUrl === "*" || rule.matchUrl === "ALL") {
      isMatch = true;
    } else if (rule.matchUrl.includes("*")) {
      const regexStr = "^" + rule.matchUrl.replace(/\*/g, ".*") + "$";
      isMatch = new RegExp(regexStr, "i").test(url);
    } else {
      isMatch = url.toLowerCase().includes(rule.matchUrl.toLowerCase());
    }
    if (rule.matchMethod && rule.matchMethod !== "ALL") {
      if (rule.matchMethod.toLowerCase() !== method.toLowerCase()) {
        isMatch = false;
      }
    }
    if (isMatch) {
      matchedRule = rule;
      rule.hitCount = (rule.hitCount || 0) + 1;
      if (rule.type === "rewrite") {
        if (rule.action.headersToAdd) {
          rule.action.headersToAdd.forEach((h) => {
            if (h.enabled) modifiedHeaders[h.key] = h.value;
          });
        }
      } else if (rule.type === "breakpoint") {
        if (rule.action.statusCode) injectedStatus = rule.action.statusCode;
        if (rule.action.bodyReplace) modifiedBody = rule.action.bodyReplace;
      } else if (rule.type === "map_local" || rule.type === "mock_server") {
        injectedStatus = rule.action.statusCode || 200;
        if (rule.action.bodyReplace) {
          modifiedBody = renderMockTemplate(rule.action.bodyReplace, { url, method, headers: reqHeaders });
        }
      } else if (rule.type === "delay") {
        delayMs = rule.action.delayMs || 500;
      }
    }
  }
  return { matchedRule, modifiedHeaders, modifiedBody, injectedStatus, delayMs };
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Reqable Web Platform",
    version: "3.2.22",
    engine: "Flutter C++ High Performance Traffic Core",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    googleAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID)
  });
});
app.post("/api/proxy", async (req, res) => {
  const startTime = Date.now();
  const { url, method = "GET", headers = {}, body = "", timeout = 1e4 } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }
  try {
    const reqHeadersObj = {};
    if (Array.isArray(headers)) {
      headers.forEach((h) => {
        if (h.enabled !== false && h.key) reqHeadersObj[h.key] = h.value;
      });
    } else if (typeof headers === "object") {
      Object.assign(reqHeadersObj, headers);
    }
    const { matchedRule, modifiedHeaders, modifiedBody, injectedStatus, delayMs } = applyRules(
      url,
      method,
      reqHeadersObj,
      typeof body === "string" ? body : JSON.stringify(body)
    );
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 5e3)));
    }
    let responseStatus = 200;
    let responseStatusText = "OK";
    let responseHeadersObj = {};
    let responseBodyText = "";
    if (injectedStatus) {
      responseStatus = injectedStatus;
      responseStatusText = injectedStatus === 200 ? "OK (Mocked)" : "Mocked Response";
      responseHeadersObj = {
        "content-type": "application/json",
        "x-reqable-interceptor": "Map Local / Breakpoint Rule Applied"
      };
      responseBodyText = modifiedBody || JSON.stringify({ message: "Mock response generated by Reqable rule" });
    } else {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const fetchOptions = {
        method,
        headers: modifiedHeaders,
        signal: controller.signal
      };
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) && modifiedBody) {
        fetchOptions.body = modifiedBody;
      }
      const proxyResponse = await fetch(url, fetchOptions);
      clearTimeout(id);
      responseStatus = proxyResponse.status;
      responseStatusText = proxyResponse.statusText || "OK";
      proxyResponse.headers.forEach((value, key) => {
        responseHeadersObj[key] = value;
      });
      responseBodyText = await proxyResponse.text();
    }
    const durationMs = Date.now() - startTime;
    const dnsMs = Math.round(durationMs * 0.1);
    const tcpMs = Math.round(durationMs * 0.2);
    const tlsMs = Math.round(durationMs * 0.25);
    const ttfbMs = Math.round(durationMs * 0.35);
    const downloadMs = Math.max(1, durationMs - (dnsMs + tcpMs + tlsMs + ttfbMs));
    const responseData = {
      status: responseStatus,
      statusText: responseStatusText,
      headers: responseHeadersObj,
      body: responseBodyText,
      sizeBytes: Buffer.byteLength(responseBodyText, "utf8"),
      timeMs: durationMs,
      timings: {
        dns: dnsMs,
        tcp: tcpMs,
        tls: tlsMs,
        ttfb: ttfbMs,
        download: downloadMs,
        total: durationMs
      },
      contentType: responseHeadersObj["content-type"] || "text/plain",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const newTrafficItem = {
      id: `tf-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      method: method.toUpperCase(),
      url,
      protocol: url.startsWith("https") ? "HTTP/2.0" : "HTTP/1.1",
      requestHeaders: modifiedHeaders,
      requestBody: modifiedBody,
      responseStatus,
      responseHeaders: responseHeadersObj,
      responseBody: responseBodyText,
      durationMs,
      sizeBytes: responseData.sizeBytes,
      clientIp: "127.0.0.1:" + Math.floor(5e4 + Math.random() * 1e4),
      status: matchedRule ? "modified" : "captured",
      ruleApplied: matchedRule ? matchedRule.name : void 0,
      timingBreakdown: responseData.timings
    };
    trafficStore.unshift(newTrafficItem);
    if (trafficStore.length > 100) trafficStore.pop();
    return res.json(responseData);
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : "Failed to proxy request";
    return res.status(502).json({
      error: errorMsg,
      status: 502,
      statusText: "Bad Gateway / Connection Error",
      body: JSON.stringify({ error: errorMsg, hint: "Check target URL reachability or CORS settings" }),
      timeMs: durationMs
    });
  }
});
app.get("/api/traffic", (req, res) => {
  res.json({ traffic: trafficStore });
});
app.post("/api/traffic/sync", (req, res) => {
  if (Array.isArray(req.body.traffic)) {
    trafficStore = req.body.traffic;
  }
  res.json({ success: true, count: trafficStore.length });
});
app.delete("/api/traffic", (req, res) => {
  trafficStore = [];
  res.json({ success: true, message: "Traffic log cleared" });
});
app.get("/api/rules", (req, res) => {
  res.json({ rules: rulesStore });
});
app.post("/api/rules", (req, res) => {
  const newRule = {
    id: `rule-${Date.now()}`,
    name: req.body.name || "Custom Rule",
    enabled: req.body.enabled !== false,
    type: req.body.type || "rewrite",
    matchUrl: req.body.matchUrl || "*",
    matchMethod: req.body.matchMethod || "ALL",
    action: req.body.action || {}
  };
  rulesStore.unshift(newRule);
  res.json({ success: true, rule: newRule });
});
app.put("/api/rules/:id", (req, res) => {
  const { id } = req.params;
  const index = rulesStore.findIndex((r) => r.id === id);
  if (index !== -1) {
    rulesStore[index] = { ...rulesStore[index], ...req.body };
    return res.json({ success: true, rule: rulesStore[index] });
  }
  res.status(404).json({ error: "Rule not found" });
});
app.delete("/api/rules/:id", (req, res) => {
  rulesStore = rulesStore.filter((r) => r.id !== req.params.id);
  res.json({ success: true });
});
app.all("/api/mock/*", async (req, res) => {
  const mockPath = req.params[0] || "";
  const fullMockUrl = `/api/mock/${mockPath}`;
  const method = req.method.toUpperCase();
  const queryMap = {};
  if (req.query) {
    Object.entries(req.query).forEach(([k, v]) => {
      queryMap[k] = String(v);
    });
  }
  let matchedRule = null;
  for (const rule of rulesStore) {
    if (!rule.enabled) continue;
    let isMatch = false;
    const rulePattern = (rule.matchUrl || "").trim();
    if (rulePattern === "*" || rulePattern === "ALL") {
      isMatch = true;
    } else if (rulePattern.includes("*")) {
      const regexStr = "^" + rulePattern.replace(/\*/g, ".*") + "$";
      isMatch = new RegExp(regexStr, "i").test(fullMockUrl) || new RegExp(regexStr, "i").test(mockPath) || new RegExp(regexStr, "i").test("/" + mockPath);
    } else {
      const cleanPattern = rulePattern.toLowerCase();
      isMatch = fullMockUrl.toLowerCase().includes(cleanPattern) || mockPath.toLowerCase().includes(cleanPattern) || `/${mockPath}`.toLowerCase().includes(cleanPattern);
    }
    if (rule.matchMethod && rule.matchMethod !== "ALL") {
      if (rule.matchMethod.toUpperCase() !== method) {
        isMatch = false;
      }
    }
    if (isMatch) {
      matchedRule = rule;
      break;
    }
  }
  if (matchedRule) {
    matchedRule.hitCount = (matchedRule.hitCount || 0) + 1;
    const delayMs = matchedRule.action?.delayMs || 0;
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 5e3)));
    }
    if (matchedRule.action?.failureRate && Math.random() * 100 < matchedRule.action.failureRate) {
      return res.status(500).json({
        error: "Simulated Random Chaos Failure",
        ruleApplied: matchedRule.name,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const statusCode = matchedRule.action?.statusCode || 200;
    const contentType = matchedRule.action?.contentType || "application/json";
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Reqable-Mock-Server", "true");
    res.setHeader("X-Reqable-Rule-Id", matchedRule.id);
    if (matchedRule.action?.headersToAdd) {
      matchedRule.action.headersToAdd.forEach((h) => {
        if (h.enabled && h.key) res.setHeader(h.key, h.value);
      });
    }
    const rawBody = matchedRule.action?.bodyReplace || '{\n  "status": "success",\n  "message": "Mock response from Reqable Server"\n}';
    const renderedBody = renderMockTemplate(rawBody, {
      url: fullMockUrl,
      method,
      query: queryMap,
      headers: req.headers
    });
    const newTrafficItem = {
      id: `tf-mock-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      method,
      url: `${req.protocol}://${req.get("host") || "localhost:3000"}${fullMockUrl}`,
      protocol: "HTTP/1.1 (Mock)",
      requestHeaders: req.headers,
      requestBody: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
      responseStatus: statusCode,
      responseHeaders: { "content-type": contentType, "x-reqable-mock-server": "true" },
      responseBody: renderedBody,
      durationMs: delayMs + 12,
      sizeBytes: Buffer.byteLength(renderedBody, "utf8"),
      clientIp: req.ip || "127.0.0.1",
      status: "modified",
      ruleApplied: matchedRule.name,
      timingBreakdown: {
        dns: 1,
        tcp: 2,
        tls: 0,
        ttfb: delayMs + 5,
        download: 4,
        total: delayMs + 12
      }
    };
    trafficStore.unshift(newTrafficItem);
    if (trafficStore.length > 100) trafficStore.pop();
    res.status(statusCode);
    if (contentType.includes("json")) {
      try {
        const parsed = JSON.parse(renderedBody);
        return res.json(parsed);
      } catch {
        return res.send(renderedBody);
      }
    }
    return res.send(renderedBody);
  }
  return res.status(404).json({
    error: "No matching Mock Server rule configured in Reqable",
    requestedPath: fullMockUrl,
    method,
    hint: 'Open the "Rules Engine" tab and create a Mock Server rule matching this endpoint pattern.'
  });
});
app.get("/api/mcp/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "reqable_list_traffic",
        description: "Retrieves recently intercepted API traffic logs filtered by domain or status code.",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "Domain name filter (e.g. github.com)" },
            status: { type: "number", description: "HTTP status code filter (e.g. 500)" },
            limit: { type: "number", description: "Maximum number of items to return (default 10)" }
          }
        }
      },
      {
        name: "reqable_get_traffic_detail",
        description: "Gets full request and response payloads, headers, and timings for a specific traffic ID.",
        inputSchema: {
          type: "object",
          properties: { id: { type: "string", description: "Traffic log ID" } },
          required: ["id"]
        }
      },
      {
        name: "reqable_execute_request",
        description: "Sends an HTTP request through Reqable proxy engine.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
            method: { type: "string" },
            headers: { type: "object" },
            body: { type: "string" }
          },
          required: ["url"]
        }
      },
      {
        name: "reqable_create_rule",
        description: "Creates a breakpoint or rewrite rule in Reqable MITM engine.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["breakpoint", "rewrite", "map_local", "delay"] },
            matchUrl: { type: "string" },
            action: { type: "object" }
          },
          required: ["name", "matchUrl", "type"]
        }
      },
      {
        name: "reqable_generate_assertions",
        description: "Generates automated test assertions for a given response JSON using AI.",
        inputSchema: {
          type: "object",
          properties: { responseBody: { type: "string" } },
          required: ["responseBody"]
        }
      }
    ]
  });
});
app.post("/api/mcp/execute", async (req, res) => {
  const { tool, arguments: args = {} } = req.body;
  if (tool === "reqable_list_traffic") {
    let result = [...trafficStore];
    if (args.domain) {
      result = result.filter((t) => t.url.toLowerCase().includes(args.domain.toLowerCase()));
    }
    if (args.status) {
      result = result.filter((t) => t.responseStatus === Number(args.status));
    }
    const limit = Number(args.limit) || 10;
    return res.json({ result: result.slice(0, limit) });
  }
  if (tool === "reqable_get_traffic_detail") {
    const item = trafficStore.find((t) => t.id === args.id);
    if (!item) return res.status(404).json({ error: "Traffic record not found" });
    return res.json({ result: item });
  }
  if (tool === "reqable_create_rule") {
    const newRule = {
      id: `rule-${Date.now()}`,
      name: args.name,
      enabled: true,
      type: args.type,
      matchUrl: args.matchUrl,
      action: args.action || {}
    };
    rulesStore.unshift(newRule);
    return res.json({ result: { success: true, rule: newRule } });
  }
  return res.status(400).json({ error: `Unknown MCP tool: ${tool}` });
});
app.post("/api/ai/analyze", async (req, res) => {
  const { trafficItem, question } = req.body;
  const genAI = getGenAIClient();
  if (!genAI) {
    return res.json({
      analysis: "AI key is not configured yet. Set `GEMINI_API_KEY` in secrets to unlock automated traffic diagnostics, security auditing, and rule synthesis.",
      insights: [
        "Inspected status code: " + (trafficItem?.responseStatus || "N/A"),
        "Duration: " + (trafficItem?.durationMs || 0) + "ms",
        "Payload size: " + (trafficItem?.sizeBytes || 0) + " bytes"
      ]
    });
  }
  try {
    const prompt = `You are Reqable's AI Copilot, an expert API debugging & security assistant.
Analyze this API traffic item:
Method: ${trafficItem.method}
URL: ${trafficItem.url}
Status Code: ${trafficItem.responseStatus}
Duration: ${trafficItem.durationMs}ms
Request Headers: ${JSON.stringify(trafficItem.requestHeaders)}
Request Body: ${trafficItem.requestBody}
Response Headers: ${JSON.stringify(trafficItem.responseHeaders)}
Response Body: ${trafficItem.responseBody.substring(0, 1500)}

User Query/Context: ${question || "Analyze this request for errors, performance bottlenecks, and security header best practices."}

Provide a concise, practical breakdown with:
1. Quick Status Diagnosis
2. Performance & Timing Analysis
3. Security & Header Recommendations
4. Suggested Mock / Test Rule (if relevant)`;
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return res.json({ analysis: response.text });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "AI generation error";
    return res.status(500).json({ error: errorMsg });
  }
});
app.post("/api/ai/generate-tests", async (req, res) => {
  const { responseBody, statusCode = 200 } = req.body;
  const genAI = getGenAIClient();
  if (!genAI) {
    return res.json({
      testScript: `// Default test assertions (Gemini API key not active)
pm.test("Status code is ${statusCode}", function () {
  pm.response.to.have.status(${statusCode});
});
pm.test("Response time is less than 500ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});`
    });
  }
  try {
    const prompt = `Write postman-style PM test script assertions (e.g. pm.test(...)) for the following JSON response:
Status: ${statusCode}
Body:
${typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody, null, 2)}

Return ONLY executable JavaScript test lines, formatted with clear pm.test checks for status code, properties, data types, and non-empty checks.`;
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return res.json({ testScript: response.text });
  } catch (err) {
    return res.json({
      testScript: `pm.test("Status code is ${statusCode}", function () {
  pm.response.to.have.status(${statusCode});
});`
    });
  }
});
app.get("/api/drive/auth-url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || "dummy_client_id";
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const redirectUri = `${appUrl}/api/drive/callback`;
  const scopes = encodeURIComponent("https://www.googleapis.com/auth/drive.file");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
  return res.json({
    authUrl,
    isConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    redirectUri
  });
});
app.get("/api/drive/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Authorization code missing");
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const redirectUri = `${appUrl}/api/drive/callback`;
  if (!clientId || !clientSecret) {
    res.cookie("gdrive_token", "mock_gdrive_access_token_" + Date.now(), { httpOnly: true, maxAge: 36e5 });
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>Google Drive Connected Successfully!</h2>
          <p>You can close this window and return to Reqable.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GDRIVE_AUTH_SUCCESS' }, '*');
            }
            setTimeout(() => window.close(), 1500);
          </script>
        </body>
      </html>
    `);
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.access_token) {
      res.cookie("gdrive_token", tokenData.access_token, { httpOnly: true, maxAge: 36e5 });
    }
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2 style="color: #10b981;">Google Drive Connected!</h2>
          <p>Reqable Google Drive synchronization is now active.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GDRIVE_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
            }
            setTimeout(() => window.close(), 1500);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "OAuth exchange failed";
    return res.status(500).send(`OAuth Error: ${msg}`);
  }
});
app.get("/api/drive/status", (req, res) => {
  const token = req.cookies.gdrive_token || req.headers.authorization?.replace("Bearer ", "");
  res.json({
    connected: Boolean(token),
    hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID)
  });
});
app.post("/api/drive/upload", async (req, res) => {
  const token = req.cookies.gdrive_token || req.headers.authorization?.replace("Bearer ", "");
  const backupData = {
    app: "Reqable",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "3.2.22",
    collections: collectionsStore,
    environments: environmentsStore,
    rules: rulesStore,
    trafficSample: trafficStore.slice(0, 20)
  };
  if (!token) {
    return res.status(401).json({
      error: "Not authenticated with Google Drive",
      backupJson: backupData
      // allow local JSON export download as fallback
    });
  }
  try {
    const fileMetadata = {
      name: `reqable_backup_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
      mimeType: "application/json"
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(fileMetadata)], { type: "application/json" }));
    form.append("file", new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" }));
    const driveRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    const result = await driveRes.json();
    return res.json({ success: true, driveFile: result });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Drive upload failed" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Reqable server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
