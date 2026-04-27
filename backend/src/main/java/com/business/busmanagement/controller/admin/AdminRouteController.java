package com.business.busmanagement.controller.admin;

import com.business.busmanagement.dto.admin.request.AdminRouteCreateRequest;
import com.business.busmanagement.dto.admin.request.AdminRouteUpdateRequest;
import com.business.busmanagement.dto.admin.response.AdminRouteResponse;
import com.business.busmanagement.service.admin.AdminRouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminRouteController {

    private final AdminRouteService adminRouteService;

    @GetMapping
    public ResponseEntity<List<AdminRouteResponse>> getRoutes(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "false") Boolean activeOnly
    ) {
        return ResponseEntity.ok(adminRouteService.getRoutes(keyword, activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminRouteResponse> getRoute(@PathVariable Long id) {
        return ResponseEntity.ok(adminRouteService.getRoute(id));
    }

    @PostMapping
    public ResponseEntity<AdminRouteResponse> createRoute(@Valid @RequestBody AdminRouteCreateRequest request) {
        return ResponseEntity.ok(adminRouteService.createRoute(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminRouteResponse> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody AdminRouteUpdateRequest request
    ) {
        return ResponseEntity.ok(adminRouteService.updateRoute(id, request));
    }
}
