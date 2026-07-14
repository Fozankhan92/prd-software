# Initial architecture

```text
Tauri 2 desktop app
        |
React + TypeScript interface
        |
Rust desktop boundary -> local application services
        |                         |
Encrypted local database      Optional cloud sync
        |
Local jobs and cache

Future MCP adapter -> same API, identity, permissions, approvals, and audit
```

The first implementation is a local-first desktop modular monolith. Cloud services are optional and used for synchronization, backup, multi-device access, and controlled file sharing.
