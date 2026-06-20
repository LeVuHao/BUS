package com.business.busmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về URL thanh toán VNPay để frontend redirect user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnpayPaymentResponse {
    /** URL cổng thanh toán VNPay (sandbox hoặc production) */
    private String paymentUrl;

    /** Mã tham chiếu giao dịch (vnp_TxnRef) mà merchant gửi lên VNPay */
    private String txnRef;

    /** Thời gian hết hạn của URL (ISO-8601 string) */
    private String expireAt;
}