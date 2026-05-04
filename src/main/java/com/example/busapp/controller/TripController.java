package com.example.busapp.controller;

import com.example.busapp.entity.Trip;
import com.example.busapp.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    // DTO nhận trạng thái cập nhật
    public static class StatusRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // A. Lấy danh sách tất cả chuyến xe
    @GetMapping
    public ResponseEntity<List<Trip>> listAll() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    // B. Xem chi tiết 1 chuyến
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getOne(@PathVariable Integer id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    // C. Tạo chuyến xe mới
    @PostMapping
    public ResponseEntity<Trip> create(@RequestBody Trip trip) {
        return ResponseEntity.ok(tripService.createTrip(trip));
    }

    // D. Cập nhật trạng thái
    @PutMapping("/{id}/status")
    public ResponseEntity<Trip> changeStatus(@PathVariable Integer id, @RequestBody StatusRequest request) {
        return ResponseEntity.ok(tripService.updateTripStatus(id, request.getStatus()));
    }
}