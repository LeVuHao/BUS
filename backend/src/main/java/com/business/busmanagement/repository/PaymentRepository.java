package com.business.busmanagement.repository;

import com.business.busmanagement.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Tìm payment theo mã tham chiếu giao dịch VNPay (vnp_TxnRef).
     * Dùng cho IPN callback.
     */
    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);

    /**
     * Tìm payment theo ID vé (mỗi vé chỉ có tối đa 1 payment nhờ @OneToOne unique).
     */
    Optional<Payment> findByTicketId(Long ticketId);
}
