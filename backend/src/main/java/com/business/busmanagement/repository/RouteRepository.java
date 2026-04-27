package com.business.busmanagement.repository;

import com.business.busmanagement.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    boolean existsByOriginIgnoreCaseAndDestinationIgnoreCase(String origin, String destination);

    boolean existsByOriginIgnoreCaseAndDestinationIgnoreCaseAndIdNot(String origin, String destination, Long id);

    long countByIsActiveTrue();
}
