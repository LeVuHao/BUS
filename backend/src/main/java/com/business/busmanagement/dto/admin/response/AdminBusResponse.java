package com.business.busmanagement.dto.admin.response;

import com.business.busmanagement.model.Bus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AdminBusResponse {
    private Long id;
    private String licensePlate;
    private Bus.BusType busType;
    private Integer totalSeats;
    private Bus.BusStatus status;
    private LocalDate lastMaintenanceDate;
    private LocalDate insuranceExpiry;
    private String insuranceStatus;
}
