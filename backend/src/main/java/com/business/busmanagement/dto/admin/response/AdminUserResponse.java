package com.business.busmanagement.dto.admin.response;

import com.business.busmanagement.model.Employee;
import com.business.busmanagement.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String role;
    private User.UserStatus status;
    private Employee.EmployeeType employeeType;
    private LocalDateTime createdAt;
}
