package com.aven.controller;

import com.aven.entity.Repost;
import com.aven.service.RepostService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reposts")
public class RepostController {

    private final RepostService repostService;

    public RepostController(RepostService repostService) {

        this.repostService = repostService;
    }

    // Репосты пользователя
    @GetMapping("/user/{userId}")
    public List<Repost> getUserReposts(
            @PathVariable Long userId
    ) {

        return repostService.getUserReposts(userId);
    }

    // Количество репостов публикации
    @GetMapping("/count/{imageId}")
    public Map<String, Long> getRepostCount(
            @PathVariable Long imageId
    ) {

        return Map.of(
                "count",
                repostService.countReposts(imageId)
        );
    }

    // Проверка статуса репоста
    @GetMapping("/status/{imageId}")
    public Map<String, Boolean> getRepostStatus(
            @PathVariable Long imageId,
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return Map.of(
                "reposted",
                repostService.isReposted(
                        authentication.getName(),
                        imageId
                )
        );
    }

    // Создание репоста
    @PostMapping("/{imageId}")
    public ResponseEntity<Repost> createRepost(
            @PathVariable Long imageId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                repostService.createRepost(
                        authentication.getName(),
                        imageId
                )
        );
    }

    // Удаление репоста
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteRepost(
            @PathVariable Long imageId,
            Authentication authentication
    ) {

        repostService.deleteRepost(
                authentication.getName(),
                imageId
        );

        return ResponseEntity.noContent().build();
    }
}