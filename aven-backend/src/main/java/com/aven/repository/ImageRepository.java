package com.aven.repository;

import com.aven.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByUserId(Long userId);

    List<Image> findByCategoryId(Long categoryId);
}