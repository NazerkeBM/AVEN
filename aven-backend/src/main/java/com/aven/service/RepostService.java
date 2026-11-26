package com.aven.service;

import com.aven.entity.Image;
import com.aven.entity.Repost;
import com.aven.entity.RepostId;
import com.aven.entity.User;
import com.aven.entity.NotificationType;

import com.aven.repository.ImageRepository;
import com.aven.repository.RepostRepository;
import com.aven.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RepostService {

    private final RepostRepository repostRepository;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final NotificationService notificationService;

    public RepostService(
            RepostRepository repostRepository,
            UserRepository userRepository,
            ImageRepository imageRepository,
            NotificationService notificationService
    ) {
        this.repostRepository = repostRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
        this.notificationService = notificationService;
    }

    public List<Repost> getUserReposts(Long userId) {

        return repostRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countReposts(Long imageId) {

        return repostRepository.countByImageId(imageId);
    }

    public boolean isReposted(String username, Long imageId) {

        User user = getCurrentUser(username);

        return repostRepository.existsById(
                new RepostId(user.getId(), imageId)
        );
    }

    @Transactional
    public Repost createRepost(String username, Long imageId) {

        User user = getCurrentUser(username);

        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Publication not found"
                ));

        if (user.getId().equals(image.getUser().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot repost your own publication"
            );
        }

        RepostId id = new RepostId(user.getId(), imageId);

        return repostRepository.findById(id)
                .orElseGet(() -> {

                    Repost repost = new Repost();

                    repost.setId(id);
                    repost.setUser(user);
                    repost.setImage(image);
                    repost.setCreatedAt(LocalDateTime.now());

                    Repost savedRepost =
                            repostRepository.save(repost);

                    notificationService.createNotification(
                            image.getUser().getId(),
                            user.getId(),
                            image.getId(),
                            NotificationType.REPOST,
                            "reposted your publication"
                    );

                    return savedRepost;
                });
    }

    @Transactional
    public void deleteRepost(String username, Long imageId) {

        User user = getCurrentUser(username);

        RepostId id = new RepostId(user.getId(), imageId);

        if (repostRepository.existsById(id)) {

            repostRepository.deleteById(id);
        }
    }

    private User getCurrentUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));
    }
}