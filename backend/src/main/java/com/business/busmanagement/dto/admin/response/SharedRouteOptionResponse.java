package com.business.busmanagement.dto.admin.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SharedRouteOptionResponse {
    private Long id;
    private String origin;
    private String destination;
    private BigDecimal distanceKm;
    private Integer estimatedDurationMin;
    private BigDecimal basePrice;
}
