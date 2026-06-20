package com.business.busmanagement.controller;

import com.business.busmanagement.dto.VnpayCreatePaymentRequest;
import com.business.busmanagement.dto.VnpayPaymentResponse;
import com.business.busmanagement.model.User;
import com.business.busmanagement.repository.TicketRepository;
import com.business.busmanagement.service.UserService;
import com.business.busmanagement.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý các endpoint VNPay:
 * <ul>
 *   <li>{@code POST /api/private/payment/vnpay/create} — Tạo URL thanh toán (cần đăng nhập CUSTOMER)</li>
 *   <li>{@code GET  /api/public/payment/vnpay/return} — Return URL (user redirect về)</li>
 *   <li>{@code POST /api/public/payment/vnpay/ipn} — IPN callback (server-to-server từ VNPay)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class VnpayController {

    private final VnpayService vnpayService;
    private final TicketRepository ticketRepository;
    private final UserService userService;

    // ─────────────────────────────────────────────────────────────
    // PRIVATE — Tạo URL thanh toán VNPay
    // POST /api/private/payment/vnpay/create
    // Body: { ticketId: 123 }
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/private/payment/vnpay/create")
    public ResponseEntity<VnpayPaymentResponse> createPayment(
            @Valid @RequestBody VnpayCreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        // Đảm bảo vé thuộc về user đang đăng nhập
        User currentUser = getCurrentUser();
        var ticket = ticketRepository.findByIdWithDetails(request.getTicketId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vé #" + request.getTicketId()));
        if (ticket.getPassenger() == null
                || ticket.getPassenger().getUser() == null
                || !ticket.getPassenger().getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Bạn không có quyền thanh toán vé này");
        }

        VnpayPaymentResponse response = vnpayService.createPaymentUrl(request.getTicketId(), httpRequest);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // PUBLIC — Return URL (user browser redirect về sau khi TT xong)
    // GET /api/public/payment/vnpay/return
    // Endpoint này chỉ trả về thông tin xác thực để frontend hiển thị.
    // Xác thực chính thức do IPN xử lý (server-to-server).
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/public/payment/vnpay/return")
    public ResponseEntity<Map<String, Object>> paymentReturn(HttpServletRequest request) {
        Map<String, String> params = extractParams(request);

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        log.info("VNPay return URL hit: txnRef={} responseCode={}", txnRef, responseCode);

        Map<String, Object> response = new HashMap<>();
        response.put("txnRef", txnRef);
        response.put("responseCode", responseCode);
        response.put("transactionNo", params.get("vnp_TransactionNo"));
        response.put("amount", parseVnpAmount(params.get("vnp_Amount")));
        response.put("bankCode", params.get("vnp_BankCode"));
        response.put("cardType", params.get("vnp_CardType"));
        response.put("payDate", params.get("vnp_PayDate"));
        response.put("orderInfo", params.get("vnp_OrderInfo"));
        response.put("success", "00".equals(responseCode));
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────
    // PUBLIC — IPN callback (server-to-server, KHÔNG cần auth)
    // POST /api/public/payment/vnpay/ipn
    // VNPay gọi endpoint này để thông báo kết quả thanh toán.
    // Quan trọng: VNPay gửi application/x-www-form-urlencoded
    // ─────────────────────────────────────────────────────────────
    @PostMapping(value = "/public/payment/vnpay/ipn",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> ipnCallback(HttpServletRequest request) {
        Map<String, String> params = extractParams(request);
        log.info("VNPay IPN received: txnRef={} responseCode={}",
                params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));

        Map<String, String> result = vnpayService.processIpn(params);
        return ResponseEntity.ok(result);
    }

    // ── helpers ──

    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, String> params = new HashMap<>();
        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            if (entry.getValue() != null && entry.getValue().length > 0) {
                params.put(entry.getKey(), entry.getValue()[0]);
            }
        }
        return params;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new SecurityException("User not found"));
    }

    private static BigDecimal parseVnpAmount(String vnpAmount) {
        try {
            if (vnpAmount == null || vnpAmount.isEmpty()) return BigDecimal.ZERO;
            return BigDecimal.valueOf(Long.parseLong(vnpAmount))
                    .divide(BigDecimal.valueOf(100));
        } catch (NumberFormatException ex) {
            return BigDecimal.ZERO;
        }
    }
}