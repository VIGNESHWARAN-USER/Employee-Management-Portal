package com.ems.backend.Models;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Blob;
import java.util.Arrays;
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



    //Onboarding
    @Lob
    private byte[] aadhaarPan;
    private String officialEmail;
    @Temporal(TemporalType.DATE)
    private Date orientationDate;
    private boolean laptopAssigned;
    private boolean knowledgeTransfer;
    private boolean idReturned;
    private boolean exitInterview;
    private boolean payRoll;


    @OneToOne(mappedBy = "employee")
    @JsonBackReference
    private Salaries salaryStruct;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonBackReference
    private Employee manager;

    @OneToMany(mappedBy = "manager")
    @JsonManagedReference
    private List<Employee> employees;

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
                '}';
    }
}
