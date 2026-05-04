import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import apiClient from "../../api/apiClient";
import { Bus, Route, Employee, EmployeeRole, Trip } from "../../types";
import { extractApiErrorMessage } from "../../utils/apiError";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  routeId: number | null;
  departureTime: string;
  arrivalTime: string;
  busId: number | null;
  driverId: number | null;
  assistantId: number | null;
}

export default function CreateTripModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTripModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    routeId: null,
    departureTime: "",
    arrivalTime: "",
    busId: null,
    driverId: null,
    assistantId: null,
  });

  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load routes on mount
  useEffect(() => {
    if (isOpen && currentStep === 1) {
      loadRoutes();
    }
  }, [isOpen, currentStep]);

  // Load buses when moving to step 2
  useEffect(() => {
    if (currentStep === 2) {
      loadBuses();
    }
  }, [currentStep]);

  // Load employees when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && formData.departureTime && formData.arrivalTime) {
      loadEmployees();
    }
  }, [currentStep]);

  const loadRoutes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<Route[]>("/routes");
      setRoutes(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách tuyến. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBuses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<Bus[]>("/buses", {
        params: { status: "AVAILABLE" },
      });
      setBuses(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách xe. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<Employee[]>("/employees/available", {
        params: {
          from: formData.departureTime,
          to: formData.arrivalTime,
        },
      });
      setEmployees(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân sự. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      routeId: Number(e.target.value) || null,
    }));
  };

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "departureTime" | "arrivalTime",
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleBusSelect = (busId: number) => {
    setFormData((prev) => ({
      ...prev,
      busId,
    }));
  };

  const handleEmployeeSelect = (
    employeeId: number,
    role: EmployeeRole,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [role === "DRIVER" ? "driverId" : "assistantId"]: employeeId,
    }));
  };

  const validateStep1 = () => {
    if (!formData.routeId) {
      toast.error("Vui lòng chọn tuyến.");
      return false;
    }
    if (!formData.departureTime) {
      toast.error("Vui lòng nhập giờ khởi hành.");
      return false;
    }
    if (!formData.arrivalTime) {
      toast.error("Vui lòng nhập giờ dự kiến đến.");
      return false;
    }
    if (new Date(formData.departureTime) >= new Date(formData.arrivalTime)) {
      toast.error("Giờ khởi hành phải trước giờ đến.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.busId) {
      toast.error("Vui lòng chọn xe.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.driverId) {
      toast.error("Vui lòng chọn tài xế.");
      return false;
    }
    if (!formData.assistantId) {
      toast.error("Vui lòng chọn phụ xe.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        routeId: formData.routeId,
        busId: formData.busId,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
      };

      const response = await apiClient.post<Trip>("/trips", payload);
      const tripId = response.data.id;

      // Assign driver
      if (formData.driverId) {
        await apiClient.post("/trip-assignments", {
          tripId,
          employeeId: formData.driverId,
          role: "DRIVER",
        });
      }

      // Assign assistant
      if (formData.assistantId) {
        await apiClient.post("/trip-assignments", {
          tripId,
          employeeId: formData.assistantId,
          role: "ASSISTANT",
        });
      }

      toast.success("Tạo chuyến thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = extractApiErrorMessage(error);
      toast.error(message || "Không thể tạo chuyến. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoute = routes.find((r) => r.id === formData.routeId);
  const selectedBus = buses.find((b) => b.id === formData.busId);
  const selectedDriver = employees.find((e) => e.id === formData.driverId);
  const selectedAssistant = employees.find(
    (e) => e.id === formData.assistantId,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Tạo chuyến mới
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bước {currentStep} của 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 border-b border-slate-200 px-6 py-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full transition ${
                  step <= currentStep ? "bg-[#0F2849]" : "bg-slate-200"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Route and Times */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Chọn tuyến *
                </label>
                <select
                  value={formData.routeId ?? ""}
                  onChange={handleRouteChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                  disabled={isLoading}
                >
                  <option value="">
                    {isLoading ? "Đang tải..." : "-- Chọn tuyến --"}
                  </option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.origin} → {route.destination} (
                      {route.estimatedDurationMin}p)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Giờ khởi hành *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => handleTimeChange(e, "departureTime")}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Giờ dự kiến đến *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => handleTimeChange(e, "arrivalTime")}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                  />
                </div>
              </div>

              {selectedRoute && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Thông tin tuyến
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Tuyến:</span>{" "}
                      {selectedRoute.origin} → {selectedRoute.destination}
                    </p>
                    <p>
                      <span className="font-semibold">Khoảng cách:</span>{" "}
                      {selectedRoute.distanceKm} km
                    </p>
                    <p>
                      <span className="font-semibold">Thời gian dự kiến:</span>{" "}
                      {selectedRoute.estimatedDurationMin} phút
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Bus */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Chọn xe từ danh sách các xe khả dụng
              </p>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-slate-500">Đang tải...</p>
                </div>
              ) : buses.length === 0 ? (
                <div className="flex justify-center py-8">
                  <p className="text-slate-500">Không có xe khả dụng.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {buses.map((bus) => (
                    <div
                      key={bus.id}
                      onClick={() => handleBusSelect(bus.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                        formData.busId === bus.id
                          ? "border-[#0F2849] bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="font-semibold text-slate-900">
                        {bus.licensePlate}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {bus.busType}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {bus.totalSeats} chỗ
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Assign Staff */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Chọn tài xế *
                </label>
                {isLoading ? (
                  <p className="mt-2 text-sm text-slate-500">Đang tải...</p>
                ) : employees.filter((e) => e.employeeType === "DRIVER")
                    .length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Không có tài xế khả dụng.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {employees
                      .filter((e) => e.employeeType === "DRIVER")
                      .map((employee) => (
                        <label
                          key={employee.id}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 hover:bg-slate-50"
                        >
                          <input
                            type="radio"
                            name="driver"
                            value={employee.id}
                            checked={formData.driverId === employee.id}
                            onChange={() =>
                              handleEmployeeSelect(employee.id, "DRIVER")
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-slate-900">
                            {employee.fullName}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Chọn phụ xe *
                </label>
                {isLoading ? (
                  <p className="mt-2 text-sm text-slate-500">Đang tải...</p>
                ) : employees.filter((e) => e.employeeType === "ASSISTANT")
                    .length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Không có phụ xe khả dụng.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {employees
                      .filter((e) => e.employeeType === "ASSISTANT")
                      .map((employee) => (
                        <label
                          key={employee.id}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-3 hover:bg-slate-50"
                        >
                          <input
                            type="radio"
                            name="assistant"
                            value={employee.id}
                            checked={formData.assistantId === employee.id}
                            onChange={() =>
                              handleEmployeeSelect(employee.id, "ASSISTANT")
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-slate-900">
                            {employee.fullName}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Summary and Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Xác nhận thông tin chuyến
              </h3>

              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Tuyến
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedRoute
                      ? `${selectedRoute.origin} → ${selectedRoute.destination}`
                      : "-"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Khởi hành
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formData.departureTime
                        ? format(
                            new Date(formData.departureTime),
                            "dd/MM/yyyy HH:mm",
                          )
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Dự kiến đến
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formData.arrivalTime
                        ? format(
                            new Date(formData.arrivalTime),
                            "dd/MM/yyyy HH:mm",
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Xe
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedBus
                      ? `${selectedBus.licensePlate} - ${selectedBus.busType}`
                      : "-"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Tài xế
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedDriver ? selectedDriver.fullName : "-"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Phụ xe
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedAssistant ? selectedAssistant.fullName : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Quay lại
            </button>
          )}
          {currentStep < 4 && (
            <button
              onClick={handleNext}
              className="flex-1 rounded-2xl bg-[#0F2849] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a3a6b] disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isLoading}
            >
              Tiếp theo
            </button>
          )}
          {currentStep === 4 && (
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Xác nhận tạo chuyến"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
