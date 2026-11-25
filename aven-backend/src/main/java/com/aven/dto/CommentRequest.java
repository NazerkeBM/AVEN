package com.aven.dto;

public record CommentRequest(
        Long imageId,
        String content
) {
}