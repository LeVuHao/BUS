package com.business.busmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_type", nullable = false)
    private EmployeeType employeeType;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    // Định nghĩa các loại nhân sự
    public enum EmployeeType {
        DRIVER, ASSISTANT, TECHNICIAN, DISPATCHER, MANAGER
    }

    // Định nghĩa trạng thái
    public enum Status {
        ACTIVE, INACTIVE
    }

    // --- BẮT BUỘC PHẢI CÓ GETTER VÀ SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public EmployeeType getEmployeeType() { return employeeType; }
    public void setEmployeeType(EmployeeType employeeType) { this.employeeType = employeeType; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}