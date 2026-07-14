export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface AdminBootstrap {
  organization: Organization;
  adminUserId: string;
  role: 'organization_admin';
}

export function createOrganizationBootstrap(input: { id: string; name: string; slug: string; adminUserId: string; now?: string }): AdminBootstrap {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) throw new Error('organization_name_required');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('organization_slug_invalid');
  const now = input.now ?? new Date().toISOString();
  const organization = { id: input.id, tenantId: input.id, name, slug, createdAt: now };
  return { organization, adminUserId: input.adminUserId, role: 'organization_admin' };
}
