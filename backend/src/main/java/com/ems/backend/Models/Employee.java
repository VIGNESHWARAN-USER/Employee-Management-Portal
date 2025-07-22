package com.ems.backend.Models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    private String mobileNumber;
    private String alternateMobileNumber;

    private String status;
    private String password;

    @Temporal(TemporalType.DATE)
    private Date dateOfJoining;

    private BigDecimal salary;
    private String emailId;
    private String role;

    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", mobileNumber='" + mobileNumber + '\'' +
                ", alternateMobileNumber='" + alternateMobileNumber + '\'' +
                ", status='" + status + '\'' +
                ", password='" + password + '\'' +
                ", dateOfJoining=" + dateOfJoining +
                ", salary=" + salary +
                ", emailId='" + emailId + '\'' +
                ", role='" + role + '\'' +
                ", manager=" + manager +
                ", employees=" + employees +
                '}';
    }

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @OneToMany(mappedBy = "manager")
    private List<Employee> employees;
}
