import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { createAdminRoute, getAdminRoutes, updateAdminRoute } from "../../api/admin";
import AdminCard from "../../components/admin/AdminCard";
import { AdminField, AdminInput, AdminSelect } from "../../components/admin/AdminField";
import AdminModal from "../../components/admin/AdminModal";
import { extractApiErrorMessage } from "../../utils/apiError";
import type {
  AdminRouteCreateRequest,
  AdminRouteResponse,
  AdminRouteUpdateRequest,
} from "../../types/admin";

const emptyForm: AdminRouteCreateRequest = {
  origin: "",
  destination: "",
  distanceKm: 0,
  estimatedDurationMin: 0,
  basePrice: 0,
  isActive: true,
};

function currency(value: number) {
  return Number(value ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function numberText(value: number) {
  return Number(value ?? 0).toLocaleString("vi-VN");
}

function durationText(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} phút`;
  if (m <= 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<AdminRouteResponse[]>([]);
  const [keyword, setKeyword] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRouteResponse | null>(null);
  const [form, setForm] = useState<AdminRouteCreateRequest>(emptyForm);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminRoutes({ keyword, activeOnly });
      setRoutes(data);
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
    total: routes.length,
    active: routes.filter((route) => route.isActive).length,
    totalDistance: routes.reduce((sum, route) => sum + Number(route.distanceKm || 0), 0),
    averagePrice: routes.length ? routes.reduce((sum, route) => sum + Number(route.basePrice || 0), 0) / routes.length : 0,
  }), [routes]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(route: AdminRouteResponse) {
    setEditing(route);
    setForm({
      origin: route.origin,
      destination: route.destination,
      distanceKm: Number(route.distanceKm),
      estimatedDurationMin: route.estimatedDurationMin,
      basePrice: Number(route.basePrice),
      isActive: route.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        distanceKm: Number(form.distanceKm),
        estimatedDurationMin: Number(form.estimatedDurationMin),
        basePrice: Number(form.basePrice),
        isActive: Boolean(form.isActive),
      };

      if (editing) {
        await updateAdminRoute(editing.id, payload as AdminRouteUpdateRequest);
        toast.success("Đã cập nhật tuyến");
      } else {
        await createAdminRoute(payload);
        toast.success("Đã thêm tuyến");
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý tuyến đường</h1>
        <p className="mt-1 text-sm text-slate-500">Tạo và cập nhật tuyến, khoảng cách, thời gian dự kiến và giá vé cơ bản.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AdminCard><div className="text-sm text-slate-500">Tổng tuyến</div><div className="mt-2 text-3xl font-bold">{stats.total}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Đang hoạt động</div><div className="mt-2 text-3xl font-bold">{stats.active}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Tổng km</div><div className="mt-2 text-3xl font-bold">{numberText(stats.totalDistance)}</div></AdminCard>
        <AdminCard><div className="text-sm text-slate-500">Giá TB</div><div className="mt-2 text-2xl font-bold">{currency(stats.averagePrice)}</div></AdminCard>
      </div>

      <AdminCard title="Bộ lọc" actions={<button onClick={openCreate} className="rounded-xl bg-[#0F2849] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a68]">Thêm tuyến</button>}>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <AdminField label="Tìm kiếm"><AdminInput value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Điểm đi hoặc điểm đến" /></AdminField>
          <AdminField label="Trạng thái"><AdminSelect value={activeOnly ? "true" : "false"} onChange={(e) => setActiveOnly(e.target.value === "true")}><option value="false">Tất cả</option><option value="true">Chỉ tuyến hoạt động</option></AdminSelect></AdminField>
          <button onClick={() => void loadData()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Lọc</button>
        </div>
      </AdminCard>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <AdminCard title="Danh sách tuyến đường">
        {loading ? <div>Đang tải...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Điểm đi</th><th className="px-4 py-3">Điểm đến</th><th className="px-4 py-3">Khoảng cách</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Giá vé</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{route.origin}</td>
                    <td className="px-4 py-3">{route.destination}</td>
                    <td className="px-4 py-3">{numberText(route.distanceKm)} km</td>
                    <td className="px-4 py-3">{durationText(route.estimatedDurationMin)}</td>
                    <td className="px-4 py-3">{currency(route.basePrice)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${route.isActive ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>{route.isActive ? "Hoạt động" : "Tạm ngưng"}</span></td>
                    <td className="px-4 py-3 text-right"><button onClick={() => openEdit(route)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">Sửa</button></td>
                  </tr>
                ))}
                {routes.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Không có dữ liệu.</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminModal open={modalOpen} title={editing ? "Sửa tuyến" : "Thêm tuyến"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Điểm đi"><AdminInput required value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))} /></AdminField>
          <AdminField label="Điểm đến"><AdminInput required value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))} /></AdminField>
          <AdminField label="Khoảng cách (km)"><AdminInput required type="number" min={0.1} step="0.1" value={form.distanceKm} onChange={(e) => setForm((p) => ({ ...p, distanceKm: Number(e.target.value) }))} /></AdminField>
          <AdminField label="Thời gian dự kiến (phút)"><AdminInput required type="number" min={1} value={form.estimatedDurationMin} onChange={(e) => setForm((p) => ({ ...p, estimatedDurationMin: Number(e.target.value) }))} /></AdminField>
          <AdminField label="Giá vé cơ bản"><AdminInput required type="number" min={1000} step="1000" value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: Number(e.target.value) }))} /></AdminField>
          <AdminField label="Trạng thái"><AdminSelect value={form.isActive ? "true" : "false"} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "true" }))}><option value="true">Hoạt động</option><option value="false">Tạm ngưng</option></AdminSelect></AdminField>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold">Hủy</button><button disabled={submitting} className="rounded-xl bg-[#0F2849] px-4 py-2 font-semibold text-white">Lưu</button></div>
        </form>
      </AdminModal>
    </div>
  );
}
