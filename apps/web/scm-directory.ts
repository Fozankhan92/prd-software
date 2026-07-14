import Database from '@tauri-apps/plugin-sql';
import type { ScmDirectory, ScmShipment } from './scm';

export class LocalScmDirectory implements ScmDirectory {
  async listShipments(tenantId: string): Promise<readonly ScmShipment[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<ScmShipment[]>('SELECT id, tenant_id AS tenantId, order_id AS orderId, carrier, tracking_reference AS trackingReference, status, created_at AS createdAt FROM scm_shipment WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  }
}
