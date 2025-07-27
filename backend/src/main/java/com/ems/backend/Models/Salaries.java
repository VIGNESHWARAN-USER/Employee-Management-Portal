package com.ems.backend.Models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Salaries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(referencedColumnName = "id")
    @JsonManagedReference(value = "salary_struct-ref") // Matching the Employee's @JsonBackReference
    private Employee employee;

    private Double basic;
    private Double hra;
    private Double specialAllowance;
    private Double grossEarnings;
    private Double professionalTax;
    private Double netSalary;
    private Double providentFund;

    @Override
    public String toString() {
        return "Salaries{" +
                "id=" + id +
                ", employee=" + employee +
                ", basic=" + basic +
                ", hra=" + hra +
                ", specialAllowance=" + specialAllowance +
                ", grossEarnings=" + grossEarnings +
                ", professionalTax=" + professionalTax +
                ", netSalary=" + netSalary +
                ", providentFund=" + providentFund +
                '}';
    }
}
