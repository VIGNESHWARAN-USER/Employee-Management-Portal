package com.ems.backend.DTO;

import lombok.Data;
import org.springframework.security.core.userdetails.UserDetails;

@Data
public class AuthResponse {
    private String token;
    private UserDetails userDetails;
    public AuthResponse(String token, UserDetails userDetails)
    {
        this.token = token;
        this.userDetails = userDetails;
    }
}
