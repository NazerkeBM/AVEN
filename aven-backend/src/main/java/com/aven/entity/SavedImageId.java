package com.aven.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SavedImageId implements Serializable {

    private Long userId;
    private Long imageId;

    public SavedImageId() {
    }
    public SavedImageId(Long userId, Long imageId) {
        this.userId = userId;
        this.imageId = imageId;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public Long getImageId() {
        return imageId;
    }
    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SavedImageId)) return false;

        SavedImageId that = (SavedImageId) o;

        return Objects.equals(userId, that.userId)
                && Objects.equals(imageId, that.imageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, imageId);
    }
}