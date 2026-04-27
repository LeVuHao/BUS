import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserLock,
} from "../../api/admin";
import AdminCard from "../../components/admin/AdminCard";
import { AdminField, AdminInput, AdminSelect } from "../../components/admin/AdminField";
import AdminModal from "../../components/admin/AdminModal";
import StatusBadge from "../../components/ui/StatusBadge";
import { extractApiErrorMessage } from "../../utils/apiError";
import type {
  AdminUserCreateRequest,
  AdminUserResponse,
  AdminUserUpdateRequest,
  EmployeeType,
  UserStatus,
} from "../../types/admin";

const EMPLOYEE_TYPES: EmployeeType[] = ["DISPATCHER", "DRIVER", "ASSISTANT", "TECHNICIAN", "MANAGER"];
const USER_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "LOCKED"];

const emptyCreateForm: AdminUserCreateRequest = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  employeeType: "DISPATCHER",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

function labelEmployeeType(value?: string | null) {
  switch (value) {
    case "DRIVER":
      return "Tài xế";
    case "ASSISTANT":
      return "Phụ xe";
    case "TECHNICIAN":
      return "Kỹ thuật";
    case "MANAGER":
      return "Quản lý";
    case "DISPATCHER":
      return "Điều phối";
    default:
      return "-";
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserResponse | null>(null);
  const [createForm, setCreateForm] = useState<AdminUserCreateRequest>(emptyCreateForm);
  const [editForm, setEditForm] = useState<AdminUserUpdateRequest>({});
  const [newPassword, setNewPassword] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers({ keyword, status });
      setUsers(data);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === "ACTIVE").length,
      locked: users.filter((user) => user.status === "LOCKED").length,
      staff: users.filter((user) => user.role === "STAFF").length,
    };
  }, [users]);

  function openCreate() {
    setCreateForm(emptyCreateForm);
    setCreateOpen(true);
  }

  function openEdit(user: AdminUserResponse) {
    setEditUser(user);
    setNewPassword("");
    setEditForm({
      username: user.username,
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      status: user.status,
      employeeType: (user.employeeType ?? "DISPATCHER") as EmployeeType,
    });
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createAdminUser({
        ...createForm,
        email: createForm.email?.trim() || undefined,
        phone: createForm.phone?.trim() || undefined,
      });
      toast.success("Đã tạo tài khoản staff");
      setCreateOpen(false);
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(event: FormEvent) {
    event.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      await updateAdminUser(editUser.id, {
        ...editForm,
        email: editForm.email?.trim() || "",
        phone: editForm.phone?.trim() || "",
      });
      toast.success("Đã cập nhật tài khoản");
      setEditUser(null);
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLock(user: AdminUserResponse) {
    try {
      await updateAdminUserLock(user.id, { locked: user.status !== "LOCKED" });
      toast.success(user.status === "LOCKED" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    }
  }

  async function handleResetPassword() {
    if (!editUser || !newPassword.trim()) return;
    try {
      await resetAdminUserPassword(editUser.id, { newPassword });
      toast.success("Đã đổi mật khẩu");
      setNewPassword("");
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Tạo tài khoản staff, sửa thông tin và khóa/mở khóa tài khoản.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AdminCard><div className="text-sm text-slate-500">Tổng tài khoản</div><div className="mt-2 text-3xl font-bold">{stats.total}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Đang hoạt động</div><div className="mt-2 text-3xl font-bold">{stats.active}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Bị khóa</div><div className="mt-2 text-3xl font-bold">{stats.locked}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Staff</div><div className="mt-2 text-3xl font-bold">{stats.staff}</div></AdminCard>
      </div>

      <AdminCard title="Bộ lọc" actions={<button onClick={openCreate} className="rounded-xl bg-[#0F2849] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a68]">Tạo tài khoản Staff</button>}>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <AdminField label="Tìm kiếm">
            <AdminInput value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tên, username, email, phone..." />
          </AdminField>
          <AdminField label="Trạng thái">
            <AdminSelect value={status} onChange={(event) => setStatus(event.target.value as UserStatus | "")}> 
              <option value="">Tất cả</option>
              {USER_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </AdminSelect>
          </AdminField>
          <button onClick={() => void loadData()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Lọc</button>
        </div>
      </AdminCard>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <AdminCard title="Danh sách users">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Loại NV</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><div className="font-semibold text-slate-900">{user.fullName || "-"}</div><div className="text-xs text-slate-500">{user.email || user.phone || "-"}</div></td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{labelEmployeeType(user.employeeType)}</td>
                    <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                    <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(user)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">Sửa</button>
                        <button onClick={() => void toggleLock(user)} className="rounded-lg border border-amber-200 px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-50">{user.status === "LOCKED" ? "Mở khóa" : "Khóa"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Không có dữ liệu.</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminModal open={createOpen} title="Tạo tài khoản Staff" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Họ tên"><AdminInput required value={createForm.fullName} onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))} /></AdminField>
          <AdminField label="Username"><AdminInput required value={createForm.username} onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))} /></AdminField>
          <AdminField label="Mật khẩu"><AdminInput required type="password" minLength={6} value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} /></AdminField>
          <AdminField label="Loại nhân viên"><AdminSelect value={createForm.employeeType} onChange={(e) => setCreateForm((p) => ({ ...p, employeeType: e.target.value as EmployeeType }))}>{EMPLOYEE_TYPES.map((item) => <option key={item} value={item}>{labelEmployeeType(item)}</option>)}</AdminSelect></AdminField>
          <AdminField label="Email"><AdminInput type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} /></AdminField>
          <AdminField label="Số điện thoại"><AdminInput value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} /></AdminField>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2"><button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold">Hủy</button><button disabled={submitting} className="rounded-xl bg-[#0F2849] px-4 py-2 font-semibold text-white">Lưu</button></div>
        </form>
      </AdminModal>

      <AdminModal open={!!editUser} title="Sửa tài khoản" onClose={() => setEditUser(null)}>
        <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Họ tên"><AdminInput value={editForm.fullName ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))} /></AdminField>
          <AdminField label="Username"><AdminInput value={editForm.username ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))} /></AdminField>
          <AdminField label="Email"><AdminInput type="email" value={editForm.email ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} /></AdminField>
          <AdminField label="Số điện thoại"><AdminInput value={editForm.phone ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} /></AdminField>
          <AdminField label="Trạng thái"><AdminSelect value={editForm.status ?? "ACTIVE"} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as UserStatus }))}>{USER_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</AdminSelect></AdminField>
          <AdminField label="Loại nhân viên"><AdminSelect value={editForm.employeeType ?? "DISPATCHER"} onChange={(e) => setEditForm((p) => ({ ...p, employeeType: e.target.value as EmployeeType }))}>{EMPLOYEE_TYPES.map((item) => <option key={item} value={item}>{labelEmployeeType(item)}</option>)}</AdminSelect></AdminField>
          <div className="md:col-span-2 rounded-2xl bg-slate-50 p-4">
            <AdminField label="Đổi mật khẩu"><div className="flex gap-2"><AdminInput type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" /><button type="button" onClick={() => void handleResetPassword()} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold whitespace-nowrap">Đổi</button></div></AdminField>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditUser(null)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold">Hủy</button><button disabled={submitting} className="rounded-xl bg-[#0F2849] px-4 py-2 font-semibold text-white">Lưu</button></div>
        </form>
      </AdminModal>
    </div>
  );
}
