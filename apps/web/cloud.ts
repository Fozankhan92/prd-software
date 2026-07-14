import type { CloudFileAdapter, CloudFileMetadata, FilePermission } from './storage';

export interface SignedCloudRequest {
  url: string;
  storageKey: string;
}

export interface CloudRequestSigner {
  signUpload(metadata: CloudFileMetadata, permission: FilePermission): Promise<SignedCloudRequest>;
  signDownload(file: CloudFileMetadata, permission: FilePermission): Promise<{ url: string }>;
}

export class S3CompatibleCloudFileAdapter implements CloudFileAdapter {
  readonly enabled: boolean;

  constructor(private readonly signer: CloudRequestSigner, enabled = false) {
    this.enabled = enabled;
  }

  async createUploadRequest(metadata: CloudFileMetadata, permission: FilePermission) {
    const request = await this.signer.signUpload(metadata, permission);
    return { uploadUrl: request.url, storageKey: request.storageKey };
  }

  async createDownloadRequest(file: CloudFileMetadata, permission: FilePermission) {
    const request = await this.signer.signDownload(file, permission);
    return { downloadUrl: request.url };
  }
}
