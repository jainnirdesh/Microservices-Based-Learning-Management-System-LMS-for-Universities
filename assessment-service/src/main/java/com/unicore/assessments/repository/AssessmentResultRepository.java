package com.unicore.assessments.repository;

import com.unicore.assessments.model.AssessmentResult;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AssessmentResultRepository extends MongoRepository<AssessmentResult, String> {
  List<AssessmentResult> findByStudentId(String studentId);
  List<AssessmentResult> findByAssessmentId(String assessmentId);
}
