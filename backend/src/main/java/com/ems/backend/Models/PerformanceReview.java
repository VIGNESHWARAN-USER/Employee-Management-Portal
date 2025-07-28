package com.ems.backend.Models;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "performance_reviews")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;


    @Column(name = "employee_id", nullable = false)
    private Long employeeId;


    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(nullable = false)
    private Date reviewPeriodStart;

    @Column(nullable = false)
    private Date reviewPeriodEnd;


    @Column(nullable = false)
    private Integer goalsAchieved;


    @Column(nullable = false)
    private Integer communication;

    @Column(nullable = false)
    private Integer technicalSkills;

    @Column(nullable = false)
    private Integer teamwork;

    @Column(nullable = false)
    private Integer leadership;

    @Column(nullable = false)
    private Integer punctuality;


    @Column(precision = 3, scale = 2)
    private BigDecimal overallRating;

    @Lob
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public PerformanceReview(Long emp, Date reviewPeriodStart, Date reviewPeriodEnd) {
        this.employeeId = emp;
        this.reviewPeriodStart = reviewPeriodStart;
        this.reviewPeriodEnd = reviewPeriodEnd;
        this.goalsAchieved = 0;
        this.communication = 0;
        this.technicalSkills = 0;
        this.teamwork = 0;
        this.leadership = 0;
        this.punctuality = 0;
        this.status = ReviewStatus.PENDING;
        this.comments = "";
        this.reviewerId = (long) 0;
    }


    @PrePersist
    @PreUpdate
    public void calculateOverallRating() {
        if (goalsAchieved == null || communication == null || technicalSkills == null || teamwork == null || leadership == null || punctuality == null) {
            this.overallRating = BigDecimal.ZERO;
            return;
        }


        double weightedSum = (goalsAchieved * 0.4) +
                (communication * 20 * 0.1) +
                (technicalSkills * 20 * 0.2) +
                (teamwork * 20 * 0.1) +
                (leadership * 20 * 0.1) +
                (punctuality * 20 * 0.1);


        double finalRating = weightedSum / 20.0;


        this.overallRating = BigDecimal.valueOf(finalRating).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}