package com.aven.service;

import com.aven.entity.Image;
import com.aven.entity.User;
import com.aven.repository.ImageRepository;
import com.aven.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SearchService {

    private final ImageRepository imageRepository;
    private final UserRepository userRepository;

    public SearchService(
            ImageRepository imageRepository,
            UserRepository userRepository
    ) {
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
    }

    public List<Image> searchImages(String query) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        return imageRepository.searchImages(query.strip());
    }

    public List<Map<String, Object>> searchUsers(String query) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        return userRepository.searchUsers(query.strip())
                .stream()
                .map(this::toPublicUser)
                .toList();
    }

    private Map<String, Object> toPublicUser(User user) {

        Map<String, Object> result =
                new java.util.LinkedHashMap<>();

        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("displayName", user.getDisplayName());
        result.put("avatarUrl", user.getAvatarUrl());
        result.put("bio", user.getBio());

        return result;
    }

    public Map<String, Object> searchAll(String query) {

        return Map.of(
                "images", searchImages(query),
                "users", searchUsers(query)
        );
    }
}