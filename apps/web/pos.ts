export type PosTransactionStatus = 'open' | 'completed' | 'voided';

export interface PosTransaction {
  id: string;
  tenantId: string;
  reference: string;
  status: PosTransactionStatus;
  totalAmount: number;
  createdAt: string;
}

export interface PosDirectory {
  listTransactions(tenantId: string): Promise<readonly PosTransaction[]>;
}
