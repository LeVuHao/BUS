package com.business.busmanagement.dto.admin.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminRouteUpdateRequest {

    @Size(max = 100, message = "Origin must not exceed 100 characters")
    private String origin;

    @Size(max = 100, message = "Destination must not exceed 100 characters")
    private String destination;

    @DecimalMin(value = "0.1", message = "Distance must be greater than 0")
    private BigDecimal distanceKm;

    @Min(value = 1, message = "Estimated duration must be greater than 0")
    private Integer estimatedDurationMin;

    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    private Boolean isActive;
}
