package com.aven.controller;

import com.aven.entity.Comment;
import com.aven.dto.CommentRequest;
import com.aven.service.CommentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(
            CommentService commentService
    ) {
        this.commentService = commentService;
    }

    @GetMapping("/image/{imageId}")
    public List<Comment> getCommentsByImage(
            @PathVariable Long imageId
    ) {

        return commentService.getCommentsByImage(imageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(
            @PathVariable Long id
    ) {

        return commentService.getCommentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(
            @RequestBody CommentRequest request,
            Principal principal
    ) {

        Comment comment = commentService.createComment(
                principal.getName(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(comment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Principal principal
    ) {

        commentService.deleteComment(
                id,
                principal.getName()
        );

        return ResponseEntity.noContent().build();
    }
}