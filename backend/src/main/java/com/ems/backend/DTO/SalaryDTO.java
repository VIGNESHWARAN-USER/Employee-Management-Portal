package com.ems.backend.DTO;

import com.ems.backend.Models.Employee;
import jakarta.persistence.*;
import lombok.*;

@Data
public class SalaryDTO {

    private Long id;
    private Long employee;
    private Double basic;
    private Double hra;
    private Double specialAllowance;
    private Double grossEarnings;
    private Double professionalTax;
    private Double netSalary;
}
