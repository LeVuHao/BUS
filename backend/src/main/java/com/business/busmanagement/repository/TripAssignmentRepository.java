package com.business.busmanagement.repository;

import com.business.busmanagement.model.TripAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface TripAssignmentRepository extends JpaRepository<TripAssignment, Long> {

    // Hàm này dùng để xóa phân công cũ khi Admin đổi tài xế khác
    @Transactional
    void deleteByTripId(Long tripId);
    List<TripAssignment> findByTripId(Long tripId);

    /**
     * PERFORMANCE (fix N+1): lấy phân công của NHIỀU tripId trong 1 query duy nhất.
     * Trước đây: 50 trips = 50 lần gọi findByTripId(id) → 50 queries tuần tự hoặc parallel.
     * Giờ: 1 query IN (...) batch trả về List<TripAssignment>, FE map theo tripId.
     */
    @Query("""
            SELECT a FROM TripAssignment a
            WHERE a.tripId IN :tripIds
            ORDER BY a.tripId ASC, a.assignmentRole ASC
            """)
    List<TripAssignment> findByTripIdIn(@Param("tripIds") List<Long> tripIds);
}
