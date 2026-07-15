export type WebCrmRecord = {
  id: string;
  kind: 'organization' | 'contact' | 'lead' | 'opportunity' | 'activity';
  name: string;
  detail: string;
  status: string;
  createdAt: string;
};

export type WebWorkspaceState = {
  organization: string;
  adminName: string;
  records: WebCrmRecord[];
};

const storageKey = 'prd-software-web-workspace-v1';

const emptyState: WebWorkspaceState = { organization: '', adminName: '', records: [] };

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
      records: Array.isArray(parsed.records) ? parsed.records : [],
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
