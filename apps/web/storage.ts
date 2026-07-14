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


export type FilePermission = 'read' | 'edit';

export interface CloudFileMetadata {
  tenantId: string;
  fileId: string;
  ownerId: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudFileAdapter {
  enabled: boolean;
  createUploadRequest(metadata: CloudFileMetadata, permission: FilePermission): Promise<{ uploadUrl: string; storageKey: string }>;
  createDownloadRequest(file: CloudFileMetadata, permission: FilePermission): Promise<{ downloadUrl: string }>;
}

export function assertCloudFileMetadata(file: CloudFileMetadata): void {
  if (!file.tenantId || !file.fileId || !file.ownerId || !file.name || !file.storageKey) {
    throw new Error('cloud_file_context_required');
  }
  if (!Number.isInteger(file.sizeBytes) || file.sizeBytes < 0) throw new Error('cloud_file_size_invalid');
}
