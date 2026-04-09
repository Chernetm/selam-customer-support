import client from './client';
import { 
  Department,
  CaseType,
  DepartmentCreateInput, 
  CaseTypeCreateInput,
  AdminUser,
  CustomerUser,
  UserPerformance
} from '@/types/admin';

class SystemAdminService {
  /**
   * User Management (Admins/Agents)
   */
  async getAdmins(): Promise<AdminUser[]> {
    const response = await client.get('/admin/super/users');
    return response.data;
  }

  async updateAdmin(uid: string, data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await client.put(`/admin/super/users/${uid}`, data);
    return response.data;
  }

  async getUserPerformance(): Promise<UserPerformance[]> {
    const response = await client.get('/admin/super/performance'); // Updated to match AdminDashboard.jsx usage
    return response.data;
  }

  async getTicketReports(period: 'weekly' | 'monthly' = 'weekly'): Promise<any> {
    const response = await client.get(`/admin/tickets/reports?period=${period}`);
    return response.data;
  }

  /**
   * Customer Management
   */
  async getCustomers(): Promise<CustomerUser[]> {
    const response = await client.get('/admin/customers');
    return response.data;
  }

  async updateCustomerStatus(id: number, status: string): Promise<CustomerUser> {
    const response = await client.patch(`/admin/customers/${id}/status`, { status });
    return response.data;
  }

  /**
   * Department Operations
   */
  async getDepartments(): Promise<Department[]> {
    const response = await client.get('/admin/departments/');
    return response.data;
  }

  async createDepartment(data: DepartmentCreateInput): Promise<Department> {
    const response = await client.post('/admin/departments/', data);
    return response.data;
  }

  async updateDepartment(id: number, data: Partial<DepartmentCreateInput>): Promise<Department> {
    const response = await client.put(`/admin/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: number): Promise<void> {
    await client.delete(`/admin/departments/${id}`);
  }

  /**
   * Case Type Operations
   */
  async getCaseTypes(): Promise<CaseType[]> {
    const response = await client.get('/admin/cases/');
    return response.data;
  }

  async createCaseType(data: CaseTypeCreateInput): Promise<CaseType> {
    const response = await client.post('/admin/cases/', data);
    return response.data;
  }

  async updateCaseType(id: number, data: Partial<CaseTypeCreateInput>): Promise<CaseType> {
    const response = await client.put(`/admin/cases/${id}`, data);
    return response.data;
  }

  async deleteCaseType(id: number): Promise<void> {
    await client.delete(`/admin/cases/${id}`);
  }
}

// Export a singleton instance
export const systemAdminService = new SystemAdminService();
export default systemAdminService;
