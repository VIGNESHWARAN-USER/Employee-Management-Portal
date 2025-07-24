package com.ems.backend.Repositories;

import com.ems.backend.Models.Employee;
import com.ems.backend.Models.Salaries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryRepo extends JpaRepository<Salaries,Long> {

    Salaries findByEmployee(Employee employee);
}
