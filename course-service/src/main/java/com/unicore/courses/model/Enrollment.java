package com.unicore.courses.model;

import java.time.Instant;

public class Enrollment {
  private String studentId;
  private String studentName;
  private int progress;
  private Instant enrolledAt = Instant.now();
  public String getStudentId() { return studentId; }
  public void setStudentId(String studentId) { this.studentId = studentId; }
  public String getStudentName() { return studentName; }
  public void setStudentName(String studentName) { this.studentName = studentName; }
  public int getProgress() { return progress; }
  public void setProgress(int progress) { this.progress = progress; }
  public Instant getEnrolledAt() { return enrolledAt; }
  public void setEnrolledAt(Instant enrolledAt) { this.enrolledAt = enrolledAt; }
}
