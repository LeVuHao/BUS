import { useCallback, useEffect, useState } from "react";
import { Users, Truck, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  AdminTrip,
  getAdminTrips,
  getAllEmployees,
  assignStaffToTrip,
  getStaffByTrip,
} from "../../api/admin";
import { Employee } from "../../types";
import { extractApiErrorMessage } from "../../utils/apiError";

export default function AdminAssignmentsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [assistants, setAssistants] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [selectedTripAssignments, setSelectedTripAssignments] = useState<Record<number, { driverId: string; assistantId: string }>>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tripsData, employeesData] = await Promise.all([
        getAdminTrips(),
        getAllEmployees(),
      ]);

      setTrips(tripsData);
      setEmployees(employeesData);
      setDrivers(employeesData.filter((e: Employee) => e.employeeType === "DRIVER"));
      setAssistants(employeesData.filter((e: Employee) => e.employeeType === "ASSISTANT"));

      // Load assignments for each trip
      const assignmentsMap: Record<number, { driverId: string; assistantId: string }> = {};
      for (const trip of tripsData) {
        try {
          const assignments = await getStaffByTrip(trip.id);
          const driver = assignments.find((a: any) => a.assignmentRole === "DRIVER");
          const assistant = assignments.find((a: any) => a.assignmentRole === "ASSISTANT");
          assignmentsMap[trip.id] = {
            driverId: driver?.employeeId?.toString() || "",
            assistantId: assistant?.employeeId?.toString() || "",
          };
        } catch {
          assignmentsMap[trip.id] = { driverId: "", assistantId: "" };
        }
      }
      setSelectedTripAssignments(assignmentsMap);
    } catch (err) {
      toast.error(extractApiErrorMessage(err) || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (tripId: number) => {
    const assignment = selectedTripAssignments[tripId];
    if (!assignment) return;

    setIsSaving(tripId);
    try {
      await assignStaffToTrip(
        tripId,
        assignment.driverId ? Number(assignment.driverId) : null,
        assignment.assistantId ? Number(assignment.assistantId) : null
      );
      toast.success("Phân công nhân sự thành công!");
      loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err) || "Không thể phân công");
    } finally {
      setIsSaving(null);
    }
  };

  const handleAssignmentChange = (tripId: number, type: "driverId" | "assistantId", value: string) => {
    setSelectedTripAssignments((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [type]: value,
      },
    }));
  };

  // Filter active trips (SCHEDULED or RUNNING)
  const activeTrips = trips.filter(
    (t) => t.status === "SCHEDULED" || t.status === "RUNNING"
  );

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <span className="badge badge-info">Đã lên lịch</span>;
      case "RUNNING":
        return <span className="badge badge-success">Đang chạy</span>;
      case "COMPLETED":
        return <span className="badge badge-neutral">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="badge badge-error">Đã hủy</span>;
      case "DELAYED":
        return <span className="badge badge-warning">Trễ</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="admin-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Trip Assignment
            </p>
            <h1 className="admin-title text-3xl">Phân công nhân sự</h1>
            <p className="admin-subtitle mt-2 text-sm">
              Gán Tài xế và Phụ xe cho các chuyến xe đang hoạt động.
            </p>
          </div>
          <button
            onClick={loadData}
            className="admin-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="admin-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeTrips.length}</p>
              <p className="text-xs text-slate-500">Chuyến đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="admin-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{drivers.length}</p>
              <p className="text-xs text-slate-500">Tài xế</p>
            </div>
          </div>
        </div>
        <div className="admin-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-3">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{assistants.length}</p>
              <p className="text-xs text-slate-500">Phụ xe</p>
            </div>
          </div>
        </div>
        <div className="admin-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {activeTrips.filter((t) => !t.assignments?.some((a: any) => a.role === "DRIVER")).length}
              </p>
              <p className="text-xs text-slate-500">Chuyến chưa có tài xế</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr>
                <th className="px-5 py-4">Chuyến</th>
                <th className="px-5 py-4">Tuyến đường</th>
                <th className="px-5 py-4">Xe</th>
                <th className="px-5 py-4">Giờ khởi hành</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Tài xế</th>
                <th className="px-5 py-4">Phụ xe</th>
                <th className="px-5 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : activeTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-slate-400">
                    Không có chuyến nào đang hoạt động.
                  </td>
                </tr>
              ) : (
                activeTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">#{trip.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-700">{trip.routeName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-600">{trip.busLabel}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatDateTime(trip.departureTime)}
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(trip.status)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={selectedTripAssignments[trip.id]?.driverId || ""}
                        onChange={(e) => handleAssignmentChange(trip.id, "driverId", e.target.value)}
                        className="admin-select w-full min-w-[140px] px-2 py-1.5 text-sm"
                      >
                        <option value="">-- Chọn tài xế --</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.fullName} ({d.phone})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={selectedTripAssignments[trip.id]?.assistantId || ""}
                        onChange={(e) => handleAssignmentChange(trip.id, "assistantId", e.target.value)}
                        className="admin-select w-full min-w-[140px] px-2 py-1.5 text-sm"
                      >
                        <option value="">-- Chọn phụ xe --</option>
                        {assistants.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.fullName} ({a.phone})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAssign(trip.id)}
                          disabled={isSaving === trip.id}
                          className="admin-button-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                        >
                          {isSaving === trip.id ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              Lưu
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Instructions */}
      <section className="admin-panel p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Hướng dẫn sử dụng</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <span>Chọn Tài xế và Phụ xe từ danh sách dropdown cho mỗi chuyến xe</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <span>Nhấn nút "Lưu" để xác nhận phân công nhân sự cho chuyến</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            <span>Có thể thay đổi phân công bất kỳ lúc nào trước khi chuyến khởi hành</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
