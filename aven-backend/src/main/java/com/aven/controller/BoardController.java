package com.aven.controller;

import com.aven.entity.Board;
import com.aven.service.BoardService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public List<Board> getAllBoards() {

        return boardService.getAllBoards();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(
            @PathVariable Long id) {

        return boardService.getBoardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Board> getBoardsByUser(
            @PathVariable Long userId) {

        return boardService.getBoardsByUser(userId);
    }

    @PostMapping
    public ResponseEntity<Board> createBoard(
            @RequestBody Board request,
            Authentication authentication) {

        Board board = boardService.createBoard(
                authentication.getName(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(board);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(
            @PathVariable Long id,
            @RequestBody Board request,
            Authentication authentication) {

        Board board = boardService.updateBoard(
                authentication.getName(),
                id,
                request
        );

        return ResponseEntity.ok(board);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Long id,
            Authentication authentication) {

        boardService.deleteBoard(
                authentication.getName(),
                id
        );

        return ResponseEntity.noContent().build();
    }
}