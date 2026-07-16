export type WebCrmRecord = {
  id: string;
  kind: 'lead' | 'prospect' | 'customer' | 'organization' | 'contact' | 'opportunity' | 'pipeline' | 'sales-stage' | 'activity' | 'call' | 'meeting' | 'task' | 'note' | 'follow-up' | 'quotation' | 'sales-order' | 'contract' | 'renewal' | 'service-case' | 'complaint' | 'campaign' | 'marketing-source' | 'territory' | 'sales-team' | 'commission' | 'credit-limit' | 'customer-statement';
  name: string;
  detail: string;
  status: string;
  createdAt: string;
};

export type WebWorkspaceState = {
  organization: string;
  adminName: string;
  tenantId: string;
  session: WebSession | null;
  records: WebCrmRecord[];
  permissions: WebPermission[];
  files: WebFile[];
  lineItems: WebLineItem[];
  approvals: WebApproval[];
  portalShares: WebPortalShare[];
  campaignMembers: WebCampaignMember[];
  customFields: string[];
  customPipelineStages: string[];
};

export type WebSession = { id: string; tenantId: string; userId: string; displayName: string; openedAt: string };
export type WebPermission = { id: string; subject: string; resource: string; canRead: boolean; canEdit: boolean };
export type WebFile = { id: string; name: string; size: number; type: string; uploadedAt: string; storage: 'browser' | 'cloud-ready' };
export type WebLineItem = { id: string; parentRecordId: string; description: string; quantity: number; unitPrice: number; total: number };
export type WebApprovalEvent = { status: 'Pending' | 'Approved' | 'Rejected'; at: string };
export type WebApproval = { id: string; recordId: string; recordType: string; requestedAction: string; status: 'Pending' | 'Approved' | 'Rejected'; requestedAt: string; history: WebApprovalEvent[] };
export type WebPortalShare = { id: string; recordId: string; audience: string; access: 'Read only'; expiresAt?: string; createdAt: string };
export type WebCampaignMember = { id: string; campaignId: string; subject: string; status: 'Targeted' | 'Responded' | 'Converted'; source?: string };

const storageKey = 'prd-software-web-workspace-v1';
const emptyState: WebWorkspaceState = { organization: '', adminName: '', tenantId: '', session: null, records: [], permissions: [], files: [], lineItems: [], approvals: [], portalShares: [], campaignMembers: [], customFields: [], customPipelineStages: [] };

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadWebWorkspace(): WebWorkspaceState {
  if (!canUseStorage()) return emptyState;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return emptyState;
    const parsed = JSON.parse(value) as Partial<WebWorkspaceState>;
    return {
      organization: typeof parsed.organization === 'string' ? parsed.organization : '',
      adminName: typeof parsed.adminName === 'string' ? parsed.adminName : '',
      tenantId: typeof parsed.tenantId === 'string' ? parsed.tenantId : '',
      session: parsed.session ?? null,
      records: Array.isArray(parsed.records) ? parsed.records : [],
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      files: Array.isArray(parsed.files) ? parsed.files : [],
      lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : [],
      approvals: Array.isArray(parsed.approvals) ? parsed.approvals : [],
      portalShares: Array.isArray(parsed.portalShares) ? parsed.portalShares : [],
      campaignMembers: Array.isArray(parsed.campaignMembers) ? parsed.campaignMembers : [],
      customFields: Array.isArray(parsed.customFields) ? parsed.customFields : [],
      customPipelineStages: Array.isArray(parsed.customPipelineStages) ? parsed.customPipelineStages : [],
    };
  } catch {
    return emptyState;
  }
}

export function saveWebWorkspace(state: WebWorkspaceState): void {
  if (canUseStorage()) window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function createWebRecord(kind: WebCrmRecord['kind'], name: string, detail: string, status: string): WebCrmRecord {
  return { id: crypto.randomUUID(), kind, name, detail, status, createdAt: new Date().toISOString() };
}

export function openWebSession(tenantId: string, displayName: string): WebSession {
  return { id: crypto.randomUUID(), tenantId, userId: crypto.randomUUID(), displayName, openedAt: new Date().toISOString() };
}

export function createTenantId(): string {
  return crypto.randomUUID();
}

export function grantWebPermission(subject: string, resource: string, canEdit: boolean): WebPermission {
  return { id: crypto.randomUUID(), subject, resource, canRead: true, canEdit };
}

export function createWebFile(file: Pick<File, 'name' | 'size' | 'type'>): WebFile {
  return { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type || 'application/octet-stream', uploadedAt: new Date().toISOString(), storage: 'cloud-ready' };
}

export function createWebLineItem(parentRecordId: string, description: string, quantity: number, unitPrice: number): WebLineItem {
  return { id: crypto.randomUUID(), parentRecordId, description, quantity, unitPrice, total: quantity * unitPrice };
}

export function createWebApproval(recordId: string, recordType: string, requestedAction: string): WebApproval {
  const requestedAt = new Date().toISOString();
  return { id: crypto.randomUUID(), recordId, recordType, requestedAction, status: 'Pending', requestedAt, history: [{ status: 'Pending', at: requestedAt }] };
}

export function createWebPortalShare(recordId: string, audience: string): WebPortalShare {
  return { id: crypto.randomUUID(), recordId, audience, access: 'Read only', createdAt: new Date().toISOString() };
}

export function createWebCampaignMember(campaignId: string, subject: string, source?: string): WebCampaignMember {
  return { id: crypto.randomUUID(), campaignId, subject, source, status: 'Targeted' };
}

export function exportWorkspace(state: WebWorkspaceState): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${state.organization || 'prd-workspace'}-backup.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
