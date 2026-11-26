package com.aven.repository;

import com.aven.entity.Repost;
import com.aven.entity.RepostId;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepostRepository
        extends JpaRepository<Repost, RepostId> {

    List<Repost> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Repost> findByImageId(Long imageId);

    long countByImageId(Long imageId);

    long countByUserId(Long userId);
}