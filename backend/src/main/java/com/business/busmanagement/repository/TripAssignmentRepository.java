package com.business.busmanagement.repository;

import com.business.busmanagement.model.TripAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface TripAssignmentRepository extends JpaRepository<TripAssignment, Long> {
    
    // Hàm này dùng để xóa phân công cũ khi Admin đổi tài xế khác
    @Transactional
    void deleteByTripId(Long tripId);
    List<TripAssignment> findByTripId(Long tripId);
}
