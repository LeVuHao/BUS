package com.business.busmanagement.service.admin;

import com.business.busmanagement.dto.admin.response.AdminDashboardResponse;
import com.business.busmanagement.model.Bus;
import com.business.busmanagement.model.User;
import com.business.busmanagement.repository.BusRepository;
import com.business.busmanagement.repository.RouteRepository;
import com.business.busmanagement.repository.TripRepository;
import com.business.busmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        usersByRole.put("ADMIN", userRepository.countByRole_Name("ADMIN"));
        usersByRole.put("STAFF", userRepository.countByRole_Name("STAFF"));
        usersByRole.put("CUSTOMER", userRepository.countByRole_Name("CUSTOMER"));

        Map<String, Long> busesByStatus = new LinkedHashMap<>();
        busesByStatus.put("AVAILABLE", busRepository.countByStatus(Bus.BusStatus.AVAILABLE));
        busesByStatus.put("RUNNING", busRepository.countByStatus(Bus.BusStatus.RUNNING));
        busesByStatus.put("MAINTENANCE", busRepository.countByStatus(Bus.BusStatus.MAINTENANCE));

        return new AdminDashboardResponse(
                userRepository.count(),
                busRepository.count(),
                routeRepository.countByIsActiveTrue(),
                tripRepository.countByDepartureTimeBetween(today.atStartOfDay(), today.plusDays(1).atStartOfDay()),
                userRepository.countByStatus(User.UserStatus.LOCKED),
                busRepository.countByInsuranceExpiryBefore(today),
                busRepository.countByInsuranceExpiryBetween(today, today.plusDays(30)),
                usersByRole,
                busesByStatus
        );
    }
}
