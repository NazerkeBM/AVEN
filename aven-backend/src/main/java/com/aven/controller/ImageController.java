package com.aven.controller;

import com.aven.entity.Image;
import com.aven.service.ImageService;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping
    public List<Image> getAllImages() {
        return imageService.getAllImages();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Image> getImageById(
            @PathVariable Long id
    ) {
        return imageService.getImageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Image> getImagesByUser(
            @PathVariable Long userId
    ) {
        return imageService.getImagesByUser(userId);
    }

    @GetMapping("/category/{categoryId}")
    public List<Image> getImagesByCategory(
            @PathVariable Long categoryId
    ) {
        return imageService.getImagesByCategory(categoryId);
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Image> createImage(
            @RequestParam("title") String title,
            @RequestParam(
                    value = "description",
                    required = false
            ) String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {

        String baseUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();

        Image image = imageService.createImage(
                principal.getName(),
                title,
                description,
                categoryId,
                file,
                baseUrl
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(image);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id,
            Principal principal
    ) {

        imageService.deleteImage(
                id,
                principal.getName()
        );

        return ResponseEntity.noContent().build();
    }
}