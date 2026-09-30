package com.unicore.users.controller;

import com.unicore.users.dto.AuthDtos.UpdateUserRequest;
import com.unicore.users.dto.AuthDtos.UserResponse;
import com.unicore.users.model.Role;
import com.unicore.users.repository.UserRepository;
import com.unicore.users.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserManagementService service;
  private final UserRepository users;

  public UserController(UserManagementService service, UserRepository users) {
    this.service = service;
    this.users = users;
  }

  @GetMapping
  List<UserResponse> all() { return service.all(); }

  @PatchMapping("/{id}")
  UserResponse update(@PathVariable String id, @Valid @RequestBody UpdateUserRequest request) {
    return service.update(id, request);
  }

  @GetMapping("/stats")
  Map<String, Long> stats() {
    List<UserResponse> all = service.all();
    return Map.of(
        "totalUsers", (long) all.size(),
        "students", all.stream().filter(u -> u.role() == Role.STUDENT).count(),
        "instructors", all.stream().filter(u -> u.role() == Role.INSTRUCTOR).count(),
        "admins", all.stream().filter(u -> u.role() == Role.ADMIN).count(),
        "activeUsers", users.findAll().stream().filter(u -> u.isActive()).count());
  }
}
