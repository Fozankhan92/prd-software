import { describe, expect, it } from 'vitest';
import { authorizeMcpRequest, defaultMcpConfig, type McpCapability } from './mcp';

const request = { tenantId: 'tenant-a', principalId: 'user-1', clientId: 'client-1', capability: 'future.read' };

describe('authorizeMcpRequest', () => {
  it('denies requests while MCP is disabled', () => {
    expect(authorizeMcpRequest(defaultMcpConfig, request)).toBe(false);
  });

  it('denies unallowlisted clients', () => {
    const config = { ...defaultMcpConfig, enabled: true, allowedClientIds: ['client-2'] };
    expect(authorizeMcpRequest(config, request, [{ name: 'future.read', version: '1', enabled: true }])).toBe(false);
  });

  it('allows only an explicitly enabled capability', () => {
    const config = { ...defaultMcpConfig, enabled: true, allowedClientIds: ['client-1'] };
    const capabilities: McpCapability[] = [{ name: 'future.read', version: '1', enabled: true }];
    expect(authorizeMcpRequest(config, request, capabilities)).toBe(true);
  });
});
