package com.ems.backend.Repositories;

import com.ems.backend.Models.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepo extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByEmployeeId(Long employeeId);
    Optional<PerformanceReview> findTopByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
