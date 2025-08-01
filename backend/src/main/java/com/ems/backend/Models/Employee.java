package com.ems.backend.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "employee")
public class Employee implements UserDetails {

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
    @Lob
    private byte[] aadhaarPan;
    @Lob
    private byte[] profilePic;
    private String officialEmail;
    @Temporal(TemporalType.DATE)
    private Date orientationDate;
    private boolean laptopAssigned;
    private boolean knowledgeTransfer;
    private boolean idReturned;
    private boolean exitInterview;
    private boolean payRoll;

    // Relationship with Salaries
    @OneToOne(mappedBy = "employee")
    @JsonBackReference(value = "salary_struct-ref")
    private Salaries salaryStruct;

    // Self-referencing Manager Relationship
    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonBackReference(value = "manager-ref")
    private Employee manager;


    @OneToMany(mappedBy = "manager")
    @JsonManagedReference(value = "manager-ref")
    private List<Employee> employees;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.role));
    }

    /**
     * This tells Spring Security where to find the user's password.
     * It is CRITICAL to ignore this for JSON to prevent ever sending
     * the hashed password to the client.
     */
    @Override
    @JsonIgnore
    public String getPassword() {
        return this.password;
    }

    /**
     * This tells Spring Security that the "username" for login
     * is the officialEmail field.
     */
    @Override
    public String getUsername() {
        return this.officialEmail;
    }

    /**
     * The following methods are also part of the UserDetails contract.
     * We will ignore them for JSON conversion and return true by default.
     * In a more complex app, these could be tied to database columns.
     */
    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }


    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", mobileNumber='" + mobileNumber + '\'' +
                ", alternateMobileNumber='" + alternateMobileNumber + '\'' +
                ", status='" + status + '\'' +
                ", dateOfJoining=" + dateOfJoining +
                ", salary=" + salary +
                ", emailId='" + emailId + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}