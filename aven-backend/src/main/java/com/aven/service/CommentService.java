package com.aven.service;

import com.aven.entity.Comment;
import com.aven.entity.User;
import com.aven.entity.Image;

import com.aven.repository.CommentRepository;
import com.aven.repository.UserRepository;
import com.aven.repository.ImageRepository;

import com.aven.dto.CommentRequest;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;

    public CommentService(
            CommentRepository commentRepository,
            UserRepository userRepository,
            ImageRepository imageRepository
    ) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
    }

    public List<Comment> getCommentsByImage(Long imageId) {

        return commentRepository
                .findByImageIdOrderByCreatedAtAsc(imageId);
    }

    public Optional<Comment> getCommentById(Long id) {

        return commentRepository.findById(id);
    }

    public Comment createComment(
            String username,
            CommentRequest request
    ) {

        if (request.content() == null
                || request.content().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment cannot be empty"
            );
        }

        String content = request.content().trim();

        if (content.length() > 1000) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment is too long"
            );
        }

        if (request.imageId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Publication ID is required"
            );
        }

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        Image image = imageRepository
                .findById(request.imageId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Publication not found"
                        )
                );

        Comment comment = new Comment();

        comment.setContent(content);
        comment.setUser(user);
        comment.setImage(image);
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public void deleteComment(
            Long id,
            String username
    ) {

        Comment comment = commentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Comment not found"
                        )
                );

        if (!comment.getUser()
                .getUsername().equals(username)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete this comment"
            );
        }

        commentRepository.delete(comment);
    }
}