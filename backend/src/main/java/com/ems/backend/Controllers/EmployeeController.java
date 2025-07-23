package com.ems.backend.Controllers;

import com.ems.backend.DTO.EmployeeDTO;
import com.ems.backend.Models.Employee;
import com.ems.backend.Repositories.EmployeeRepo;
import com.ems.backend.Services.EmployeeServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class EmployeeController {

    @Autowired
    private EmployeeServices employeeServices;

    @Autowired
    private EmployeeRepo employeeRepo;

    @RequestMapping("/")
    public String displayMessgae()
    {
        return "Hello World!!!";
    }

    @RequestMapping("/addEmployee")
    public String addUser(@RequestBody EmployeeDTO dto)
    {
        Employee employee = new Employee();
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setMobileNumber(dto.getMobileNumber());
        employee.setAlternateMobileNumber(dto.getAlternateMobileNumber());
        employee.setStatus(dto.getStatus());
        employee.setPassword(dto.getPassword());
        employee.setDateOfJoining(dto.getDateOfJoining());
        employee.setSalary(dto.getSalary());
        employee.setEmailId(dto.getEmailId());
        employee.setRole(dto.getRole());

        if (dto.getManager() != null) {
            Employee manager = employeeRepo.findById(dto.getManager()).orElse(null);
            employee.setManager(manager);
        }
        return employeeServices.addEmployee(employee);
    }

    @RequestMapping("/updateEmployee")
    public String updateEmployee(@RequestBody Employee user)
    {
        System.out.println(user.toString());
        String message = employeeServices.updateEmployee(user);
        return message;
    }

    @RequestMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data)
    {
        String email = data.get("email");
        String password = data.get("password");
        return employeeServices.login(email, password);
    }

    @RequestMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> data)
    {
        String email = data.get("email");
        System.out.println(email);
        return employeeServices.forgotPassword(email);
    }

    @RequestMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> data)
    {
        String email = data.get("email");
        String password = data.get("password");
        return employeeServices.resetPassword(email, password);
    }

    @RequestMapping("/fetchAllUsers")
    public ResponseEntity<?> fetchAllUsers()
    {
        return employeeServices.fetchAllUsers();
    }

    @RequestMapping("/deleteEmployee")
    public ResponseEntity<?> deleteEmployee(@RequestBody Map<String, Long> id)
    {
        System.out.println(id);
        return employeeServices.deleteEmployee(id.get("id"));
    }


    @RequestMapping("/update-field")
    public ResponseEntity<?> updateField(@RequestBody Map<String, String> data)
    {
        String emailId = data.get("emailId");
        String name = data.get("name");
        String value = data.get("value");
        System.out.println(emailId+" "+name+" "+value);
        return employeeServices.updateField(emailId, name, value);
    }

    @RequestMapping("/updatestatus")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, String> data)
    {
        String emailId = data.get("emailId");
        String status = data.get("status");
        System.out.println(emailId+" "+status);
        return employeeServices.updateStatus(emailId, status);
    }
}
