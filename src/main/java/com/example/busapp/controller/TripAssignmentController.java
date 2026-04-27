package com.example.busapp.controller;

import com.example.busapp.entity.TripAssignment;
import com.example.busapp.service.TripAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-assignments")
public class TripAssignmentController {

    @Autowired
    private TripAssignmentService tripAssignmentService;

    // Lấy danh sách phân công của chuyến xe
    @GetMapping("/{tripId}")
    public ResponseEntity<List<TripAssignment>> get(@PathVariable Integer tripId) {
        return ResponseEntity.ok(tripAssignmentService.getByTripId(tripId));
    }

    // API Phân công: POST /api/trip-assignments
    @PostMapping
    public ResponseEntity<TripAssignment> create(@RequestBody TripAssignment assignment) {
        return ResponseEntity.ok(tripAssignmentService.assign(assignment));
    }
}
