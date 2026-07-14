# Desktop architecture

PRD Software is desktop software. The primary product is an installable Tauri 2 application for Windows, macOS, and Linux—not a browser-only web app.

## Runtime

Tauri 2 desktop executable
  -> React + TypeScript embedded interface
  -> Rust native boundary and local application services
  -> Encrypted local database, secure key storage, local jobs, and cache
  -> Optional cloud synchronization, backup, multi-device access, and file sharing

The local desktop application remains useful when cloud connectivity is unavailable. Cloud services synchronize authorized changes and files; they do not replace the desktop runtime.

## Boundaries

- React/TypeScript owns screens, forms, navigation, and presentation.
- Rust owns native commands, local persistence access, secure storage, filesystem integration, OS notifications, and desktop lifecycle.
- Domain contracts define the shared interface between the embedded UI and Rust services.
- Authorization is enforced in the native/domain service boundary, never only in the UI.
- Cloud APIs are optional adapters for synchronization, backup, collaboration, and controlled sharing.
- The MCP adapter is optional, disabled by default, and must call the same identity, authorization, approval, and audit services.

## Delivery shape

The repository may contain an embedded UI package under apps/web; that name describes the UI technology package only. It does not change the product identity: the shipped artifact is the PRD Software desktop executable.
