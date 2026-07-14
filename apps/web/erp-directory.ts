import Database from '@tauri-apps/plugin-sql';
import type { ErpDirectory, ErpItem, ErpPurchaseOrder, ErpSupplier } from './erp';

export class LocalErpDirectory implements ErpDirectory {
  async listItems(tenantId: string): Promise<readonly ErpItem[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<ErpItem[]>('SELECT id, tenant_id AS tenantId, sku, name, item_type AS itemType, unit_price AS unitPrice, created_at AS createdAt FROM erp_item WHERE tenant_id = $1 ORDER BY name', [tenantId]);
  }

  async listSuppliers(tenantId: string): Promise<readonly ErpSupplier[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<ErpSupplier[]>('SELECT id, tenant_id AS tenantId, name, email, phone, created_at AS createdAt FROM erp_supplier WHERE tenant_id = $1 ORDER BY name', [tenantId]);
  }

  async listPurchaseOrders(tenantId: string): Promise<readonly ErpPurchaseOrder[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<ErpPurchaseOrder[]>('SELECT id, tenant_id AS tenantId, supplier_id AS supplierId, status, total_amount AS totalAmount, created_at AS createdAt FROM erp_purchase_order WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  }
}
