package com.aven.service;

import com.aven.entity.Image;
import com.aven.entity.User;
import com.aven.entity.Category;
import com.aven.repository.ImageRepository;
import com.aven.repository.UserRepository;
import com.aven.repository.CategoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ImageUploadService imageUploadService;

    public ImageService(
            ImageRepository imageRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            ImageUploadService imageUploadService
    ) {
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.imageUploadService = imageUploadService;
    }

    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }

    public Optional<Image> getImageById(Long id) {
        return imageRepository.findById(id);
    }

    public List<Image> getImagesByUser(Long userId) {
        return imageRepository.findByUserId(userId);
    }

    public List<Image> getImagesByCategory(Long categoryId) {
        return imageRepository.findByCategoryId(categoryId);
    }

    public Image createImage(
            String username,
            String title,
            String description,
            Long categoryId,
            MultipartFile file,
            String baseUrl
    ) {

        if (title == null || title.isBlank()
                || title.length() > 150) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid title"
            );
        }

        if (description != null
                && description.length() > 2000) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Description is too long"
            );
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        Category category = categoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Category not found"
                        )
                );

        String imageUrl =
                imageUploadService.uploadImage(file);

        Image image = new Image();

        image.setTitle(title.trim());
        image.setDescription(description);
        image.setImageUrl(baseUrl + imageUrl);
        image.setUser(user);
        image.setCategory(category);
        image.setCreatedAt(LocalDateTime.now());

        return imageRepository.save(image);
    }

    public void deleteImage(Long id, String username) {

        Image image = imageRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Image not found"
                        )
                );

        if (!image.getUser().getUsername().equals(username)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete this publication"
            );
        }

        imageRepository.delete(image);
    }
}