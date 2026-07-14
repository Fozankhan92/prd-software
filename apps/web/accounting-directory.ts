import Database from '@tauri-apps/plugin-sql';
import type { AccountingAccount, AccountingDirectory, FinanceBudget, JournalEntry } from './accounting';

export class LocalAccountingDirectory implements AccountingDirectory {
  async listAccounts(tenantId: string): Promise<readonly AccountingAccount[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<AccountingAccount[]>('SELECT id, tenant_id AS tenantId, code, name, account_type AS accountType, created_at AS createdAt FROM accounting_account WHERE tenant_id = $1 ORDER BY code', [tenantId]);
  }

  async listJournalEntries(tenantId: string): Promise<readonly JournalEntry[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<JournalEntry[]>('SELECT id, tenant_id AS tenantId, account_id AS accountId, description, debit, credit, occurred_at AS occurredAt FROM accounting_journal_entry WHERE tenant_id = $1 ORDER BY occurred_at DESC', [tenantId]);
  }

  async listBudgets(tenantId: string): Promise<readonly FinanceBudget[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<FinanceBudget[]>('SELECT id, tenant_id AS tenantId, name, amount, period_start AS periodStart, period_end AS periodEnd FROM finance_budget WHERE tenant_id = $1 ORDER BY period_start DESC', [tenantId]);
  }
}
