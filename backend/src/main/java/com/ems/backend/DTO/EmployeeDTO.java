package com.ems.backend.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class EmployeeDTO {
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String alternateMobileNumber;
    private String status;
    private String password;
    private Date dateOfJoining;
    private BigDecimal salary;
    private String emailId;
    private String role;
    private Long manager; // this will just hold the manager's ID
}
