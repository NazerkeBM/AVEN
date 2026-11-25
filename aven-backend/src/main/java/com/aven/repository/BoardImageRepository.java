package com.aven.repository;

import com.aven.entity.BoardImage;
import com.aven.entity.BoardImageId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardImageRepository extends JpaRepository<BoardImage, BoardImageId> {

    List<BoardImage> findByBoardId(Long boardId);

    List<BoardImage> findByImageId(Long imageId);

}