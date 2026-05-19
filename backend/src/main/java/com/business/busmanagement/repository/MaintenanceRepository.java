package com.business.busmanagement.repository;

import com.business.busmanagement.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByBusId(Long busId);
    List<Maintenance> findByStatus(Maintenance.MaintenanceStatus status);
    List<Maintenance> findByBusIdOrderByMaintenanceDateDesc(Long busId);
}
