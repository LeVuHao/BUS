import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createAdminBus,
  getAdminBuses,
  updateAdminBus,
  updateAdminBusStatus,
} from "../../api/admin";
import AdminCard from "../../components/admin/AdminCard";
import { AdminField, AdminInput, AdminSelect } from "../../components/admin/AdminField";
import AdminModal from "../../components/admin/AdminModal";
import StatusBadge from "../../components/ui/StatusBadge";
import { extractApiErrorMessage } from "../../utils/apiError";
import type { BusStatus } from "../../types";
import type {
  AdminBusCreateRequest,
  AdminBusResponse,
  AdminBusUpdateRequest,
  BusType,
  InsuranceStatus,
} from "../../types/admin";

const BUS_TYPES: BusType[] = ["LIMOUSINE", "SLEEPER", "SEAT"];
const BUS_STATUSES: BusStatus[] = ["AVAILABLE", "RUNNING", "MAINTENANCE"];

const emptyForm: AdminBusCreateRequest = {
  licensePlate: "",
  busType: "SLEEPER",
  totalSeats: 34,
  status: "AVAILABLE",
  lastMaintenanceDate: "",
  insuranceExpiry: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

function insuranceLabel(status: InsuranceStatus) {
  switch (status) {
    case "VALID":
      return "Còn hạn";
    case "EXPIRING_SOON":
      return "Sắp hết hạn";
    case "EXPIRED":
      return "Hết hạn";
    default:
      return "Chưa rõ";
  }
}

function insuranceClass(status: InsuranceStatus) {
  switch (status) {
    case "VALID":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "EXPIRING_SOON":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "EXPIRED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<AdminBusResponse[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<BusStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBusResponse | null>(null);
  const [form, setForm] = useState<AdminBusCreateRequest>(emptyForm);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminBuses({ keyword, status });
      setBuses(data);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => ({
    total: buses.length,
    available: buses.filter((bus) => bus.status === "AVAILABLE").length,
    maintenance: buses.filter((bus) => bus.status === "MAINTENANCE").length,
    expiring: buses.filter((bus) => bus.insuranceStatus === "EXPIRING_SOON" || bus.insuranceStatus === "EXPIRED").length,
  }), [buses]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(bus: AdminBusResponse) {
    setEditing(bus);
    setForm({
      licensePlate: bus.licensePlate,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      status: bus.status,
      lastMaintenanceDate: bus.lastMaintenanceDate ?? "",
      insuranceExpiry: bus.insuranceExpiry ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        licensePlate: form.licensePlate.trim().toUpperCase(),
        totalSeats: Number(form.totalSeats),
        lastMaintenanceDate: form.lastMaintenanceDate || undefined,
        insuranceExpiry: form.insuranceExpiry || undefined,
      };

      if (editing) {
        const updatePayload: AdminBusUpdateRequest = {
          licensePlate: payload.licensePlate,
          busType: payload.busType,
          totalSeats: payload.totalSeats,
          lastMaintenanceDate: payload.lastMaintenanceDate,
          insuranceExpiry: payload.insuranceExpiry,
        };
        await updateAdminBus(editing.id, updatePayload);
        if (editing.status !== payload.status) {
          await updateAdminBusStatus(editing.id, { status: payload.status });
        }
        toast.success("Đã cập nhật xe");
      } else {
        await createAdminBus(payload);
        toast.success("Đã thêm xe mới");
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(bus: AdminBusResponse, nextStatus: BusStatus) {
    try {
      await updateAdminBusStatus(bus.id, { status: nextStatus });
      toast.success("Đã cập nhật trạng thái xe");
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý xe</h1>
        <p className="mt-1 text-sm text-slate-500">Thêm xe, sửa thông tin xe và theo dõi trạng thái bảo hiểm.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AdminCard><div className="text-sm text-slate-500">Tổng xe</div><div className="mt-2 text-3xl font-bold">{stats.total}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Sẵn sàng</div><div className="mt-2 text-3xl font-bold">{stats.available}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Bảo trì</div><div className="mt-2 text-3xl font-bold">{stats.maintenance}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Cần chú ý bảo hiểm</div><div className="mt-2 text-3xl font-bold">{stats.expiring}</div></AdminCard>
      </div>

      <AdminCard title="Bộ lọc" actions={<button onClick={openCreate} className="rounded-xl bg-[#0F2849] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a68]">Thêm xe</button>}>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <AdminField label="Tìm kiếm"><AdminInput value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Biển số, loại xe..." /></AdminField>
          <AdminField label="Trạng thái"><AdminSelect value={status} onChange={(e) => setStatus(e.target.value as BusStatus | "")}><option value="">Tất cả</option>{BUS_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</AdminSelect></AdminField>
          <button onClick={() => void loadData()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Lọc</button>
        </div>
      </AdminCard>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <AdminCard title="Danh sách xe">
        {loading ? <div>Đang tải...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Biển số</th><th className="px-4 py-3">Loại xe</th><th className="px-4 py-3">Số ghế</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Bảo hiểm hết hạn</th><th className="px-4 py-3">Tình trạng BH</th><th className="px-4 py-3 text-right">Hành động</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{bus.licensePlate}</td>
                    <td className="px-4 py-3">{bus.busType}</td>
                    <td className="px-4 py-3">{bus.totalSeats}</td>
                    <td className="px-4 py-3"><StatusBadge status={bus.status} /></td>
                    <td className="px-4 py-3">{formatDate(bus.insuranceExpiry)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${insuranceClass(bus.insuranceStatus)}`}>{insuranceLabel(bus.insuranceStatus)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(bus)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">Sửa</button>
                        <select value={bus.status} onChange={(e) => void changeStatus(bus, e.target.value as BusStatus)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"><option value="AVAILABLE">Sẵn sàng</option><option value="RUNNING">Đang chạy</option><option value="MAINTENANCE">Bảo trì</option></select>
                      </div>
                    </td>
                  </tr>
                ))}
                {buses.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Không có dữ liệu.</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminModal open={modalOpen} title={editing ? "Sửa xe" : "Thêm xe"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Biển số"><AdminInput required value={form.licensePlate} onChange={(e) => setForm((p) => ({ ...p, licensePlate: e.target.value }))} /></AdminField>
          <AdminField label="Loại xe"><AdminSelect value={form.busType} onChange={(e) => setForm((p) => ({ ...p, busType: e.target.value as BusType }))}>{BUS_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</AdminSelect></AdminField>
          <AdminField label="Số ghế"><AdminInput type="number" min={1} required value={form.totalSeats} onChange={(e) => setForm((p) => ({ ...p, totalSeats: Number(e.target.value) }))} /></AdminField>
          <AdminField label="Trạng thái"><AdminSelect value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BusStatus }))}>{BUS_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</AdminSelect></AdminField>
          <AdminField label="Ngày bảo trì gần nhất"><AdminInput type="date" value={form.lastMaintenanceDate ?? ""} onChange={(e) => setForm((p) => ({ ...p, lastMaintenanceDate: e.target.value }))} /></AdminField>
          <AdminField label="Bảo hiểm hết hạn"><AdminInput type="date" value={form.insuranceExpiry ?? ""} onChange={(e) => setForm((p) => ({ ...p, insuranceExpiry: e.target.value }))} /></AdminField>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold">Hủy</button><button disabled={submitting} className="rounded-xl bg-[#0F2849] px-4 py-2 font-semibold text-white">Lưu</button></div>
        </form>
      </AdminModal>
    </div>
  );
}
