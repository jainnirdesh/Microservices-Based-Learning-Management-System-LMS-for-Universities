package com.unicore.assessments.model;

import java.util.ArrayList;
import java.util.List;

public class Question {
  private String prompt;
  private List<String> options = new ArrayList<>();
  private int correctOptionIndex;
  public String getPrompt() { return prompt; }
  public void setPrompt(String prompt) { this.prompt = prompt; }
  public List<String> getOptions() { return options; }
  public void setOptions(List<String> options) { this.options = options; }
  public int getCorrectOptionIndex() { return correctOptionIndex; }
  public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }
}
