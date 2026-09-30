package com.unicore.courses.repository;

import com.unicore.courses.model.Course;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {
  List<Course> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(String title, String category);
  List<Course> findByInstructorId(String instructorId);
}
