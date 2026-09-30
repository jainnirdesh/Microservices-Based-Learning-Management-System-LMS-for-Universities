package com.unicore.assessments.repository;

import com.unicore.assessments.model.Assessment;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AssessmentRepository extends MongoRepository<Assessment, String> {
  List<Assessment> findByCourseId(String courseId);
  List<Assessment> findByInstructorId(String instructorId);
}
