package com.business.busmanagement.dto.admin.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalBuses;
    private long totalRoutes;
    private long totalTripsToday;
    private long lockedUsers;
    private long expiredInsuranceBuses;
    private long expiringInsuranceBuses;
    private Map<String, Long> usersByRole;
    private Map<String, Long> busesByStatus;
}
