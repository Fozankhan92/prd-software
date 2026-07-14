import Database from '@tauri-apps/plugin-sql';
import type { User, UserDirectory, UserStatus } from './identity';

type UserRow = {
  id: string;
  tenant_id: string;
  email: string;
  display_name: string;
  role: User['roles'][number];
  status: UserStatus;
};

export class LocalUserDirectory implements UserDirectory {
  async list(tenantId: string): Promise<readonly User[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    const rows = await database.select<UserRow[]>('SELECT id, tenant_id, email, display_name, role, status FROM app_user WHERE tenant_id = $1 ORDER BY display_name', [tenantId]);
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      email: row.email,
      displayName: row.display_name,
      roles: [row.role],
      status: row.status,
    }));
  }

  async setStatus(userId: string, status: UserStatus): Promise<void> {
    const database = await Database.load('sqlite:prd.sqlite');
    await database.execute('UPDATE app_user SET status = $1 WHERE id = $2', [status, userId]);
  }
}
