export interface ImsStockItem {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  createdAt: string;
}

export interface ImsDirectory {
  listStock(tenantId: string): Promise<readonly ImsStockItem[]>;
  lowStock(tenantId: string): Promise<readonly ImsStockItem[]>;
}

export function assertInventoryValues(item: ImsStockItem): void {
  if (!item.id || !item.tenantId) throw new Error('ims_tenant_context_required');
  if (!Number.isFinite(item.quantity) || !Number.isFinite(item.reorderLevel)) throw new Error('ims_quantity_invalid');
  if (item.quantity < 0 || item.reorderLevel < 0) throw new Error('ims_quantity_invalid');
}
