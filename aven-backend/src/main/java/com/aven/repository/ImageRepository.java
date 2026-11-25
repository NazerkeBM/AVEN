package com.aven.repository;

import com.aven.entity.Image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByUserId(Long userId);

    List<Image> findByCategoryId(Long categoryId);

    @Query("""
        SELECT i FROM Image i
        LEFT JOIN i.category c
        WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%'))
        OR LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%'))
        OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))
        """)
    List<Image> searchImages(@Param("query") String query);

}