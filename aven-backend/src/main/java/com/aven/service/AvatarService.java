package com.aven.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;

@Service
public class AvatarService {

    private static final long MAX_FILE_SIZE =
            5 * 1024 * 1024;

    private static final int MAX_DIMENSION = 4096;

    private final Path avatarDirectory =
            Paths.get("uploads", "avatars")
                    .toAbsolutePath()
                    .normalize();


    // ===== Сохранение аватарки =====

    public String saveAvatar(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select an image"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Image must not exceed 5 MB"
            );
        }

        BufferedImage image;

        try (ImageInputStream input =
                     ImageIO.createImageInputStream(
                             file.getInputStream())) {

            if (input == null) {
                throw invalidImage();
            }

            Iterator<ImageReader> readers =
                    ImageIO.getImageReaders(input);

            if (!readers.hasNext()) {
                throw invalidImage();
            }

            ImageReader reader = readers.next();

            try {

                reader.setInput(input);

                String format = reader.getFormatName();

                if (!format.equalsIgnoreCase("png")
                        && !format.equalsIgnoreCase("jpeg")
                        && !format.equalsIgnoreCase("jpg")) {

                    throw invalidImage();
                }

                int width = reader.getWidth(0);
                int height = reader.getHeight(0);

                if (width > MAX_DIMENSION
                        || height > MAX_DIMENSION
                        || width <= 0
                        || height <= 0) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Image dimensions must not exceed 4096 x 4096"
                    );
                }

                image = reader.read(0);

            } finally {
                reader.dispose();
            }

        } catch (IOException exception) {
            throw invalidImage();
        }

        if (image == null) {
            throw invalidImage();
        }


        // ===== Создание имени файла =====

        String fileName =
                UUID.randomUUID() + ".png";

        Path destination =
                avatarDirectory.resolve(fileName);


        // ===== Сохранение изображения =====

        try {

            Files.createDirectories(avatarDirectory);

            if (!ImageIO.write(
                    image,
                    "png",
                    destination.toFile())) {

                throw new IOException("Image encoding failed");
            }

        } catch (IOException exception) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save profile photo"
            );
        }

        return "/uploads/avatars/" + fileName;
    }


    // ===== Ошибка формата =====

    private ResponseStatusException invalidImage() {

        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please select a valid PNG or JPEG image"
        );
    }
}