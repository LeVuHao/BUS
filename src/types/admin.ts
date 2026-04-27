import type { BusStatus } from "./index";

export type AdminRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type EmployeeType = "DRIVER" | "ASSISTANT" | "TECHNICIAN" | "DISPATCHER" | "MANAGER";
export type BusType = "LIMOUSINE" | "SLEEPER" | "SEAT";
export type InsuranceStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED" | "UNKNOWN";

export interface AdminDashboardResponse {
  totalUsers: number;
  totalBuses: number;
  totalRoutes: number;
  totalTripsToday: number;
  lockedUsers: number;
  expiredInsuranceBuses: number;
  expiringInsuranceBuses: number;
  usersByRole: Record<AdminRole | string, number>;
  busesByStatus: Record<BusStatus | string, number>;
}

export interface AdminUserResponse {
  id: number;
  username: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  role?: AdminRole | string | null;
  status: UserStatus;
  employeeType?: EmployeeType | null;
  createdAt?: string | null;
}

export interface AdminUserCreateRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  employeeType: EmployeeType;
}

export interface AdminUserUpdateRequest {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  employeeType?: EmployeeType;
}

export interface AdminUserLockRequest {
  locked: boolean;
}

export interface AdminUserPasswordResetRequest {
  newPassword: string;
}

export interface AdminBusResponse {
  id: number;
  licensePlate: string;
  busType: BusType;
  totalSeats: number;
  status: BusStatus;
  lastMaintenanceDate?: string | null;
  insuranceExpiry?: string | null;
  insuranceStatus: InsuranceStatus;
}

export interface AdminBusCreateRequest {
  licensePlate: string;
  busType: BusType;
  totalSeats: number;
  status: BusStatus;
  lastMaintenanceDate?: string;
  insuranceExpiry?: string;
}

export interface AdminBusUpdateRequest {
  licensePlate?: string;
  busType?: BusType;
  totalSeats?: number;
  lastMaintenanceDate?: string;
  insuranceExpiry?: string;
}

export interface AdminBusStatusRequest {
  status: BusStatus;
}

export interface AdminRouteResponse {
  id: number;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDurationMin: number;
  basePrice: number;
  isActive: boolean;
}

export interface AdminRouteCreateRequest {
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDurationMin: number;
  basePrice: number;
  isActive: boolean;
}

export interface AdminRouteUpdateRequest {
  origin?: string;
  destination?: string;
  distanceKm?: number;
  estimatedDurationMin?: number;
  basePrice?: number;
  isActive?: boolean;
}
