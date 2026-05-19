package com.business.busmanagement.service;

import com.business.busmanagement.dto.TripCreateRequest;
import com.business.busmanagement.dto.TripResponse;
import com.business.busmanagement.exception.ResourceNotFoundException;
import com.business.busmanagement.model.Bus;
import com.business.busmanagement.model.Route;
import com.business.busmanagement.model.Trip;
import com.business.busmanagement.repository.BusRepository;
import com.business.busmanagement.repository.RouteRepository;
import com.business.busmanagement.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TripService {

        private final TripRepository tripRepository;
        private final RouteRepository routeRepository;
        private final BusRepository busRepository;

        @Transactional(readOnly = true)
        public List<TripResponse> getTrips(LocalDate date, Long routeId, Trip.TripStatus status) {
                LocalDateTime from = date != null ? date.atStartOfDay() : null;
                LocalDateTime to = date != null ? date.plusDays(1).atStartOfDay() : null;

                return tripRepository.searchTrips(from, to, routeId, status)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional
        public TripResponse createTrip(TripCreateRequest request) {
                validateTripTimes(request.getDepartureTime(), request.getArrivalTime());

                Long busId = Objects.requireNonNull(request.getBusId(), "busId is required");
                Bus bus = busRepository.findById(busId)
                                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

                if (bus.getStatus() == Bus.BusStatus.MAINTENANCE) {
                        throw new IllegalStateException("Bus is under maintenance and cannot be scheduled");
                }

                boolean hasOverlap = tripRepository.existsConflictingTripForBus(
                                bus.getId(),
                                request.getDepartureTime(),
                                request.getArrivalTime(),
                                null);
                if (hasOverlap) {
                        throw new IllegalStateException("Bus already has another trip in this time range");
                }

                // Resolve route: dùng routeId có sẵn hoặc tạo mới inline
                Route route = resolveRoute(request);

                Trip trip = new Trip();
                trip.setRoute(route);
                trip.setBus(bus);
                trip.setDepartureTime(request.getDepartureTime());
                trip.setArrivalTime(request.getArrivalTime());
                trip.setStatus(request.getStatus() != null ? request.getStatus() : Trip.TripStatus.SCHEDULED);

                return toResponse(tripRepository.save(trip));
        }

        /**
         * Resolve route: nếu có routeId thì dùng route có sẵn,
         * nếu không thì tạo route mới từ origin/destination
         */
        private Route resolveRoute(TripCreateRequest request) {
                // Ưu tiên dùng route có sẵn
                if (request.getRouteId() != null) {
                        return routeRepository.findById(request.getRouteId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + request.getRouteId()));
                }

                // Tạo route mới inline
                if (request.getOrigin() == null || request.getDestination() == null) {
                        throw new IllegalArgumentException("Either routeId or origin+destination is required");
                }

                // Kiểm tra route đã tồn tại chưa
                String origin = request.getOrigin().trim();
                String destination = request.getDestination().trim();

                List<Route> existingRoutes = routeRepository.findAll();
                Route existingRoute = existingRoutes.stream()
                                .filter(r -> r.getOrigin().equalsIgnoreCase(origin)
                                                && r.getDestination().equalsIgnoreCase(destination))
                                .findFirst()
                                .orElse(null);

                if (existingRoute != null) {
                        return existingRoute;
                }

                // Tạo route mới
                Route newRoute = new Route();
                newRoute.setOrigin(origin);
                newRoute.setDestination(destination);
                newRoute.setBasePrice(request.getBasePrice() != null ? request.getBasePrice() : java.math.BigDecimal.valueOf(300000));
                newRoute.setDistanceKm(request.getDistanceKm() != null ? request.getDistanceKm() : java.math.BigDecimal.ZERO);
                newRoute.setEstimatedDurationMin(request.getEstimatedDurationMin() != null ? request.getEstimatedDurationMin() : 60);
                newRoute.setIsActive(true);

                return routeRepository.save(newRoute);
        }

        @Transactional
        public TripResponse updateTrip(Long id, TripCreateRequest request) {
                validateTripTimes(request.getDepartureTime(), request.getArrivalTime());

                Trip trip = getTripEntity(id);
                Long busId = Objects.requireNonNull(request.getBusId(), "busId is required");
                Bus bus = busRepository.findById(busId)
                                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

                if (bus.getStatus() == Bus.BusStatus.MAINTENANCE) {
                        throw new IllegalStateException("Bus is under maintenance and cannot be scheduled");
                }

                boolean hasOverlap = tripRepository.existsConflictingTripForBus(
                                bus.getId(),
                                request.getDepartureTime(),
                                request.getArrivalTime(),
                                trip.getId());
                if (hasOverlap) {
                        throw new IllegalStateException("Bus already has another trip in this time range");
                }

                Route route = resolveRoute(request);

                trip.setRoute(route);
                trip.setBus(bus);
                trip.setDepartureTime(request.getDepartureTime());
                trip.setArrivalTime(request.getArrivalTime());
                trip.setStatus(request.getStatus() != null ? request.getStatus() : trip.getStatus());

                return toResponse(tripRepository.save(trip));
        }

        @Transactional
        public void deleteTrip(Long id) {
                Trip trip = getTripEntity(id);
                tripRepository.delete(trip);
        }

        private void validateTripTimes(LocalDateTime departureTime, LocalDateTime arrivalTime) {
                if (departureTime == null || arrivalTime == null) {
                        throw new IllegalArgumentException("Departure time and arrival time are required");
                }
                if (arrivalTime.isBefore(departureTime) || arrivalTime.isEqual(departureTime)) {
                        throw new IllegalArgumentException("Arrival time must be after departure time");
                }
        }

        @Transactional(readOnly = true)
        public Trip getTripEntity(Long id) {
                Long tripId = Objects.requireNonNull(id, "tripId is required");
                return tripRepository.findById(tripId)
                                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        }

        public TripResponse toResponse(Trip trip) {
                String routeName = trip.getRoute() != null
                                ? trip.getRoute().getOrigin() + " -> " + trip.getRoute().getDestination()
                                : "";
                String busLabel = trip.getBus() != null
                                ? trip.getBus().getLicensePlate() + " - " + trip.getBus().getBusType()
                                : "";

                return new TripResponse(
                                trip.getId(),
                                trip.getRoute() != null ? trip.getRoute().getId() : null,
                                routeName,
                                trip.getBus() != null ? trip.getBus().getId() : null,
                                busLabel,
                                trip.getDepartureTime(),
                                trip.getArrivalTime(),
                                trip.getStatus());
        }
}
