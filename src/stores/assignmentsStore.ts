import { create } from "zustand";

/**
 * Store chia sẻ nhỏ giữa các trang admin liên quan đến phân công nhân sự.
 *
 * Mục đích: khi admin phân công / sửa / xoá TX-PX ở một trang (ví dụ
 * `AdminAssignmentsPage`), trang khác (ví dụ `AdminTripsPage`) cần tự
 * reload lại danh sách chuyến để cột "Nhân sự" hiển thị đúng tên.
 *
 * Thiết kế: chỉ giữ một `version` đếm — không cache data — để:
 *   - Tránh đồng bộ state phức tạp giữa 2 page khác nhau.
 *   - Đảm bảo mỗi page tự fetch qua API của riêng nó (giữ nguyên logic hiện tại).
 *   - Không ảnh hưởng tới các chỗ khác dùng cùng API.
 */
interface AssignmentsState {
  version: number;
  bumpAssignments: () => void;
}

export const useAssignmentsStore = create<AssignmentsState>((set) => ({
  version: 0,
  bumpAssignments: () =>
    set((state) => ({ version: state.version + 1 })),
}));