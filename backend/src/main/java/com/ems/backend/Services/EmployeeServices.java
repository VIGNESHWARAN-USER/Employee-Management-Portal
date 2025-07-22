package com.ems.backend.Services;

import com.ems.backend.Models.Employee;
import com.ems.backend.Repositories.EmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;
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

            if (user.getEmailId() == null || user.getEmailId().isEmpty()) {
                return "Email cannot be empty";
            }

            if (!isValidEmail(user.getEmailId())) {
                return "Invalid email format";
            }

            if (user.getPassword() == null || user.getPassword().length() < 6) {
                return "Password must be at least 6 characters long";
            }

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
            Employee user = employeeRepo.findByEmailId(email);
            if(user  == null) return ResponseEntity.notFound().build();
            else if(passwordEncoder.matches(password,user.getPassword())) return ResponseEntity.ok(user);
            else return ResponseEntity.status(201).body("Invalid Password");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Server Error");
        }
    }

    public ResponseEntity<?> forgotPassword(String email) {
        try{
            Employee user = employeeRepo.findByEmailId(email);
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
            Employee user = employeeRepo.findByEmailId(email);
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
}