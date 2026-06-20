package com.business.busmanagement.util;

import com.business.busmanagement.config.VnpayConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Tiện ích ký và xác thực checksum VNPay theo chuẩn HMAC-SHA512.
 * <p>
 * Quy tắc VNPay:
 * <ol>
 *   <li>Sắp xếp các tham số theo key tăng dần (alphabet)</li>
 *   <li>Loại bỏ tham số rỗng và 2 key đặc biệt: vnp_SecureHash, vnp_SecureHashType</li>
 *   <li>Build chuỗi {@code key1=value1&key2=value2} với value đã URL-encode</li>
 *   <li>Ký HMAC-SHA512 với secret key</li>
 * </ol>
 * Tham khảo: <a href="https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html">Tài liệu VNPay</a>
 */
public final class VnpayUtil {

    private VnpayUtil() {
        // Utility class
    }

    /**
     * Ký HMAC-SHA512 cho chuỗi dữ liệu bằng secret key.
     */
    public static String hmacSHA512(String secretKey, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hashBytes.length * 2);
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Không thể tạo HMAC-SHA512: " + ex.getMessage(), ex);
        }
    }

    /**
     * URL-encode theo chuẩn VNPay (form-urlencoded, dùng UTF-8).
     * Lưu ý: encode space thành {@code +}, các ký tự đặc biệt theo chuẩn.
     */
    public static String urlEncode(String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    /**
     * Build chuỗi hash data và tính secure hash từ map các tham số.
     *
     * @param params   map các tham số (KHÔNG bao gồm vnp_SecureHash*)
     * @param hashSecret secret key
     * @return mảng 2 phần tử: [hashData, secureHash]
     */
    public static String[] buildHashData(Map<String, String> params, String hashSecret) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(urlEncode(fieldValue));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }
        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        return new String[]{hashData.toString(), secureHash};
    }

    /**
     * Build URL thanh toán đầy đủ kèm vnp_SecureHash để redirect user sang VNPay.
     */
    public static String buildPaymentUrl(VnpayConfig config, Map<String, String> params) {
        String[] hashResult = buildHashData(params, config.getHashSecret());
        String hashData = hashResult[0];
        String secureHash = hashResult[1];

        String queryString = hashData
                + "&vnp_SecureHashType=HmacSHA512"
                + "&vnp_SecureHash=" + secureHash;

        return config.getUrl() + "?" + queryString;
    }

    /**
     * Xác thực checksum từ IPN callback hoặc Return URL.
     * Trả về true nếu secure hash khớp (chữ ký hợp lệ).
     *
     * @param params   các tham số VNPay trả về (không bao gồm vnp_SecureHash*)
     * @param secureHash chữ ký VNPay gửi kèm (vnp_SecureHash)
     * @param hashSecret secret key của merchant
     */
    public static boolean verifySecureHash(Map<String, String> params, String secureHash, String hashSecret) {
        if (secureHash == null || secureHash.isEmpty()) return false;
        String[] hashResult = buildHashData(params, hashSecret);
        String expected = hashResult[1];
        return constantTimeEquals(expected, secureHash);
    }

    /**
     * So sánh 2 chuỗi trong thời gian cố định (tránh timing attack).
     */
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    /**
     * Lấy IP thực của client từ request (ưu tiên X-Forwarded-For nếu có proxy).
     */
    public static String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank()) {
            // Lấy IP đầu tiên nếu có nhiều IP phân cách bằng dấu phẩy
            int commaIdx = ip.indexOf(',');
            return commaIdx > 0 ? ip.substring(0, commaIdx).trim() : ip.trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isBlank()) return ip.trim();
        return request.getRemoteAddr();
    }
}