package com.aven.service;

import com.aven.entity.Board;
import com.aven.repository.BoardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }
    public Optional<Board> getBoardById(Long id) {
        return boardRepository.findById(id);
    }
    public List<Board> getBoardsByUser(Long userId) {
        return boardRepository.findByUserId(userId);
    }
    public Board createBoard(Board board) { board.setCreatedAt(java.time.LocalDateTime.now()); return boardRepository.save(board); }
    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
    }
}