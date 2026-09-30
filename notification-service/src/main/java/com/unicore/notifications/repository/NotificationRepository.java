package com.unicore.notifications.repository;

import com.unicore.notifications.model.Notification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
  List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
}
