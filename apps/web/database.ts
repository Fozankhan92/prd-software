export interface Migration {
  version: number;
  name: string;
  up: string;
}

export interface MigrationState {
  schemaVersion: number;
  appliedAt: readonly string[];
}

export const foundationMigrations: readonly Migration[] = [
  { version: 1, name: 'tenant_identity_authorization_audit', up: 'Create tenant, organization, user, session, permission_grant, and audit_event tables with tenant indexes.' },
  { version: 2, name: 'file_metadata', up: 'Create folder, file, file_version, sharing_policy, and sync_queue tables.' },
];

export function pendingMigrations(state: MigrationState, migrations: readonly Migration[] = foundationMigrations): readonly Migration[] {
  return migrations.filter((migration) => migration.version > state.schemaVersion);
}
