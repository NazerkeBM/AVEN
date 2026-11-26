package com.aven.dto;

public record UpdateAccountRequest(

        String displayName,
        String email,
        String username

) {
}