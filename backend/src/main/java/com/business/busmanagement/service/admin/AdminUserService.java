package com.business.busmanagement.service.admin;

import com.business.busmanagement.dto.admin.request.AdminUserCreateRequest;
import com.business.busmanagement.dto.admin.request.AdminUserLockRequest;
import com.business.busmanagement.dto.admin.request.AdminUserPasswordResetRequest;
import com.business.busmanagement.dto.admin.request.AdminUserUpdateRequest;
import com.business.busmanagement.dto.admin.response.AdminUserResponse;
import com.business.busmanagement.exception.BusinessConflictException;
import com.business.busmanagement.exception.ResourceNotFoundException;
import com.business.busmanagement.model.Employee;
import com.business.busmanagement.model.Passenger;
import com.business.busmanagement.model.Role;
import com.business.busmanagement.model.User;
import com.business.busmanagement.repository.EmployeeRepository;
import com.business.busmanagement.repository.PassengerRepository;
import com.business.busmanagement.repository.RoleRepository;
import com.business.busmanagement.repository.UserRepository;
import com.business.busmanagement.util.RoleNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PassengerRepository passengerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(String keyword, String role, User.UserStatus status) {
        String normalizedKeyword = normalizeKeyword(keyword);
        String normalizedRole = StringUtils.hasText(role) ? RoleNormalizer.normalize(role) : null;

        return userRepository.findAll()
                .stream()
                .filter(user -> matchesKeyword(user, normalizedKeyword))
                .filter(user -> normalizedRole == null || (user.getRole() != null && normalizedRole.equals(RoleNormalizer.normalize(user.getRole().getName()))))
                .filter(user -> status == null || user.getStatus() == status)
                .sorted(Comparator.comparing(User::getId).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public AdminUserResponse createStaff(AdminUserCreateRequest request) {
        validateUniqueUsername(request.getUsername(), null);
        validateUniqueEmail(request.getEmail(), null);

        Role staffRole = roleRepository.findByName("STAFF")
                .orElseThrow(() -> new IllegalStateException("Required role STAFF is not configured"));

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(trimToNull(request.getEmail()));
        user.setPhone(trimToNull(request.getPhone()));
        user.setRole(staffRole);
        user.setStatus(User.UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setFullName(request.getFullName().trim());
        employee.setPhone(trimToNull(request.getPhone()));
        employee.setEmployeeType(request.getEmployeeType() != null ? request.getEmployeeType() : Employee.EmployeeType.DISPATCHER);
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);
        employeeRepository.save(employee);

        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, AdminUserUpdateRequest request) {
        User user = findUser(id);

        if (StringUtils.hasText(request.getUsername())) {
            validateUniqueUsername(request.getUsername(), user.getId());
            user.setUsername(request.getUsername().trim());
        }
        if (request.getEmail() != null) {
            validateUniqueEmail(request.getEmail(), user.getId());
            user.setEmail(trimToNull(request.getEmail()));
        }
        if (request.getPhone() != null) {
            user.setPhone(trimToNull(request.getPhone()));
        }
        if (request.getStatus() != null) {
            if (user.getUsername().equals(getCurrentUsername()) && request.getStatus() != User.UserStatus.ACTIVE) {
                throw new BusinessConflictException("Admin cannot disable or lock the current account");
            }
            user.setStatus(request.getStatus());
        }

        User savedUser = userRepository.save(user);
        updateEmployeeInfoIfPresent(savedUser, request);
        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse lockUser(Long id, AdminUserLockRequest request) {
        User user = findUser(id);
        if (user.getUsername().equals(getCurrentUsername())) {
            throw new BusinessConflictException("Admin cannot lock the current account");
        }

        user.setStatus(Boolean.TRUE.equals(request.getLocked()) ? User.UserStatus.LOCKED : User.UserStatus.ACTIVE);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse resetPassword(Long id, AdminUserPasswordResetRequest request) {
        User user = findUser(id);
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        return toResponse(userRepository.save(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(Objects.requireNonNull(id, "id is required"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void updateEmployeeInfoIfPresent(User user, AdminUserUpdateRequest request) {
        Optional<Employee> optionalEmployee = employeeRepository.findByUserId(user.getId());
        if (optionalEmployee.isEmpty()) {
            return;
        }

        Employee employee = optionalEmployee.get();
        if (StringUtils.hasText(request.getFullName())) {
            employee.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            employee.setPhone(trimToNull(request.getPhone()));
        }
        if (request.getEmployeeType() != null) {
            employee.setEmployeeType(request.getEmployeeType());
        }
        employeeRepository.save(employee);
    }

    private boolean matchesKeyword(User user, String keyword) {
        if (keyword == null) {
            return true;
        }
        String role = user.getRole() != null ? user.getRole().getName() : "";
        String fullName = getFullName(user).orElse("");
        return contains(user.getUsername(), keyword)
                || contains(user.getEmail(), keyword)
                || contains(user.getPhone(), keyword)
                || contains(role, keyword)
                || contains(fullName, keyword);
    }

    private Optional<String> getFullName(User user) {
        Optional<Employee> employee = employeeRepository.findByUserId(user.getId());
        if (employee.isPresent()) {
            return Optional.ofNullable(employee.get().getFullName());
        }
        Optional<Passenger> passenger = passengerRepository.findByUserId(user.getId());
        return passenger.map(Passenger::getFullName);
    }

    private Employee.EmployeeType getEmployeeType(User user) {
        return employeeRepository.findByUserId(user.getId())
                .map(Employee::getEmployeeType)
                .orElse(null);
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                getFullName(user).orElse(null),
                user.getRole() != null ? RoleNormalizer.normalize(user.getRole().getName()) : null,
                user.getStatus(),
                getEmployeeType(user),
                user.getCreatedAt()
        );
    }

    private void validateUniqueUsername(String username, Long currentUserId) {
        if (!StringUtils.hasText(username)) {
            throw new IllegalArgumentException("Username is required");
        }
        boolean exists = currentUserId == null
                ? userRepository.existsByUsername(username.trim())
                : userRepository.existsByUsernameAndIdNot(username.trim(), currentUserId);
        if (exists) {
            throw new BusinessConflictException("Username already exists");
        }
    }

    private void validateUniqueEmail(String email, Long currentUserId) {
        if (!StringUtils.hasText(email)) {
            return;
        }
        boolean exists = currentUserId == null
                ? userRepository.existsByEmail(email.trim())
                : userRepository.existsByEmailAndIdNot(email.trim(), currentUserId);
        if (exists) {
            throw new BusinessConflictException("Email already exists");
        }
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    private String normalizeKeyword(String keyword) {
        return StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT) : null;
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
