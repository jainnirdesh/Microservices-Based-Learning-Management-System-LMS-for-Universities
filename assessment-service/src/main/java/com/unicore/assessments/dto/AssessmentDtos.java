package com.unicore.assessments.dto;

import com.unicore.assessments.model.Question;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

public class AssessmentDtos {
  public record AssessmentRequest(@NotBlank String courseId, @NotBlank String title, String instructorId, List<Question> questions) {}
  public record SubmitRequest(@NotBlank String studentId, @NotBlank String studentName, Map<Integer, Integer> answers) {}
}
