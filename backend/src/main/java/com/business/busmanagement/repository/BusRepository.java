package com.business.busmanagement.repository;

import com.business.busmanagement.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    boolean existsByLicensePlate(String licensePlate);

    boolean existsByLicensePlateAndIdNot(String licensePlate, Long id);

    long countByStatus(Bus.BusStatus status);

    long countByInsuranceExpiryBefore(LocalDate date);

    long countByInsuranceExpiryBetween(LocalDate startDate, LocalDate endDate);
}
