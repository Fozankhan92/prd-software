export interface CrmOrganization {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface CrmContact {
  id: string;
  tenantId: string;
  organizationId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface CrmDirectory {
  listOrganizations(tenantId: string): Promise<readonly CrmOrganization[]>;
  listContacts(tenantId: string): Promise<readonly CrmContact[]>;
  createOrganization(input: Omit<CrmOrganization, 'id' | 'createdAt'>): Promise<CrmOrganization>;
  createContact(input: Omit<CrmContact, 'id' | 'createdAt'>): Promise<CrmContact>;
}

export function assertCrmTenantContext(record: CrmOrganization | CrmContact): void {
  if (!record.tenantId || !record.id) throw new Error('crm_tenant_context_required');
}
