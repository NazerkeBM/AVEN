package com.aven.controller;

import com.aven.dto.UpdateProfileRequest;
import com.aven.entity.User;
import com.aven.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ===== Получение всех пользователей =====

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ===== Получение пользователя по ID =====

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ===== Получение пользователя по username =====

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(
            @PathVariable String username) {

        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ===== Редактирование текущего профиля =====

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

    // ===== Удаление пользователя =====

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