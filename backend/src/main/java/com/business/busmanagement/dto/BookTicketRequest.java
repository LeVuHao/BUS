package com.business.busmanagement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookTicketRequest {
    @NotNull(message = "tripId is required")
    private Long tripId;

    @NotNull(message = "seatId is required")
    private Long seatId;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.01", message = "price must be greater than 0")
    private BigDecimal price;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String passengerPhone;

    // Điểm đón cụ thể (tên + địa chỉ)
    private String pickupPoint;

    // Điểm trả cụ thể (tên + địa chỉ)
    private String dropoffPoint;
}
