package com.unicore.assessments.model;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("assessment_results")
public class AssessmentResult {
  @Id private String id;
  private String assessmentId;
  private String courseId;
  private String studentId;
  private String studentName;
  private Map<Integer, Integer> answers;
  private int correctAnswers;
  private int totalQuestions;
  private double scorePercent;
  private Instant submittedAt = Instant.now();
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getAssessmentId() { return assessmentId; }
  public void setAssessmentId(String assessmentId) { this.assessmentId = assessmentId; }
  public String getCourseId() { return courseId; }
  public void setCourseId(String courseId) { this.courseId = courseId; }
  public String getStudentId() { return studentId; }
  public void setStudentId(String studentId) { this.studentId = studentId; }
  public String getStudentName() { return studentName; }
  public void setStudentName(String studentName) { this.studentName = studentName; }
  public Map<Integer, Integer> getAnswers() { return answers; }
  public void setAnswers(Map<Integer, Integer> answers) { this.answers = answers; }
  public int getCorrectAnswers() { return correctAnswers; }
  public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
  public int getTotalQuestions() { return totalQuestions; }
  public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
  public double getScorePercent() { return scorePercent; }
  public void setScorePercent(double scorePercent) { this.scorePercent = scorePercent; }
  public Instant getSubmittedAt() { return submittedAt; }
  public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
}
