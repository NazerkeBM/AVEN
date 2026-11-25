package com.aven.controller;

import com.aven.entity.SavedImage;
import com.aven.entity.SavedImageId;
import com.aven.service.SavedImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved")
@CrossOrigin(origins = "*")
public class SavedImageController {

    private final SavedImageService savedImageService;

    public SavedImageController(SavedImageService savedImageService) {
        this.savedImageService = savedImageService;
    }

    @GetMapping("/user/{userId}")
    public List<SavedImage> getSavedImagesByUser(@PathVariable Long userId) {
        return savedImageService.getSavedImagesByUser(userId);
    }

    @GetMapping("/image/{imageId}")
    public List<SavedImage> getUsersWhoSavedImage(@PathVariable Long imageId) {
        return savedImageService.getUsersWhoSavedImage(imageId);
    }

    @GetMapping("/{userId}/{imageId}")
    public ResponseEntity<SavedImage> getSavedImageById(
            @PathVariable Long userId,
            @PathVariable Long imageId) {

        SavedImageId id = new SavedImageId(userId, imageId);

        return savedImageService.getSavedImageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SavedImage saveImage(@RequestBody SavedImage savedImage) {
        return savedImageService.saveImage(savedImage);
    }

    @DeleteMapping("/{userId}/{imageId}")
    public ResponseEntity<Void> deleteSavedImage(
            @PathVariable Long userId,
            @PathVariable Long imageId) {

        SavedImageId id = new SavedImageId(userId, imageId);

        if (savedImageService.getSavedImageById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        savedImageService.deleteSavedImage(id);
        return ResponseEntity.noContent().build();
    }
}