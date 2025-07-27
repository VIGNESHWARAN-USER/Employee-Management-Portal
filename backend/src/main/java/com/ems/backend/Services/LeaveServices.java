package com.ems.backend.Services;

import com.ems.backend.DTO.LeaveDTO;
import com.ems.backend.Models.Leave;
import com.ems.backend.Models.LeaveStatus;
import com.ems.backend.Repositories.LeaveRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeaveServices {

    @Autowired
    LeaveRepo leaveRepo;

    public ResponseEntity<?> applyLeave(Leave data) {
        try{
            leaveRepo.save(data);
            return ResponseEntity.ok().body(data);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> getHistory(Long id) {
        try{
            List<Leave> leaves = leaveRepo.findByEmployeeId(id);
            return ResponseEntity.ok().body(leaves);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> cancelLeave(Leave data) {
        try{
            data.setStatus(LeaveStatus.CANCELLED);
            leaveRepo.save(data);
            List<Leave> leaves = leaveRepo.findByEmployeeId(data.getEmployee().getId());
            return ResponseEntity.ok().body(leaves);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> getAllHistory() {
        try{
            List<Leave> data = leaveRepo.findAll();
            List<LeaveDTO> res = data.stream()
                    .map(LeaveDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok().body(res);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> changeStatus(Long id, String actionType) {
        try{
            Leave data = leaveRepo.findById(id).orElse(null);
            assert data != null;
            data.setStatus(LeaveStatus.valueOf(actionType));
            leaveRepo.save(data);
            return ResponseEntity.ok().body(new LeaveDTO(data));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }
}
