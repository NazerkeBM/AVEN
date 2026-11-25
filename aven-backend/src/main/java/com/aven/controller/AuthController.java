package com.aven.controller;

import com.aven.dto.RegisterRequest;
import com.aven.entity.User;
import com.aven.service.UserService;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {
            User user = userService.register(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Account created successfully",
                            "id", user.getId(),
                            "username", user.getUsername()
                    ));

        } catch (ResponseStatusException e) {

            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(Map.of("message", e.getReason()));

        } catch (DataIntegrityViolationException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "Username or email already exists"
                    ));
        }
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }

    @GetMapping("/me")
    public ResponseEntity<User> me(Principal principal) {

        return userService
                .getUserByUsername(principal.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}