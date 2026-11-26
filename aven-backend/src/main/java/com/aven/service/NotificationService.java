package com.aven.service;

import com.aven.dto.NotificationDto;
import com.aven.entity.Notification;
import com.aven.entity.NotificationType;
import com.aven.entity.User;
import com.aven.repository.NotificationRepository;
import com.aven.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Objects;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(
            Long recipientId,
            Long actorId,
            Long imageId,
            NotificationType type,
            String message
    ) {

        if (recipientId == null) {
            return;
        }

        if (Objects.equals(recipientId, actorId)) {
            return;
        }

        Notification notification = new Notification(
                recipientId,
                actorId,
                imageId,
                type,
                message
        );

        notificationRepository.save(notification);
    }

    @Transactional
    public void createSystemNotification(
            Long recipientId,
            String message
    ) {

        createNotification(
                recipientId,
                null,
                null,
                NotificationType.SYSTEM,
                message
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(
            Long recipientId
    ) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {

        return notificationRepository
                .countByRecipientIdAndReadFalse(recipientId);
    }

    @Transactional
    public void markAsRead(
            Long notificationId,
            Long recipientId
    ) {

        Notification notification = notificationRepository
                .findByIdAndRecipientId(
                        notificationId,
                        recipientId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        notification.setRead(true);
    }

    @Transactional
    public void markAllAsRead(Long recipientId) {

        notificationRepository.markAllAsRead(recipientId);
    }

    private NotificationDto toDto(
            Notification notification
    ) {

        User actor = null;

        if (notification.getActorId() != null) {

            actor = userRepository
                    .findById(notification.getActorId())
                    .orElse(null);
        }

        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getActorId(),
                actor != null ? actor.getDisplayName() : null,
                actor != null ? actor.getUsername() : null,
                actor != null ? actor.getAvatarUrl() : null,
                notification.getImageId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}