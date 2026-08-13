import { TrafficItem } from '../types/reqable';

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact?: { name: string; url?: string };
  };
  servers: { url: string; description?: string }[];
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

export function inferJsonSchema(value: any): any {
  if (value === null || value === undefined) {
    return { type: 'string', nullable: true };
  }
  if (typeof value === 'boolean') {
    return { type: 'boolean', example: value };
  }
  if (typeof value === 'number') {
    return { type: Number.isInteger(value) ? 'integer' : 'number', example: value };
  }
  if (typeof value === 'string') {
    return { type: 'string', example: value.length > 60 ? value.substring(0, 60) + '...' : value };
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', items: { type: 'string' } };
    }
    return {
      type: 'array',
      items: inferJsonSchema(value[0]),
    };
  }
  if (typeof value === 'object') {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    Object.keys(value).forEach((key) => {
      properties[key] = inferJsonSchema(value[key]);
      required.push(key);
    });
    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }
  return { type: 'string' };
}

/**
 * Normalizes URL paths by parameterizing IDs (numeric IDs or UUIDs)
 */
function normalizePath(pathname: string): { normalizedPath: string; pathParams: { name: string; example: string }[] } {
  const segments = pathname.split('/').filter(Boolean);
  const pathParams: { name: string; example: string }[] = [];

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const numericRegex = /^\d+$/;

  const normalizedSegments = segments.map((seg, idx) => {
    if (numericRegex.test(seg) || uuidRegex.test(seg)) {
      const prevSeg = idx > 0 ? segments[idx - 1].replace(/s$/, '') : 'id';
      const paramName = `${prevSeg}Id`;
      pathParams.push({ name: paramName, example: seg });
      return `{${paramName}}`;
    }
    return seg;
  });

  return {
    normalizedPath: '/' + normalizedSegments.join('/'),
    pathParams,
  };
}

export function generateOpenApiSpec(
  traffic: TrafficItem[],
  options?: {
    title?: string;
    version?: string;
    description?: string;
    filterHost?: string;
  }
): OpenApiSpec {
  const title = options?.title || 'Captured API Traffic Specification';
  const version = options?.version || '1.0.0';
  const description =
    options?.description ||
    'Automatically generated OpenAPI / Swagger 3.0.3 specification constructed from live captured traffic history in Reqable.';

  const filteredTraffic = options?.filterHost
    ? traffic.filter((t) => {
        try {
          return new URL(t.url).origin === options.filterHost;
        } catch {
          return true;
        }
      })
    : traffic;

  const serverSet = new Set<string>();
  const paths: Record<string, Record<string, any>> = {};
  const hasAuthHeader = { bearer: false, apiKey: false, basic: false };

  filteredTraffic.forEach((item) => {
    try {
      const parsedUrl = new URL(item.url);
      const origin = parsedUrl.origin;
      serverSet.add(origin);

      const { normalizedPath, pathParams } = normalizePath(parsedUrl.pathname);
      const method = item.method.toLowerCase();

      if (!paths[normalizedPath]) {
        paths[normalizedPath] = {};
      }

      const existingOp = paths[normalizedPath][method] || {
        summary: `${item.method.toUpperCase()} ${normalizedPath}`,
        description: `Endpoint inferred from captured traffic at ${item.timestamp}`,
        parameters: [],
        responses: {},
      };

      // Extract Parameters (Query params)
      const parametersMap = new Map<string, any>();

      // Path parameters
      pathParams.forEach((pp) => {
        parametersMap.set(`path:${pp.name}`, {
          name: pp.name,
          in: 'path',
          required: true,
          schema: { type: 'string', example: pp.example },
          description: `Path parameter ${pp.name}`,
        });
      });

      // Query parameters
      parsedUrl.searchParams.forEach((val, key) => {
        const isNum = !isNaN(Number(val));
        const isBool = val === 'true' || val === 'false';
        parametersMap.set(`query:${key}`, {
          name: key,
          in: 'query',
          required: false,
          schema: {
            type: isBool ? 'boolean' : isNum ? 'integer' : 'string',
            example: val,
          },
        });
      });

      // Headers (Include custom or important headers)
      if (item.requestHeaders) {
        Object.entries(item.requestHeaders).forEach(([hKey, hVal]) => {
          const lowerKey = hKey.toLowerCase();
          if (lowerKey === 'authorization') {
            if (hVal.toLowerCase().startsWith('bearer')) hasAuthHeader.bearer = true;
            else if (hVal.toLowerCase().startsWith('basic')) hasAuthHeader.basic = true;
          } else if (lowerKey === 'x-api-key') {
            hasAuthHeader.apiKey = true;
          } else if (['accept', 'user-agent', 'x-requested-with', 'content-type'].includes(lowerKey)) {
            parametersMap.set(`header:${hKey}`, {
              name: hKey,
              in: 'header',
              required: false,
              schema: { type: 'string', example: hVal },
            });
          }
        });
      }

      existingOp.parameters = Array.from(parametersMap.values());

      // Request Body
      if (['post', 'put', 'patch'].includes(method) && item.requestBody) {
        try {
          const parsedReqBody = JSON.parse(item.requestBody);
          existingOp.requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: inferJsonSchema(parsedReqBody),
                example: parsedReqBody,
              },
            },
          };
        } catch {
          existingOp.requestBody = {
            content: {
              'text/plain': {
                schema: { type: 'string', example: item.requestBody },
              },
            },
          };
        }
      }

      // Response
      const statusCode = String(item.responseStatus || 200);
      let respBodySchema: any = { type: 'string' };
      let respBodyExample: any = item.responseBody;

      if (item.responseBody) {
        try {
          const parsedResp = JSON.parse(item.responseBody);
          respBodySchema = inferJsonSchema(parsedResp);
          respBodyExample = parsedResp;
        } catch {}
      }

      const contentType = item.responseHeaders?.['content-type'] || 'application/json';

      existingOp.responses[statusCode] = {
        description: `Captured response with HTTP ${statusCode}`,
        content: {
          [contentType.split(';')[0]]: {
            schema: respBodySchema,
            example: respBodyExample,
          },
        },
      };

      paths[normalizedPath][method] = existingOp;
    } catch (e) {
      console.warn('Could not parse URL for OpenAPI spec generation:', item.url, e);
    }
  });

  const servers = Array.from(serverSet).map((url) => ({
    url,
    description: 'Captured target API server host',
  }));

  if (servers.length === 0) {
    servers.push({ url: 'https://api.example.com/v1', description: 'Default API host' });
  }

  const securitySchemes: Record<string, any> = {};
  if (hasAuthHeader.bearer) {
    securitySchemes['bearerAuth'] = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    };
  }
  if (hasAuthHeader.apiKey) {
    securitySchemes['apiKeyAuth'] = {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title,
      version,
      description,
      contact: {
        name: 'Reqable API Workspace',
        url: 'https://reqable.com',
      },
    },
    servers,
    paths,
    components: Object.keys(securitySchemes).length > 0 ? { securitySchemes } : undefined,
  };
}

export function specToJsonString(spec: OpenApiSpec): string {
  return JSON.stringify(spec, null, 2);
}

export function specToYamlString(obj: any, indent = 0): string {
  const spacing = ' '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.startsWith('{') || obj.startsWith('[')) {
      return JSON.stringify(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const innerYaml = specToYamlString(item, indent + 2);
          const lines = innerYaml.split('\n');
          return `${spacing}- ${lines[0].trim()}\n` + lines.slice(1).map((l) => `${spacing}  ${l}`).join('\n');
        }
        return `${spacing}- ${specToYamlString(item, 0)}`;
      })
      .join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys
      .map((key) => {
        const val = obj[key];
        if (val === undefined) return '';
        if (typeof val === 'object' && val !== null) {
          return `${spacing}${key}:\n${specToYamlString(val, indent + 2)}`;
        }
        return `${spacing}${key}: ${specToYamlString(val, 0)}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  return String(obj);
}
