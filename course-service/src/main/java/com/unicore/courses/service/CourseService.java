package com.unicore.courses.service;

import com.unicore.courses.dto.CourseDtos.CourseRequest;
import com.unicore.courses.dto.CourseDtos.EnrollmentRequest;
import com.unicore.courses.dto.CourseDtos.ProgressRequest;
import com.unicore.courses.exception.ApiException;
import com.unicore.courses.model.Course;
import com.unicore.courses.model.Enrollment;
import com.unicore.courses.repository.CourseRepository;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CourseService {
  private final CourseRepository courses;
  private final RestTemplate rest;
  private final String notificationUrl;

  public CourseService(CourseRepository courses, RestTemplate rest, @Value("${services.notification-url}") String notificationUrl) {
    this.courses = courses; this.rest = rest; this.notificationUrl = notificationUrl;
  }

  public List<Course> search(String q) {
    return q == null || q.isBlank() ? courses.findAll() : courses.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(q, q);
  }
  public Course get(String id) { return courses.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found")); }
  public Course create(CourseRequest r) { Course c = new Course(); apply(c, r); return courses.save(c); }
  public Course update(String id, CourseRequest r) { Course c = get(id); apply(c, r); return courses.save(c); }
  public void delete(String id) { courses.delete(get(id)); }
  public List<Course> byInstructor(String instructorId) { return courses.findByInstructorId(instructorId); }

  public Course enroll(String id, EnrollmentRequest r) {
    Course c = get(id);
    boolean exists = c.getEnrollments().stream().anyMatch(e -> e.getStudentId().equals(r.studentId()));
    if (!exists) {
      Enrollment e = new Enrollment();
      e.setStudentId(r.studentId()); e.setStudentName(r.studentName());
      c.getEnrollments().add(e);
      notify(r.studentId(), "COURSE_ENROLLMENT", "Enrollment confirmed", "You enrolled in " + c.getTitle());
    }
    return courses.save(c);
  }

  public Course progress(String id, String studentId, ProgressRequest r) {
    Course c = get(id);
    c.getEnrollments().stream().filter(e -> e.getStudentId().equals(studentId)).findFirst()
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Enrollment not found"))
        .setProgress(Math.max(0, Math.min(100, r.progress())));
    return courses.save(c);
  }

  public Map<String, Object> stats() {
    List<Course> all = courses.findAll();
    long enrollments = all.stream().mapToLong(c -> c.getEnrollments().size()).sum();
    return Map.of("totalCourses", all.size(), "enrollments", enrollments,
        "completedCourses", all.stream().flatMap(c -> c.getEnrollments().stream()).filter(e -> e.getProgress() >= 100).count());
  }

  private void apply(Course c, CourseRequest r) {
    c.setTitle(r.title()); c.setDescription(r.description()); c.setCategory(r.category());
    c.setLevel(r.level() == null ? "Beginner" : r.level());
    c.setInstructorId(r.instructorId()); c.setInstructorName(r.instructorName());
    if (r.modules() != null) c.setModules(r.modules());
  }

  private void notify(String userId, String type, String title, String message) {
    try { rest.postForObject(notificationUrl + "/api/notifications/events", Map.of("userId", userId, "type", type, "title", title, "message", message), Object.class); }
    catch (RuntimeException ignored) { }
  }
}
