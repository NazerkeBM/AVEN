package com.aven.repository;

import com.aven.entity.Like;
import com.aven.entity.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, LikeId> {

    List<Like> findByImageId(Long imageId);

    List<Like> findByUserId(Long userId);

}