import { AlertTriangle, Bus, MapPinned, Users, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getAdminDashboard } from "../../api/admin";
import AdminCard from "../../components/admin/AdminCard";
import { extractApiErrorMessage } from "../../utils/apiError";
import type { AdminDashboardResponse } from "../../types/admin";

function numberText(value?: number) {
  return Number(value ?? 0).toLocaleString("vi-VN");
}

function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{numberText(value)}</p>
        </div>
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">{icon}</div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function BarRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{numberText(value)} ({percent}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#0F2849]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAdminDashboard()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((err) => {
        if (mounted) setError(extractApiErrorMessage(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const usersByRole = useMemo(() => data?.usersByRole ?? {}, [data]);
  const busesByStatus = useMemo(() => data?.busesByStatus ?? {}, [data]);

  if (loading) {
    return <section className="rounded-3xl bg-white p-6 shadow-sm">Đang tải dashboard...</section>;
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Không tải được dashboard: {error}
      </section>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan quản trị</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi số liệu tổng quát về user, xe, tuyến và chuyến xe trong ngày.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng user" value={data.totalUsers} helper="Toàn bộ tài khoản hệ thống" icon={<Users className="h-6 w-6" />} />
        <StatCard label="Tổng xe" value={data.totalBuses} helper="Số xe trong đội xe" icon={<Bus className="h-6 w-6" />} />
        <StatCard label="Tổng tuyến" value={data.totalRoutes} helper="Tuyến đang hoạt động" icon={<MapPinned className="h-6 w-6" />} />
        <StatCard label="Chuyến hôm nay" value={data.totalTripsToday} helper="Chuyến có giờ khởi hành hôm nay" icon={<CalendarDays className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Cơ cấu tài khoản" description="Dữ liệu lấy từ /api/admin/dashboard">
          <div className="space-y-4">
            <BarRow label="Admin" value={usersByRole.ADMIN ?? 0} total={data.totalUsers} />
            <BarRow label="Staff" value={usersByRole.STAFF ?? 0} total={data.totalUsers} />
            <BarRow label="Customer" value={usersByRole.CUSTOMER ?? 0} total={data.totalUsers} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Tài khoản đang khóa: <strong className="text-slate-900">{numberText(data.lockedUsers)}</strong>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Tình trạng đội xe" description="Theo trạng thái vận hành và bảo hiểm">
          <div className="space-y-4">
            <BarRow label="Sẵn sàng" value={busesByStatus.AVAILABLE ?? 0} total={data.totalBuses} />
            <BarRow label="Đang chạy" value={busesByStatus.RUNNING ?? 0} total={data.totalBuses} />
            <BarRow label="Bảo trì" value={busesByStatus.MAINTENANCE ?? 0} total={data.totalBuses} />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Hết hạn bảo hiểm</div>
                <div className="mt-2 text-2xl font-bold">{numberText(data.expiredInsuranceBuses)}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <div className="font-semibold">Sắp hết hạn trong 30 ngày</div>
                <div className="mt-2 text-2xl font-bold">{numberText(data.expiringInsuranceBuses)}</div>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
