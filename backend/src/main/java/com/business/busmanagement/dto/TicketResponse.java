package com.business.busmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private Long tripId;
    private String routeName;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String busLabel;
    private String seatNumber;
    private String passengerName;
    private String passengerPhone;
    private BigDecimal price;
    private String status;
    private LocalDateTime bookedAt;
}
