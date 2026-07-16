import type { WebWorkspaceState } from '../app/web-store';
import type { WorkspaceStore } from './workspace-api';

export type SqlClient = { query<T = unknown>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }> };
type WorkspaceRow = { state: WebWorkspaceState; version: string };

export function createPostgresWorkspaceStore(db: SqlClient): WorkspaceStore {
  return {
    async read(tenantId) {
      const result = await db.query<WorkspaceRow>('select state, version from workspace_snapshot where tenant_id = $1', [tenantId]);
      return result.rows[0] ?? null;
    },
    async write(tenantId, state, expectedVersion) {
      const result = await db.query<{ version: string }>(
        `insert into workspace_snapshot (tenant_id, state, version)
         values ($1, $2::jsonb, '1')
         on conflict (tenant_id) do update
         set state = excluded.state, version = (workspace_snapshot.version::bigint + 1)::text, updated_at = now()
         where $3::text is null or workspace_snapshot.version = $3
         returning version`,
        [tenantId, JSON.stringify(state), expectedVersion ?? null],
      );
      return result.rows[0] ?? 'CONFLICT';
    },
  };
}
