export interface McpConfig {
  enabled: boolean;
  allowedClientIds: readonly string[];
  rateLimitPerMinute: number;
}

export interface McpCapability {
  name: string;
  version: string;
  enabled: boolean;
}

export interface McpRequest {
  tenantId: string;
  principalId: string;
  clientId: string;
  capability: string;
}

export const defaultMcpConfig: McpConfig = { enabled: false, allowedClientIds: [], rateLimitPerMinute: 0 };
export const initialCapabilities: readonly McpCapability[] = [];

export function authorizeMcpRequest(config: McpConfig, request: McpRequest, capabilities: readonly McpCapability[] = initialCapabilities): boolean {
  if (!config.enabled || !config.allowedClientIds.includes(request.clientId)) return false;
  return capabilities.some((capability) => capability.name === request.capability && capability.enabled);
}
