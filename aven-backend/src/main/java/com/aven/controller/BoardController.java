package com.aven.controller;

import com.aven.entity.Board;
import com.aven.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<Board> getBoardById(@PathVariable Long id) {
        return boardService.getBoardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Board> getBoardsByUser(@PathVariable Long userId) {
        return boardService.getBoardsByUser(userId);
    }

    @PostMapping
    public Board createBoard(@RequestBody Board board) {
        return boardService.createBoard(board);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        if (boardService.getBoardById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}