package com.aven.controller;

import com.aven.entity.BoardImage;
import com.aven.entity.BoardImageId;
import com.aven.service.BoardImageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/board-images")
public class BoardImageController {

    private final BoardImageService boardImageService;

    public BoardImageController(
            BoardImageService boardImageService) {

        this.boardImageService = boardImageService;
    }

    @GetMapping("/board/{boardId}")
    public List<BoardImage> getImagesByBoard(
            @PathVariable Long boardId) {

        return boardImageService.getImagesByBoard(boardId);
    }

    @GetMapping("/image/{imageId}")
    public List<BoardImage> getBoardsForImage(
            @PathVariable Long imageId,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return boardImageService.getBoardsForImage(
                imageId,
                authentication.getName()
        );
    }

    @GetMapping("/{boardId}/{imageId}")
    public ResponseEntity<BoardImage> getBoardImageById(
            @PathVariable Long boardId,
            @PathVariable Long imageId) {

        BoardImageId id = new BoardImageId(
                boardId,
                imageId
        );

        return boardImageService.getBoardImageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{boardId}/{imageId}")
    public ResponseEntity<BoardImage> addImageToBoard(
            @PathVariable Long boardId,
            @PathVariable Long imageId,
            Authentication authentication) {

        BoardImage boardImage =
                boardImageService.addImageToBoard(
                        authentication.getName(),
                        boardId,
                        imageId
                );

        return ResponseEntity.ok(boardImage);
    }

    @DeleteMapping("/{boardId}/{imageId}")
    public ResponseEntity<Void> removeImageFromBoard(
            @PathVariable Long boardId,
            @PathVariable Long imageId,
            Authentication authentication) {

        boardImageService.removeImageFromBoard(
                authentication.getName(),
                boardId,
                imageId
        );

        return ResponseEntity.noContent().build();
    }
}