package com.business.busmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusResponse {
    private Long id;
    private String seatNumber;
    private Integer positionX;
    private Integer positionY;
    private boolean booked;
}
