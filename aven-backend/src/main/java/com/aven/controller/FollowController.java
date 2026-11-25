package com.aven.controller;

import com.aven.entity.Follow;
import com.aven.entity.FollowId;
import com.aven.service.FollowService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/following/{userId}")
    public List<Follow> getFollowing(
            @PathVariable Long userId) {

        return followService.getFollowing(userId);
    }

    @GetMapping("/followers/{userId}")
    public List<Follow> getFollowers(
            @PathVariable Long userId) {

        return followService.getFollowers(userId);
    }

    @GetMapping("/stats/{userId}")
    public Map<String, Long> getFollowStats(
            @PathVariable Long userId) {

        return Map.of(
                "followers", followService.getFollowersCount(userId),
                "following", followService.getFollowingCount(userId)
        );
    }

    @GetMapping("/{followerId}/{followingId}")
    public ResponseEntity<Follow> getFollowById(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {

        FollowId id = new FollowId(
                followerId,
                followingId
        );

        return followService.getFollowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{followerId}/{followingId}")
    public Map<String, Boolean> getFollowStatus(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {

        return Map.of(
                "following",
                followService.isFollowing(
                        followerId,
                        followingId
                )
        );
    }

    @PostMapping("/{followingId}")
    public ResponseEntity<Follow> followUser(
            @PathVariable Long followingId,
            Authentication authentication) {

        Follow follow = followService.followUser(
                authentication.getName(),
                followingId
        );

        return ResponseEntity.ok(follow);
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long followingId,
            Authentication authentication) {

        followService.unfollowUser(
                authentication.getName(),
                followingId
        );

        return ResponseEntity.noContent().build();
    }
}