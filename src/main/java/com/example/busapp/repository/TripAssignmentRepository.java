package com.example.busapp.repository;

import com.example.busapp.entity.TripAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripAssignmentRepository extends JpaRepository<TripAssignment, Integer> {
    
    // Tự động tạo câu lệnh SQL: SELECT * FROM trip_assignments WHERE trip_id = ?
    List<TripAssignment> findByTripId(Integer tripId);
}
