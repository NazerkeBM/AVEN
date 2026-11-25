package com.aven.service;

import com.aven.entity.Board;
import com.aven.entity.User;
import com.aven.repository.BoardRepository;
import com.aven.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public BoardService(
            BoardRepository boardRepository,
            UserRepository userRepository) {

        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
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

    private User getCurrentUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authentication required"
                        )
                );
    }

    public Board getOwnedBoard(Long boardId, String username) {

        User currentUser = getCurrentUser(username);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Collection not found"
                        )
                );

        if (!board.getUser().getId().equals(currentUser.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not own this collection"
            );
        }

        return board;
    }

    private String validateName(String name) {

        if (name == null || name.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Collection name is required"
            );
        }

        String normalizedName = name.strip();

        if (normalizedName.length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Collection name must not exceed 100 characters"
            );
        }

        return normalizedName;
    }

    @Transactional
    public Board createBoard(String username, Board request) {

        User currentUser = getCurrentUser(username);

        Board board = new Board();

        board.setName(validateName(request.getName()));
        board.setDescription(request.getDescription());
        board.setCoverImageUrl(request.getCoverImageUrl());
        board.setUser(currentUser);
        board.setCreatedAt(LocalDateTime.now());

        return boardRepository.save(board);
    }

    @Transactional
    public Board updateBoard(
            String username,
            Long boardId,
            Board request) {

        Board board = getOwnedBoard(boardId, username);

        board.setName(validateName(request.getName()));
        board.setDescription(request.getDescription());
        board.setCoverImageUrl(request.getCoverImageUrl());

        return boardRepository.save(board);
    }

    @Transactional
    public void deleteBoard(String username, Long boardId) {

        Board board = getOwnedBoard(boardId, username);

        boardRepository.delete(board);
    }
}