package com.example.busapp.service;

import com.example.busapp.entity.TripAssignment;
import com.example.busapp.repository.TripAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripAssignmentService {

    @Autowired
    private TripAssignmentRepository tripAssignmentRepository;

    // 1. Xem danh sách phân công của 1 chuyến
    public List<TripAssignment> getByTripId(Integer tripId) {
        return tripAssignmentRepository.findByTripId(tripId);
    }

    // 2. Thực hiện phân công mới (Gán tài xế vào chuyến)
    public TripAssignment assign(TripAssignment assignment) {
        return tripAssignmentRepository.save(assignment);
    }
}