package com.aven.controller;

import com.aven.dto.CurrentUserDto;
import com.aven.dto.UpdateAccountRequest;
import com.aven.dto.UpdateProfileRequest;
import com.aven.entity.User;
import com.aven.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(
            @PathVariable String username) {

        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        User updatedUser = userService.updateProfile(
                principal.getName(),
                request
        );

        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/me/account")
    public ResponseEntity<?> updateAccount(
            @RequestBody UpdateAccountRequest request,
            Principal principal,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String oldUsername = principal.getName();

        User updatedUser = userService.updateAccount(
                oldUsername,
                request
        );

        boolean requiresLogin =
                !oldUsername.equals(updatedUser.getUsername());

        if (requiresLogin) {

            SecurityContextLogoutHandler logoutHandler =
                    new SecurityContextLogoutHandler();

            logoutHandler.logout(
                    httpRequest,
                    httpResponse,
                    SecurityContextHolder.getContext()
                            .getAuthentication()
            );
        }

        return ResponseEntity.ok(Map.of(
                "message", "Account updated successfully",
                "user", CurrentUserDto.from(updatedUser),
                "requiresLogin", requiresLogin
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        if (userService.getUserById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}