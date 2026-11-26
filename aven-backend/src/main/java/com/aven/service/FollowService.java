package com.aven.service;

import com.aven.entity.Follow;
import com.aven.entity.FollowId;
import com.aven.entity.User;
import com.aven.entity.NotificationType;
import com.aven.repository.FollowRepository;
import com.aven.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FollowService(
            FollowRepository followRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<Follow> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId);
    }

    public List<Follow> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId);
    }

    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    public long getFollowersCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }

    public Optional<Follow> getFollowById(FollowId id) {
        return followRepository.findById(id);
    }

    public boolean isFollowing(
            Long followerId,
            Long followingId) {

        return followRepository.existsById(
                new FollowId(followerId, followingId)
        );
    }

    private User getCurrentUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        ));
    }

    @Transactional
    public Follow followUser(
            String username,
            Long followingId) {

        User follower = getCurrentUser(username);

        if (follower.getId().equals(followingId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot follow yourself"
            );
        }

        User following = userRepository.findById(followingId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));

        FollowId id = new FollowId(
                follower.getId(),
                followingId
        );

        Optional<Follow> existingFollow =
                followRepository.findById(id);

        if (existingFollow.isPresent()) {
            return existingFollow.get();
        }

        Follow follow = new Follow();

        follow.setId(id);
        follow.setFollower(follower);
        follow.setFollowing(following);
        follow.setCreatedAt(LocalDateTime.now());

        Follow savedFollow = followRepository.save(follow);

        notificationService.createNotification(
                following.getId(),
                follower.getId(),
                null,
                NotificationType.FOLLOW,
                follower.getUsername() + " started following you"
        );

        return savedFollow;
    }

    @Transactional
    public void unfollowUser(
            String username,
            Long followingId) {

        User follower = getCurrentUser(username);

        FollowId id = new FollowId(
                follower.getId(),
                followingId
        );

        if (followRepository.existsById(id)) {
            followRepository.deleteById(id);
        }
    }
}