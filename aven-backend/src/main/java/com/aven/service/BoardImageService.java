package com.aven.service;

import com.aven.entity.BoardImage;
import com.aven.entity.BoardImageId;
import com.aven.repository.BoardImageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoardImageService {

    private final BoardImageRepository boardImageRepository;

    public BoardImageService(BoardImageRepository boardImageRepository) {
        this.boardImageRepository = boardImageRepository;
    }
    public List<BoardImage> getImagesByBoard(Long boardId) {
        return boardImageRepository.findByBoardId(boardId);
    }
    public List<BoardImage> getBoardsForImage(Long imageId) {
        return boardImageRepository.findByImageId(imageId);
    }
    public Optional<BoardImage> getBoardImageById(BoardImageId id) {
        return boardImageRepository.findById(id);
    }
    public BoardImage addImageToBoard(BoardImage boardImage) {
        return boardImageRepository.save(boardImage);
    }
    public void removeImageFromBoard(BoardImageId id) {
        boardImageRepository.deleteById(id);
    }
}