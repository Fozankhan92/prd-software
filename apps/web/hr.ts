export type EmploymentStatus = 'active' | 'on_leave' | 'terminated';

export interface HrDepartment {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export interface HrEmployee {
  id: string;
  tenantId: string;
  departmentId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  employmentStatus: EmploymentStatus;
  createdAt: string;
}

export interface HrDirectory {
  listDepartments(tenantId: string): Promise<readonly HrDepartment[]>;
  listEmployees(tenantId: string): Promise<readonly HrEmployee[]>;
  createDepartment(input: Omit<HrDepartment, 'id' | 'createdAt'>): Promise<HrDepartment>;
  createEmployee(input: Omit<HrEmployee, 'id' | 'createdAt'>): Promise<HrEmployee>;
}
