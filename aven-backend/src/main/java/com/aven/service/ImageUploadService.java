package com.aven.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.UUID;

@Service
public class ImageUploadService {

    private final Path uploadDirectory =
            Path.of("uploads", "images");

    public String uploadImage(MultipartFile file) {

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Image is required"
            );
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum file size is 10 MB"
            );
        }

        String type = file.getContentType();

        if (!"image/png".equals(type)
                && !"image/jpeg".equals(type)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PNG and JPEG are supported"
            );
        }

        try {

            BufferedImage image =
                    ImageIO.read(file.getInputStream());

            if (image == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid image"
                );
            }

            if (image.getWidth() > 4096
                    || image.getHeight() > 4096) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Image dimensions are too large"
                );
            }

            Files.createDirectories(uploadDirectory);

            String filename = UUID.randomUUID() + ".png";

            Path destination =
                    uploadDirectory.resolve(filename);

            if (!ImageIO.write(image, "png",
                    destination.toFile())) {
                throw new IOException("Image encoding failed");
            }

            return "/uploads/images/" + filename;

        } catch (IOException e) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not upload image"
            );
        }
    }
}