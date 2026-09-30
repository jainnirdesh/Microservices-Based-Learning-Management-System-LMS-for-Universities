package com.unicore.notifications.controller;

import com.unicore.notifications.dto.NotificationDtos.NotificationEvent;
import com.unicore.notifications.model.Notification;
import com.unicore.notifications.service.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService service;
  public NotificationController(NotificationService service) { this.service = service; }
  @PostMapping("/events") Notification event(@Valid @RequestBody NotificationEvent event) { return service.create(event); }
  @GetMapping("/user/{userId}") List<Notification> byUser(@PathVariable String userId) { return service.byUser(userId); }
  @PatchMapping("/{id}/read") Notification read(@PathVariable String id) { return service.markRead(id); }
  @GetMapping("/user/{userId}/stats") Map<String, Object> stats(@PathVariable String userId) { return service.stats(userId); }
}
