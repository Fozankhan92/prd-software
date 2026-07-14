export type AccountingAccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface AccountingAccount {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  accountType: AccountingAccountType;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  tenantId: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  occurredAt: string;
}

export interface FinanceBudget {
  id: string;
  tenantId: string;
  name: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
}

export interface AccountingDirectory {
  listAccounts(tenantId: string): Promise<readonly AccountingAccount[]>;
  listJournalEntries(tenantId: string): Promise<readonly JournalEntry[]>;
  listBudgets(tenantId: string): Promise<readonly FinanceBudget[]>;
}

export function assertAccountingValues(entry: JournalEntry): void {
  if (!entry.tenantId || !entry.id || !entry.accountId) throw new Error('accounting_context_required');
  if (!Number.isFinite(entry.debit) || !Number.isFinite(entry.credit) || entry.debit < 0 || entry.credit < 0) {
    throw new Error('accounting_amount_invalid');
  }
}
