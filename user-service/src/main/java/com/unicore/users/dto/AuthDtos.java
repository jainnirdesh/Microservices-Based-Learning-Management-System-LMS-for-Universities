package com.unicore.users.dto;

import com.unicore.users.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDtos {
  public record RegisterRequest(
      @NotBlank String fullName,
      @Email @NotBlank String email,
      @Size(min = 6) String password,
      @NotNull Role role) {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record UserResponse(String id, String fullName, String email, Role role, boolean active) {}

  public record AuthResponse(String token, UserResponse user) {}

  public record UpdateUserRequest(String fullName, Role role, Boolean active) {}
}
