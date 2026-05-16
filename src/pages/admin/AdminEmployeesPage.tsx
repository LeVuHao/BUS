import React, { useEffect, useState } from 'react';
import { Employee } from '../../types';
import { getAllEmployees, createEmployee, getStaffByTrip, getAdminTrips } from '../../api/admin';
import { Plus, UserCheck, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // State lưu thông tin Form khi Admin thêm Tài xế / Phụ xe
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    employeeType: 'DRIVER', // Mặc định là Tài xế
    status: 'ACTIVE'        // <-- THÊM DÒNG NÀY ĐỂ KHÔNG BỊ BÁO THIẾU BIẾN
  });

  const fetchEmployees = async () => {
    try {
      // 1. Lấy danh sách nhân sự
      const empData = await getAllEmployees();

      // 2. Lấy danh sách các chuyến đi đang "Lên lịch" hoặc "Đang chạy"
      const activeTrips = await getAdminTrips();
      const runningTrips = activeTrips.filter(t => t.status === 'SCHEDULED' || t.status === 'RUNNING');

      // 3. Quét từng nhân viên xem có đang lái chuyến nào không
      const enrichedEmployees = await Promise.all(empData.map(async (emp) => {
        let tripInfo = "Đang rảnh rỗi";

        for (const trip of runningTrips) {
          try {
            const assignments = await getStaffByTrip(trip.id);
            // Nếu tìm thấy ID của nhân viên này trong danh sách phân công của chuyến
            const isAssigned = assignments.some((a: any) => a.employeeId === emp.id);
            if (isAssigned) {
              tripInfo = `Chuyến #${trip.id} (${trip.routeName})`;
              break; // Tìm thấy rồi thì dừng lại
            }
          } catch (e) { }
        }

        return { ...emp, currentTripInfo: tripInfo };
      }));

      setEmployees(enrichedEmployees);
    } catch (error) {
      console.error("Lỗi tải danh sách nhân sự", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast.error("Vui lòng nhập đầy đủ họ tên và số điện thoại!");
      return;
    }
    try {
      // <-- THÊM 'as any' ĐỂ TYPESCRIPT HẾT BẮT BẺ KIỂU CHỮ
      await createEmployee(formData as any);

      toast.success("Thêm nhân sự thành công!");
      setShowModal(false);

      // <-- CẬP NHẬT LẠI FORM RESET CÓ KÈM STATUS
      setFormData({ fullName: '', phone: '', employeeType: 'DRIVER', status: 'ACTIVE' });
      fetchEmployees();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm nhân sự!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1">HUMAN RESOURCES</h2>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài xế & Phụ xe</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition"
        >
          <Plus size={18} /> Thêm nhân sự
        </button>
      </div>

      {/* Bảng hiển thị danh sách Tài xế / Phụ xe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Họ và Tên</th>
              <th className="px-6 py-4 font-medium">Số điện thoại</th>
              <th className="px-6 py-4 font-medium">Vai trò</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium">Hoạt động hiện tại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center">Đang tải dữ liệu...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center">Chưa có Tài xế hay Phụ xe nào trong hệ thống.</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{emp.fullName}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="flex items-center gap-1"><Phone size={14} /> {emp.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    {/* Hiển thị phân biệt màu sắc giữa Tài xế và Phụ xe */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${emp.employeeType === 'DRIVER' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {emp.employeeType === 'DRIVER' ? 'Tài xế' : 'Phụ xe'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${emp.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                      <UserCheck size={14} /> {emp.status === 'ACTIVE' ? 'Đang hoạt động' : 'Nghỉ việc'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${emp.currentTripInfo === 'Đang rảnh rỗi' ? 'text-gray-400' : 'text-amber-600 font-bold'}`}>
                      {emp.currentTripInfo}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Thêm Mới */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Thêm Nhân Sự Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="VD: 0987654321"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhân sự (Vai trò)</label>
                <select
                  className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.employeeType}
                  onChange={(e) => setFormData({ ...formData, employeeType: e.target.value })}
                >
                  <option value="DRIVER">Tài xế (Lái xe)</option>
                  <option value="ASSISTANT">Phụ xe (Lơ xe)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeesPage;