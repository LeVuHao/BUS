package com.business.busmanagement.repository;

import com.business.busmanagement.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Hàm này giúp lọc danh sách riêng Tài xế hoặc Phụ xe
    List<Employee> findByEmployeeType(Employee.EmployeeType employeeType);
}