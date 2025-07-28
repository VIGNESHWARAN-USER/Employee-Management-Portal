package com.ems.backend.Services;

import com.ems.backend.DTO.ReviewCycleRequest;
import com.ems.backend.DTO.ReviewDTO;
import com.ems.backend.Models.PerformanceReview;
import com.ems.backend.Models.ReviewStatus;
import com.ems.backend.Repositories.EmployeeRepo;
import com.ems.backend.Repositories.ReviewRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewServices {

    @Autowired
    ReviewRepo reviewRepo;
    @Autowired
    EmployeeRepo employeeRepo;

    public ResponseEntity<?> getAllHistory() {
        try {
            List<ReviewDTO> data = reviewRepo.findAll().stream()
                    .map(val-> new ReviewDTO(val, employeeRepo.findById(val.getEmployeeId()).orElse(null), employeeRepo.findById(val.getReviewId()).orElse(null))).collect(Collectors.toList());
            return ResponseEntity.ok().body(data);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> startCycle(ReviewCycleRequest data) {
        try {
            List<PerformanceReview> values = data.getEmployeeIds().stream()
                    .map(emp -> new PerformanceReview(emp, data.getReviewPeriodStart(), data.getReviewPeriodEnd()))
                    .collect(Collectors.toList());

            reviewRepo.saveAll(values);
            return ResponseEntity.ok().body("Review cycle initiated successfully!");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }


    public ResponseEntity<?> getLatestReview(Long id) {
        try {
            Optional<PerformanceReview> data = reviewRepo.findTopByEmployeeIdOrderByCreatedAtDesc(id);
            if (data.isPresent()) {
                return ResponseEntity.ok().body(data.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No review found for this employee");
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> upDateReview(PerformanceReview data) {
        try {
            PerformanceReview ans = reviewRepo.findById(data.getReviewId()).orElse(null);
            assert ans != null;
            ans.setReviewerId(data.getReviewerId());
            ans.setComments(data.getComments());
            ans.setCommunication(data.getCommunication());
            ans.setLeadership(data.getLeadership());
            ans.setReviewPeriodEnd(data.getReviewPeriodEnd());
            ans.setReviewPeriodStart(data.getReviewPeriodStart());
            ans.setGoalsAchieved(data.getGoalsAchieved());
            ans.setTechnicalSkills(data.getTechnicalSkills());
            ans.setTeamwork(data.getTeamwork());
            ans.setPunctuality(data.getPunctuality());
            ans.setStatus(data.getStatus());
            ans.setOverallRating(data.getOverallRating());
            reviewRepo.save(data);
            return ResponseEntity.ok().body("Data saved successfully");
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> getReviews(Long id) {
        try {
            List<PerformanceReview> data = reviewRepo.findByEmployeeId(id);
            return ResponseEntity.ok().body(data);

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> acknowledgeReview(PerformanceReview data) {
        try {
            data.setStatus(ReviewStatus.ACKNOWLEDGED);
            reviewRepo.save(data);
            return ResponseEntity.ok().body(data);

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }
}
