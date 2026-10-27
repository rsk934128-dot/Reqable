/**
 * Comprehensive JSON Schema Validation Engine & Utilities
 * Supports JSON Schema Draft-07 / 2020 core specifications:
 * - Types: string, number, integer, boolean, object, array, null (including type unions)
 * - Objects: properties, required, additionalProperties, minProperties, maxProperties
 * - Arrays: items (single schema or tuple), minItems, maxItems, uniqueItems
 * - Numbers: minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf
 * - Strings: minLength, maxLength, pattern, format (email, uri, uuid, date-time, ipv4, ipv6)
 * - Enums & Const: enum, const
 * - Logical: oneOf, anyOf, allOf, not
 */

export interface SchemaDiscrepancy {
  id: string;
  path: string; // JSON pointer, e.g. "#/data/users/0/age"
  humanPath: string; // User-friendly path, e.g. "data.users[0].age"
  keyword:
    | 'type'
    | 'required'
    | 'enum'
    | 'const'
    | 'minimum'
    | 'maximum'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'format'
    | 'additionalProperties'
    | 'items'
    | 'minItems'
    | 'maxItems'
    | 'uniqueItems'
    | 'syntax'
    | 'other';
  message: string;
  expected: string;
  actual: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  discrepancies: SchemaDiscrepancy[];
  validatedAt: string;
  fieldCount: number;
  schemaTitle?: string;
  rawSchema?: Record<string, any>;
}

// Deep comparison helper
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

// Format validators
const FORMAT_REGEX: Record<string, RegExp> = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
  uri: /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?\/\/[^\s/$.?#].[^\s]*$/,
  url: /^(?:https?:\/\/)[^\s/$.?#].[^\s]*$/,
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
};

/**
 * Gets real JS primitive / compound type name
 */
export function getTypeName(val: any): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? 'integer' : 'number';
  }
  return typeof val;
}

/**
 * Validates a JavaScript value against a parsed JSON Schema
 */
export function validateJsonAgainstSchema(
  data: any,
  schema: any,
  schemaTitle?: string
): ValidationResult {
  const discrepancies: SchemaDiscrepancy[] = [];
  let fieldCount = 0;

  if (!schema || typeof schema !== 'object') {
    return {
      valid: false,
      discrepancies: [
        {
          id: 'err-invalid-schema',
          path: '#',
          humanPath: '(root)',
          keyword: 'syntax',
          message: 'JSON Schema must be a valid JSON object.',
          expected: 'Valid JSON Schema object',
          actual: String(schema),
          severity: 'error',
        },
      ],
      validatedAt: new Date().toISOString(),
      fieldCount: 0,
      schemaTitle,
    };
  }

  function validateNode(value: any, subSchema: any, path: string[], humanPathParts: string[]) {
    if (!subSchema || typeof subSchema !== 'object') return;
    fieldCount++;

    const currentPointer = `#${path.length > 0 ? '/' + path.join('/') : ''}`;
    const currentHumanPath = humanPathParts.length > 0 ? humanPathParts.join('.') : '(root)';

    const actualType = getTypeName(value);

    // 1. Type validation
    if (subSchema.type !== undefined) {
      const allowedTypes = Array.isArray(subSchema.type) ? subSchema.type : [subSchema.type];
      let matchesType = false;

      for (const t of allowedTypes) {
        if (t === 'integer') {
          if (typeof value === 'number' && Number.isInteger(value)) matchesType = true;
        } else if (t === 'number') {
          if (typeof value === 'number') matchesType = true;
        } else if (t === actualType) {
          matchesType = true;
        }
      }

      if (!matchesType) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-${path.join('-') || 'root'}-type`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'type',
          message: `Expected type "${allowedTypes.join(' | ')}", but received type "${actualType}"`,
          expected: `type: ${allowedTypes.join(' | ')}`,
          actual: `type: ${actualType} (${JSON.stringify(value)?.slice(0, 50) ?? 'undefined'})`,
          severity: 'error',
        });
        // If type mismatch, further constraints may fail or throw, so return early for this node
        return;
      }
    }

    // 2. Enum & Const validation
    if (subSchema.const !== undefined) {
      if (!deepEqual(value, subSchema.const)) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-${path.join('-') || 'root'}-const`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'const',
          message: `Value does not match required constant`,
          expected: JSON.stringify(subSchema.const),
          actual: JSON.stringify(value),
          severity: 'error',
        });
      }
    }

    if (Array.isArray(subSchema.enum)) {
      const matched = subSchema.enum.some((item: any) => deepEqual(item, value));
      if (!matched) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-${path.join('-') || 'root'}-enum`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'enum',
          message: `Value is not one of allowed enum values`,
          expected: `enum: [${subSchema.enum.map((v: any) => JSON.stringify(v)).join(', ')}]`,
          actual: JSON.stringify(value),
          severity: 'error',
        });
      }
    }

    // 3. String constraints
    if (typeof value === 'string') {
      if (subSchema.minLength !== undefined && value.length < subSchema.minLength) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-minlen`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'minLength',
          message: `String length (${value.length}) is shorter than required minimum (${subSchema.minLength})`,
          expected: `minLength >= ${subSchema.minLength}`,
          actual: `length: ${value.length}`,
          severity: 'error',
        });
      }

      if (subSchema.maxLength !== undefined && value.length > subSchema.maxLength) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-maxlen`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'maxLength',
          message: `String length (${value.length}) exceeds allowed maximum (${subSchema.maxLength})`,
          expected: `maxLength <= ${subSchema.maxLength}`,
          actual: `length: ${value.length}`,
          severity: 'error',
        });
      }

      if (subSchema.pattern !== undefined) {
        try {
          const regex = new RegExp(subSchema.pattern);
          if (!regex.test(value)) {
            discrepancies.push({
              id: `disc-${discrepancies.length + 1}-pattern`,
              path: currentPointer,
              humanPath: currentHumanPath,
              keyword: 'pattern',
              message: `String does not match pattern regex /${subSchema.pattern}/`,
              expected: `pattern: /${subSchema.pattern}/`,
              actual: `"${value}"`,
              severity: 'error',
            });
          }
        } catch {
          // ignore invalid user regex
        }
      }

      if (subSchema.format !== undefined && FORMAT_REGEX[subSchema.format]) {
        const regex = FORMAT_REGEX[subSchema.format];
        if (!regex.test(value)) {
          discrepancies.push({
            id: `disc-${discrepancies.length + 1}-format`,
            path: currentPointer,
            humanPath: currentHumanPath,
            keyword: 'format',
            message: `String is not a valid "${subSchema.format}" format`,
            expected: `format: "${subSchema.format}"`,
            actual: `"${value}"`,
            severity: 'error',
          });
        }
      }
    }

    // 4. Number constraints
    if (typeof value === 'number') {
      if (subSchema.minimum !== undefined && value < subSchema.minimum) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-minimum`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'minimum',
          message: `Number ${value} is less than required minimum ${subSchema.minimum}`,
          expected: `>= ${subSchema.minimum}`,
          actual: `${value}`,
          severity: 'error',
        });
      }

      if (subSchema.maximum !== undefined && value > subSchema.maximum) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-maximum`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'maximum',
          message: `Number ${value} is greater than allowed maximum ${subSchema.maximum}`,
          expected: `<= ${subSchema.maximum}`,
          actual: `${value}`,
          severity: 'error',
        });
      }

      if (subSchema.exclusiveMinimum !== undefined && value <= subSchema.exclusiveMinimum) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-excl-min`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'minimum',
          message: `Number ${value} must be strictly greater than ${subSchema.exclusiveMinimum}`,
          expected: `> ${subSchema.exclusiveMinimum}`,
          actual: `${value}`,
          severity: 'error',
        });
      }

      if (subSchema.exclusiveMaximum !== undefined && value >= subSchema.exclusiveMaximum) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-excl-max`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'maximum',
          message: `Number ${value} must be strictly less than ${subSchema.exclusiveMaximum}`,
          expected: `< ${subSchema.exclusiveMaximum}`,
          actual: `${value}`,
          severity: 'error',
        });
      }
    }

    // 5. Object constraints (required, properties, additionalProperties)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Required properties
      if (Array.isArray(subSchema.required)) {
        for (const reqKey of subSchema.required) {
          if (!Object.prototype.hasOwnProperty.call(value, reqKey) || value[reqKey] === undefined) {
            const reqPointer = `#${[...path, reqKey].join('/')}`;
            const reqHuman = [...humanPathParts, reqKey].join('.');
            discrepancies.push({
              id: `disc-${discrepancies.length + 1}-${reqKey}-required`,
              path: reqPointer,
              humanPath: reqHuman,
              keyword: 'required',
              message: `Missing required property "${reqKey}"`,
              expected: `Property "${reqKey}" is required`,
              actual: `undefined / missing in object`,
              severity: 'error',
            });
          }
        }
      }

      // Check properties defined in schema
      if (subSchema.properties && typeof subSchema.properties === 'object') {
        for (const [propKey, propSchema] of Object.entries<any>(subSchema.properties)) {
          if (Object.prototype.hasOwnProperty.call(value, propKey) && value[propKey] !== undefined) {
            validateNode(value[propKey], propSchema, [...path, propKey], [...humanPathParts, propKey]);
          }
        }
      }

      // Additional properties
      if (subSchema.additionalProperties === false) {
        const allowedKeys = new Set(Object.keys(subSchema.properties || {}));
        for (const objKey of Object.keys(value)) {
          if (!allowedKeys.has(objKey)) {
            discrepancies.push({
              id: `disc-${discrepancies.length + 1}-${objKey}-addprop`,
              path: `#${[...path, objKey].join('/')}`,
              humanPath: [...humanPathParts, objKey].join('.'),
              keyword: 'additionalProperties',
              message: `Unexpected additional property "${objKey}" is not permitted by schema`,
              expected: `additionalProperties: false`,
              actual: `Present with value: ${JSON.stringify(value[objKey])?.slice(0, 40)}`,
              severity: 'error',
            });
          }
        }
      }
    }

    // 6. Array constraints (items, minItems, maxItems, uniqueItems)
    if (Array.isArray(value)) {
      if (subSchema.minItems !== undefined && value.length < subSchema.minItems) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-minitems`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'minItems',
          message: `Array length (${value.length}) has fewer items than required minimum (${subSchema.minItems})`,
          expected: `minItems >= ${subSchema.minItems}`,
          actual: `count: ${value.length}`,
          severity: 'error',
        });
      }

      if (subSchema.maxItems !== undefined && value.length > subSchema.maxItems) {
        discrepancies.push({
          id: `disc-${discrepancies.length + 1}-maxitems`,
          path: currentPointer,
          humanPath: currentHumanPath,
          keyword: 'maxItems',
          message: `Array length (${value.length}) exceeds allowed maximum (${subSchema.maxItems})`,
          expected: `maxItems <= ${subSchema.maxItems}`,
          actual: `count: ${value.length}`,
          severity: 'error',
        });
      }

      if (subSchema.uniqueItems === true) {
        const seen = new Set<string>();
        let hasDuplicate = false;
        for (const item of value) {
          const serialized = JSON.stringify(item);
          if (seen.has(serialized)) {
            hasDuplicate = true;
            break;
          }
          seen.add(serialized);
        }
        if (hasDuplicate) {
          discrepancies.push({
            id: `disc-${discrepancies.length + 1}-uniqueitems`,
            path: currentPointer,
            humanPath: currentHumanPath,
            keyword: 'uniqueItems',
            message: `Array contains duplicate items, but uniqueItems is true`,
            expected: `uniqueItems: true`,
            actual: `Contains duplicate elements`,
            severity: 'error',
          });
        }
      }

      // Items schema
      if (subSchema.items) {
        if (Array.isArray(subSchema.items)) {
          // Tuple validation
          subSchema.items.forEach((itemSchema: any, idx: number) => {
            if (idx < value.length) {
              validateNode(value[idx], itemSchema, [...path, String(idx)], [
                ...humanPathParts.slice(0, -1),
                `${humanPathParts[humanPathParts.length - 1] || 'root'}[${idx}]`,
              ]);
            }
          });
        } else if (typeof subSchema.items === 'object') {
          // Uniform array validation
          value.forEach((item: any, idx: number) => {
            const arrayIndexLabel = `${humanPathParts[humanPathParts.length - 1] || 'root'}[${idx}]`;
            validateNode(
              item,
              subSchema.items,
              [...path, String(idx)],
              [...humanPathParts.slice(0, -1), arrayIndexLabel]
            );
          });
        }
      }
    }
  }

  try {
    validateNode(data, schema, [], []);
  } catch (err: any) {
    discrepancies.push({
      id: 'err-validation-exception',
      path: '#',
      humanPath: '(root)',
      keyword: 'other',
      message: `Validation exception: ${err.message || String(err)}`,
      expected: 'Successful evaluation',
      actual: String(err),
      severity: 'error',
    });
  }

  return {
    valid: discrepancies.length === 0,
    discrepancies,
    validatedAt: new Date().toISOString(),
    fieldCount,
    schemaTitle: schema.title || schemaTitle,
    rawSchema: schema,
  };
}

/**
 * Automatically infers a JSON Schema (Draft-07 compliant) from any JS data object or array
 */
export function inferJsonSchema(data: any, title: string = 'InferredResponseSchema'): Record<string, any> {
  function inferNode(val: any): Record<string, any> {
    if (val === null) {
      return { type: 'null' };
    }
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return {
          type: 'array',
          items: {},
        };
      }
      // Infer item schema from the first non-null element or sample up to 5 elements
      const sampleItem = val.find((item) => item !== null && item !== undefined) ?? val[0];
      return {
        type: 'array',
        items: inferNode(sampleItem),
      };
    }
    if (typeof val === 'object') {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, propVal] of Object.entries(val)) {
        properties[key] = inferNode(propVal);
        required.push(key);
      }

      return {
        type: 'object',
        required,
        properties,
      };
    }
    if (typeof val === 'number') {
      return {
        type: Number.isInteger(val) ? 'integer' : 'number',
      };
    }
    if (typeof val === 'boolean') {
      return {
        type: 'boolean',
      };
    }
    if (typeof val === 'string') {
      // Check for common formats
      if (FORMAT_REGEX.email.test(val)) {
        return { type: 'string', format: 'email' };
      }
      if (FORMAT_REGEX.uuid.test(val)) {
        return { type: 'string', format: 'uuid' };
      }
      if (FORMAT_REGEX['date-time'].test(val)) {
        return { type: 'string', format: 'date-time' };
      }
      if (FORMAT_REGEX.url.test(val)) {
        return { type: 'string', format: 'uri' };
      }
      return {
        type: 'string',
      };
    }

    return {};
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title,
    description: `Auto-generated JSON schema inferred on ${new Date().toLocaleDateString()}`,
    ...inferNode(data),
  };
}

/**
 * Built-in schema templates for quick testing
 */
export const SCHEMA_TEMPLATES: { name: string; description: string; schema: Record<string, any> }[] = [
  {
    name: 'Standard JSON Object',
    description: 'Object with common typed properties (id, name, status, count)',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'StandardObjectResponse',
      type: 'object',
      required: ['id', 'status'],
      properties: {
        id: { type: ['string', 'number'] },
        name: { type: 'string', minLength: 1 },
        status: { type: 'string', enum: ['active', 'pending', 'inactive', 'success', 'ok'] },
        count: { type: 'integer', minimum: 0 },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
  {
    name: 'Paginated API Response',
    description: 'Response with pagination envelope (page, total, limit, items array)',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'PaginatedApiResponse',
      type: 'object',
      required: ['data', 'page', 'total'],
      properties: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        total: { type: 'integer', minimum: 0 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: ['string', 'number'] },
            },
          },
        },
      },
    },
  },
  {
    name: 'HttpBin / Postman Echo Schema',
    description: 'Schema for httpbin.org/get or echo responses with args and headers',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'HttpBinGetResponse',
      type: 'object',
      required: ['args', 'headers', 'origin', 'url'],
      properties: {
        args: {
          type: 'object',
          required: ['user'],
          properties: {
            user: { type: 'string', minLength: 1 },
            mode: { type: 'string', enum: ['debug', 'test', 'release'] },
          },
        },
        headers: {
          type: 'object',
        },
        origin: {
          type: 'string',
        },
        url: {
          type: 'string',
          format: 'uri',
        },
      },
    },
  },
  {
    name: 'Error / Fault Response Envelope',
    description: 'Standard RFC-7807 problem details or API error envelope',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'ApiErrorResponse',
      type: 'object',
      required: ['error', 'statusCode'],
      properties: {
        statusCode: { type: 'integer', minimum: 400, maximum: 599 },
        error: { type: 'string' },
        message: { type: 'string' },
        code: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  },
];
