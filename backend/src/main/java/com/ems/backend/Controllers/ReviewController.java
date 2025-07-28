package com.ems.backend.Controllers;

import com.ems.backend.DTO.ReviewCycleRequest;
import com.ems.backend.Models.PerformanceReview;
import com.ems.backend.Services.ReviewServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    ReviewServices reviewServices;

    @RequestMapping("/all-reviews")
    public ResponseEntity<?> getAllReviews()
    {
        return reviewServices.getAllHistory();
    }

    @RequestMapping("/reviews/start-cycle")
    public ResponseEntity<?> startCycle(@RequestBody ReviewCycleRequest data)
    {
        System.out.println(data);
        return reviewServices.startCycle(data);
    }

    @RequestMapping("/performance-reviews/employee/{id}/latest")
    public ResponseEntity<?> startCycle(@PathVariable Long id)
    {
        return reviewServices.getLatestReview(id);
    }

    @RequestMapping("/performance-reviews")
    public ResponseEntity<?> upDateReview(@RequestBody PerformanceReview data)
    {
        System.out.println(data);
        return reviewServices.upDateReview(data);
    }

    @RequestMapping("/performance-reviews/employee/{id}")
    public ResponseEntity<?> getReviews(@PathVariable Long id)
    {
        return reviewServices.getReviews(id);
    }

    @RequestMapping("/acknowledgeReview")
    public ResponseEntity<?> acknowledgeReview(@RequestBody PerformanceReview data)
    {
        System.out.println(data);
        return reviewServices.acknowledgeReview(data);
    }
}
