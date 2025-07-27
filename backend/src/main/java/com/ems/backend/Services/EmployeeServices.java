package com.ems.backend.Services;

import com.ems.backend.Models.Employee;
import com.ems.backend.Repositories.EmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class EmployeeServices {

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String addEmployee(Employee user) {
        try {
            System.out.println(user);
            if (user.getEmailId() == null || user.getEmailId().isEmpty()) {
                return "Email cannot be empty";
            }

            if (!isValidEmail(user.getEmailId())) {
                return "Invalid email format";
            }

            if (user.getPassword() == null || user.getPassword().length() < 6) {
                return "Password must be at least 6 characters long";
            }

            Employee emp = employeeRepo.findByOfficialEmail(user.getEmailId());
            if(emp != null) return "Employee with same email id already exist.";

            // Encrypt the password
            String encryptedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(encryptedPassword);

            // Save employee
            employeeRepo.save(user);
            return "Employee added successfully";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error while adding employee: " + e.getMessage();
        }
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return Pattern.matches(emailRegex, email);
    }

    public ResponseEntity<?> login(String email, String password)
    {
        try{
            Employee user = employeeRepo.findByOfficialEmail(email);
            if(user  == null) return ResponseEntity.notFound().build();
            else if(passwordEncoder.matches(password,user.getPassword())) return ResponseEntity.ok(user);
            else return ResponseEntity.status(201).body("Invalid Password");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> forgotPassword(String email) {
        try{
            Employee user = employeeRepo.findByOfficialEmail(email);
            if(user  == null) return ResponseEntity.notFound().build();
            int otp = (int) (Math.random() * 10000);
            String htmlContent = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "  <meta charset=\"UTF-8\">\n" +
                    "  <style>\n" +
                    "    .container {\n" +
                    "      font-family: Arial, sans-serif;\n" +
                    "      padding: 20px;\n" +
                    "      border: 1px solid #e0e0e0;\n" +
                    "      border-radius: 10px;\n" +
                    "      max-width: 500px;\n" +
                    "      margin: auto;\n" +
                    "      background-color: #f9f9f9;\n" +
                    "    }\n" +
                    "\n" +
                    "    .header {\n" +
                    "      background-color: #007bff;\n" +
                    "      color: white;\n" +
                    "      padding: 15px;\n" +
                    "      text-align: center;\n" +
                    "      border-radius: 10px 10px 0 0;\n" +
                    "      font-size: 20px;\n" +
                    "    }\n" +
                    "\n" +
                    "    .body {\n" +
                    "      padding: 20px;\n" +
                    "      color: #333;\n" +
                    "    }\n" +
                    "\n" +
                    "    .otp-box {\n" +
                    "      background-color: #e6f0ff;\n" +
                    "      color: #007bff;\n" +
                    "      font-weight: bold;\n" +
                    "      font-size: 24px;\n" +
                    "      text-align: center;\n" +
                    "      padding: 15px;\n" +
                    "      border-radius: 5px;\n" +
                    "      margin: 20px 0;\n" +
                    "      letter-spacing: 3px;\n" +
                    "    }\n" +
                    "\n" +
                    "    .footer {\n" +
                    "      font-size: 12px;\n" +
                    "      color: #777;\n" +
                    "      text-align: center;\n" +
                    "      margin-top: 30px;\n" +
                    "    }\n" +
                    "  </style>\n" +
                    "</head>\n" +
                    "<body>\n" +
                    "  <div class=\"container\">\n" +
                    "    <div class=\"header\">\n" +
                    "      Your OTP Code\n" +
                    "    </div>\n" +
                    "    <div class=\"body\">\n" +
                    "      <p>Dear User,</p>\n" +
                    "      <p>Use the following OTP to complete your action. This OTP is valid for the next 5 minutes.</p>\n" +
                    "\n" +
                    "      <div class=\"otp-box\">\n" +
                    "        otp_value\n" +
                    "      </div>\n" +
                    "\n" +
                    "      <p>If you did not request this, please ignore this email.</p>\n" +
                    "      <p>Thank you,<br><strong>EMS Team</strong></p>\n" +
                    "    </div>\n" +
                    "    <div class=\"footer\">\n" +
                    "      Please do not share this code with anyone for security reasons.\n" +
                    "    </div>\n" +
                    "  </div>\n" +
                    "</body>\n" +
                    "</html>\n";
                    htmlContent = htmlContent.replace("otp_value", Integer.toString(otp));
            emailService.sendHtmlEmail(email, "Password Recovery", htmlContent);

            return ResponseEntity.ok().body(otp);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> resetPassword(String email, String password) {
        try{
            Employee user = employeeRepo.findByOfficialEmail(email);
            System.out.println(password);
            if(user  == null) return ResponseEntity.notFound().build();
            else
            {
                user.setPassword(passwordEncoder.encode(password));
                employeeRepo.save(user);
                return ResponseEntity.status(201).body("Password has been changed successfully");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> fetchAllUsers() {
        try{
            List<Employee> data =  employeeRepo.findAll();
            return ResponseEntity.ok().body(data);
        }
        catch (Exception e)
        {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> deleteEmployee(Long id) {
        try{
            Employee user = employeeRepo.findById(id).orElse(null);
            assert user != null;
            user.setStatus("Exiting");
            employeeRepo.save(user);
            return ResponseEntity.ok().body("Employee data deleted successfully");
        }
        catch (Exception e)
        {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public String updateEmployee(Employee user) {
        try {

            if (user.getEmailId() == null || user.getEmailId().isEmpty()) {
                return "Email cannot be empty";
            }

            if (!isValidEmail(user.getEmailId())) {
                return "Invalid email format";
            }

            employeeRepo.save(user);
            return "Employee updated successfully";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error while updating employee: " + e.getMessage();
        }
    }

    private Object convertToProperType(Class<?> type, String value) {
        if (type == String.class) {
            return value;
        } else if (type == int.class || type == Integer.class) {
            return Integer.parseInt(value);
        } else if (type == long.class || type == Long.class) {
            return Long.parseLong(value);
        } else if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(value);
        } else if (type == BigDecimal.class) {
            return new BigDecimal(value);
        } else if (type == Date.class) {
            try {
                return new SimpleDateFormat("yyyy-MM-dd").parse(value); // match format of dateOfJoining
            } catch (ParseException e) {
                throw new RuntimeException("Invalid date format. Use yyyy-MM-dd");
            }
        }
        throw new RuntimeException("Unsupported field type: " + type.getName());
    }


    public ResponseEntity<?> updateField(String emailId, String fieldName, String value) {
        try {
            Employee user = employeeRepo.findByEmailId(emailId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found");
            }
            System.out.println(fieldName+" "+user);
            Field field = Employee.class.getDeclaredField(fieldName);
            field.setAccessible(true);


            if ("officialEmail".equalsIgnoreCase(fieldName)) {
                Employee data = employeeRepo.findByOfficialEmail(value);
                if (data != null) {
                    return ResponseEntity.badRequest().body("This Official email is already set to another employee.");
                }
            }

            Object convertedValue = convertToProperType(field.getType(), value);
            field.set(user, convertedValue);

            employeeRepo.save(user);
            return ResponseEntity.ok(user);
        } catch (NoSuchFieldException e) {
            return ResponseEntity.badRequest().body("Invalid field name: " + fieldName);
        } catch (IllegalAccessException e) {
            return ResponseEntity.internalServerError().body("Unable to access field: " + fieldName);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }


    public ResponseEntity<?> updateStatus(String emailId, String status) {
        try{
            Employee user = employeeRepo.findByEmailId(emailId);
            if(user  == null) return ResponseEntity.notFound().build();
            else
            {
                user.setStatus(status);
                employeeRepo.save(user);
                return ResponseEntity.status(201).body("Status has been updated successfully");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> uploadDocument(String emailId, MultipartFile file) {
        try{
            Employee user = employeeRepo.findByEmailId(emailId);
            if(user  == null) return ResponseEntity.notFound().build();
            else
            {
                user.setAadhaarPan(file.getBytes());
                employeeRepo.save(user);
                return ResponseEntity.ok().body(user);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> fetchUser(String emailId) {
        try {
            return ResponseEntity.ok().body(employeeRepo.findByOfficialEmail(emailId));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> getProfilePic(Long id) {
        try{
            Employee data = employeeRepo.findById(id).orElse(null);
            assert data != null;
            return ResponseEntity.ok().body(data.getProfilePic());
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server erorr");
        }
    }

    public ResponseEntity<?> getAadharPan(Long id) {
        try{
            Employee data = employeeRepo.findById(id).orElse(null);
            assert data != null;
            return ResponseEntity.ok().body(data.getAadhaarPan());
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server erorr");
        }
    }

    public ResponseEntity<?> setProfilePic(Long id, MultipartFile file) {
        try{
            Employee data = employeeRepo.findById(id).orElse(null);
            assert data != null;
            data.setProfilePic(file.getBytes());
            employeeRepo.save(data);
            return ResponseEntity.ok().body(data.getProfilePic());
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Internal Server Error");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


}