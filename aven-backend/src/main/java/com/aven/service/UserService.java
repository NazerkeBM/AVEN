package com.aven.service;

import com.aven.dto.RegisterRequest;
import com.aven.dto.UpdateProfileRequest;
import com.aven.entity.User;
import com.aven.repository.UserRepository;
import com.aven.dto.UpdateAccountRequest;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User register(RegisterRequest request) {

        if (request.username() == null ||
                request.email() == null ||
                request.password() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All fields are required"
            );
        }

        String username = request.username().trim();

        String email = request.email().trim()
                .toLowerCase(Locale.ROOT);

        String password = request.password();

        if (!username.matches("[a-zA-Z0-9_.]{3,50}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid username"
            );
        }

        if (email.length() > 255 ||
                !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid email"
            );
        }

        if (password.length() < 8 ||
                password.getBytes(StandardCharsets.UTF_8).length > 72) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid password length"
            );
        }

        if (userRepository.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        User user = new User();

        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setDisplayName(username);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        notificationService.createSystemNotification(
                savedUser.getId(),
                "Welcome to AVEN! Discover inspiration, " +
                        "share your creativity and connect with others."
        );

        return savedUser;
    }

    public User updateProfile(
            String username,
            UpdateProfileRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (request.displayName() != null) {

            String displayName = request.displayName().trim();

            if (displayName.isEmpty() || displayName.length() > 100) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Display name must contain 1-100 characters"
                );
            }

            user.setDisplayName(displayName);
        }

        if (request.bio() != null) {

            String bio = request.bio().trim();

            if (bio.length() > 500) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Bio must not exceed 500 characters"
                );
            }

            user.setBio(bio);
        }

        if (request.avatarUrl() != null) {

            String avatarUrl = request.avatarUrl().trim();

            if (!avatarUrl.isEmpty()) {
                validateAvatarUrl(avatarUrl);
            }

            user.setAvatarUrl(
                    avatarUrl.isEmpty() ? null : avatarUrl
            );
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateAccount(
            String currentUsername,
            UpdateAccountRequest request) {

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (request.displayName() == null ||
                request.email() == null ||
                request.username() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All fields are required"
            );
        }

        String displayName = request.displayName().trim();

        String email = request.email().trim()
                .toLowerCase(Locale.ROOT);

        String username = request.username().trim();

        if (displayName.isEmpty() ||
                displayName.length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Display name must contain 1-100 characters"
            );
        }

        if (!username.matches("[a-zA-Z0-9_.]{3,50}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid username"
            );
        }

        if (email.length() > 255 ||
                !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid email"
            );
        }

        userRepository.findByUsername(username)
                .filter(existingUser ->
                        !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Username already exists"
                    );
                });

        userRepository.findByEmail(email)
                .filter(existingUser ->
                        !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Email already exists"
                    );
                });

        user.setDisplayName(displayName);
        user.setEmail(email);
        user.setUsername(username);

        try {

            return userRepository.saveAndFlush(user);

        } catch (DataIntegrityViolationException exception) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username or email already exists"
            );
        }
    }

    private void validateAvatarUrl(String avatarUrl) {

        try {
            URI uri = URI.create(avatarUrl);

            String scheme = uri.getScheme();

            if (avatarUrl.length() > 2048 ||
                    uri.getHost() == null ||
                    (!"http".equalsIgnoreCase(scheme) &&
                            !"https".equalsIgnoreCase(scheme))) {

                throw new IllegalArgumentException();
            }

        } catch (IllegalArgumentException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid avatar URL"
            );
        }
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}