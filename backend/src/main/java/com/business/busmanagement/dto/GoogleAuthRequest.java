package com.business.busmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {
    @NotBlank
    private String idToken;
    
    // Optional role selection, defaults to CUSTOMER if not provided
    private String role;
}
