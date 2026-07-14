import { describe, expect, it } from 'vitest';
import { S3CompatibleCloudFileAdapter } from './cloud';

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

describe('S3CompatibleCloudFileAdapter', () => {
  it('passes upload permission to the signer', async () => {
    const adapter = new S3CompatibleCloudFileAdapter({
      signUpload: async (_metadata, permission) => ({ url: `https://upload.test/${permission}`, storageKey: 'tenant-a/file-1' }),
      signDownload: async (_metadata, permission) => ({ url: `https://download.test/${permission}` }),
    });

    await expect(adapter.createUploadRequest(file, 'edit')).resolves.toEqual({
      uploadUrl: 'https://upload.test/edit',
      storageKey: 'tenant-a/file-1',
    });
  });

  it('passes download permission to the signer', async () => {
    const adapter = new S3CompatibleCloudFileAdapter({
      signUpload: async () => ({ url: 'https://upload.test', storageKey: 'tenant-a/file-1' }),
      signDownload: async (_metadata, permission) => ({ url: `https://download.test/${permission}` }),
    });

    await expect(adapter.createDownloadRequest(file, 'read')).resolves.toEqual({
      downloadUrl: 'https://download.test/read',
    });
  });
});
