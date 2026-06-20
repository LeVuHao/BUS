package com.business.busmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request tạo URL thanh toán VNPay.
 * Client gọi sau khi đã có vé ở trạng thái HOLD và muốn thanh toán online.
 */
@Data
public class VnpayCreatePaymentRequest {
    /** ID của vé cần thanh toán */
    @NotNull(message = "ticketId is required")
    private Long ticketId;
}