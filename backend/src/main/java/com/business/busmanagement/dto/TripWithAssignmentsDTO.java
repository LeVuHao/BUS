package com.business.busmanagement.dto;

import java.util.List;

/**
 * DTO gộp TripResponse với danh sách nhân sự phân công — trả về 1 lần từ
 * endpoint /admin/trips/with-assignments để fix N+1 (trước đây 50 trips = 50 request).
 *
 * Cấu trúc:
 *   - trip:        thông tin chuyến (giống TripResponse cũ — FE vẫn dùng field này)
 *   - assignments: danh sách {id, tripId, employeeId, employeeName, role}
 *
 * Lưu ý FE: hiện tại FE đang nhận List<TripResponse> và tự gọi
 * /admin/trip-assignments/{id} cho MỖI trip. Khi gọi endpoint mới này, FE chỉ cần
 * map `assignments` vào `trip.assignments` là xong (giữ nguyên interface cũ).
 */
public class TripWithAssignmentsDTO {
    private TripResponse trip;
    private List<AssignmentDTO> assignments;

    public TripWithAssignmentsDTO() {}

    public TripWithAssignmentsDTO(TripResponse trip, List<AssignmentDTO> assignments) {
        this.trip = trip;
        this.assignments = assignments;
    }

    public TripResponse getTrip() { return trip; }
    public void setTrip(TripResponse trip) { this.trip = trip; }
    public List<AssignmentDTO> getAssignments() { return assignments; }
    public void setAssignments(List<AssignmentDTO> assignments) { this.assignments = assignments; }

    public static class AssignmentDTO {
        private Long id;
        private Long tripId;
        private Long employeeId;
        private String employeeName;
        private String role;

        public AssignmentDTO() {}

        public AssignmentDTO(Long id, Long tripId, Long employeeId,
                             String employeeName, String role) {
            this.id = id;
            this.tripId = tripId;
            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTripId() { return tripId; }
        public void setTripId(Long tripId) { this.tripId = tripId; }
        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public String getEmployeeName() { return employeeName; }
        public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
