package com.business.busmanagement.controller.admin;

import com.business.busmanagement.dto.admin.request.AdminUserCreateRequest;
import com.business.busmanagement.dto.admin.request.AdminUserLockRequest;
import com.business.busmanagement.dto.admin.request.AdminUserPasswordResetRequest;
import com.business.busmanagement.dto.admin.request.AdminUserUpdateRequest;
import com.business.busmanagement.dto.admin.response.AdminUserResponse;
import com.business.busmanagement.model.User;
import com.business.busmanagement.service.admin.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) User.UserStatus status
    ) {
        return ResponseEntity.ok(adminUserService.getUsers(keyword, role, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUser(id));
    }

    @PostMapping
    public ResponseEntity<AdminUserResponse> createStaff(@Valid @RequestBody AdminUserCreateRequest request) {
        return ResponseEntity.ok(adminUserService.createStaff(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request
    ) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<AdminUserResponse> lockUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserLockRequest request
    ) {
        return ResponseEntity.ok(adminUserService.lockUser(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<AdminUserResponse> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserPasswordResetRequest request
    ) {
        return ResponseEntity.ok(adminUserService.resetPassword(id, request));
    }
}
