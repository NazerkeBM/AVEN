package com.aven.dto;

import com.aven.entity.User;

public record CurrentUserDto(

        Long id,
        String username,
        String email,
        String displayName,
        String bio,
        String avatarUrl

) {

    public static CurrentUserDto from(User user) {

        return new CurrentUserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getBio(),
                user.getAvatarUrl()
        );
    }
}