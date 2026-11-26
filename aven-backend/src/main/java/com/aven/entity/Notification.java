package com.aven.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "image_id")
    private Long imageId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Notification() {
    }

    public Notification(
            Long recipientId,
            Long actorId,
            Long imageId,
            NotificationType type,
            String message
    ) {
        this.recipientId = recipientId;
        this.actorId = actorId;
        this.imageId = imageId;
        this.type = type;
        this.message = message;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public Long getActorId() {
        return actorId;
    }

    public Long getImageId() {
        return imageId;
    }

    public NotificationType getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}