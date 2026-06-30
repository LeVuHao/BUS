package com.business.busmanagement.repository;

/* ============================================================
 * Query đặc biệt:
 *   - findBookedSeatIdsByTripId: lấy DS ghế đã đặt của 1 chuyến
 *   - findByTripIdAndSeatIdForUpdate: PESSIMISTIC LOCK chống race
 *   - findByPassengerUserId: lịch sử vé của 1 user
 *   - findAllTicketsForAdmin: admin xem tất cả vé
 *   - findBookedCountsByTripIds: gom bookedSeat theo nhieu tripId trong 1 query (fix N+1)
 *   - aggregateRevenueByBusIdForStats: gom revenue theo busId (fix N+1 cho revenue stats)
 *   - aggregateRevenueByDriverEmployeeIdForStats: gom revenue theo driver employeeId (fix N+1)
 *   - countTripsByBusIds: dem tong so chuyen theo busId (fix N+1)
 * ============================================================ */
import com.business.busmanagement.dto.AdminTicketDTO;
import com.business.busmanagement.model.Seat;
import com.business.busmanagement.model.Ticket;
import com.business.busmanagement.model.Trip;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTripAndSeat(Trip trip, Seat seat);

    boolean existsByTripAndSeat(Trip trip, Seat seat);

    @Query("""
            SELECT t FROM Ticket t
            LEFT JOIN FETCH t.trip tr
            LEFT JOIN FETCH tr.route
            LEFT JOIN FETCH tr.bus
            LEFT JOIN FETCH t.seat
            LEFT JOIN FETCH t.passenger p
            LEFT JOIN FETCH p.user
            LEFT JOIN FETCH t.payment
            WHERE t.id = :id
            """)
    Optional<Ticket> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT t FROM Ticket t WHERE t.trip.id = :tripId AND t.seat.id = :seatId")
    Optional<Ticket> findByTripIdAndSeatId(@Param("tripId") Long tripId, @Param("seatId") Long seatId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.trip.id = :tripId AND t.seat.id = :seatId")
    Optional<Ticket> findByTripIdAndSeatIdForUpdate(@Param("tripId") Long tripId, @Param("seatId") Long seatId);

    @Query("""
            SELECT t FROM Ticket t
            JOIN FETCH t.passenger p
            LEFT JOIN FETCH p.user
            LEFT JOIN FETCH t.trip tr
            LEFT JOIN FETCH tr.route
            LEFT JOIN FETCH tr.bus
            LEFT JOIN FETCH t.seat
            LEFT JOIN FETCH t.payment
            WHERE p.user.id = :userId
            ORDER BY t.bookedAt DESC
            """)
    List<Ticket> findByPassengerUserId(@Param("userId") Long userId);

    @Query("""
            SELECT t.seat.id FROM Ticket t
            WHERE t.trip.id = :tripId
              AND t.status NOT IN ('CANCELLED', 'REFUNDED')
            """)
    List<Long> findBookedSeatIdsByTripId(@Param("tripId") Long tripId);

    @Query("""
            SELECT t FROM Ticket t
            WHERE (:keyword IS NULL OR :keyword = ''
                   OR LOWER(t.passenger.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(t.passenger.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:status IS NULL OR t.status = :status)
              AND (:tripId IS NULL OR t.trip.id = :tripId)
            ORDER BY t.bookedAt DESC
            """)
    List<Ticket> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("status") Ticket.TicketStatus status,
            @Param("tripId") Long tripId
    );


   @Query("SELECT new com.business.busmanagement.dto.AdminTicketDTO(" +
           "t.id, r.origin, r.destination, tr.departureTime, " +
           "b.licensePlate, b.busType, s.seatNumber, " +
           "p.fullName, p.phone, t.bookedAt, t.price, t.status, " +
           "t.pickupPoint, t.dropoffPoint) " +
           "FROM Ticket t " +
           "LEFT JOIN t.trip tr " +
           "LEFT JOIN tr.route r " +
           "LEFT JOIN tr.bus b " +
           "LEFT JOIN t.seat s " +
           "LEFT JOIN t.passenger p " +
           "ORDER BY t.bookedAt DESC")
    List<AdminTicketDTO> findAllTicketsForAdmin();

    // ---------------------------------------------------------------
    // PERFORMANCE: Batch query aggregations (thay thế N+1 patterns)
    // ---------------------------------------------------------------

    /**
     * Đếm số ghế đã đặt của NHIỀU tripId trong 1 query duy nhất.
     * Fix N+1: trước đây goi findBookedSeatIdsByTripId cho từng trip → 50 trips = 50 queries.
     * Giờ: 1 query GROUP BY trip_id.
     */
    @Query("""
            SELECT t.trip.id AS tripId, COUNT(t.id) AS count
            FROM Ticket t
            WHERE t.trip.id IN :tripIds
              AND t.status NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY t.trip.id
            """)
    List<BookedCountByTripIdProjection> countBookedSeatsByTripIds(@Param("tripIds") List<Long> tripIds);

    /**
     * Gom doanh thu theo busId trong 1 query duy nhất (chỉ tính vé CONFIRMED + PAID).
     * Fix N+1: revenue stats trước đây load all tickets rồi loop → rất chậm.
     */
    @Query("""
            SELECT t.trip.bus.id AS busId,
                   COUNT(t.id) AS ticketCount,
                   COALESCE(SUM(t.price), 0) AS revenue
            FROM Ticket t
            WHERE t.status IN ('CONFIRMED', 'PAID')
              AND t.trip IS NOT NULL
              AND t.trip.bus IS NOT NULL
            GROUP BY t.trip.bus.id
            """)
    List<RevenueByBusIdProjection> aggregateRevenueByBusIdForStats();

    /**
     * Gom doanh thu theo (tripId, busId) trong 1 query duy nhất.
     * Dùng để tính revenue cho top drivers (gom theo trip -> gán cho driver).
     */
    @Query("""
            SELECT t.trip.id AS tripId,
                   t.trip.bus.id AS busId,
                   COALESCE(SUM(t.price), 0) AS revenue,
                   COUNT(t.id) AS ticketCount
            FROM Ticket t
            WHERE t.status IN ('CONFIRMED', 'PAID')
              AND t.trip IS NOT NULL
            GROUP BY t.trip.id, t.trip.bus.id
            """)
    List<RevenueByTripIdProjection> aggregateRevenueByTripIdForStats();

    /**
     * Đếm số chuyến theo từng busId trong 1 query duy nhất.
     * Fix N+1: trước đây load tripRepository.findAll() rồi lazy load bus.
     */
    @Query("""
            SELECT t.bus.id AS busId, COUNT(t.id) AS tripCount
            FROM Trip t
            WHERE t.bus IS NOT NULL
            GROUP BY t.bus.id
            """)
    List<TripCountByBusIdProjection> countTripsByBusIds();

    /** Projection cho countBookedSeatsByTripIds */
    interface BookedCountByTripIdProjection {
        Long getTripId();
        Long getCount();
    }

    /** Projection cho aggregateRevenueByBusIdForStats */
    interface RevenueByBusIdProjection {
        Long getBusId();
        Long getTicketCount();
        java.math.BigDecimal getRevenue();
    }

    /** Projection cho aggregateRevenueByTripIdForStats */
    interface RevenueByTripIdProjection {
        Long getTripId();
        Long getBusId();
        java.math.BigDecimal getRevenue();
        Long getTicketCount();
    }

    /** Projection cho countTripsByBusIds */
    interface TripCountByBusIdProjection {
        Long getBusId();
        Long getTripCount();
    }

    // ---------------------------------------------------------------
    // Spring Data derived methods (auto-generated queries)
    // ---------------------------------------------------------------

    /** Đếm tổng số vé theo 1 status. */
    long countByStatus(Ticket.TicketStatus status);

    /** Đếm tổng số vé thuộc 1 trong nhiều status. */
    long countByStatusIn(Collection<Ticket.TicketStatus> statuses);

    /**
     * Lấy các field CẦN THIẾT để tính revenue (KHÔNG load entity đầy đủ).
     * Returns: [price, paidAt, bookedAt].
     *
     * Tại sao dùng Object[] thay vì Projection:
     *   - Không cần khai báo interface, đỡ overhead khi scan nhiều row.
     *   - Chỉ SELECT 3 column → nhẹ hơn fetch full Ticket entity.
     */
    @Query("""
            SELECT t.price, t.paidAt, t.bookedAt
            FROM Ticket t
            WHERE t.status IN ('CONFIRMED', 'PAID')
            ORDER BY t.paidAt DESC NULLS LAST, t.bookedAt DESC NULLS LAST
            """)
    List<Object[]> findRevenueRowsForStats();
}



