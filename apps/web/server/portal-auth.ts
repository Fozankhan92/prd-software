export type PortalIdentity = { subject: string; tenantId: string; expiresAt: string };
export type PortalTokenVerifier = { verify: (token: string) => Promise<PortalIdentity | null> };

export async function authorizePortalToken(verifier: PortalTokenVerifier, token: string | undefined, tenantId: string): Promise<PortalIdentity | null> {
  if (!token) return null;
  const identity = await verifier.verify(token);
  if (!identity || identity.tenantId !== tenantId || new Date(identity.expiresAt).getTime() <= Date.now()) return null;
  return identity;
}
