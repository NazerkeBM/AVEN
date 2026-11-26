package com.aven.dto;

import com.aven.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationDto(

        Long id,

        NotificationType type,

        String message,

        Long actorId,

        String actorName,

        String actorUsername,

        String actorAvatarUrl,

        Long imageId,

        boolean read,

        LocalDateTime createdAt

) {
}