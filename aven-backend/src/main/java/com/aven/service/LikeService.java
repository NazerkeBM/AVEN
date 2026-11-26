package com.aven.service;

import com.aven.entity.Like;
import com.aven.entity.LikeId;
import com.aven.entity.Image;
import com.aven.entity.NotificationType;

import com.aven.repository.LikeRepository;
import com.aven.repository.ImageRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final ImageRepository imageRepository;
    private final NotificationService notificationService;

    public LikeService(
            LikeRepository likeRepository,
            ImageRepository imageRepository,
            NotificationService notificationService
    ) {
        this.likeRepository = likeRepository;
        this.imageRepository = imageRepository;
        this.notificationService = notificationService;
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

    @Transactional
    public Like createLike(Like like) {

        Optional<Like> existingLike =
                likeRepository.findById(like.getId());

        if (existingLike.isPresent()) {
            return existingLike.get();
        }

        Image image = imageRepository
                .findById(like.getId().getImageId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Image not found"
                ));

        like.setImage(image);
        like.setCreatedAt(LocalDateTime.now());

        Like savedLike = likeRepository.save(like);

        notificationService.createNotification(
                image.getUser().getId(),
                savedLike.getId().getUserId(),
                image.getId(),
                NotificationType.LIKE,
                "liked your publication"
        );

        return savedLike;
    }

    @Transactional
    public void deleteLike(LikeId id) {
        likeRepository.deleteById(id);
    }
}