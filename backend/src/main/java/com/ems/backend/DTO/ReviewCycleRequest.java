package com.ems.backend.DTO;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class ReviewCycleRequest {
    private List<Long> employeeIds;
    private Date reviewPeriodStart;
    private Date reviewPeriodEnd;
}
