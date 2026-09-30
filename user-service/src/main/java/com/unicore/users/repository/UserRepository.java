package com.unicore.users.repository;

import com.unicore.users.model.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
  Optional<User> findByEmailIgnoreCase(String email);
  boolean existsByEmailIgnoreCase(String email);
}
