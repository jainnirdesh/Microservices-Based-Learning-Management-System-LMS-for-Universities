package com.unicore.courses.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("courses")
public class Course {
  @Id private String id;
  private String title;
  private String description;
  private String category;
  private String level;
  private String instructorId;
  private String instructorName;
  private List<CourseModule> modules = new ArrayList<>();
  private List<Enrollment> enrollments = new ArrayList<>();
  private Instant createdAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public String getCategory() { return category; }
  public void setCategory(String category) { this.category = category; }
  public String getLevel() { return level; }
  public void setLevel(String level) { this.level = level; }
  public String getInstructorId() { return instructorId; }
  public void setInstructorId(String instructorId) { this.instructorId = instructorId; }
  public String getInstructorName() { return instructorName; }
  public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
  public List<CourseModule> getModules() { return modules; }
  public void setModules(List<CourseModule> modules) { this.modules = modules; }
  public List<Enrollment> getEnrollments() { return enrollments; }
  public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
