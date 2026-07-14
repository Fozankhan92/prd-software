import Database from '@tauri-apps/plugin-sql';
import type { CrmContact, CrmDirectory, CrmOrganization } from './crm';

export class LocalCrmDirectory implements CrmDirectory {
  async listOrganizations(tenantId: string): Promise<readonly CrmOrganization[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    const rows = await database.select<CrmOrganization[]>('SELECT id, tenant_id AS tenantId, name, email, phone, created_at AS createdAt FROM crm_organization WHERE tenant_id = $1 ORDER BY name', [tenantId]);
    return rows;
  }

  async listContacts(tenantId: string): Promise<readonly CrmContact[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    const rows = await database.select<CrmContact[]>('SELECT id, tenant_id AS tenantId, organization_id AS organizationId, first_name AS firstName, last_name AS lastName, email, phone, created_at AS createdAt FROM crm_contact WHERE tenant_id = $1 ORDER BY last_name, first_name', [tenantId]);
    return rows;
  }

  async createOrganization(input: Omit<CrmOrganization, 'id' | 'createdAt'>): Promise<CrmOrganization> {
    const database = await Database.load('sqlite:prd.sqlite');
    const organization = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await database.execute('INSERT INTO crm_organization (id, tenant_id, name, email, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [organization.id, organization.tenantId, organization.name, organization.email ?? null, organization.phone ?? null, organization.createdAt]);
    return organization;
  }

  async createContact(input: Omit<CrmContact, 'id' | 'createdAt'>): Promise<CrmContact> {
    const database = await Database.load('sqlite:prd.sqlite');
    const contact = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await database.execute('INSERT INTO crm_contact (id, tenant_id, organization_id, first_name, last_name, email, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [contact.id, contact.tenantId, contact.organizationId ?? null, contact.firstName, contact.lastName, contact.email ?? null, contact.phone ?? null, contact.createdAt]);
    return contact;
  }
}
