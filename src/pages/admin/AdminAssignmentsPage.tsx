// ============================================================================
// ADMIN ASSIGNMENTS PAGE — Phân công nhân sự (Admin)
// Tính năng: gán tài xế + phụ xe cho từng chuyến, quản lý DS nhân viên
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import {
  AdminTrip,
  getAdminTrips,
  getAllEmployees,
  assignStaffToTrip,
  createEmployee,
  getStaffByTrip,
} from "../../api/admin";
import { Employee } from "../../types";
import Pagination from "../../components/ui/Pagination";
import { extractApiErrorMessage } from "../../utils/apiError";
import toast from "react-hot-toast";
import { useAssignmentsStore } from "../../stores/assignmentsStore";
import {
  Users,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Phone,
  Award,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Plus,
  X,
  TrendingUp,
  CheckSquare,
  UserCheck,
} from "lucide-react";

const STAFF_BADGES: Record<string, {
  licenseType: string;
  birthday: string;
  achievements: string[];
  totalTrips: number;
}> = {
  // ─────────────── TÀI XẾ (DRIVER) ───────────────
  "Nguyễn Văn An":    { licenseType: "GPLX hạng E", birthday: "15/03/1986", achievements: ["An toàn 12 năm", "940+ chuyến"], totalTrips: 940 },
  "Trần Văn Bình":    { licenseType: "GPLX hạng E", birthday: "22/07/1988", achievements: ["An toàn 10 năm", "760+ chuyến"], totalTrips: 760 },
  "Lê Đình Cường":    { licenseType: "GPLX hạng E", birthday: "10/01/1983", achievements: ["An toàn 14 năm", "1.150+ chuyến", "Chuyên tuyến dài Bắc–Nam"], totalTrips: 1150 },
  "Phạm Văn Dũng":    { licenseType: "GPLX hạng D", birthday: "05/09/1991", achievements: ["Tay nghề vững", "510+ chuyến"], totalTrips: 510 },
  "Hoàng Văn Em":      { licenseType: "GPLX hạng D", birthday: "25/04/1995", achievements: ["Nhiệt tình", "320+ chuyến"], totalTrips: 320 },
  "Đặng Văn Phong":    { licenseType: "GPLX hạng E", birthday: "20/06/1979", achievements: ["An toàn 15 năm", "1.420+ chuyến", "Lái xe kỳ cựu"], totalTrips: 1420 },
  "Bùi Văn Quang":     { licenseType: "GPLX hạng E", birthday: "12/11/1989", achievements: ["An toàn 9 năm", "680+ chuyến"], totalTrips: 680 },
  "Đỗ Văn Sơn":        { licenseType: "GPLX hạng E", birthday: "08/05/1984", achievements: ["An toàn 11 năm", "880+ chuyến"], totalTrips: 880 },
  "Ngô Văn Tài":       { licenseType: "GPLX hạng D", birthday: "30/08/1996", achievements: ["Tuyển tài năng trẻ", "210+ chuyến"], totalTrips: 210 },
  "Vũ Văn Thành":      { licenseType: "GPLX hạng D", birthday: "18/02/1990", achievements: ["Chuyên tuyến miền Trung", "440+ chuyến"], totalTrips: 440 },

  // ─────────────── PHỤ XE (ASSISTANT) ───────────────
  "Lý Thị Hương":      { licenseType: "Chứng chỉ PX", birthday: "18/08/1990", achievements: ["9 năm kinh nghiệm", "Hỗ trợ chuyên nghiệp", "720+ chuyến"], totalTrips: 720 },
  "Trương Thị Lan":    { licenseType: "Chứng chỉ PX", birthday: "12/05/1993", achievements: ["6 năm kinh nghiệm", "Chuyên chăm sóc khách"], totalTrips: 460 },
  "Phan Thị Mai":      { licenseType: "Chứng chỉ PX", birthday: "20/11/1998", achievements: ["4 năm kinh nghiệm", "Nhanh nhẹn, nhiệt tình"], totalTrips: 220 },
  "Cao Thị Ngọc":      { licenseType: "Chứng chỉ PX", birthday: "08/03/1992", achievements: ["7 năm kinh nghiệm", "Thông thạo tuyến Bắc–Nam"], totalTrips: 540 },
  "Đinh Thị Oanh":     { licenseType: "Chứng chỉ PX", birthday: "05/07/1999", achievements: ["3 năm kinh nghiệm", "Năng động"], totalTrips: 150 },
  "Hứa Thị Phương":    { licenseType: "Chứng chỉ PX", birthday: "14/10/1991", achievements: ["8 năm kinh nghiệm", "Giao tiếp tốt"], totalTrips: 610 },
  "Châu Thị Quỳnh":    { licenseType: "Chứng chỉ PX", birthday: "26/02/1994", achievements: ["5 năm kinh nghiệm", "Thân thiện"], totalTrips: 380 },
  "Thái Thị Thu":      { licenseType: "Chứng chỉ PX", birthday: "09/09/1995", achievements: ["4 năm kinh nghiệm", "Cẩn thận, chu đáo"], totalTrips: 260 },
  "Phùng Thị Vy":      { licenseType: "Chứng chỉ PX", birthday: "17/04/2001", achievements: ["Mới vào nghề", "Ham học hỏi"], totalTrips: 90 },
  "Đoàn Thị Xinh":     { licenseType: "Chứng chỉ PX", birthday: "23/12/1993", achievements: ["6 năm kinh nghiệm", "Chuyên phục vụ cao cấp"], totalTrips: 430 },
};

export default function AdminAssignmentsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [assistants, setAssistants] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drivers" | "assistants">("drivers");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTripAssignments, setSelectedTripAssignments] = useState<Record<number, { driverId: string | null; assistantId: string | null }>>({});
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Subscribe store để reload data khi trang khác (AdminTripsPage) thay đổi phân công
  const assignmentsVersion = useAssignmentsStore((s) => s.version);
  const bumpAssignments = useAssignmentsStore((s) => s.bumpAssignments);

  // Form thêm nhân sự (từ AdminEmployeesPage)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    hometown: "",
    experienceYears: "",
    employeeType: "DRIVER" as "DRIVER" | "ASSISTANT",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tripsData, employeesData] = await Promise.all([
        getAdminTrips(),
        getAllEmployees(),
      ]);
      setTrips(tripsData);
      setDrivers(employeesData.filter((e: Employee) => e.employeeType === "DRIVER"));
      setAssistants(employeesData.filter((e: Employee) => e.employeeType === "ASSISTANT"));
    } catch (err) {
      toast.error(extractApiErrorMessage(err) || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Khi trang khác (AdminTripsPage) thay đổi phân công -> tự reload để dropdown/badge đồng bộ
  useEffect(() => {
    if (assignmentsVersion > 0) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentsVersion]);

  // Pre-populate dropdown từ phân công hiện tại — chỉ với trip user chưa động vào dropdown.
  // Sau khi user chọn 1 lần, ta lưu giá trị và KHÔNG bao giờ ghi đè lại (kể cả khi `trips` refetch).
  // Mục đích: nếu user đang chọn "Chưa có TX" để unassign, không bị effect sau loadData() ghi đè lại.
  // `undefined` = chưa động vào (sẽ được seed ở đây); `null` = user chọn "Chưa có" (giữ nguyên).
  useEffect(() => {
    setSelectedTripAssignments((prev) => {
      const tripIdSet = new Set(trips.map((t) => t.id));
      let changed = false;
      const next: Record<number, { driverId: string | null; assistantId: string | null }> = {};
      // Loại bỏ entry của các trip không còn trong danh sách hiện tại (vd: đổi trang)
      for (const idStr of Object.keys(prev)) {
        const id = Number(idStr);
        if (tripIdSet.has(id)) {
          next[id] = prev[id];
        } else {
          changed = true;
        }
      }
      for (const trip of trips) {
        if (next[trip.id]) continue;
        const driver = trip.assignments?.find((a) => a.role === "DRIVER");
        const assistant = trip.assignments?.find((a) => a.role === "ASSISTANT");
        next[trip.id] = {
          driverId:
            driver?.employeeId != null ? String(driver.employeeId) : null,
          assistantId:
            assistant?.employeeId != null ? String(assistant.employeeId) : null,
        };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [trips]);

  const activeTrips = trips.filter((t) => t.status === "SCHEDULED" || t.status === "RUNNING");
  const staffList = activeTab === "drivers" ? drivers : assistants;

  const [currentTripPage, setCurrentTripPage] = useState(1);
  const TRIPS_PER_PAGE = 5;
  const totalTripPages = Math.ceil(activeTrips.length / TRIPS_PER_PAGE);
  const validTripPage = Math.min(currentTripPage, Math.max(1, totalTripPages));
  const paginatedActiveTrips = activeTrips.slice((validTripPage - 1) * TRIPS_PER_PAGE, validTripPage * TRIPS_PER_PAGE);

  useEffect(() => {
    setCurrentTripPage(1);
  }, [trips]);

  const handleEmployeeClick = (emp: Employee) => {
    setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp);
  };

  const handleAssignmentChange = (tripId: number, type: "driverId" | "assistantId", value: string) => {
    // Lưu `null` khi user chọn "Chưa có TX/PX" để phân biệt với "chưa động vào".
    setSelectedTripAssignments((prev) => ({
      ...prev,
      [tripId]: {
        ...(prev[tripId] ?? {}),
        [type]: value === "" ? null : value,
      },
    }));
  };

  const handleAssign = async (tripId: number) => {
    const assignment = selectedTripAssignments[tripId];
    if (!assignment) return;

    // Lấy trạng thái hiện tại từ data đã fetch
    const currentDriver =
      activeTrips
        .find((t) => t.id === tripId)
        ?.assignments?.find((a) => a.role === "DRIVER")?.employeeId ?? null;
    const currentAssistant =
      activeTrips
        .find((t) => t.id === tripId)
        ?.assignments?.find((a) => a.role === "ASSISTANT")?.employeeId ?? null;

    // `undefined` = user chưa động vào dropdown -> giữ nguyên giá trị hiện tại.
    // `null`     = user chọn "Chưa có"   -> gửi null để xoá phân công.
    // string khác rỗng = user chọn 1 nhân viên cụ thể.
    const wantedDriverId =
      assignment.driverId === undefined
        ? currentDriver
        : assignment.driverId === null
          ? null
          : Number(assignment.driverId);
    const wantedAssistantId =
      assignment.assistantId === undefined
        ? currentAssistant
        : assignment.assistantId === null
          ? null
          : Number(assignment.assistantId);

    const isUnassignAll = wantedDriverId === null && wantedAssistantId === null;
    const hasChange =
      wantedDriverId !== currentDriver ||
      wantedAssistantId !== currentAssistant;

    // User chưa động vào dropdown nào -> nếu DB cũng rỗng thì bỏ qua, ngược lại cũng bỏ qua
    // (đã có đúng TX/PX hiện tại rồi).
    const untouched =
      assignment.driverId === undefined &&
      assignment.assistantId === undefined;
    if (untouched) {
      toast(
        isUnassignAll
          ? "Chuyến này chưa có phân công nào."
          : "Không có thay đổi để lưu."
      );
      return;
    }

    // User đã chạm dropdown nhưng giá trị trùng với DB (chọn lại đúng người cũ) -> bỏ qua.
    if (!isUnassignAll && !hasChange) {
      toast("Không có thay đổi để lưu.");
      return;
    }

    setIsSaving(tripId);
    try {
      await assignStaffToTrip(tripId, wantedDriverId, wantedAssistantId);
      toast.success("Phân công thành công!");
      // Bump store để các trang khác (AdminTripsPage) tự reload lại dữ liệu,
      // giúp cột "Nhân sự" ở trang Quản lý chuyến & tuyến cập nhật ngay.
      bumpAssignments();
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err) || "Không thể phân công");
    } finally {
      setIsSaving(null);
    }
  };

  // Xử lý thêm nhân sự mới
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast.error("Vui lòng nhập họ tên và số điện thoại!");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        fullName: formData.fullName,
        phone: formData.phone,
        employeeType: formData.employeeType,
        status: formData.status,
      };
      if (formData.hometown) payload.hometown = formData.hometown;
      if (formData.experienceYears) payload.experienceYears = Number(formData.experienceYears);

      await createEmployee(payload);
      toast.success("Thêm nhân sự thành công!");
      setShowAddModal(false);
      setFormData({ fullName: "", phone: "", hometown: "", experienceYears: "", employeeType: "DRIVER", status: "ACTIVE" });
      await loadData();
    } catch (err) {
      toast.error(extractApiErrorMessage(err) || "Có lỗi khi thêm nhân sự!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy chuyến hiện tại của nhân viên
  const getEmployeeCurrentTrip = (emp: Employee): string | null => {
    for (const trip of activeTrips) {
      const hasDriver = trip.assignments?.some((a) => a.employeeId === emp.id && a.role === "DRIVER");
      const hasAssistant = trip.assignments?.some((a) => a.employeeId === emp.id && a.role === "ASSISTANT");
      if (hasDriver || hasAssistant) {
        return `Chuyến #${trip.id} — ${trip.routeName}`;
      }
    }
    return null;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getBadgeInfo = (name: string) => {
    const found = STAFF_BADGES[name];
    if (found) return found;
    // Fallback cho nhân viên mới thêm chưa có trong STAFF_BADGES
    return {
      licenseType: name.includes("Thị") || name.includes("Thuy") ? "Chứng chỉ PX" : "GPLX hạng D",
      birthday: "—",
      achievements: ["Nhân viên tận tâm"],
      totalTrips: 0,
    };
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      SCHEDULED: "badge badge-info",
      RUNNING: "badge badge-success",
      COMPLETED: "badge badge-neutral",
      CANCELLED: "badge badge-error",
      DELAYED: "badge badge-warning",
    };
    return <span className={badges[status] || "badge"}>{status}</span>;
  };

  const totalStaff = drivers.length + assistants.length;
  const assignedCount = activeTrips.filter((t) =>
    t.assignments?.some((a) => a.role === "DRIVER" && a.employeeId)
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-4 text-slate-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50/80 to-purple-50">
      <div className="relative z-10 space-y-6 p-6">
        {/* Header — gradient xanh tím sáng, đồng bộ với AdminTicketsPage */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-7 shadow-xl shadow-indigo-200/40">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
            </svg>
          </div>
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Staff Management</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Phân công &amp; Quản lý Nhân sự</h1>
              <p className="text-blue-50/90 text-sm mt-2">
                Thêm mới, quản lý nhân sự và gán Tài xế / Phụ xe cho các chuyến xe đang hoạt động.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-2xl backdrop-blur-sm transition-colors"
              >
                <CheckCircle className="h-4 w-4" /> Làm mới
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="h-4 w-4" /> Thêm nhân sự
              </button>
            </div>
          </div>
        </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white border border-indigo-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 p-3"><Truck className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeTrips.length}</p>
              <p className="text-xs text-slate-500">Chuyến đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-indigo-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 p-3"><Shield className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{drivers.length}</p>
              <p className="text-xs text-slate-500">Tài xế</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-indigo-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 p-3"><Users className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{assistants.length}</p>
              <p className="text-xs text-slate-500">Phụ xe</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-indigo-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 p-3"><AlertCircle className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeTrips.length - assignedCount}</p>
              <p className="text-xs text-slate-500">Chưa phân công đủ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Staff List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Staff List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="mb-2 flex rounded-xl bg-white p-1.5 shadow-md border border-indigo-100">
            <button
              onClick={() => { setActiveTab("drivers"); setSelectedEmployee(null); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all ${
                activeTab === "drivers"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-indigo-50"
              }`}
            >
              <Shield className="h-5 w-5" /> Tài xế ({drivers.length})
            </button>
            <button
              onClick={() => { setActiveTab("assistants"); setSelectedEmployee(null); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all ${
                activeTab === "assistants"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-indigo-50"
              }`}
            >
              <Users className="h-5 w-5" /> Phụ xe ({assistants.length})
            </button>
          </div>

          {/* Staff List */}
          <div className="space-y-2">
            {staffList.length === 0 ? (
              <div className="rounded-2xl bg-white border border-indigo-100 p-8 text-center text-slate-500 shadow-sm">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30 text-indigo-300" />
                <p>Chưa có {activeTab === "drivers" ? "tài xế" : "phụ xe"} nào.</p>
                <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-indigo-600 underline hover:text-indigo-700">
                  + Thêm nhân sự mới
                </button>
              </div>
            ) : staffList.map((emp) => {
              const currentTrip = getEmployeeCurrentTrip(emp);
              return (
                <div
                  key={emp.id}
                  onClick={() => handleEmployeeClick(emp)}
                  className={`group cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
                    selectedEmployee?.id === emp.id
                      ? "border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md"
                      : "border-indigo-100 bg-white hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${
                        emp.employeeType === "DRIVER"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                          : "bg-gradient-to-br from-indigo-500 to-purple-500"
                      } h-12 w-12 rounded-full flex items-center justify-center shadow-md`}>
                        <span className="text-lg font-bold text-white">
                          {emp.fullName.split(" ").pop()?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">{emp.fullName}</h4>
                          {emp.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                              <CheckSquare className="h-2.5 w-2.5" /> ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />{emp.phone}
                        </p>
                        {currentTrip && (
                          <p className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                            <Truck className="h-2.5 w-2.5" />{currentTrip}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {emp.experienceYears ? (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                          <Award className="h-3 w-3" />{emp.experienceYears} năm KN
                        </span>
                      ) : null}
                      <ChevronRight className={`h-5 w-5 text-indigo-400 transition-transform ${selectedEmployee?.id === emp.id ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trips Table Below */}
          <div className="mt-6 rounded-2xl bg-white border border-indigo-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <th className="px-5 py-4 font-semibold text-indigo-700">Chuyến</th>
                    <th className="px-5 py-4 font-semibold text-indigo-700">Tuyến</th>
                    <th className="px-5 py-4 font-semibold text-indigo-700">Giờ khởi hành</th>
                    <th className="px-5 py-4 font-semibold text-indigo-700">Trạng thái</th>
                    <th className="px-5 py-4 text-right font-semibold text-indigo-700">Phân công</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedActiveTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center text-slate-400">Không có chuyến nào đang hoạt động</td>
                    </tr>
                  ) : paginatedActiveTrips.map((trip) => {
                    const driverAssignment = trip.assignments?.find((a) => a.role === "DRIVER");
                    const assistantAssignment = trip.assignments?.find((a) => a.role === "ASSISTANT");
                    return (
                      <tr key={trip.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">#{trip.id}</div>
                          <div className="text-xs text-slate-400">{trip.busLabel}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-slate-700 font-medium">{trip.routeName}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {new Date(trip.departureTime).toLocaleString("vi-VN", {
                              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(trip.status)}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 items-center">
                            {/* Hiển thị TX đã gán */}
                            {driverAssignment?.employeeName ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 max-w-[120px] truncate" title={driverAssignment.employeeName}>
                                <Shield className="h-3 w-3 flex-shrink-0" />{driverAssignment.employeeName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Chưa có TX</span>
                            )}
                            {/* Hiển thị PX đã gán */}
                            {assistantAssignment?.employeeName ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200 max-w-[120px] truncate" title={assistantAssignment.employeeName}>
                                <Users className="h-3 w-3 flex-shrink-0" />{assistantAssignment.employeeName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Chưa có PX</span>
                            )}
                            <select
                              value={selectedTripAssignments[trip.id]?.driverId ?? ""}
                              onChange={(e) => handleAssignmentChange(trip.id, "driverId", e.target.value)}
                              className="text-xs px-2 py-1 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              title="Chọn tài xế"
                            >
                              <option value="">Chưa có TX</option>
                              {drivers.map((d) => (
                                <option key={d.id} value={d.id}>{d.fullName}</option>
                              ))}
                            </select>
                            <select
                              value={selectedTripAssignments[trip.id]?.assistantId ?? ""}
                              onChange={(e) => handleAssignmentChange(trip.id, "assistantId", e.target.value)}
                              className="text-xs px-2 py-1 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              title="Chọn phụ xe"
                            >
                              <option value="">Chưa có PX</option>
                              {assistants.map((a) => (
                                <option key={a.id} value={a.id}>{a.fullName}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(trip.id)}
                              disabled={isSaving === trip.id}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-sm disabled:opacity-60 transition-all"
                            >
                              {isSaving === trip.id ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}{" "}
                              Lưu
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {totalTripPages > 1 && (
              <div className="border-t border-slate-100 bg-slate-50/50">
                <Pagination 
                  currentPage={validTripPage} 
                  totalPages={totalTripPages} 
                  onPageChange={setCurrentTripPage} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Employee Detail Panel */}
        <div className="lg:col-span-1">
          {selectedEmployee ? (() => {
            const badge = getBadgeInfo(selectedEmployee.fullName);
            const currentTrip = getEmployeeCurrentTrip(selectedEmployee);
            const isDriver = selectedEmployee.employeeType === "DRIVER";

            return (
              <div className="sticky top-4 rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-purple-50 p-6 shadow-xl border border-indigo-200">
                {/* Avatar & Name */}
                <div className="text-center mb-5">
                  <div className={`mx-auto mb-3 h-20 w-20 rounded-full flex items-center justify-center shadow-lg ${
                    isDriver ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-indigo-500 to-purple-500"
                  }`}>
                    <span className="text-2xl font-bold text-white">
                      {selectedEmployee.fullName.split(" ").pop()?.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedEmployee.fullName}</h3>
                  <p className="text-sm text-indigo-600 flex items-center justify-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" />{selectedEmployee.phone}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                      isDriver
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-purple-100 text-purple-700 border-purple-200"
                    }`}>
                      {isDriver ? "Tài xế" : "Phụ xe"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      selectedEmployee.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      <UserCheck className="h-3 w-3" />
                      {selectedEmployee.status === "ACTIVE" ? "Đang hoạt động" : "Nghỉ việc"}
                    </span>
                  </div>
                </div>

                {/* Chuyến hiện tại */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-amber-100 p-2 flex-shrink-0"><Truck className="h-4 w-4 text-amber-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Chuyến hiện tại</p>
                    <p className={`font-semibold text-sm ${currentTrip ? "text-amber-700" : "text-slate-400"}`}>
                      {currentTrip || "Đang rảnh rỗi"}
                    </p>
                  </div>
                </div>

                {/* Địa chỉ / Quê quán */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-rose-100 p-2 flex-shrink-0"><MapPin className="h-4 w-4 text-rose-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Địa chỉ / Quê quán</p>
                    <p className="font-semibold text-slate-800 text-sm">{selectedEmployee.hometown || "—"}</p>
                  </div>
                </div>

                {/* Giấy phép */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-blue-100 p-2 flex-shrink-0"><FileText className="h-4 w-4 text-blue-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Giấy phép lái xe</p>
                    <p className="font-semibold text-slate-800 text-sm">{badge.licenseType}</p>
                  </div>
                </div>

                {/* Ngày sinh */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-emerald-100 p-2 flex-shrink-0"><Calendar className="h-4 w-4 text-emerald-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Ngày sinh</p>
                    <p className="font-semibold text-slate-800 text-sm">{badge.birthday}</p>
                  </div>
                </div>

                {/* Ngày gia nhập */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-purple-100 p-2 flex-shrink-0"><Briefcase className="h-4 w-4 text-purple-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Ngày gia nhập</p>
                    <p className="font-semibold text-slate-800 text-sm">{formatDate(selectedEmployee.joinDate)}</p>
                  </div>
                </div>

                {/* Kinh nghiệm */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-amber-100 p-2 flex-shrink-0"><Award className="h-4 w-4 text-amber-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Số năm kinh nghiệm</p>
                    <p className="font-bold text-slate-800 text-base">
                      {selectedEmployee.experienceYears != null
                        ? `${selectedEmployee.experienceYears} năm`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Tổng chuyến */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100 mb-3 shadow-sm">
                  <div className="rounded-full bg-cyan-100 p-2 flex-shrink-0"><TrendingUp className="h-4 w-4 text-cyan-600" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Tổng chuyến đã hoàn thành</p>
                    <p className="font-semibold text-slate-800 text-sm">{badge.totalTrips} chuyến</p>
                  </div>
                </div>

                {/* Thành tích */}
                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-200">
                  <p className="text-xs font-medium text-indigo-700 mb-2 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />Thành tích nổi bật
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {badge.achievements.map((ach, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 border border-indigo-200"
                      >
                        <Star className="h-3 w-3 text-amber-400" />{ach}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="sticky top-4 rounded-2xl bg-gradient-to-br from-white to-indigo-50 p-8 text-center border border-indigo-200 shadow-lg">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 mb-2">Chọn nhân viên</h4>
              <p className="text-sm text-slate-500 mb-4">Click vào tên bên trái để xem thông tin chi tiết</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mx-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all"
              >
                <Plus className="h-4 w-4" /> Thêm nhân sự mới
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm Nhân Sự */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-indigo-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" /> Thêm Nhân Sự Mới
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Nhập thông tin đầy đủ để thêm tài xế hoặc phụ xe</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: 0987654321"
                  className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Hàng đầu - Vai trò + Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vai trò</label>
                  <select
                    className="w-full p-3 border border-indigo-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    value={formData.employeeType}
                    onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as "DRIVER" | "ASSISTANT" })}
                  >
                    <option value="DRIVER">Tài xế (Lái xe)</option>
                    <option value="ASSISTANT">Phụ xe (Lơ xe)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                  <select
                    className="w-full p-3 border border-indigo-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Nghỉ việc</option>
                  </select>
                </div>
              </div>

              {/* Hàng tiếp - Quê quán + Kinh nghiệm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quê quán / Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="VD: Hà Nội"
                    className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    value={formData.hometown}
                    onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kinh nghiệm (năm)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 5"
                    className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
