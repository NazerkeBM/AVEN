package com.aven.controller;

import com.aven.dto.NotificationDto;
import com.aven.repository.UserRepository;
import com.aven.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Principal principal) {

        if (principal == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ))
                .getId();
    }

    @GetMapping
    public List<NotificationDto> getNotifications(
            Principal principal
    ) {

        Long userId = getCurrentUserId(principal);

        return notificationService.getNotifications(userId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(
            Principal principal
    ) {

        Long userId = getCurrentUserId(principal);

        return Map.of(
                "count",
                notificationService.getUnreadCount(userId)
        );
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Principal principal
    ) {

        Long userId = getCurrentUserId(principal);

        notificationService.markAsRead(id, userId);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Principal principal
    ) {

        Long userId = getCurrentUserId(principal);

        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }
}