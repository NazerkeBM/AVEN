package com.aven.repository;

import com.aven.entity.SavedImage;
import com.aven.entity.SavedImageId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedImageRepository extends JpaRepository<SavedImage, SavedImageId> {

    List<SavedImage> findByUserId(Long userId);

    List<SavedImage> findByImageId(Long imageId);

}