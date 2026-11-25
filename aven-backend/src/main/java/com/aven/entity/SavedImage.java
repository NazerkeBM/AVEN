package com.aven.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_images")
public class SavedImage {

    @EmbeddedId
    private SavedImageId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @MapsId("imageId")
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;

    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt;

    public SavedImage() {
    }
    public SavedImageId getId() {
        return id;
    }
    public void setId(SavedImageId id) {
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
    public LocalDateTime getSavedAt() {
        return savedAt;
    }
    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}