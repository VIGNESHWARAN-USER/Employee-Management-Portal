package com.ems.backend.Repositories;

import com.ems.backend.Models.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaySlipRepo extends JpaRepository<Payslip, Long> {
}
