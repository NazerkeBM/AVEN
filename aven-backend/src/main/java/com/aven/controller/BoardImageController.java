package com.aven.controller;

import com.aven.entity.BoardImage;
import com.aven.entity.BoardImageId;
import com.aven.service.BoardImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board-images")
@CrossOrigin(origins = "*")
public class BoardImageController {

    private final BoardImageService boardImageService;

    public BoardImageController(BoardImageService boardImageService) {
        this.boardImageService = boardImageService;
    }

    @GetMapping("/board/{boardId}")
    public List<BoardImage> getImagesByBoard(@PathVariable Long boardId) {
        return boardImageService.getImagesByBoard(boardId);
    }

    @GetMapping("/image/{imageId}")
    public List<BoardImage> getBoardsForImage(@PathVariable Long imageId) {
        return boardImageService.getBoardsForImage(imageId);
    }

    @GetMapping("/{boardId}/{imageId}")
    public ResponseEntity<BoardImage> getBoardImageById(
            @PathVariable Long boardId,
            @PathVariable Long imageId) {

        BoardImageId id = new BoardImageId(boardId, imageId);

        return boardImageService.getBoardImageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public BoardImage addImageToBoard(@RequestBody BoardImage boardImage) {
        return boardImageService.addImageToBoard(boardImage);
    }

    @DeleteMapping("/{boardId}/{imageId}")
    public ResponseEntity<Void> removeImageFromBoard(
            @PathVariable Long boardId,
            @PathVariable Long imageId) {

        BoardImageId id = new BoardImageId(boardId, imageId);

        if (boardImageService.getBoardImageById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boardImageService.removeImageFromBoard(id);
        return ResponseEntity.noContent().build();
    }
}