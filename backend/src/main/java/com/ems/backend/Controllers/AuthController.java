package com.ems.backend.Controllers;

import com.ems.backend.Config.JwtUtils;
import com.ems.backend.DTO.AuthRequest;
import com.ems.backend.DTO.AuthResponse;
import com.ems.backend.Services.EmployeeUserDetailsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmployeeUserDetailsService userDetailsService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils,
            EmployeeUserDetailsService userDetailsService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            System.out.println(authRequest);
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword()
                    )
            );


            final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

            final String token = jwtUtils.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(token, userDetails));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}
