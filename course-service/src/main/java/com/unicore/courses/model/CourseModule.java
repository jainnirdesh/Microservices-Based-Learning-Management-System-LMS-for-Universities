package com.unicore.courses.model;

import java.util.ArrayList;
import java.util.List;

public class CourseModule {
  private String title;
  private String summary;
  private List<Lesson> lessons = new ArrayList<>();
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getSummary() { return summary; }
  public void setSummary(String summary) { this.summary = summary; }
  public List<Lesson> getLessons() { return lessons; }
  public void setLessons(List<Lesson> lessons) { this.lessons = lessons; }
}
