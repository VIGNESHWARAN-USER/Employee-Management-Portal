package com.ems.backend.Services;

import com.ems.backend.Models.Employee;
import com.ems.backend.Repositories.EmployeeRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EmployeeUserDetailsService implements UserDetailsService {

    private final EmployeeRepo employeeRepo;

    public EmployeeUserDetailsService(EmployeeRepo employeeRepo) {
        this.employeeRepo = employeeRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // The 'username' here is the email that the user types into the login form.
        System.out.println("Searching for user with email: " + username);

        // We use your repository to find the employee by their email.
        Employee employee = employeeRepo.findByOfficialEmail(username);

        if (employee == null) {
            System.out.println("User not found!");
            throw new UsernameNotFoundException("No user found with email: " + username);
        }

        System.out.println("User found: " + employee.getOfficialEmail());
        return employee;
    }
}