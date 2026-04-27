package com.business.busmanagement.dto.admin.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUserLockRequest {

    @NotNull(message = "locked is required")
    private Boolean locked;
}
