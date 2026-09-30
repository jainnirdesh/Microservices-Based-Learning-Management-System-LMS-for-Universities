package com.unicore.assessments.service;

import com.unicore.assessments.dto.AssessmentDtos.AssessmentRequest;
import com.unicore.assessments.dto.AssessmentDtos.SubmitRequest;
import com.unicore.assessments.exception.ApiException;
import com.unicore.assessments.model.Assessment;
import com.unicore.assessments.model.AssessmentResult;
import com.unicore.assessments.repository.AssessmentRepository;
import com.unicore.assessments.repository.AssessmentResultRepository;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AssessmentService {
  private final AssessmentRepository assessments;
  private final AssessmentResultRepository results;
  private final RestTemplate rest;
  private final String notificationUrl;

  public AssessmentService(AssessmentRepository assessments, AssessmentResultRepository results, RestTemplate rest,
      @Value("${services.notification-url}") String notificationUrl) {
    this.assessments = assessments; this.results = results; this.rest = rest; this.notificationUrl = notificationUrl;
  }

  public List<Assessment> all(String courseId) { return courseId == null ? assessments.findAll() : assessments.findByCourseId(courseId); }
  public Assessment get(String id) { return assessments.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Assessment not found")); }
  public Assessment create(AssessmentRequest r) { Assessment a = new Assessment(); apply(a, r); return assessments.save(a); }
  public Assessment update(String id, AssessmentRequest r) { Assessment a = get(id); apply(a, r); return assessments.save(a); }
  public void delete(String id) { assessments.delete(get(id)); }
  public List<Assessment> byInstructor(String instructorId) { return assessments.findByInstructorId(instructorId); }

  public AssessmentResult submit(String assessmentId, SubmitRequest r) {
    Assessment assessment = get(assessmentId);
    int correct = 0;
    for (int i = 0; i < assessment.getQuestions().size(); i++) {
      Integer answer = r.answers() == null ? null : r.answers().get(i);
      if (answer != null && answer == assessment.getQuestions().get(i).getCorrectOptionIndex()) correct++;
    }
    AssessmentResult result = new AssessmentResult();
    result.setAssessmentId(assessment.getId());
    result.setCourseId(assessment.getCourseId());
    result.setStudentId(r.studentId());
    result.setStudentName(r.studentName());
    result.setAnswers(r.answers());
    result.setCorrectAnswers(correct);
    result.setTotalQuestions(assessment.getQuestions().size());
    result.setScorePercent(assessment.getQuestions().isEmpty() ? 0 : (correct * 100.0 / assessment.getQuestions().size()));
    AssessmentResult saved = results.save(result);
    notify(r.studentId(), "ASSESSMENT_RESULT", "Assessment result generated", "Score: " + Math.round(saved.getScorePercent()) + "% in " + assessment.getTitle());
    return saved;
  }

  public List<AssessmentResult> byStudent(String studentId) { return results.findByStudentId(studentId); }
  public List<AssessmentResult> byAssessment(String assessmentId) { return results.findByAssessmentId(assessmentId); }

  public Map<String, Object> stats() {
    List<AssessmentResult> all = results.findAll();
    double average = all.stream().mapToDouble(AssessmentResult::getScorePercent).average().orElse(0);
    return Map.of("assessments", assessments.count(), "submissions", all.size(), "averageScore", Math.round(average));
  }

  private void apply(Assessment a, AssessmentRequest r) {
    a.setCourseId(r.courseId()); a.setTitle(r.title()); a.setInstructorId(r.instructorId());
    if (r.questions() != null) a.setQuestions(r.questions());
  }

  private void notify(String userId, String type, String title, String message) {
    try { rest.postForObject(notificationUrl + "/api/notifications/events", Map.of("userId", userId, "type", type, "title", title, "message", message), Object.class); }
    catch (RuntimeException ignored) { }
  }
}
