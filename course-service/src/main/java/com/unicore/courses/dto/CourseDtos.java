package com.unicore.courses.dto;

import com.unicore.courses.model.CourseModule;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CourseDtos {
  public record CourseRequest(@NotBlank String title, @NotBlank String description, @NotBlank String category,
      String level, String instructorId, String instructorName, List<CourseModule> modules) {}
  public record EnrollmentRequest(@NotBlank String studentId, @NotBlank String studentName) {}
  public record ProgressRequest(int progress) {}
}
