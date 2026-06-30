package com.business.busmanagement.repository;

import com.business.busmanagement.model.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    Optional<Passenger> findByUserId(Long userId);

    /**
     * PERFORMANCE (fix N+1): tải nhiều passenger theo userIds trong 1 query duy nhất.
     * Trước đây gọi findByUserId(userId) cho MỖI user → 100 users = 100 queries.
     */
    @Query("""
            SELECT p FROM Passenger p
            LEFT JOIN FETCH p.user
            WHERE p.user.id IN :userIds
            """)
    List<Passenger> findAllByUserIdIn(@Param("userIds") Collection<Long> userIds);
}
