import type { CloudSyncAdapter, LocalStore, TenantRecord } from './storage';

export type SyncConflictPolicy = 'reject' | 'last_write_wins';

export interface SyncConflict {
  local: TenantRecord;
  remote: TenantRecord;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: readonly SyncConflict[];
}

export class LocalCloudSyncQueue {
  constructor(
    private readonly localStore: LocalStore,
    private readonly cloud: CloudSyncAdapter,
    private readonly conflictPolicy: SyncConflictPolicy = 'reject',
  ) {}

  async run(tenantId: string): Promise<SyncResult> {
    if (!this.cloud.enabled) return { pushed: 0, pulled: 0, conflicts: [] };

    const pending = await this.localStore.pendingSync(tenantId);
    const remote = await this.cloud.pull(tenantId);
    const remoteById = new Map(remote.map((record) => [record.id, record]));
    const conflicts = pending
      .filter((record) => remoteById.has(record.id))
      .map((local) => ({ local, remote: remoteById.get(local.id)! }));

    if (conflicts.length && this.conflictPolicy === 'reject') {
      return { pushed: 0, pulled: remote.length, conflicts };
    }

    await this.cloud.push(pending);
    for (const record of remote) {
      if (this.conflictPolicy === 'last_write_wins' && pending.some((local) => local.id === record.id && local.updatedAt >= record.updatedAt)) continue;
      await this.localStore.put(record);
    }

    return { pushed: pending.length, pulled: remote.length, conflicts };
  }
}
