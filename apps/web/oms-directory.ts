import Database from '@tauri-apps/plugin-sql';
import type { OmsDirectory, OmsOrder } from './oms';

export class LocalOmsDirectory implements OmsDirectory {
  async listOrders(tenantId: string): Promise<readonly OmsOrder[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<OmsOrder[]>('SELECT id, tenant_id AS tenantId, reference, status, total_amount AS totalAmount, created_at AS createdAt FROM oms_order WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  }
}
