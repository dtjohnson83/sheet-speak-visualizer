export interface RESTAPIConfig {
  baseUrl: string;
  authentication: {
    type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth';
    apiKey?: string;
    apiKeyHeader?: string;
    bearerToken?: string;
    username?: string;
    password?: string;
    oauthToken?: string;
  };
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  pagination?: {
    type: 'none' | 'offset' | 'cursor' | 'page';
    limitParam?: string;
    offsetParam?: string;
    pageParam?: string;
    cursorParam?: string;
    totalCountPath?: string;
  };
  dataPath?: string; // JSONPath to extract data from response
  rateLimit?: {
    requestsPerSecond: number;
    burstLimit: number;
  };
}

export interface RESTAPIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  body?: any;
}

export interface RESTAPIResponse {
  data: any[];
  hasMore?: boolean;
  nextCursor?: string;
  totalCount?: number;
}