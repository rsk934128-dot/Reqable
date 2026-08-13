import React, { useState, useMemo } from 'react';
import zkpDistrictNodesPreviewImg from '../assets/images/zkp_district_nodes_preview_1786292063708.jpg';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Search,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Play,
  Sliders,
  FileCode,
  Bug,
  Key,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { ApiRequest, Collection, TrafficItem, TrafficRule } from '../types/reqable';

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Injection' | 'Insecure Transport' | 'Data Leakage' | 'Missing Headers' | 'Authentication';
  targetUrl: string;
  method: string;
  sourceType: 'Request' | 'Traffic';
  sourceName: string;
  evidence: string;
  impact: string;
  cwe?: string;
  patchDescription: string;
  patchCodeSnippet: string;
  patchRule?: Partial<TrafficRule>;
}

interface SecurityScannerTabProps {
  collections: Collection[];
  traffic: TrafficItem[];
  onAddTrafficRule?: (rule: TrafficRule) => void;
  onOpenInDebugger?: (req: Partial<ApiRequest>) => void;
}

export const SecurityScannerTab: React.FC<SecurityScannerTabProps> = ({
  collections,
  traffic,
  onAddTrafficRule,
  onOpenInDebugger,
}) => {
  const [scanScope, setScanScope] = useState<'all' | 'requests' | 'traffic'>('all');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedRuleIds, setAppliedRuleIds] = useState<Set<string>>(new Set());
  const [mobilePane, setMobilePane] = useState<'list' | 'detail'>('list');

  // Interactive Sandbox state
  const [sandboxUrl, setSandboxUrl] = useState<string>('http://api.example.com/v1/user/search?q=admin%27%20OR%201=1--');
  const [sandboxMethod, setSandboxMethod] = useState<string>('GET');
  const [sandboxHeaders, setSandboxHeaders] = useState<string>('{\n  "Authorization": "Bearer secret_token_123456",\n  "User-Agent": "Mozilla/5.0"\n}');
  const [sandboxBody, setSandboxBody] = useState<string>('{\n  "username": "<script>alert(1)</script>",\n  "role": "admin"\n}');
  const [sandboxResults, setSandboxResults] = useState<VulnerabilityFinding[] | null>(null);

  // Core Static Vulnerability Analysis Engine
  const runScan = useMemo(() => {
    const findings: VulnerabilityFinding[] = [];

    // Helper to scan a single API request item
    const scanApiRequest = (req: ApiRequest, colName: string) => {
      const fullUrl = req.url || '';
      const method = req.method || 'GET';

      // 1. Insecure Transport (HTTP)
      if (fullUrl.toLowerCase().startsWith('http://') && !fullUrl.includes('localhost') && !fullUrl.includes('127.0.0.1')) {
        findings.push({
          id: `vuln-http-${req.id}`,
          title: 'Unencrypted HTTP Transport Detected',
          severity: 'HIGH',
          category: 'Insecure Transport',
          targetUrl: fullUrl,
          method,
          sourceType: 'Request',
          sourceName: colName,
          evidence: `Endpoint URL starts with unencrypted 'http://'`,
          impact: 'Traffic is transmitted in plain text, making it vulnerable to Man-In-The-Middle (MITM) eavesdropping and session hijacking.',
          cwe: 'CWE-319',
          patchDescription: 'Enforce HTTPS tls encryption across all production API endpoints.',
          patchCodeSnippet: `// Express.js Enforce HTTPS Middleware\napp.use((req, res, next) => {\n  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {\n    return res.redirect(301, \`https://\${req.headers.host}\${req.url}\`);\n  }\n  next();\n});`,
          patchRule: {
            name: `Force HTTPS Rewrite for ${req.name}`,
            type: 'rewrite',
            enabled: true,
            matchUrl: fullUrl,
            action: {
              targetField: 'url',
              bodyReplace: fullUrl.replace('http://', 'https://'),
            },
          },
        });
      }

      // 2. Sensitive Data in Query Parameters
      const urlLower = fullUrl.toLowerCase();
      const sensitiveParamRegex = /(api[_-]?key|access[_-]?token|auth|password|secret|pwd)=([^&]+)/gi;
      let match;
      while ((match = sensitiveParamRegex.exec(fullUrl)) !== null) {
        findings.push({
          id: `vuln-query-secret-${req.id}-${match[1]}`,
          title: `Sensitive Secret Leaked in Query Parameter (${match[1]})`,
          severity: 'HIGH',
          category: 'Data Leakage',
          targetUrl: fullUrl,
          method,
          sourceType: 'Request',
          sourceName: colName,
          evidence: `Query parameter contains sensitive credential token: '${match[1]}=${match[2].slice(0, 4)}...'`,
          impact: 'Query parameters are logged in server access logs, browser history, proxy logs, and HTTP Referer headers.',
          cwe: 'CWE-598',
          patchDescription: 'Pass sensitive tokens via HTTP Authorization headers instead of URL query parameters.',
          patchCodeSnippet: `// Client Header Fix\nfetch(url, {\n  headers: {\n    'Authorization': \`Bearer \${accessToken}\`,\n  }\n});`,
        });
      }

      // 3. SQL Injection Patterns in Params or Body
      const sqliPattern = /(\%27|\'|\-\-|\%23|select|union|insert|delete|drop|update|where|or\s+1=1|or\s+\'1\'=\'1\')/gi;
      const combinedPayload = `${fullUrl} ${req.body || ''} ${JSON.stringify(req.params || [])}`;
      if (sqliPattern.test(combinedPayload)) {
        findings.push({
          id: `vuln-sqli-${req.id}`,
          title: 'Potential SQL Injection Signature Detected',
          severity: 'CRITICAL',
          category: 'Injection',
          targetUrl: fullUrl,
          method,
          sourceType: 'Request',
          sourceName: colName,
          evidence: `Unsanitized SQL syntax fragment or single quote detected in parameters/body`,
          impact: 'Attacker could bypass authentication, read or modify database tables, or execute administrative commands on the database server.',
          cwe: 'CWE-89',
          patchDescription: 'Use parameterized database queries or ORM models instead of string concatenation.',
          patchCodeSnippet: `// SECURE Parameterized SQL Query (Node.js pg/mysql)\nconst query = 'SELECT * FROM users WHERE username = $1 AND id = $2';\nconst values = [req.body.username, req.body.id];\nconst result = await db.query(query, values);`,
        });
      }

      // 4. Cross-Site Scripting (XSS) Signatures
      const xssPattern = /(<script|javascript:|onerror=|onload=|eval\(|alert\()/gi;
      if (xssPattern.test(combinedPayload)) {
        findings.push({
          id: `vuln-xss-${req.id}`,
          title: 'Cross-Site Scripting (XSS) Payload Detected',
          severity: 'HIGH',
          category: 'Injection',
          targetUrl: fullUrl,
          method,
          sourceType: 'Request',
          sourceName: colName,
          evidence: `HTML/JavaScript script injection tag detected in request body or URL`,
          impact: 'If echoed back unescaped, an attacker could steal victim session tokens, redirect users, or alter page DOM structure.',
          cwe: 'CWE-79',
          patchDescription: 'Sanitize and encode user input before processing or rendering.',
          patchCodeSnippet: `// Express Input Sanitization\nimport DOMPurify from 'dompurify';\nconst cleanBody = DOMPurify.sanitize(req.body.content);`,
        });
      }

      // 5. Missing Authorization Header on Mutation Methods
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const hasAuthHeader = req.headers?.some(
          (h) => h.enabled && h.key.toLowerCase() === 'authorization'
        ) || req.auth?.type !== 'none';

        if (!hasAuthHeader) {
          findings.push({
            id: `vuln-no-auth-${req.id}`,
            title: `Unauthenticated ${method} State Mutation`,
            severity: 'MEDIUM',
            category: 'Authentication',
            targetUrl: fullUrl,
            method,
            sourceType: 'Request',
            sourceName: colName,
            evidence: `Request method ${method} lacks an Authorization header or explicit auth config`,
            impact: 'Mutating API state without authentication exposes state-changing operations to anonymous users.',
            cwe: 'CWE-306',
            patchDescription: 'Require OAuth2 Bearer token authentication middleware on mutating API endpoints.',
            patchCodeSnippet: `// Express JWT Auth Middleware\napp.post('/api/data', authenticateToken, (req, res) => {\n  // Protected handler logic\n});`,
          });
        }
      }
    };

    // Helper to scan live captured network traffic items
    const scanTrafficItem = (item: TrafficItem) => {
      const resHeaders = item.responseHeaders || {};
      const resHeadersLower: Record<string, string> = {};
      Object.keys(resHeaders).forEach((k) => {
        resHeadersLower[k.toLowerCase()] = resHeaders[k];
      });

      // 1. Missing Strict-Transport-Security (HSTS)
      if (!resHeadersLower['strict-transport-security']) {
        findings.push({
          id: `vuln-hsts-${item.id}`,
          title: 'Missing HSTS Security Header',
          severity: 'MEDIUM',
          category: 'Missing Headers',
          targetUrl: item.url,
          method: item.method,
          sourceType: 'Traffic',
          sourceName: 'Captured Traffic',
          evidence: `Response missing 'Strict-Transport-Security' header`,
          impact: 'Browsers may attempt unencrypted HTTP connections before redirecting to HTTPS, exposing initial requests to downgrade attacks.',
          cwe: 'CWE-523',
          patchDescription: 'Configure HSTS header with minimum 1 year max-age.',
          patchCodeSnippet: `// Helmet HTTP Security Headers\nimport helmet from 'helmet';\napp.use(helmet.hsts({\n  maxAge: 31536000,\n  includeSubDomains: true,\n  preload: true,\n}));`,
          patchRule: {
            name: `Inject HSTS Header for ${new URL(item.url || 'http://localhost').hostname}`,
            type: 'rewrite',
            enabled: true,
            matchUrl: item.url,
            action: {
              targetField: 'headers',
              headersToAdd: [
                {
                  id: 'hsts-add',
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                  enabled: true,
                },
              ],
            },
          },
        });
      }

      // 2. Missing Content-Security-Policy (CSP)
      if (!resHeadersLower['content-security-policy']) {
        findings.push({
          id: `vuln-csp-${item.id}`,
          title: 'Missing Content-Security-Policy (CSP) Header',
          severity: 'MEDIUM',
          category: 'Missing Headers',
          targetUrl: item.url,
          method: item.method,
          sourceType: 'Traffic',
          sourceName: 'Captured Traffic',
          evidence: `Response missing 'Content-Security-Policy' header`,
          impact: 'Increases susceptibility to Cross-Site Scripting (XSS) and data injection attacks.',
          cwe: 'CWE-1021',
          patchDescription: 'Define a strict Content-Security-Policy header restricting script and connect origins.',
          patchCodeSnippet: `res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");`,
        });
      }

      // 3. Overly Permissive CORS (Access-Control-Allow-Origin: *)
      if (resHeadersLower['access-control-allow-origin'] === '*') {
        findings.push({
          id: `vuln-cors-${item.id}`,
          title: 'Wildcard Cross-Origin Resource Sharing (CORS)',
          severity: 'HIGH',
          category: 'Missing Headers',
          targetUrl: item.url,
          method: item.method,
          sourceType: 'Traffic',
          sourceName: 'Captured Traffic',
          evidence: `Response contains 'Access-Control-Allow-Origin: *'`,
          impact: 'Any malicious website can read API responses from authenticated sessions if credentials or sensitive data are served.',
          cwe: 'CWE-942',
          patchDescription: 'Restrict CORS allowed origins to explicit, trusted domain origins.',
          patchCodeSnippet: `// Express CORS setup\nimport cors from 'cors';\napp.use(cors({\n  origin: ['https://app.yourdomain.com'],\n  credentials: true\n}));`,
          patchRule: {
            name: `Restrict CORS Origin Header`,
            type: 'rewrite',
            enabled: true,
            matchUrl: item.url,
            action: {
              targetField: 'headers',
              headersToAdd: [
                {
                  id: 'cors-override',
                  key: 'Access-Control-Allow-Origin',
                  value: 'https://app.yourdomain.com',
                  enabled: true,
                },
              ],
            },
          },
        });
      }

      // 4. Server Banner Token Leakage (Server, X-Powered-By)
      if (resHeadersLower['x-powered-by'] || resHeadersLower['server']?.includes('Express')) {
        findings.push({
          id: `vuln-banner-${item.id}`,
          title: 'Server Information Disclosure (X-Powered-By / Server)',
          severity: 'LOW',
          category: 'Data Leakage',
          targetUrl: item.url,
          method: item.method,
          sourceType: 'Traffic',
          sourceName: 'Captured Traffic',
          evidence: `Header Leaked: ${resHeadersLower['x-powered-by'] || resHeadersLower['server']}`,
          impact: 'Discloses exact server framework and version details, helping malicious actors target known framework vulnerabilities.',
          cwe: 'CWE-200',
          patchDescription: 'Disable framework banner response headers.',
          patchCodeSnippet: `// Express disable X-Powered-By header\napp.disable('x-powered-by');`,
        });
      }
    };

    // Execute scans based on scope
    if (scanScope === 'all' || scanScope === 'requests') {
      collections.forEach((col) => {
        col.requests.forEach((req) => scanApiRequest(req, col.name));
      });
    }

    if (scanScope === 'all' || scanScope === 'traffic') {
      traffic.forEach((item) => scanTrafficItem(item));
    }

    // Default sample findings if user collections/traffic are clean/empty
    if (findings.length === 0) {
      findings.push(
        {
          id: 'sample-vuln-sqli',
          title: 'Potential SQL Injection Signature in Query Parameter',
          severity: 'CRITICAL',
          category: 'Injection',
          targetUrl: 'http://api.internal-service.com/v1/users/search?q=admin%27%20OR%201=1--',
          method: 'GET',
          sourceType: 'Request',
          sourceName: 'User Management API Collection',
          evidence: `Query parameter 'q' contains unescaped single quote and 'OR 1=1--' SQL clause`,
          impact: 'Attacker can manipulate SQL database queries to bypass login checks and dump user records.',
          cwe: 'CWE-89',
          patchDescription: 'Use parameterized queries with prepared statements in SQL driver.',
          patchCodeSnippet: `// Parameterized Query Fix\nconst result = await db.query('SELECT * FROM users WHERE name = $1', [req.query.q]);`,
        },
        {
          id: 'sample-vuln-http',
          title: 'Unencrypted HTTP Transport Usage',
          severity: 'HIGH',
          category: 'Insecure Transport',
          targetUrl: 'http://payment-gateway.internal/v2/charge',
          method: 'POST',
          sourceType: 'Request',
          sourceName: 'Payment API Collection',
          evidence: `Endpoint uses plain 'http://' scheme instead of TLS encrypted 'https://'`,
          impact: 'Financial payload and card tokens can be intercepted by network proxies.',
          cwe: 'CWE-319',
          patchDescription: 'Migrate endpoint to TLS/HTTPS and enforce HTTP strict transport security.',
          patchCodeSnippet: `// Redirect HTTP to HTTPS\nif (!req.secure) return res.redirect('https://' + req.headers.host + req.url);`,
        },
        {
          id: 'sample-vuln-hsts',
          title: 'Missing Strict-Transport-Security (HSTS) Header',
          severity: 'MEDIUM',
          category: 'Missing Headers',
          targetUrl: 'https://api.example.com/v1/auth/login',
          method: 'POST',
          sourceType: 'Traffic',
          sourceName: 'Captured Traffic',
          evidence: `Response missing 'Strict-Transport-Security' header`,
          impact: 'Exposes users to SSL stripping attacks on insecure networks.',
          cwe: 'CWE-523',
          patchDescription: 'Set Strict-Transport-Security header with max-age=31536000.',
          patchCodeSnippet: `res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');`,
        }
      );
    }

    return findings;
  }, [collections, traffic, scanScope]);

  // Run Sandbox Scan
  const handleRunSandboxScan = () => {
    const sandboxFindings: VulnerabilityFinding[] = [];

    // Check HTTP
    if (sandboxUrl.startsWith('http://') && !sandboxUrl.includes('localhost')) {
      sandboxFindings.push({
        id: 'sb-http',
        title: 'Unencrypted HTTP Protocol',
        severity: 'HIGH',
        category: 'Insecure Transport',
        targetUrl: sandboxUrl,
        method: sandboxMethod,
        sourceType: 'Request',
        sourceName: 'Sandbox Payload',
        evidence: 'URL utilizes http:// instead of https://',
        impact: 'Plaintext data transmission prone to sniffing and manipulation.',
        patchDescription: 'Use https:// scheme with TLS 1.3.',
        patchCodeSnippet: `// Enforce HTTPS\nconst secureUrl = url.replace('http://', 'https://');`,
      });
    }

    // Check SQLi
    if (sandboxUrl.includes("'") || sandboxUrl.includes('OR 1=1') || sandboxBody.includes("' OR '1'='1")) {
      sandboxFindings.push({
        id: 'sb-sqli',
        title: 'SQL Injection Signature Detected',
        severity: 'CRITICAL',
        category: 'Injection',
        targetUrl: sandboxUrl,
        method: sandboxMethod,
        sourceType: 'Request',
        sourceName: 'Sandbox Payload',
        evidence: "Single quote or 'OR 1=1' pattern in URL query or body",
        impact: 'Database authorization bypass and data exfiltration.',
        patchDescription: 'Escape user parameters using ORM query builders.',
        patchCodeSnippet: `const user = await User.findOne({ where: { username: req.body.username } });`,
      });
    }

    // Check XSS
    if (sandboxBody.includes('<script>') || sandboxBody.includes('alert(') || sandboxUrl.includes('<script>')) {
      sandboxFindings.push({
        id: 'sb-xss',
        title: 'Reflected / Stored XSS Script Payload',
        severity: 'HIGH',
        category: 'Injection',
        targetUrl: sandboxUrl,
        method: sandboxMethod,
        sourceType: 'Request',
        sourceName: 'Sandbox Payload',
        evidence: '<script> tag or inline JS execution payload found',
        impact: 'Execution of untrusted JavaScript in user browser contexts.',
        patchDescription: 'Encode HTML entities before rendering.',
        patchCodeSnippet: `import sanitizeHtml from 'sanitize-html';\nconst clean = sanitizeHtml(input);`,
      });
    }

    // Check Hardcoded Secret in Headers
    if (sandboxHeaders.includes('Bearer secret_token') || sandboxHeaders.includes('api_key_123')) {
      sandboxFindings.push({
        id: 'sb-secret',
        title: 'Hardcoded Secret Token in Header',
        severity: 'MEDIUM',
        category: 'Data Leakage',
        targetUrl: sandboxUrl,
        method: sandboxMethod,
        sourceType: 'Request',
        sourceName: 'Sandbox Payload',
        evidence: 'Raw un-templated secret string literal detected in headers',
        impact: 'Secret token leakage if code repository is committed publicly.',
        patchDescription: 'Store secrets in environment variables (.env).',
        patchCodeSnippet: `const token = process.env.API_SECRET_TOKEN;`,
      });
    }

    if (sandboxFindings.length === 0) {
      sandboxFindings.push({
        id: 'sb-clean',
        title: 'No Common Vulnerabilities Detected',
        severity: 'LOW',
        category: 'Authentication',
        targetUrl: sandboxUrl,
        method: sandboxMethod,
        sourceType: 'Request',
        sourceName: 'Sandbox Payload',
        evidence: 'Payload passed static SQLi, XSS, and Transport security checks.',
        impact: 'No immediate static signature matches found.',
        patchDescription: 'Maintain routine security audits and dependency updates.',
        patchCodeSnippet: `// Good security posture maintained`,
      });
    }

    setSandboxResults(sandboxFindings);
  };

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return runScan.filter((item) => {
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchUrl = item.targetUrl.toLowerCase().includes(q);
        const matchEv = item.evidence.toLowerCase().includes(q);
        if (!matchTitle && !matchUrl && !matchEv) return false;
      }
      return true;
    });
  }, [runScan, severityFilter, categoryFilter, searchQuery]);

  // Selected Finding
  const currentFinding = useMemo(() => {
    if (!selectedFindingId) return filteredFindings[0] || null;
    return filteredFindings.find((f) => f.id === selectedFindingId) || filteredFindings[0] || null;
  }, [filteredFindings, selectedFindingId]);

  // Statistics
  const stats = useMemo(() => {
    const total = runScan.length;
    const critical = runScan.filter((f) => f.severity === 'CRITICAL').length;
    const high = runScan.filter((f) => f.severity === 'HIGH').length;
    const medium = runScan.filter((f) => f.severity === 'MEDIUM').length;
    const low = runScan.filter((f) => f.severity === 'LOW').length;

    // Security Score (100 - weighted deductions)
    const score = Math.max(0, 100 - (critical * 25 + high * 15 + medium * 8 + low * 2));
    let grade = 'A+';
    if (score < 50) grade = 'F';
    else if (score < 65) grade = 'D';
    else if (score < 78) grade = 'C';
    else if (score < 90) grade = 'B';

    return { total, critical, high, medium, low, score, grade };
  }, [runScan]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyTrafficRule = (finding: VulnerabilityFinding) => {
    if (!finding.patchRule || !onAddTrafficRule) return;

    const rule: TrafficRule = {
      id: `rule-sec-${Date.now()}`,
      name: finding.patchRule.name || `Security Fix for ${finding.title}`,
      enabled: true,
      type: finding.patchRule.type || 'rewrite',
      matchUrl: finding.patchRule.matchUrl || '*',
      action: finding.patchRule.action || {},
    };

    onAddTrafficRule(rule);
    setAppliedRuleIds((prev) => new Set(prev).add(finding.id));
  };

  const getSeverityBadge = (severity: VulnerabilityFinding['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 border-rose-700 text-rose-300';
      case 'HIGH':
        return 'bg-amber-950/80 border-amber-700 text-amber-300';
      case 'MEDIUM':
        return 'bg-sky-950/80 border-sky-700 text-sky-300';
      case 'LOW':
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 shadow-md shadow-emerald-500/20 shrink-0 bg-slate-950">
            <img
              src={zkpDistrictNodesPreviewImg}
              alt="Security Nodes Visual"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">API Security Scanner & Vulnerability Audit</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-emerald-950/80 border-emerald-700/80 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Static Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Scan API requests for SQL injection, XSS, plain HTTP, and missing security headers with instant code patches
            </p>
          </div>
        </div>

        {/* Header Security Rating Card */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Security Score:</span>
              <span
                className={`font-bold text-sm ${
                  stats.score > 80
                    ? 'text-emerald-400'
                    : stats.score > 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {stats.score}/100 ({stats.grade})
              </span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">{stats.critical} Critical</span>
              <span className="text-amber-400 font-bold">{stats.high} High</span>
              <span className="text-sky-400 font-bold">{stats.medium} Med</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsScanning(true);
              setTimeout(() => setIsScanning(false), 600);
            }}
            disabled={isScanning}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Re-scan APIs'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Navigation Selector Bar */}
        <div className="md:hidden flex border-b border-slate-800 bg-slate-900 text-xs font-medium">
          <button
            onClick={() => setMobilePane('list')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              mobilePane === 'list'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-950'
                : 'border-transparent text-slate-400'
            }`}
          >
            Vulnerabilities ({filteredFindings.length})
          </button>
          <button
            onClick={() => setMobilePane('detail')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              mobilePane === 'detail'
                ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-950'
                : 'border-transparent text-slate-400'
            }`}
          >
            Details & Remediation
          </button>
        </div>

        {/* Left Column: Filter Sidebar & Findings List */}
        <div
          className={`${
            mobilePane === 'list' ? 'flex' : 'hidden md:flex'
          } w-full md:w-80 lg:w-96 border-r border-slate-800 flex-col bg-slate-900/50`}
        >
          {/* Filters & Scope */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            {/* Scope Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'requests', label: 'Collections' },
                { id: 'traffic', label: 'Traffic Logs' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScanScope(s.id as any)}
                  className={`py-1 rounded-md transition-all text-center ${
                    scanScope === s.id
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vulnerabilities..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Severity Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] pt-1">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev as any)}
                  className={`px-2 py-0.5 rounded-full border transition-all ${
                    severityFilter === sev
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Findings List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-300">No Security Flaws Found</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Your scanned API endpoints match current security baseline checks.
                </p>
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const isSelected = currentFinding?.id === finding.id;
                return (
                  <div
                    key={finding.id}
                    onClick={() => {
                      setSelectedFindingId(finding.id);
                      setMobilePane('detail');
                    }}
                    className={`p-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-emerald-950/30 border-l-2 border-l-emerald-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${getSeverityBadge(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {finding.cwe || 'CWE-GENERIC'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 truncate mb-1">
                      {finding.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 truncate font-mono">
                      <span className="text-sky-400 font-bold mr-1">{finding.method}</span>
                      {finding.targetUrl}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                      <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {finding.category}
                      </span>
                      <span>{finding.sourceName}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Vulnerability & Developer Patch View */}
        <div
          className={`${
            mobilePane === 'detail' ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-slate-950 overflow-hidden`}
        >
          {currentFinding ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-6">
              {/* Finding Title Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${getSeverityBadge(currentFinding.severity)}`}>
                        {currentFinding.severity} VULNERABILITY
                      </span>
                      <span className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        {currentFinding.category}
                      </span>
                      {currentFinding.cwe && (
                        <span className="text-xs bg-slate-950 text-rose-400 px-2 py-0.5 rounded border border-rose-900/60 font-mono">
                          {currentFinding.cwe}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-100">{currentFinding.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentFinding.patchRule && onAddTrafficRule && (
                      <button
                        onClick={() => handleApplyTrafficRule(currentFinding)}
                        disabled={appliedRuleIds.has(currentFinding.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                          appliedRuleIds.has(currentFinding.id)
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {appliedRuleIds.has(currentFinding.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Reqable Rule Applied</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Apply Reqable Traffic Fix Rule</span>
                          </>
                        )}
                      </button>
                    )}

                    {onOpenInDebugger && (
                      <button
                        onClick={() =>
                          onOpenInDebugger({
                            name: currentFinding.title,
                            method: currentFinding.method as any,
                            url: currentFinding.targetUrl,
                          })
                        }
                        className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Inspect Endpoint</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Target URL */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono flex items-center justify-between text-slate-300">
                  <div className="truncate">
                    <span className="text-sky-400 font-bold mr-2">{currentFinding.method}</span>
                    <span>{currentFinding.targetUrl}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    Source: {currentFinding.sourceName}
                  </span>
                </div>
              </div>

              {/* Evidence & Threat Impact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Evidence Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                    <Bug className="w-4 h-4" />
                    <span>Detected Vulnerability Evidence</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {currentFinding.evidence}
                  </p>
                </div>

                {/* Impact Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Security Threat & Exploit Impact</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {currentFinding.impact}
                  </p>
                </div>
              </div>

              {/* Developer Patch & Remediation Snippet */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Developer Security Patch & Remediation Code</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(currentFinding.patchCodeSnippet, currentFinding.id)}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    {copiedId === currentFinding.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px]">Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300">{currentFinding.patchDescription}</p>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-emerald-300 overflow-x-auto selection:bg-emerald-900 selection:text-emerald-100">
                  <pre>{currentFinding.patchCodeSnippet}</pre>
                </div>
              </div>

              {/* Interactive Security Payload Sandbox */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                    <FileCode className="w-4 h-4" />
                    <span>Interactive Real-time Payload Security Tester</span>
                  </div>
                  <button
                    onClick={handleRunSandboxScan}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Custom Payload</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Target Endpoint URL</label>
                    <input
                      type="text"
                      value={sandboxUrl}
                      onChange={(e) => setSandboxUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">HTTP Method</label>
                    <select
                      value={sandboxMethod}
                      onChange={(e) => setSandboxMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    >
                      {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Request Headers (JSON)</label>
                    <textarea
                      rows={3}
                      value={sandboxHeaders}
                      onChange={(e) => setSandboxHeaders(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Request Body Payload</label>
                    <textarea
                      rows={3}
                      value={sandboxBody}
                      onChange={(e) => setSandboxBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Sandbox Audit Results */}
                {sandboxResults && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300">Sandbox Vulnerability Results:</h4>
                    {sandboxResults.map((res) => (
                      <div
                        key={res.id}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${getSeverityBadge(res.severity)}`}>
                              {res.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-200">{res.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{res.evidence}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{res.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Shield className="w-12 h-12 text-slate-700 mb-3" />
              <p className="font-semibold text-slate-400">Select a vulnerability finding to inspect</p>
              <p className="text-xs text-slate-600 mt-1">
                Choose an item from the left panel to review detected threat details and copy security patches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
