

package com.ems.backend.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.Date;


@Entity
@Getter
@Setter
@Table(name = "leaves")
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date startDate;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date endDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date submittedDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Lob
    private byte[] attachment;

    @PrePersist
    protected void onCreate() {
        this.submittedDate = new Date();
        if (this.status == null) {
            this.status = LeaveStatus.PENDING;
        }
    }

    @Override
    public String toString() {
        return "Leave{" +
                "id=" + id +
                ", employee=" + employee +
                ", leaveType=" + leaveType +
                ", status=" + status +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", submittedDate=" + submittedDate +
                ", reason='" + reason + '\'' +
                ", attachment=" + Arrays.toString(attachment) +
                '}';
    }
}