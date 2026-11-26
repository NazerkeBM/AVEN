package com.aven.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reposts")
public class Repost {

    @EmbeddedId
    private RepostId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @MapsId("imageId")
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Repost() {
    }

    public RepostId getId() {
        return id;
    }

    public void setId(RepostId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Image getImage() {
        return image;
    }

    public void setImage(Image image) {
        this.image = image;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}