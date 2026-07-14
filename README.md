# PRD Software

PRD Software is custom desktop business software: an all-in-one, local-first platform combining CRM, HR, ERP, POS, IMS, OMS, SCM, accounting, finance, document management, and secure cloud file sharing.

## Desktop product

The product is a Tauri 2 desktop application for Windows, macOS, and Linux. React and TypeScript provide the embedded interface; Rust provides the native desktop boundary, local services, secure storage, and operating-system integration. The application is local-first. Cloud services are optional synchronization, backup, multi-device access, and controlled file-sharing services.

## Core modules

- CRM, HR, ERP, POS, IMS, OMS, SCM
- Accounting and finance
- Secure cloud file sharing
- Administration, summaries, drill-downs, permissions, and audit history

## Double-layer permissions

Visibility permission controls whether a user may discover and read a record or file. Action permission separately controls editing, approval, deletion, download, sharing, and administration. Read access never grants edit access. Explicit denies override inherited grants, cross-tenant access fails closed, and authorization decisions are audited.

## Architecture

- Tauri 2 desktop shell
- React + TypeScript embedded UI
- Rust native layer and local application services
- Encrypted local database
- Optional cloud synchronization and S3-compatible file storage
- Optional Node.js cloud services and workers
- MCP server boundary disabled by default with zero AI tools in the first release

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/PRD.md](docs/PRD.md), [docs/SECURITY.md](docs/SECURITY.md), and [docs/MCP.md](docs/MCP.md).
