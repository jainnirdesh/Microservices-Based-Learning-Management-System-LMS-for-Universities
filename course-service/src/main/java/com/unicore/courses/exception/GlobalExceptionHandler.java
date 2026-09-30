package com.unicore.courses.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class) ResponseEntity<Map<String, Object>> api(ApiException ex) {
    return ResponseEntity.status(ex.getStatus()).body(body(ex.getStatus(), ex.getMessage()));
  }
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
    return ResponseEntity.badRequest().body(body(HttpStatus.BAD_REQUEST, "Invalid course payload"));
  }
  @ExceptionHandler(Exception.class) ResponseEntity<Map<String, Object>> fallback(Exception ex) {
    return ResponseEntity.internalServerError().body(body(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()));
  }
  private Map<String, Object> body(HttpStatus status, String message) {
    return Map.of("timestamp", Instant.now().toString(), "status", status.value(), "error", message);
  }
}
