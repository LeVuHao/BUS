package com.business.busmanagement.service.admin;

import com.business.busmanagement.dto.admin.request.AdminBusCreateRequest;
import com.business.busmanagement.dto.admin.request.AdminBusStatusRequest;
import com.business.busmanagement.dto.admin.request.AdminBusUpdateRequest;
import com.business.busmanagement.dto.admin.response.AdminBusResponse;
import com.business.busmanagement.dto.admin.response.SharedBusOptionResponse;
import com.business.busmanagement.exception.BusinessConflictException;
import com.business.busmanagement.exception.ResourceNotFoundException;
import com.business.busmanagement.model.Bus;
import com.business.busmanagement.model.Seat;
import com.business.busmanagement.repository.BusRepository;
import com.business.busmanagement.repository.SeatRepository;
import com.business.busmanagement.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminBusService {

    private final BusRepository busRepository;
    private final SeatRepository seatRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<AdminBusResponse> getBuses(String keyword, Bus.BusStatus status) {
        String normalizedKeyword = normalizeKeyword(keyword);

        return busRepository.findAll()
                .stream()
                .filter(bus -> status == null || bus.getStatus() == status)
                .filter(bus -> matchesKeyword(bus, normalizedKeyword))
                .sorted(Comparator.comparing(Bus::getId).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminBusResponse getBus(Long id) {
        return toResponse(findBus(id));
    }

    @Transactional(readOnly = true)
    public List<SharedBusOptionResponse> getBusOptions(Bus.BusStatus status) {
        return busRepository.findAll()
                .stream()
                .filter(bus -> status == null || bus.getStatus() == status)
                .sorted(Comparator.comparing(Bus::getLicensePlate))
                .map(bus -> new SharedBusOptionResponse(
                        bus.getId(),
                        bus.getLicensePlate(),
                        bus.getBusType(),
                        bus.getTotalSeats(),
                        bus.getStatus()
                ))
                .toList();
    }

    @Transactional
    public AdminBusResponse createBus(AdminBusCreateRequest request) {
        validateLicensePlate(request.getLicensePlate(), null);
        Bus.BusStatus status = request.getStatus() != null ? request.getStatus() : Bus.BusStatus.AVAILABLE;
        validateInsuranceStatus(status, request.getInsuranceExpiry());

        Bus bus = new Bus();
        bus.setLicensePlate(request.getLicensePlate().trim());
        bus.setBusType(request.getBusType());
        bus.setTotalSeats(request.getTotalSeats());
        bus.setStatus(status);
        bus.setLastMaintenanceDate(request.getLastMaintenanceDate());
        bus.setInsuranceExpiry(request.getInsuranceExpiry());

        Bus savedBus = busRepository.save(bus);
        generateSeats(savedBus);
        return toResponse(savedBus);
    }

    @Transactional
    public AdminBusResponse updateBus(Long id, AdminBusUpdateRequest request) {
        Bus bus = findBus(id);

        if (StringUtils.hasText(request.getLicensePlate())) {
            validateLicensePlate(request.getLicensePlate(), bus.getId());
            bus.setLicensePlate(request.getLicensePlate().trim());
        }
        if (request.getBusType() != null) {
            bus.setBusType(request.getBusType());
        }
        if (request.getLastMaintenanceDate() != null) {
            bus.setLastMaintenanceDate(request.getLastMaintenanceDate());
        }
        if (request.getInsuranceExpiry() != null) {
            validateInsuranceStatus(bus.getStatus(), request.getInsuranceExpiry());
            bus.setInsuranceExpiry(request.getInsuranceExpiry());
        }
        if (request.getTotalSeats() != null && !request.getTotalSeats().equals(bus.getTotalSeats())) {
            if (tripRepository.existsByBusId(bus.getId())) {
                throw new BusinessConflictException("Cannot change total seats because this bus already has trips");
            }
            bus.setTotalSeats(request.getTotalSeats());
            Bus savedBus = busRepository.save(bus);
            seatRepository.deleteByBusId(savedBus.getId());
            generateSeats(savedBus);
            return toResponse(savedBus);
        }

        return toResponse(busRepository.save(bus));
    }

    @Transactional
    public AdminBusResponse updateStatus(Long id, AdminBusStatusRequest request) {
        Bus bus = findBus(id);
        validateInsuranceStatus(request.getStatus(), bus.getInsuranceExpiry());
        bus.setStatus(request.getStatus());
        return toResponse(busRepository.save(bus));
    }

    private Bus findBus(Long id) {
        return busRepository.findById(Objects.requireNonNull(id, "id is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));
    }

    private void generateSeats(Bus bus) {
        for (int i = 1; i <= bus.getTotalSeats(); i++) {
            Seat seat = new Seat();
            seat.setBus(bus);
            seat.setSeatNumber(String.format("A%02d", i));
            seat.setPositionX((i - 1) % 4);
            seat.setPositionY((i - 1) / 4);
            seatRepository.save(seat);
        }
    }

    private void validateLicensePlate(String licensePlate, Long currentBusId) {
        if (!StringUtils.hasText(licensePlate)) {
            throw new IllegalArgumentException("License plate is required");
        }
        boolean exists = currentBusId == null
                ? busRepository.existsByLicensePlate(licensePlate.trim())
                : busRepository.existsByLicensePlateAndIdNot(licensePlate.trim(), currentBusId);
        if (exists) {
            throw new BusinessConflictException("License plate already exists");
        }
    }

    private void validateInsuranceStatus(Bus.BusStatus status, LocalDate insuranceExpiry) {
        if (status == Bus.BusStatus.AVAILABLE && insuranceExpiry != null && insuranceExpiry.isBefore(LocalDate.now())) {
            throw new BusinessConflictException("Bus with expired insurance cannot be AVAILABLE");
        }
    }

    private boolean matchesKeyword(Bus bus, String keyword) {
        if (keyword == null) {
            return true;
        }
        return contains(bus.getLicensePlate(), keyword)
                || contains(bus.getBusType() != null ? bus.getBusType().name() : null, keyword)
                || contains(bus.getStatus() != null ? bus.getStatus().name() : null, keyword);
    }

    private AdminBusResponse toResponse(Bus bus) {
        return new AdminBusResponse(
                bus.getId(),
                bus.getLicensePlate(),
                bus.getBusType(),
                bus.getTotalSeats(),
                bus.getStatus(),
                bus.getLastMaintenanceDate(),
                bus.getInsuranceExpiry(),
                insuranceStatus(bus.getInsuranceExpiry())
        );
    }

    private String insuranceStatus(LocalDate insuranceExpiry) {
        if (insuranceExpiry == null) {
            return "UNKNOWN";
        }
        LocalDate today = LocalDate.now();
        if (insuranceExpiry.isBefore(today)) {
            return "EXPIRED";
        }
        if (!insuranceExpiry.isAfter(today.plusDays(30))) {
            return "EXPIRING_SOON";
        }
        return "VALID";
    }

    private String normalizeKeyword(String keyword) {
        return StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT) : null;
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }
}
