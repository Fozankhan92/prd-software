import Database from '@tauri-apps/plugin-sql';
import type { PosDirectory, PosTransaction } from './pos';

export class LocalPosDirectory implements PosDirectory {
  async listTransactions(tenantId: string): Promise<readonly PosTransaction[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<PosTransaction[]>('SELECT id, tenant_id AS tenantId, reference, status, total_amount AS totalAmount, created_at AS createdAt FROM pos_transaction WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  }
}
