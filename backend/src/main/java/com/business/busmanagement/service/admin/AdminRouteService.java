package com.business.busmanagement.service.admin;

import com.business.busmanagement.dto.admin.request.AdminRouteCreateRequest;
import com.business.busmanagement.dto.admin.request.AdminRouteUpdateRequest;
import com.business.busmanagement.dto.admin.response.AdminRouteResponse;
import com.business.busmanagement.dto.admin.response.SharedRouteOptionResponse;
import com.business.busmanagement.exception.BusinessConflictException;
import com.business.busmanagement.exception.ResourceNotFoundException;
import com.business.busmanagement.model.Route;
import com.business.busmanagement.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminRouteService {

    private final RouteRepository routeRepository;

    @Transactional(readOnly = true)
    public List<AdminRouteResponse> getRoutes(String keyword, Boolean activeOnly) {
        String normalizedKeyword = normalizeKeyword(keyword);

        return routeRepository.findAll()
                .stream()
                .filter(route -> !Boolean.TRUE.equals(activeOnly) || Boolean.TRUE.equals(route.getIsActive()))
                .filter(route -> matchesKeyword(route, normalizedKeyword))
                .sorted(Comparator.comparing(Route::getId).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminRouteResponse getRoute(Long id) {
        return toResponse(findRoute(id));
    }

    @Transactional(readOnly = true)
    public List<SharedRouteOptionResponse> getRouteOptions() {
        return routeRepository.findAll()
                .stream()
                .filter(route -> Boolean.TRUE.equals(route.getIsActive()))
                .sorted(Comparator.comparing(Route::getOrigin).thenComparing(Route::getDestination))
                .map(route -> new SharedRouteOptionResponse(
                        route.getId(),
                        route.getOrigin(),
                        route.getDestination(),
                        route.getDistanceKm(),
                        route.getEstimatedDurationMin(),
                        route.getBasePrice()
                ))
                .toList();
    }

    @Transactional
    public AdminRouteResponse createRoute(AdminRouteCreateRequest request) {
        validateOriginDestination(request.getOrigin(), request.getDestination(), null);

        Route route = new Route();
        route.setOrigin(request.getOrigin().trim());
        route.setDestination(request.getDestination().trim());
        route.setDistanceKm(request.getDistanceKm());
        route.setEstimatedDurationMin(request.getEstimatedDurationMin());
        route.setBasePrice(request.getBasePrice());
        route.setIsActive(request.getIsActive() == null || request.getIsActive());

        return toResponse(routeRepository.save(route));
    }

    @Transactional
    public AdminRouteResponse updateRoute(Long id, AdminRouteUpdateRequest request) {
        Route route = findRoute(id);

        String newOrigin = StringUtils.hasText(request.getOrigin()) ? request.getOrigin().trim() : route.getOrigin();
        String newDestination = StringUtils.hasText(request.getDestination()) ? request.getDestination().trim() : route.getDestination();

        validateOriginDestination(newOrigin, newDestination, route.getId());

        route.setOrigin(newOrigin);
        route.setDestination(newDestination);

        if (request.getDistanceKm() != null) {
            route.setDistanceKm(request.getDistanceKm());
        }
        if (request.getEstimatedDurationMin() != null) {
            route.setEstimatedDurationMin(request.getEstimatedDurationMin());
        }
        if (request.getBasePrice() != null) {
            route.setBasePrice(request.getBasePrice());
        }
        if (request.getIsActive() != null) {
            route.setIsActive(request.getIsActive());
        }

        return toResponse(routeRepository.save(route));
    }

    private Route findRoute(Long id) {
        return routeRepository.findById(Objects.requireNonNull(id, "id is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
    }

    private void validateOriginDestination(String origin, String destination, Long currentRouteId) {
        if (!StringUtils.hasText(origin)) {
            throw new IllegalArgumentException("Origin is required");
        }
        if (!StringUtils.hasText(destination)) {
            throw new IllegalArgumentException("Destination is required");
        }
        if (origin.trim().equalsIgnoreCase(destination.trim())) {
            throw new BusinessConflictException("Origin and destination must be different");
        }

        boolean exists = currentRouteId == null
                ? routeRepository.existsByOriginIgnoreCaseAndDestinationIgnoreCase(origin.trim(), destination.trim())
                : routeRepository.existsByOriginIgnoreCaseAndDestinationIgnoreCaseAndIdNot(origin.trim(), destination.trim(), currentRouteId);
        if (exists) {
            throw new BusinessConflictException("Route already exists");
        }
    }

    private boolean matchesKeyword(Route route, String keyword) {
        if (keyword == null) {
            return true;
        }
        return contains(route.getOrigin(), keyword)
                || contains(route.getDestination(), keyword);
    }

    private AdminRouteResponse toResponse(Route route) {
        return new AdminRouteResponse(
                route.getId(),
                route.getOrigin(),
                route.getDestination(),
                route.getDistanceKm(),
                route.getEstimatedDurationMin(),
                route.getBasePrice(),
                route.getIsActive()
        );
    }

    private String normalizeKeyword(String keyword) {
        return StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT) : null;
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }
}
