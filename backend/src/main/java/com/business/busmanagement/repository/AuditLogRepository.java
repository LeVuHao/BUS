package com.business.busmanagement.repository;

import com.business.busmanagement.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<AuditLog> findByTableNameOrderByTimestampDesc(String tableName);
    List<AuditLog> findByRecordIdAndTableName(Long recordId, String tableName);
}
