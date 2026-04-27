package com.business.busmanagement.dto.admin.request;

import com.business.busmanagement.model.Bus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminBusUpdateRequest {

    @Size(max = 20, message = "License plate must not exceed 20 characters")
    private String licensePlate;

    private Bus.BusType busType;

    @Min(value = 1, message = "Total seats must be greater than 0")
    private Integer totalSeats;

    private LocalDate lastMaintenanceDate;

    @FutureOrPresent(message = "Insurance expiry must be today or in the future")
    private LocalDate insuranceExpiry;
}
