package com.ems.backend.Controllers;

import com.ems.backend.DTO.SalaryDTO;
import com.ems.backend.Models.Employee;
import com.ems.backend.Models.Payslip;
import com.ems.backend.Models.Salaries;
import com.ems.backend.Repositories.EmployeeRepo;
import com.ems.backend.Services.SalaryServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class SalaryController {

    @Autowired
    SalaryServices salaryServices;

    @Autowired
    EmployeeRepo employeeRepo;

    @RequestMapping("/submitStructure")
    public ResponseEntity<?> submitStructure(@RequestBody SalaryDTO data)
    {
        Salaries salaries = new Salaries();
        salaries.setNetSalary(data.getNetSalary());
        salaries.setHra(data.getHra());
        salaries.setBasic(data.getBasic());
        salaries.setProfessionalTax(data.getProfessionalTax());
        salaries.setProvidentFund(data.getProvidentFund());
        salaries.setSpecialAllowance(data.getSpecialAllowance());
        salaries.setGrossEarnings(data.getGrossEarnings());
        if(data.getEmployee() != null)
        {
            Employee emp = employeeRepo.findById(data.getEmployee()).orElse(null);
            salaries.setEmployee(emp);
        }
        System.out.println(data);
        return salaryServices.submitStructure(salaries);
    }

    @RequestMapping("/fetchAllSalaryStructures")
    public ResponseEntity<?> fetchAllSalaryStructures()
    {
        return salaryServices.fetchAllSalaryStructures();
    }

    @RequestMapping("/storePaySlips")
    public ResponseEntity<?> storePaySlips(@RequestBody List<Payslip> data){
        return salaryServices.storePaySlips(data);
    }

    @RequestMapping("/fetchAllPayslips")
    public ResponseEntity<?> fetchAllPayslips()
    {
        return salaryServices.fetchAllPayslips();
    }


}
