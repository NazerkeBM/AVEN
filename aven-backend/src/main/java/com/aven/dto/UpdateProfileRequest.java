package com.aven.dto;

public record UpdateProfileRequest(
        String displayName,
        String bio,
        String avatarUrl
) {
}