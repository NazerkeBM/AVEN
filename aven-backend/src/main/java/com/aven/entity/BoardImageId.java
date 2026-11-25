package com.aven.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BoardImageId implements Serializable {

    private Long boardId;
    private Long imageId;

    public BoardImageId() {
    }
    public BoardImageId(Long boardId, Long imageId) {
        this.boardId = boardId;
        this.imageId = imageId;
    }
    public Long getBoardId() {
        return boardId;
    }
    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }
    public Long getImageId() {
        return imageId;
    }
    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BoardImageId)) return false;
        BoardImageId that = (BoardImageId) o;
        return Objects.equals(boardId, that.boardId)
                && Objects.equals(imageId, that.imageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(boardId, imageId);
    }
}