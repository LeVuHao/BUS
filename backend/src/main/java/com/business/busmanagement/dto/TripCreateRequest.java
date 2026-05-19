package com.business.busmanagement.dto;

import com.business.busmanagement.model.Trip;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripCreateRequest {

    // Chọn route có sẵn (ưu tiên)
    private Long routeId;

    // Hoặc tạo route mới inline (khi routeId = null)
    private String origin;
    private String destination;
    private BigDecimal basePrice;
    private BigDecimal distanceKm;
    private Integer estimatedDurationMin;

    @NotNull(message = "Bus is required")
    private Long busId;

    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;

    @NotNull(message = "Arrival time is required")
    private LocalDateTime arrivalTime;

    private Trip.TripStatus status;
}
