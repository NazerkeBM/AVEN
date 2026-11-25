package com.aven.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "board_images")
public class BoardImage {

    @EmbeddedId
    private BoardImageId id;

    @ManyToOne
    @MapsId("boardId")
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne
    @MapsId("imageId")
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    public BoardImage() {
    }
    public BoardImageId getId() {
        return id;
    }
    public void setId(BoardImageId id) {
        this.id = id;
    }
    public Board getBoard() {
        return board;
    }
    public void setBoard(Board board) {
        this.board = board;
    }
    public Image getImage() {
        return image;
    }
    public void setImage(Image image) {
        this.image = image;
    }
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}