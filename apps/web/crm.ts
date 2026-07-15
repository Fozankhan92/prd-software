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

/** A qualified or unqualified prospective customer. */
export interface CrmLead {
  id: string;
  tenantId: string;
  organizationId?: string;
  contactId?: string;
  source?: string;
  status: 'new' | 'working' | 'qualified' | 'unqualified' | 'converted';
  ownerUserId?: string;
  score?: number;
  notes?: string;
  createdAt: string;
}

export interface CrmOpportunity {
  id: string;
  tenantId: string;
  organizationId?: string;
  contactId?: string;
  name: string;
  stage: 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
  amount?: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  ownerUserId?: string;
  lossReason?: string;
  createdAt: string;
}

export interface CrmActivity {
  id: string;
  tenantId: string;
  organizationId?: string;
  contactId?: string;
  opportunityId?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  dueAt?: string;
  completedAt?: string;
  ownerUserId?: string;
  description?: string;
  createdAt: string;
}

export interface CrmQuote {
  id: string;
  tenantId: string;
  opportunityId?: string;
  organizationId?: string;
  quoteNumber: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  validUntil?: string;
  createdAt: string;
}

export interface CrmSalesOrder {
  id: string;
  tenantId: string;
  organizationId?: string;
  quoteId?: string;
  orderNumber: string;
  status: 'draft' | 'confirmed' | 'fulfilling' | 'fulfilled' | 'cancelled';
  total: number;
  currency?: string;
  requestedDeliveryDate?: string;
  createdAt: string;
}

export interface CrmServiceCase {
  id: string;
  tenantId: string;
  organizationId?: string;
  contactId?: string;
  caseNumber: string;
  subject: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ownerUserId?: string;
  resolution?: string;
  createdAt: string;
}

export interface CrmCampaign {
  id: string;
  tenantId: string;
  name: string;
  type: 'email' | 'event' | 'call' | 'advertising' | 'other';
  status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export const crmCapabilities = [
  'accounts and organizations', 'contacts and relationship history', 'lead capture and qualification',
  'opportunity pipeline and forecasting', 'activities, tasks, calls, emails, and meetings',
  'quotes and sales orders', 'customer service cases and SLAs', 'campaigns and attribution',
  'territories, owners, teams, and targets', 'deduplication, imports, exports, and merge review',
  'dashboards, reports, audit history, and permission-aware sharing',
] as const;

export interface CrmDirectory {
  listOrganizations(tenantId: string): Promise<readonly CrmOrganization[]>;
  listContacts(tenantId: string): Promise<readonly CrmContact[]>;
  createOrganization(input: Omit<CrmOrganization, 'id' | 'createdAt'>): Promise<CrmOrganization>;
  createContact(input: Omit<CrmContact, 'id' | 'createdAt'>): Promise<CrmContact>;
}

export function assertCrmTenantContext(record: CrmOrganization | CrmContact): void {
  if (!record.tenantId || !record.id) throw new Error('crm_tenant_context_required');
}
