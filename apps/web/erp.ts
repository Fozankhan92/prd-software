export type ErpItemType = 'product' | 'service' | 'asset' | 'expense';
export type PurchaseOrderStatus = 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';

export interface ErpItem {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  itemType: ErpItemType;
  unitPrice: number;
  createdAt: string;
}

export interface ErpSupplier {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface ErpPurchaseOrder {
  id: string;
  tenantId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface ErpDirectory {
  listItems(tenantId: string): Promise<readonly ErpItem[]>;
  listSuppliers(tenantId: string): Promise<readonly ErpSupplier[]>;
  listPurchaseOrders(tenantId: string): Promise<readonly ErpPurchaseOrder[]>;
}


export function assertErpTenantContext(record: ErpItem | ErpSupplier | ErpPurchaseOrder): void {
  if (!record.id || !record.tenantId) throw new Error('erp_tenant_context_required');
  if ('unitPrice' in record && (!Number.isFinite(record.unitPrice) || record.unitPrice < 0)) throw new Error('erp_unit_price_invalid');
  if ('totalAmount' in record && (!Number.isFinite(record.totalAmount) || record.totalAmount < 0)) throw new Error('erp_total_amount_invalid');
}
