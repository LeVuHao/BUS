package com.business.busmanagement.controller;

import com.business.busmanagement.dto.admin.response.SharedBusOptionResponse;
import com.business.busmanagement.model.Bus;
import com.business.busmanagement.service.admin.AdminBusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class BusController {

    private final AdminBusService adminBusService;

    @GetMapping
    public ResponseEntity<List<SharedBusOptionResponse>> getBuses(
            @RequestParam(required = false) Bus.BusStatus status
    ) {
        return ResponseEntity.ok(adminBusService.getBusOptions(status));
    }
}
