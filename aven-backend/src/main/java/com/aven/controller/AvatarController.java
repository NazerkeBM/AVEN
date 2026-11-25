package com.aven.controller;

import com.aven.service.AvatarService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/avatar")
public class AvatarController {

    private final AvatarService avatarService;

    public AvatarController(AvatarService avatarService) {
        this.avatarService = avatarService;
    }


    // ===== Загрузка фотографии =====

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {

        // Проверяем авторизацию пользователя

        if (principal == null) {

            return ResponseEntity.status(401).body(
                    Map.of("message", "Authentication required")
            );
        }


        // Сохраняем фотографию

        String avatarPath = avatarService.saveAvatar(file);


        // Возвращаем путь к фотографии

        return ResponseEntity.ok(
                Map.of(
                        "message", "Avatar uploaded successfully",
                        "avatarUrl", avatarPath
                )
        );
    }
}