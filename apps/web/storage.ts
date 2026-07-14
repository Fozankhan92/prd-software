export interface TenantRecord {
  tenantId: string;
  id: string;
  type: string;
  data: Readonly<Record<string, unknown>>;
  updatedAt: string;
}

export interface LocalStore {
  get<T extends TenantRecord>(tenantId: string, id: string): Promise<T | null>;
  put<T extends TenantRecord>(record: T): Promise<void>;
  appendAudit(event: TenantRecord): Promise<void>;
  pendingSync(tenantId: string): Promise<readonly TenantRecord[]>;
}

export interface CloudSyncAdapter {
  enabled: boolean;
  push(records: readonly TenantRecord[]): Promise<void>;
  pull(tenantId: string): Promise<readonly TenantRecord[]>;
}

export function assertTenantRecord(record: TenantRecord): void {
  if (!record.tenantId || !record.id || !record.type) throw new Error('tenant_record_context_required');
}
