package com.unicore.assessments.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class) ResponseEntity<Map<String, Object>> api(ApiException ex) {
    return ResponseEntity.status(ex.getStatus()).body(Map.of("timestamp", Instant.now().toString(), "status", ex.getStatus().value(), "error", ex.getMessage()));
  }
  @ExceptionHandler(Exception.class) ResponseEntity<Map<String, Object>> fallback(Exception ex) {
    return ResponseEntity.internalServerError().body(Map.of("timestamp", Instant.now().toString(), "status", 500, "error", ex.getMessage()));
  }
}
