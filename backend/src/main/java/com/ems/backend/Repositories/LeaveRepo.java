package com.ems.backend.Repositories;

import com.ems.backend.Models.Leave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepo extends JpaRepository<Leave,Long> {
    List<Leave> findByEmployeeId(Long employeeId);
}
