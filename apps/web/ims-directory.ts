import Database from '@tauri-apps/plugin-sql';
import type { ImsDirectory, ImsStockItem } from './ims';

export class LocalImsDirectory implements ImsDirectory {
  async listStock(tenantId: string): Promise<readonly ImsStockItem[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<ImsStockItem[]>('SELECT id, tenant_id AS tenantId, sku, name, quantity, reorder_level AS reorderLevel, created_at AS createdAt FROM ims_stock_item WHERE tenant_id = $1 ORDER BY name', [tenantId]);
  }

  async lowStock(tenantId: string): Promise<readonly ImsStockItem[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<ImsStockItem[]>('SELECT id, tenant_id AS tenantId, sku, name, quantity, reorder_level AS reorderLevel, created_at AS createdAt FROM ims_stock_item WHERE tenant_id = $1 AND quantity <= reorder_level ORDER BY name', [tenantId]);
  }
}
