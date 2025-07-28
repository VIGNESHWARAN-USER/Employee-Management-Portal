package com.ems.backend.DTO;

import com.ems.backend.Models.Employee;
import com.ems.backend.Models.PerformanceReview;
import com.ems.backend.Models.ReviewStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class ReviewDTO {
    private Long reviewId;
    private Employee employee;
    private Employee reviewer;
    private Date reviewPeriodStart;
    private Date reviewPeriodEnd;
    private Integer goalsAchieved;
    private Integer communication;
    private Integer technicalSkills;
    private Integer teamwork;
    private Integer leadership;
    private Integer punctuality;
    private BigDecimal overallRating;
    private String comments;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewDTO(PerformanceReview data, Employee employee, Employee reviewer) {
        this.comments = data.getComments();
        this.employee = employee;
        this.reviewer = reviewer;
        this.leadership = data.getLeadership();
        this.updatedAt = data.getUpdatedAt();
        this.createdAt = data.getCreatedAt();
        this.status = data.getStatus();
        this.overallRating = data.getOverallRating();
        this.punctuality = data.getPunctuality();
        this.teamwork = data.getTeamwork();
        this.technicalSkills = data.getTechnicalSkills();
        this.communication  = data.getCommunication();
        this.reviewId = data.getReviewId();
        this.reviewPeriodEnd = data.getReviewPeriodEnd();
        this.reviewPeriodStart = data.getReviewPeriodStart();
        this.goalsAchieved = data.getGoalsAchieved();
    }
}
