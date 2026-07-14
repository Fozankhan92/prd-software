import { describe, expect, it } from 'vitest';
import { assertCloudFileMetadata, assertTenantRecord } from './storage';

describe('assertTenantRecord', () => {
  it('accepts a complete tenant-scoped record', () => {
    expect(() => assertTenantRecord({ tenantId: 'tenant-a', id: 'record-1', type: 'customer', data: {}, updatedAt: '2026-01-01T00:00:00.000Z' })).not.toThrow();
  });

  it('rejects records without tenant context', () => {
    expect(() => assertTenantRecord({ tenantId: '', id: 'record-1', type: 'customer', data: {}, updatedAt: '2026-01-01T00:00:00.000Z' })).toThrow('tenant_record_context_required');
  });
});


describe('assertCloudFileMetadata', () => {
  const file = {
    tenantId: 'tenant-a',
    fileId: 'file-1',
    ownerId: 'user-1',
    name: 'invoice.pdf',
    contentType: 'application/pdf',
    sizeBytes: 1024,
    storageKey: 'tenant-a/file-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('accepts valid cloud file metadata', () => {
    expect(() => assertCloudFileMetadata(file)).not.toThrow();
  });

  it('rejects missing file context', () => {
    expect(() => assertCloudFileMetadata({ ...file, storageKey: '' })).toThrow('cloud_file_context_required');
  });

  it('rejects negative or fractional sizes', () => {
    expect(() => assertCloudFileMetadata({ ...file, sizeBytes: -1 })).toThrow('cloud_file_size_invalid');
    expect(() => assertCloudFileMetadata({ ...file, sizeBytes: 1.5 })).toThrow('cloud_file_size_invalid');
  });
});
