export interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseType {
  id: number;
  name: string;
  description: string;
  departmentId: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  department?: Department;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentCreateInput {
  name: string;
  description: string;
  location: string;
}

export interface CaseTypeCreateInput {
  name: string;
  description: string;
  departmentId: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface AdminUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'super-admin' | 'admin' | 'agent' | 'manager';
  department?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin?: string;
}

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  status: 'active' | 'inactive';
  ticketCount: number;
  createdAt?: string;
}

export interface DashboardStats {
  totalAdmins: number;
  activeAdmins: number;
  superAdmins: number;
  totalCustomers: number;
  totalDepartments: number;
}

export interface UserPerformance {
  id: string;
  name: string;
  department: string;
  isOnline: boolean;
  avgRating: number;
  totalTickets: number;
  closedTickets: number;
  customersServed: number;
  durationWeekly: number; // in minutes
  durationMonthly: number;
  durationAnnually: number;
}
