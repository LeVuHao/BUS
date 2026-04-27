package com.business.busmanagement.dto.admin.response;

import com.business.busmanagement.model.Bus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SharedBusOptionResponse {
    private Long id;
    private String licensePlate;
    private Bus.BusType busType;
    private Integer totalSeats;
    private Bus.BusStatus status;
}
