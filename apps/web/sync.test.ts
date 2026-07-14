import { describe, expect, it } from 'vitest';
import { LocalCloudSyncQueue, withSyncRetry } from './sync';
import type { CloudSyncAdapter, LocalStore, TenantRecord } from './storage';

const record: TenantRecord = {
  tenantId: 'tenant-a',
  id: 'record-1',
  type: 'customer',
  data: { name: 'Acme' },
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function localStore(pending: readonly TenantRecord[]): LocalStore {
  return {
    get: async () => null,
    put: async () => undefined,
    appendAudit: async () => undefined,
    pendingSync: async () => pending,
  };
}

describe('LocalCloudSyncQueue', () => {
  it('does nothing when cloud is disabled', async () => {
    const cloud: CloudSyncAdapter = { enabled: false, push: async () => undefined, pull: async () => [] };
    await expect(new LocalCloudSyncQueue(localStore([record]), cloud).run('tenant-a')).resolves.toEqual({ pushed: 0, pulled: 0, conflicts: [] });
  });

  it('rejects conflicts by default', async () => {
    const cloud: CloudSyncAdapter = { enabled: true, push: async () => undefined, pull: async () => [record] };
    const result = await new LocalCloudSyncQueue(localStore([record]), cloud).run('tenant-a');
    expect(result.pushed).toBe(0);
    expect(result.conflicts).toHaveLength(1);
  });

  it('pushes and pulls non-conflicting records', async () => {
    const pushed: TenantRecord[] = [];
    const cloud: CloudSyncAdapter = { enabled: true, push: async (records) => pushed.push(...records), pull: async () => [] };
    const result = await new LocalCloudSyncQueue(localStore([record]), cloud).run('tenant-a');
    expect(pushed).toEqual([record]);
    expect(result).toEqual({ pushed: 1, pulled: 0, conflicts: [] });
  });
});


describe('withSyncRetry', () => {
  it('retries transient failures before succeeding', async () => {
    let calls = 0;
    await expect(withSyncRetry(async () => {
      calls += 1;
      if (calls < 3) throw new Error('temporary_failure');
      return 'ok';
    })).resolves.toBe('ok');
    expect(calls).toBe(3);
  });
});
