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
    @JsonManagedReference
    private Employee employee;

    private Double basic;
    private Double hra;
    private Double specialAllowance;
    private Double grossEarnings;
    private Double professionalTax;
    private Double netSalary;

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
                '}';
    }
}
