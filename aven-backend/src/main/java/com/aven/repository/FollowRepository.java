package com.aven.repository;

import com.aven.entity.Follow;
import com.aven.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {

    List<Follow> findByFollowerId(Long followerId);

    List<Follow> findByFollowingId(Long followingId);

    long countByFollowerId(Long followerId);

    long countByFollowingId(Long followingId);

}