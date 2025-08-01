package com.ems.backend.DTO;
import com.ems.backend.Models.Leave;
import com.ems.backend.Models.LeaveStatus;
import com.ems.backend.Models.LeaveType;
import lombok.Data;

import java.util.Date;

@Data
public class LeaveDTO {
    private Long id;
    private Long employee_id;
    private LeaveType leaveType;
    private LeaveStatus status;
    private Date startDate;
    private Date endDate;
    private Date submittedDate;
    private String reason;
    private String emailId;
    private String name;
    private Long manager_id;
    private byte[] attachment;

    public LeaveDTO(Leave leave) {
        this.id = leave.getId();
        this.employee_id = leave.getEmployee().getId();
        this.leaveType = leave.getLeaveType();
        this.status = leave.getStatus();
        this.startDate = leave.getStartDate();
        this.endDate = leave.getEndDate();
        this.submittedDate = leave.getSubmittedDate();
        this.reason = leave.getReason();
        this.emailId = leave.getEmployee().getEmailId();
        this.name=  leave.getEmployee().getFirstName()+" "+leave.getEmployee().getLastName();
        this.manager_id = leave.getEmployee().getManager().getId();
    }
}
