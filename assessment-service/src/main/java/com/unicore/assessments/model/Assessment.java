package com.unicore.assessments.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("assessments")
public class Assessment {
  @Id private String id;
  private String courseId;
  private String title;
  private String instructorId;
  private List<Question> questions = new ArrayList<>();
  private Instant createdAt = Instant.now();
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getCourseId() { return courseId; }
  public void setCourseId(String courseId) { this.courseId = courseId; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getInstructorId() { return instructorId; }
  public void setInstructorId(String instructorId) { this.instructorId = instructorId; }
  public List<Question> getQuestions() { return questions; }
  public void setQuestions(List<Question> questions) { this.questions = questions; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
