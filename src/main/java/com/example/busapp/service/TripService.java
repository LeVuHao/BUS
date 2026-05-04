package com.example.busapp.service;

import com.example.busapp.entity.Trip;
import com.example.busapp.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    // 1. Lấy tất cả các chuyến (Để hiện lên bảng Dashboard)
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    // 2. Lấy chi tiết 1 chuyến
    public Trip getTripById(Integer id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến xe ID: " + id));
    }

    // 3. Tạo chuyến mới (Mặc định là SCHEDULED)
    public Trip createTrip(Trip trip) {
        trip.setStatus("SCHEDULED");
        return tripRepository.save(trip);
    }

    // 4. Cập nhật trạng thái (Bấm nút RUNNING/COMPLETED...)
    public Trip updateTripStatus(Integer id, String newStatus) {
        Trip trip = getTripById(id);
        trip.setStatus(newStatus);
        return tripRepository.save(trip);
    }
}
