package com.aven.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows")
public class Follow {

    @EmbeddedId
    private FollowId id;

    @ManyToOne
    @MapsId("followerId")
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne
    @MapsId("followingId")
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Follow() {
    }
    public FollowId getId() {
        return id;
    }
    public void setId(FollowId id) {
        this.id = id;
    }
    public User getFollower() {
        return follower;
    }
    public void setFollower(User follower) {
        this.follower = follower;
    }
    public User getFollowing() {
        return following;
    }
    public void setFollowing(User following) {
        this.following = following;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}