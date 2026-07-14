# MCP integration boundary

## Status

MCP readiness is part of the platform architecture. AI functionality is intentionally not part of the initial release.

## Included now

- A separately deployable MCP adapter boundary
- Versioned protocol and capability metadata
- Authentication and tenant-resolution hooks
- Reuse of the core API authorization pipeline
- Visibility and action permission checks
- Administrator enable/disable control
- Rate limiting, request tracing, and audit events
- Feature flags and emergency revocation
- Contract and security tests proving that no unregistered capability is callable

## Not included now

- No AI model integration
- No AI assistant or agent
- No prompts exposed to AI clients
- No business resources exposed to MCP clients
- No MCP tools for reading, editing, approving, exporting, downloading, or sharing company data
- No autonomous actions or background AI workflows

## Future safety contract

When AI tools are eventually introduced, every tool must be explicitly registered, versioned, administrator-approved, tenant-scoped, permission-aware, rate-limited, auditable, and revocable.

MCP is an integration surface, not an authorization system. The application remains the source of truth for identity, permissions, workflows, and auditability.
