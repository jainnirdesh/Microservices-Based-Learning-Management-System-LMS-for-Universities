package com.unicore.notifications.dto;

import jakarta.validation.constraints.NotBlank;

public class NotificationDtos {
  public record NotificationEvent(@NotBlank String userId, @NotBlank String type, @NotBlank String title, @NotBlank String message) {}
}
