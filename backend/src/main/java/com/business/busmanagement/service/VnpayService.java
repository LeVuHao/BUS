package com.business.busmanagement.service;

import com.business.busmanagement.config.VnpayConfig;
import com.business.busmanagement.dto.VnpayPaymentResponse;
import com.business.busmanagement.exception.ResourceNotFoundException;
import com.business.busmanagement.model.Payment;
import com.business.busmanagement.model.Ticket;
import com.business.busmanagement.repository.PaymentRepository;
import com.business.busmanagement.repository.TicketRepository;
import com.business.busmanagement.util.VnpayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service xử lý tích hợp VNPay:
 * <ul>
 *   <li>Tạo URL thanh toán redirect user sang cổng VNPay</li>
 *   <li>Xác thực chữ ký từ IPN callback (server-to-server)</li>
 *   <li>Cập nhật trạng thái vé + payment sau khi nhận IPN</li>
 * </ul>
 * Lưu ý: VNPay sandbox có thể gọi IPN với delay, cần xử lý idempotent.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnpayService {

    private final VnpayConfig vnpayConfig;
    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;

    /** Format ngày giờ chuẩn VNPay: yyyyMMddHHmmss (theo GMT+7) */
    private static final DateTimeFormatter VNP_DATETIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * Tạo URL thanh toán VNPay cho một vé đang ở trạng thái HOLD.
     */
    @Transactional
    public VnpayPaymentResponse createPaymentUrl(Long ticketId, HttpServletRequest request) {
        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vé #" + ticketId));

        if (ticket.getStatus() != Ticket.TicketStatus.HOLD) {
            throw new IllegalStateException(
                    "Chỉ vé ở trạng thái chờ thanh toán (HOLD) mới có thể thanh toán online. Hiện tại: "
                            + ticket.getStatus());
        }

        // Tìm payment PENDING cũ (nếu user retry) qua query trực tiếp
        // Tránh dùng ticket.getPayment() vì lazy-loading có thể trả null không đáng tin
        Optional<Payment> existingPayment = paymentRepository.findByTicketId(ticket.getId());

        if (existingPayment.isPresent()
                && existingPayment.get().getStatus() == Payment.PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Vé này đã được thanh toán thành công trước đó");
        }

        // Sinh mã tham chiếu giao dịch duy nhất
        String txnRef = "TICKET" + ticketId + "_" + System.currentTimeMillis();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireAt = now.plusMinutes(vnpayConfig.getExpireMinutes());

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnpayConfig.getVersion());
        vnpParams.put("vnp_Command", vnpayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        // Số tiền VNPay yêu cầu nhân 100, là số nguyên, không phần thập phân
        long amount = ticket.getPrice().multiply(BigDecimal.valueOf(100)).longValue();
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", vnpayConfig.getCurrencyCode());
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan ve xe #" + ticket.getId());
        vnpParams.put("vnp_OrderType", vnpayConfig.getOrderType());
        vnpParams.put("vnp_Locale", vnpayConfig.getLocale());
        vnpParams.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", VnpayUtil.getClientIp(request));
        vnpParams.put("vnp_CreateDate", formatVnpDatetime(now));
        vnpParams.put("vnp_ExpireDate", formatVnpDatetime(expireAt));

        // Tạo / cập nhật Payment record ở trạng thái PENDING trước khi redirect
        Payment payment = existingPayment.orElseGet(Payment::new);
        payment.setTicket(ticket);
        payment.setAmount(ticket.getPrice());
        payment.setPaymentMethod(Payment.PaymentMethod.VNPAY);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setVnpTxnRef(txnRef);
        payment.setTransactionCode(null); // sẽ update khi nhận IPN
        payment.setPaidAt(null);
        payment.setVnpTransactionNo(null);
        payment.setVnpBankCode(null);
        payment.setVnpCardType(null);
        payment.setVnpResponseCode(null);
        paymentRepository.save(payment);

        ticket.setPayment(payment);
        ticketRepository.save(ticket);

        String paymentUrl = VnpayUtil.buildPaymentUrl(vnpayConfig, vnpParams);
        log.info("Created VNPay URL for ticket #{} txnRef={} amount={}", ticketId, txnRef, amount);

        return VnpayPaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .expireAt(expireAt.toString())
                .build();
    }

    /**
     * Xử lý IPN callback từ VNPay (server-to-server).
     */
    @Transactional
    public Map<String, String> processIpn(Map<String, String> vnpParams) {
        Map<String, String> result = new HashMap<>();
        String txnRef = vnpParams.get("vnp_TxnRef");
        String responseCode = vnpParams.get("vnp_ResponseCode");
        String transactionNo = vnpParams.get("vnp_TransactionNo");
        String secureHash = vnpParams.get("vnp_SecureHash");

        if (txnRef == null || txnRef.isEmpty()) {
            log.warn("VNPay IPN missing vnp_TxnRef");
            return ipnError("01", "Order not found");
        }

        // Bỏ 2 trường secure hash ra khỏi params trước khi verify
        Map<String, String> verifyParams = new HashMap<>(vnpParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        if (!VnpayUtil.verifySecureHash(verifyParams, secureHash, vnpayConfig.getHashSecret())) {
            log.warn("VNPay IPN invalid checksum for txnRef={}", txnRef);
            return ipnError("97", "Invalid signature");
        }

        Optional<Payment> paymentOpt = paymentRepository.findByVnpTxnRef(txnRef);
        if (paymentOpt.isEmpty()) {
            log.warn("VNPay IPN: payment not found for txnRef={}", txnRef);
            return ipnError("01", "Order not found");
        }

        Payment payment = paymentOpt.get();

        // Idempotent: nếu đã SUCCESS thì return Confirm Success luôn
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            log.info("VNPay IPN: txnRef={} already SUCCESS, skipping", txnRef);
            return ipnOk();
        }

        Ticket ticket = payment.getTicket();
        if (ticket == null) {
            log.error("VNPay IPN: payment {} has no ticket", payment.getId());
            return ipnError("99", "Unknown error");
        }

        // Validate số tiền khớp với giá vé
        String amountStr = vnpParams.get("vnp_Amount");
        try {
            long vnpAmount = amountStr != null ? Long.parseLong(amountStr) : 0L;
            BigDecimal expectedAmount = ticket.getPrice().multiply(BigDecimal.valueOf(100));
            if (BigDecimal.valueOf(vnpAmount).compareTo(expectedAmount) != 0) {
                log.warn("VNPay IPN: amount mismatch for txnRef={} vnp={} expected={}",
                        txnRef, vnpAmount, expectedAmount);
                return ipnError("04", "Invalid amount");
            }
        } catch (NumberFormatException ex) {
            log.warn("VNPay IPN: invalid amount format for txnRef={}: {}", txnRef, amountStr);
            return ipnError("04", "Invalid amount");
        }

        boolean isSuccess = "00".equals(responseCode);

        // Cập nhật payment
        payment.setVnpTransactionNo(transactionNo);
        payment.setVnpBankCode(vnpParams.get("vnp_BankCode"));
        payment.setVnpCardType(vnpParams.get("vnp_CardType"));
        payment.setVnpResponseCode(responseCode);
        payment.setTransactionCode(buildTransactionCode(transactionNo, txnRef));

        if (isSuccess) {
            LocalDateTime paidAt = LocalDateTime.now();
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaidAt(paidAt);
            ticket.setStatus(Ticket.TicketStatus.PAID);
            ticket.setPaidAt(paidAt);
            log.info("VNPay payment SUCCESS for ticket #{} txnRef={}", ticket.getId(), txnRef);
        } else {
            // Thanh toán thất bại: KHÔNG đổi ticket status, giữ HOLD để user retry
            payment.setStatus(Payment.PaymentStatus.FAILED);
            log.info("VNPay payment FAILED for ticket #{} txnRef={} code={}",
                    ticket.getId(), txnRef, responseCode);
        }

        ticketRepository.save(ticket);
        paymentRepository.save(payment);

        return ipnOk();
    }

    private Map<String, String> ipnOk() {
        Map<String, String> result = new HashMap<>();
        result.put("RspCode", "00");
        result.put("Message", "Confirm Success");
        return result;
    }

    private Map<String, String> ipnError(String code, String message) {
        Map<String, String> result = new HashMap<>();
        result.put("RspCode", code);
        result.put("Message", message);
        return result;
    }

    private static String formatVnpDatetime(LocalDateTime dt) {
        return dt.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(VNP_DATETIME_FORMAT);
    }

    private static String buildTransactionCode(String vnpTransactionNo, String txnRef) {
        if (vnpTransactionNo != null && !vnpTransactionNo.isEmpty()) {
            return "VNP" + vnpTransactionNo;
        }
        return txnRef;
    }
}