package com.ems.backend.Controllers;


import com.ems.backend.DTO.LeaveDTO;
import com.ems.backend.Models.Employee;
import com.ems.backend.Models.Leave;
import com.ems.backend.Models.LeaveType;
import com.ems.backend.Repositories.EmployeeRepo;
import com.ems.backend.Services.LeaveServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Optional;
import java.util.logging.Level;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class LeavesController {

    @Autowired
    private LeaveServices leaveServices;
    @Autowired
    private EmployeeRepo employeeRepo;

    @RequestMapping("/leaves/apply")
    public ResponseEntity<?> applyLeave(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("leaveType") String leaveTypeStr,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr,
            @RequestParam("reason") String reason,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment // Optional file
    ) {

        Optional<Employee> employeeOpt = employeeRepo.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            return new ResponseEntity<>("Employee not found with ID: " + employeeId, HttpStatus.BAD_REQUEST);
        }

        // --- 2. Manually construct the Leave object ---
        Leave newLeaveRequest = new Leave();
        newLeaveRequest.setEmployee(employeeOpt.get());
        newLeaveRequest.setReason(reason);

        // --- 3. Convert String parameters to correct types (Enum, Date) ---
        try {
            // Convert String to Enum
            newLeaveRequest.setLeaveType(LeaveType.valueOf(leaveTypeStr.toUpperCase()));


            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            newLeaveRequest.setStartDate(formatter.parse(startDateStr));
            newLeaveRequest.setEndDate(formatter.parse(endDateStr));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid leaveType value: " + leaveTypeStr, HttpStatus.BAD_REQUEST);
        } catch (ParseException e) {
            return new ResponseEntity<>("Invalid date format. Please use yyyy-MM-dd.", HttpStatus.BAD_REQUEST);
        }


        if (attachment != null && !attachment.isEmpty()) {
            try {
                newLeaveRequest.setAttachment(attachment.getBytes());
            } catch (IOException e) {
                return new ResponseEntity<>("Failed to process attachment.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }


        return leaveServices.applyLeave(newLeaveRequest);
    }

    @RequestMapping("/leaves/history/{id}")
    public ResponseEntity<?> getHistory(@PathVariable Long id)
    {
        return leaveServices.getHistory(id);
    }

    @RequestMapping("/cancelLeave")
    public ResponseEntity<?> cancelLeave(@RequestBody LeaveDTO data)
    {
        System.out.println(data);
        Leave leave = new Leave();
        leave.setLeaveType(data.getLeaveType());
        leave.setStatus(data.getStatus());
        leave.setEmployee(employeeRepo.findById(data.getEmployee_id()).orElse(null));
        leave.setReason(data.getReason());
        leave.setStartDate(data.getStartDate());
        leave.setEndDate(data.getEndDate());
        leave.setAttachment(data.getAttachment());
        leave.setSubmittedDate(data.getSubmittedDate());
        leave.setId(data.getId());
        System.out.println(leave);
        return leaveServices.cancelLeave(leave);
    }

    @RequestMapping("/leaves/allRequests")
    public ResponseEntity<?> getAllHistory()
    {
        return leaveServices.getAllHistory();
    }

    @RequestMapping("/leaves/{id}/{actionType}")
    public ResponseEntity<?> changeStatus(@PathVariable Long id, @PathVariable String actionType)
    {
        return leaveServices.changeStatus(id, actionType);
    }
}



