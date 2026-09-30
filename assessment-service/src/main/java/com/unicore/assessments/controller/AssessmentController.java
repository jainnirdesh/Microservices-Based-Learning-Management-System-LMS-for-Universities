package com.unicore.assessments.controller;

import com.unicore.assessments.dto.AssessmentDtos.AssessmentRequest;
import com.unicore.assessments.dto.AssessmentDtos.SubmitRequest;
import com.unicore.assessments.model.Assessment;
import com.unicore.assessments.model.AssessmentResult;
import com.unicore.assessments.service.AssessmentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AssessmentController {
  private final AssessmentService service;
  public AssessmentController(AssessmentService service) { this.service = service; }

  @GetMapping("/assessments") List<Assessment> all(@RequestParam(required = false) String courseId) { return service.all(courseId); }
  @GetMapping("/assessments/{id}") Assessment one(@PathVariable String id) { return service.get(id); }
  @PostMapping("/assessments") Assessment create(@Valid @RequestBody AssessmentRequest request) { return service.create(request); }
  @PutMapping("/assessments/{id}") Assessment update(@PathVariable String id, @Valid @RequestBody AssessmentRequest request) { return service.update(id, request); }
  @DeleteMapping("/assessments/{id}") void delete(@PathVariable String id) { service.delete(id); }
  @PostMapping("/assessments/{id}/submit") AssessmentResult submit(@PathVariable String id, @Valid @RequestBody SubmitRequest request) { return service.submit(id, request); }
  @GetMapping("/assessments/instructor/{instructorId}") List<Assessment> byInstructor(@PathVariable String instructorId) { return service.byInstructor(instructorId); }
  @GetMapping("/assessments/stats") Map<String, Object> stats() { return service.stats(); }
  @GetMapping("/results/student/{studentId}") List<AssessmentResult> byStudent(@PathVariable String studentId) { return service.byStudent(studentId); }
  @GetMapping("/results/assessment/{assessmentId}") List<AssessmentResult> byAssessment(@PathVariable String assessmentId) { return service.byAssessment(assessmentId); }
}
