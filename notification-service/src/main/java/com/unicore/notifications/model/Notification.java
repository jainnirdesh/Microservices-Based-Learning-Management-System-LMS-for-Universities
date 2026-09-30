package com.unicore.notifications.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("notifications")
public class Notification {
  @Id private String id;
  private String userId;
  private String type;
  private String title;
  private String message;
  private boolean read;
  private Instant createdAt = Instant.now();
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
  public boolean isRead() { return read; }
  public void setRead(boolean read) { this.read = read; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
