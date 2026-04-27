import apiClient from "./apiClient";
import type {
  AdminBusCreateRequest,
  AdminBusResponse,
  AdminBusStatusRequest,
  AdminBusUpdateRequest,
  AdminDashboardResponse,
  AdminRouteCreateRequest,
  AdminRouteResponse,
  AdminRouteUpdateRequest,
  AdminUserCreateRequest,
  AdminUserLockRequest,
  AdminUserPasswordResetRequest,
  AdminUserResponse,
  AdminUserUpdateRequest,
  UserStatus,
} from "../types/admin";
import type { BusStatus } from "../types";

export interface AdminUserFilter {
  keyword?: string;
  role?: string;
  status?: UserStatus | "";
}

export interface AdminBusFilter {
  keyword?: string;
  status?: BusStatus | "";
}

export interface AdminRouteFilter {
  keyword?: string;
  activeOnly?: boolean;
}

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get<AdminDashboardResponse>("/admin/dashboard");
  return response.data;
}

export async function getAdminUsers(filter: AdminUserFilter = {}): Promise<AdminUserResponse[]> {
  const response = await apiClient.get<AdminUserResponse[]>("/admin/users", {
    params: cleanParams(filter),
  });
  return response.data;
}

export async function getAdminUser(id: number): Promise<AdminUserResponse> {
  const response = await apiClient.get<AdminUserResponse>(`/admin/users/${id}`);
  return response.data;
}

export async function createAdminUser(payload: AdminUserCreateRequest): Promise<AdminUserResponse> {
  const response = await apiClient.post<AdminUserResponse>("/admin/users", payload);
  return response.data;
}

export async function updateAdminUser(
  id: number,
  payload: AdminUserUpdateRequest,
): Promise<AdminUserResponse> {
  const response = await apiClient.put<AdminUserResponse>(`/admin/users/${id}`, payload);
  return response.data;
}

export async function updateAdminUserLock(
  id: number,
  payload: AdminUserLockRequest,
): Promise<AdminUserResponse> {
  const response = await apiClient.put<AdminUserResponse>(`/admin/users/${id}/lock`, payload);
  return response.data;
}

export async function resetAdminUserPassword(
  id: number,
  payload: AdminUserPasswordResetRequest,
): Promise<AdminUserResponse> {
  const response = await apiClient.put<AdminUserResponse>(`/admin/users/${id}/password`, payload);
  return response.data;
}

export async function getAdminBuses(filter: AdminBusFilter = {}): Promise<AdminBusResponse[]> {
  const response = await apiClient.get<AdminBusResponse[]>("/admin/buses", {
    params: cleanParams(filter),
  });
  return response.data;
}

export async function createAdminBus(payload: AdminBusCreateRequest): Promise<AdminBusResponse> {
  const response = await apiClient.post<AdminBusResponse>("/admin/buses", payload);
  return response.data;
}

export async function updateAdminBus(
  id: number,
  payload: AdminBusUpdateRequest,
): Promise<AdminBusResponse> {
  const response = await apiClient.put<AdminBusResponse>(`/admin/buses/${id}`, payload);
  return response.data;
}

export async function updateAdminBusStatus(
  id: number,
  payload: AdminBusStatusRequest,
): Promise<AdminBusResponse> {
  const response = await apiClient.put<AdminBusResponse>(`/admin/buses/${id}/status`, payload);
  return response.data;
}

export async function getAdminRoutes(filter: AdminRouteFilter = {}): Promise<AdminRouteResponse[]> {
  const response = await apiClient.get<AdminRouteResponse[]>("/admin/routes", {
    params: cleanParams(filter),
  });
  return response.data;
}

export async function createAdminRoute(
  payload: AdminRouteCreateRequest,
): Promise<AdminRouteResponse> {
  const response = await apiClient.post<AdminRouteResponse>("/admin/routes", payload);
  return response.data;
}

export async function updateAdminRoute(
  id: number,
  payload: AdminRouteUpdateRequest,
): Promise<AdminRouteResponse> {
  const response = await apiClient.put<AdminRouteResponse>(`/admin/routes/${id}`, payload);
  return response.data;
}
