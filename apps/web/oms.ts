export type OmsOrderStatus = 'draft' | 'confirmed' | 'fulfilling' | 'fulfilled' | 'cancelled';

export interface OmsOrder {
  id: string;
  tenantId: string;
  reference: string;
  status: OmsOrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface OmsDirectory {
  listOrders(tenantId: string): Promise<readonly OmsOrder[]>;
}
