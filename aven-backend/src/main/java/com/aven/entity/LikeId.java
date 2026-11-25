package com.aven.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class LikeId implements Serializable {

    private Long userId;
    private Long imageId;

    public LikeId() {
    }
    public LikeId(Long userId, Long imageId) {
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
        if (!(o instanceof LikeId)) return false;

        LikeId likeId = (LikeId) o;

        return Objects.equals(userId, likeId.userId)
                && Objects.equals(imageId, likeId.imageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, imageId);
    }
}