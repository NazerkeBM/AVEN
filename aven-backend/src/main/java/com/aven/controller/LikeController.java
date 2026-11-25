package com.aven.controller;

import com.aven.entity.Like;
import com.aven.entity.LikeId;
import com.aven.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @GetMapping("/image/{imageId}")
    public List<Like> getLikesByImage(@PathVariable Long imageId) {
        return likeService.getLikesByImage(imageId);
    }

    @GetMapping("/user/{userId}")
    public List<Like> getLikesByUser(@PathVariable Long userId) {
        return likeService.getLikesByUser(userId);
    }

    @GetMapping("/{userId}/{imageId}")
    public ResponseEntity<Like> getLikeById(
            @PathVariable Long userId,
            @PathVariable Long imageId) {

        LikeId id = new LikeId(userId, imageId);

        return likeService.getLikeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Like createLike(@RequestBody Like like) {
        return likeService.createLike(like);
    }

    @DeleteMapping("/{userId}/{imageId}")
    public ResponseEntity<Void> deleteLike(
            @PathVariable Long userId,
            @PathVariable Long imageId) {

        LikeId id = new LikeId(userId, imageId);

        if (likeService.getLikeById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        likeService.deleteLike(id);
        return ResponseEntity.noContent().build();
    }
}