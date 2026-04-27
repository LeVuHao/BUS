package com.business.busmanagement.controller.admin;

import com.business.busmanagement.dto.admin.request.AdminBusCreateRequest;
import com.business.busmanagement.dto.admin.request.AdminBusStatusRequest;
import com.business.busmanagement.dto.admin.request.AdminBusUpdateRequest;
import com.business.busmanagement.dto.admin.response.AdminBusResponse;
import com.business.busmanagement.model.Bus;
import com.business.busmanagement.service.admin.AdminBusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/buses")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminBusController {

    private final AdminBusService adminBusService;

    @GetMapping
    public ResponseEntity<List<AdminBusResponse>> getBuses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Bus.BusStatus status
    ) {
        return ResponseEntity.ok(adminBusService.getBuses(keyword, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminBusResponse> getBus(@PathVariable Long id) {
        return ResponseEntity.ok(adminBusService.getBus(id));
    }

    @PostMapping
    public ResponseEntity<AdminBusResponse> createBus(@Valid @RequestBody AdminBusCreateRequest request) {
        return ResponseEntity.ok(adminBusService.createBus(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminBusResponse> updateBus(
            @PathVariable Long id,
            @Valid @RequestBody AdminBusUpdateRequest request
    ) {
        return ResponseEntity.ok(adminBusService.updateBus(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminBusResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminBusStatusRequest request
    ) {
        return ResponseEntity.ok(adminBusService.updateStatus(id, request));
    }
}
