package com.aven.service;

import com.aven.entity.Like;
import com.aven.entity.LikeId;
import com.aven.repository.LikeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;

    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    public List<Like> getLikesByImage(Long imageId) {
        return likeRepository.findByImageId(imageId);
    }

    public List<Like> getLikesByUser(Long userId) {
        return likeRepository.findByUserId(userId);
    }

    public Optional<Like> getLikeById(LikeId id) {
        return likeRepository.findById(id);
    }

    public Like createLike(Like like) {
        like.setCreatedAt(LocalDateTime.now());
        return likeRepository.save(like);
    }

    public void deleteLike(LikeId id) {
        likeRepository.deleteById(id);
    }
}