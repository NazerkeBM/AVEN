package com.aven.service;

import com.aven.entity.SavedImage;
import com.aven.entity.SavedImageId;
import com.aven.repository.SavedImageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SavedImageService {

    private final SavedImageRepository savedImageRepository;

    public SavedImageService(SavedImageRepository savedImageRepository) {
        this.savedImageRepository = savedImageRepository;
    }
    public List<SavedImage> getSavedImagesByUser(Long userId) {
        return savedImageRepository.findByUserId(userId);
    }
    public List<SavedImage> getUsersWhoSavedImage(Long imageId) {
        return savedImageRepository.findByImageId(imageId);
    }
    public Optional<SavedImage> getSavedImageById(SavedImageId id) {
        return savedImageRepository.findById(id);
    }
    public SavedImage saveImage(SavedImage savedImage) { savedImage.setSavedAt(java.time.LocalDateTime.now()); return savedImageRepository.save(savedImage); }
    public void deleteSavedImage(SavedImageId id) {
        savedImageRepository.deleteById(id);
    }
}