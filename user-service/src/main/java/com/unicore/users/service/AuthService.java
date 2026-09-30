package com.unicore.users.service;

import com.unicore.users.dto.AuthDtos.AuthResponse;
import com.unicore.users.dto.AuthDtos.LoginRequest;
import com.unicore.users.dto.AuthDtos.RegisterRequest;
import com.unicore.users.dto.AuthDtos.UserResponse;
import com.unicore.users.exception.ApiException;
import com.unicore.users.model.User;
import com.unicore.users.repository.UserRepository;
import com.unicore.users.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
    this.users = users;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  public AuthResponse register(RegisterRequest request) {
    if (users.existsByEmailIgnoreCase(request.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
    }
    User user = new User();
    user.setFullName(request.fullName());
    user.setEmail(request.email().toLowerCase());
    user.setPasswordHash(encoder.encode(request.password()));
    user.setRole(request.role());
    User saved = users.save(user);
    return new AuthResponse(jwt.token(saved), toResponse(saved));
  }

  public AuthResponse login(LoginRequest request) {
    User user = users.findByEmailIgnoreCase(request.email())
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    if (!user.isActive() || !encoder.matches(request.password(), user.getPasswordHash())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    return new AuthResponse(jwt.token(user), toResponse(user));
  }

  public UserResponse toResponse(User user) {
    return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.isActive());
  }
}
