# Security and permission model

## Authorization decision

```text
authenticate(user)
  -> resolve tenant and department context
  -> evaluate visibility policy(resource, user)
  -> evaluate action policy(resource, user, requested_action)
  -> apply explicit denies and separation-of-duties rules
  -> allow or deny
  -> write immutable audit event
```

## Permission layers

| Layer | Purpose | Examples |
|---|---|---|
| Visibility | Determines whether a resource may be discovered or read | view folder, view customer, read payroll record |
| Action | Determines what the user may do after visibility is granted | edit, approve, delete, download, export, share |

## Design rules

- Default deny for protected resources.
- Read does not grant write.
- Inherited permissions must be visible and explainable.
- Explicit deny overrides inherited allow unless a designated break-glass policy applies.
- Temporary access must have an expiry and an audit trail.
- Privileged actions require stronger authentication where configured.
- Administrative summaries must be filtered by the administrator's own scope.
- Cloud links must support expiry, revocation, optional password protection, and download controls.
