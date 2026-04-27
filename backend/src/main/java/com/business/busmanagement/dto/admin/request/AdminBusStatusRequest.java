package com.business.busmanagement.dto.admin.request;

import com.business.busmanagement.model.Bus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminBusStatusRequest {

    @NotNull(message = "Status is required")
    private Bus.BusStatus status;
}
