package com.aven.service;

import com.aven.entity.Board;
import com.aven.entity.BoardImage;
import com.aven.entity.BoardImageId;
import com.aven.entity.Image;

import com.aven.repository.BoardImageRepository;
import com.aven.repository.ImageRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BoardImageService {

    private final BoardImageRepository boardImageRepository;
    private final ImageRepository imageRepository;
    private final BoardService boardService;

    public BoardImageService(
            BoardImageRepository boardImageRepository,
            ImageRepository imageRepository,
            BoardService boardService) {

        this.boardImageRepository = boardImageRepository;
        this.imageRepository = imageRepository;
        this.boardService = boardService;
    }

    public List<BoardImage> getImagesByBoard(Long boardId) {

        boardService.getBoardById(boardId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Collection not found"
                        )
                );

        return boardImageRepository.findByBoardId(boardId);
    }

    public List<BoardImage> getBoardsForImage(
            Long imageId,
            String username) {

        return boardImageRepository.findByImageId(imageId)
                .stream()
                .filter(boardImage ->
                        boardImage.getBoard()
                                .getUser()
                                .getUsername()
                                .equals(username)
                )
                .toList();
    }

    public Optional<BoardImage> getBoardImageById(
            BoardImageId id) {

        return boardImageRepository.findById(id);
    }

    @Transactional
    public BoardImage addImageToBoard(
            String username,
            Long boardId,
            Long imageId) {

        Board board = boardService.getOwnedBoard(
                boardId,
                username
        );

        Image image = imageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Publication not found"
                        )
                );

        BoardImageId id = new BoardImageId(
                boardId,
                imageId
        );

        Optional<BoardImage> existing =
                boardImageRepository.findById(id);

        if (existing.isPresent()) {
            return existing.get();
        }

        BoardImage boardImage = new BoardImage();

        boardImage.setId(id);
        boardImage.setBoard(board);
        boardImage.setImage(image);
        boardImage.setAddedAt(LocalDateTime.now());

        return boardImageRepository.save(boardImage);
    }

    @Transactional
    public void removeImageFromBoard(
            String username,
            Long boardId,
            Long imageId) {

        boardService.getOwnedBoard(boardId, username);

        BoardImageId id = new BoardImageId(
                boardId,
                imageId
        );

        if (boardImageRepository.existsById(id)) {

            boardImageRepository.deleteById(id);
        }
    }
}