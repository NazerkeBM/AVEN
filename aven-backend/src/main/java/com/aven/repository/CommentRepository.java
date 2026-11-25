package com.aven.repository;

import com.aven.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment> findByImageId(Long imageId);

    List<Comment> findByUserId(Long userId);

    List<Comment> findByImageIdOrderByCreatedAtAsc(Long imageId);
}