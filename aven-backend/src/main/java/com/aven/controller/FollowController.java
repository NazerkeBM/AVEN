package com.aven.controller;

import com.aven.entity.Follow;
import com.aven.entity.FollowId;
import com.aven.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "*")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/following/{userId}")
    public List<Follow> getFollowing(@PathVariable Long userId) {
        return followService.getFollowing(userId);
    }

    @GetMapping("/followers/{userId}")
    public List<Follow> getFollowers(@PathVariable Long userId) {
        return followService.getFollowers(userId);
    }

    @GetMapping("/{followerId}/{followingId}")
    public ResponseEntity<Follow> getFollowById(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {

        FollowId id = new FollowId(followerId, followingId);

        return followService.getFollowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Follow followUser(@RequestBody Follow follow) {
        return followService.followUser(follow);
    }

    @DeleteMapping("/{followerId}/{followingId}")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {

        FollowId id = new FollowId(followerId, followingId);

        if (followService.getFollowById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        followService.unfollowUser(id);
        return ResponseEntity.noContent().build();
    }
}