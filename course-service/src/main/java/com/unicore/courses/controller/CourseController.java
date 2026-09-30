package com.unicore.courses.controller;

import com.unicore.courses.dto.CourseDtos.CourseRequest;
import com.unicore.courses.dto.CourseDtos.EnrollmentRequest;
import com.unicore.courses.dto.CourseDtos.ProgressRequest;
import com.unicore.courses.model.Course;
import com.unicore.courses.service.CourseService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
  private final CourseService service;
  public CourseController(CourseService service) { this.service = service; }

  @GetMapping List<Course> all(@RequestParam(required = false) String q) { return service.search(q); }
  @GetMapping("/{id}") Course one(@PathVariable String id) { return service.get(id); }
  @PostMapping Course create(@Valid @RequestBody CourseRequest request) { return service.create(request); }
  @PutMapping("/{id}") Course update(@PathVariable String id, @Valid @RequestBody CourseRequest request) { return service.update(id, request); }
  @DeleteMapping("/{id}") void delete(@PathVariable String id) { service.delete(id); }
  @PostMapping("/{id}/enroll") Course enroll(@PathVariable String id, @Valid @RequestBody EnrollmentRequest request) { return service.enroll(id, request); }
  @PatchMapping("/{id}/progress/{studentId}") Course progress(@PathVariable String id, @PathVariable String studentId, @RequestBody ProgressRequest request) { return service.progress(id, studentId, request); }
  @GetMapping("/instructor/{instructorId}") List<Course> byInstructor(@PathVariable String instructorId) { return service.byInstructor(instructorId); }
  @GetMapping("/stats") Map<String, Object> stats() { return service.stats(); }
}
