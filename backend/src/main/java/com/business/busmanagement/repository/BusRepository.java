package com.business.busmanagement.repository;

import com.business.busmanagement.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    /**
     * PERFORMANCE (fix Dashboard): gom số xe theo status trong 1 query GROUP BY.
     * Trước: findAll buses → groupingBy → size (phải load all buses).
     * Sau: 1 query GROUP BY → trả về [status, count].
     */
    @Query("SELECT b.status, COUNT(b) FROM Bus b GROUP BY b.status")
    List<Object[]> countBusesGroupedByStatus();

    /**
     * PERFORMANCE (fix getBuses): search by licensePlate trong DB thay vì load all rồi
     * filter trong Java. Khi bảng lớn (>500 buses), filter in-memory sẽ chậm.
     */
    @Query("""
            SELECT b FROM Bus b
            WHERE (:keyword IS NULL OR :keyword = ''
                   OR LOWER(b.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:status IS NULL OR :status = '' OR b.status = :status)
            ORDER BY b.id DESC
            """)
    List<Bus> searchBuses(@Param("keyword") String keyword,
                          @Param("status") String status);
}
