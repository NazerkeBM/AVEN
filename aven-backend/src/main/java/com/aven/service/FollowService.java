package com.aven.service;

import com.aven.entity.Follow;
import com.aven.entity.FollowId;
import com.aven.repository.FollowRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }
    public List<Follow> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId);
    }
    public List<Follow> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId);
    }
    public Optional<Follow> getFollowById(FollowId id) {
        return followRepository.findById(id);
    }
    public Follow followUser(Follow follow) {
        return followRepository.save(follow);
    }
    public void unfollowUser(FollowId id) {
        followRepository.deleteById(id);
    }
}