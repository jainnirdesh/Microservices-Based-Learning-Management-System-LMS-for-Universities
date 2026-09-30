package com.unicore.notifications.service;

import com.unicore.notifications.dto.NotificationDtos.NotificationEvent;
import com.unicore.notifications.model.Notification;
import com.unicore.notifications.repository.NotificationRepository;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private final NotificationRepository notifications;
  public NotificationService(NotificationRepository notifications) { this.notifications = notifications; }

  public Notification create(NotificationEvent event) {
    Notification n = new Notification();
    n.setUserId(event.userId()); n.setType(event.type()); n.setTitle(event.title()); n.setMessage(event.message());
    return notifications.save(n);
  }
  public List<Notification> byUser(String userId) { return notifications.findByUserIdOrderByCreatedAtDesc(userId); }
  public Notification markRead(String id) {
    Notification n = notifications.findById(id).orElseThrow();
    n.setRead(true);
    return notifications.save(n);
  }
  public Map<String, Object> stats(String userId) {
    List<Notification> all = byUser(userId);
    return Map.of("total", all.size(), "unread", all.stream().filter(n -> !n.isRead()).count());
  }
}
