package com.business.busmanagement.controller;

import com.business.busmanagement.dto.admin.response.SharedRouteOptionResponse;
import com.business.busmanagement.service.admin.AdminRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class RouteController {

    private final AdminRouteService adminRouteService;

    @GetMapping
    public ResponseEntity<List<SharedRouteOptionResponse>> getRoutes() {
        return ResponseEntity.ok(adminRouteService.getRouteOptions());
    }
}
