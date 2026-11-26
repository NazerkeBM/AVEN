package com.aven.repository;

import com.aven.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(
            Long recipientId
    );

    long countByRecipientIdAndReadFalse(
            Long recipientId
    );

    Optional<Notification> findByIdAndRecipientId(
            Long id,
            Long recipientId
    );

    @Modifying
    @Query("""
        UPDATE Notification n
        SET n.read = true
        WHERE n.recipientId = :recipientId
        AND n.read = false
        """)
    int markAllAsRead(
            @Param("recipientId") Long recipientId
    );
}