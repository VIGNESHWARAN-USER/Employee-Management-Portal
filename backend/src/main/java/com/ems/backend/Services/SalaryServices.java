package com.ems.backend.Services;


import com.ems.backend.DTO.EmployeeDTO;
import com.ems.backend.Models.Employee;
import com.ems.backend.Models.Salaries;
import com.ems.backend.Repositories.EmployeeRepo;
import com.ems.backend.Repositories.SalaryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalaryServices {

    @Autowired
    SalaryRepo salaryRepo;
    @Autowired
    EmployeeRepo employeeRepo;

    public ResponseEntity<?> submitStructure(Salaries data) {
        try{
            Salaries salary = salaryRepo.findByEmployee(data.getEmployee());
            Employee emp = data.getEmployee();
            emp.setSalaryStruct(salary);
            emp.setPayRoll(true);
            employeeRepo.save(emp);
            if(salary != null)
            {
                salary.setNetSalary(data.getNetSalary());
                salary.setHra(data.getHra());
                salary.setBasic(data.getBasic());
                salary.setProfessionalTax(data.getProfessionalTax());
                salary.setSpecialAllowance(data.getSpecialAllowance());
                salary.setGrossEarnings(data.getGrossEarnings());
                salaryRepo.save(salary);

            }
            else salaryRepo.save(data);
            return ResponseEntity.ok().body("Structure saved successfully");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> fetchAllSalaryStructures() {
        try{
            List<Salaries> data = salaryRepo.findAll();
            return ResponseEntity.ok().body(data);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }
}
