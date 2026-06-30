package com.business.busmanagement.controller;

/* ============================================================
 * EMPLOYEE CONTROLLER — Module: Quản lý nhân sự (Tài xế, Phụ xe)
 * ============================================================ */

import com.business.busmanagement.model.Employee;
import com.business.busmanagement.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    // 1. Lấy toàn bộ danh sách nhân sự cho trang quản lý
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    // 2. Thêm mới một nhân sự (Tài xế hoặc Phụ xe)
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        if (employee.getStatus() == null) {
            employee.setStatus(Employee.Status.ACTIVE);
        }
        Employee savedEmployee = employeeRepository.save(employee);
        return ResponseEntity.ok(savedEmployee);
    }

    // 3. Lấy danh sách lọc theo loại nhân sự
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Employee>> getEmployeesByType(@PathVariable String type) {
        return ResponseEntity.ok(employeeRepository.findByEmployeeType(Employee.EmployeeType.valueOf(type)));
    }

    // 4. Lấy top tài xế kinh nghiệm nhất
    @GetMapping("/top-experienced")
    public ResponseEntity<List<Employee>> getTopExperiencedDrivers() {
        return ResponseEntity.ok(employeeRepository.findTopDriversByExperience());
    }

    // 5. Cập nhật thông tin một nhân sự đã có.
    //    Dùng JsonNode để phân biệt "field không gửi" vs "field gửi = null",
    //    tránh ghi đè nhầm các trường optional (hometown, experienceYears) thành null
    //    khi frontend chỉ gửi một phần payload.
    //    KHÔNG cho phép đổi id và userId (giữ nguyên giá trị cũ).
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody com.fasterxml.jackson.databind.JsonNode payload) {
        return employeeRepository.findById(id)
                .<ResponseEntity<?>>map(emp -> {
                    if (payload.has("fullName") && !payload.get("fullName").isNull()) emp.setFullName(payload.get("fullName").asText());
                    if (payload.has("phone") && !payload.get("phone").isNull()) emp.setPhone(payload.get("phone").asText());
                    if (payload.has("hometown") && !payload.get("hometown").isNull()) emp.setHometown(payload.get("hometown").asText());
                    if (payload.has("experienceYears") && !payload.get("experienceYears").isNull()) emp.setExperienceYears(payload.get("experienceYears").asInt());
                    if (payload.has("employeeType") && !payload.get("employeeType").isNull()) emp.setEmployeeType(Employee.EmployeeType.valueOf(payload.get("employeeType").asText()));
                    if (payload.has("status") && !payload.get("status").isNull()) emp.setStatus(Employee.Status.valueOf(payload.get("status").asText()));
                    Employee saved = employeeRepository.save(emp);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "message", "Không tìm thấy nhân sự với id = " + id
                )));
    }

    // 6. Xóa cứng một nhân sự khỏi hệ thống.
    //    KHÔNG xóa trip_assignments liên quan — lịch sử chuyến đi vẫn được giữ nguyên
    //    (trip_assignments.employee_id là Long plain, không có FK ràng buộc với employees.id).
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(emp -> {
                    String name = emp.getFullName();
                    String type = emp.getEmployeeType() != null
                            ? emp.getEmployeeType().name()
                            : "UNKNOWN";
                    employeeRepository.deleteById(id);
                    return ResponseEntity.ok(Map.of(
                            "message", "Đã xóa nhân sự khỏi hệ thống",
                            "id", id,
                            "fullName", name,
                            "employeeType", type
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "message", "Không tìm thấy nhân sự với id = " + id
                )));
    }
}