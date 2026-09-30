package com.unicore.users.service;

import com.unicore.users.dto.AuthDtos.UpdateUserRequest;
import com.unicore.users.dto.AuthDtos.UserResponse;
import com.unicore.users.exception.ApiException;
import com.unicore.users.model.User;
import com.unicore.users.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserManagementService {
  private final UserRepository users;
  private final AuthService auth;

  public UserManagementService(UserRepository users, AuthService auth) {
    this.users = users;
    this.auth = auth;
  }

  public List<UserResponse> all() {
    return users.findAll().stream().map(auth::toResponse).toList();
  }

  public UserResponse update(String id, UpdateUserRequest request) {
    User user = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    if (request.fullName() != null) user.setFullName(request.fullName());
    if (request.role() != null) user.setRole(request.role());
    if (request.active() != null) user.setActive(request.active());
    return auth.toResponse(users.save(user));
  }
}
