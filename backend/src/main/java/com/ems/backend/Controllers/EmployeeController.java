package com.ems.backend.Controllers;

import com.ems.backend.Models.Employee;
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
    private EmployeeServices employeServices;

    @RequestMapping("/")
    public String displayMessgae()
    {
        return "Hello World!!!";
    }

    @RequestMapping("/addUser")
    public String addUser(@RequestBody Employee user)
    {
        System.out.println(user.toString());
        String message = employeServices.addEmployee(user);
        return message;
    }

    @RequestMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data)
    {
        String email = data.get("email");
        String password = data.get("password");
        return employeServices.login(email, password);
    }

    @RequestMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> data)
    {
        String email = data.get("email");
        System.out.println(email);
        return employeServices.forgotPassword(email);
    }

    @RequestMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> data)
    {
        String email = data.get("email");
        String password = data.get("password");
        return employeServices.resetPassword(email, password);
    }
}
