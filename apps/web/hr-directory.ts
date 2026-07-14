import Database from '@tauri-apps/plugin-sql';
import type { EmploymentStatus, HrDepartment, HrDirectory, HrEmployee } from './hr';

export class LocalHrDirectory implements HrDirectory {
  async listDepartments(tenantId: string): Promise<readonly HrDepartment[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<HrDepartment[]>('SELECT id, tenant_id AS tenantId, name, created_at AS createdAt FROM hr_department WHERE tenant_id = $1 ORDER BY name', [tenantId]);
  }

  async listEmployees(tenantId: string): Promise<readonly HrEmployee[]> {
    const database = await Database.load('sqlite:prd.sqlite');
    return database.select<HrEmployee[]>('SELECT id, tenant_id AS tenantId, department_id AS departmentId, first_name AS firstName, last_name AS lastName, email, employment_status AS employmentStatus, created_at AS createdAt FROM hr_employee WHERE tenant_id = $1 ORDER BY last_name, first_name', [tenantId]);
  }

  async createDepartment(input: Omit<HrDepartment, 'id' | 'createdAt'>): Promise<HrDepartment> {
    const database = await Database.load('sqlite:prd.sqlite');
    const department = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await database.execute('INSERT INTO hr_department (id, tenant_id, name, created_at) VALUES ($1, $2, $3, $4)', [department.id, department.tenantId, department.name, department.createdAt]);
    return department;
  }

  async createEmployee(input: Omit<HrEmployee, 'id' | 'createdAt'>): Promise<HrEmployee> {
    const database = await Database.load('sqlite:prd.sqlite');
    const employee = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await database.execute('INSERT INTO hr_employee (id, tenant_id, department_id, first_name, last_name, email, employment_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [employee.id, employee.tenantId, employee.departmentId ?? null, employee.firstName, employee.lastName, employee.email ?? null, employee.employmentStatus satisfies EmploymentStatus, employee.createdAt]);
    return employee;
  }
}
