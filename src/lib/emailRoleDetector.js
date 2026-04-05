/**
 * Detect user role and school from university email domain
 * @krmu.edu.in → student
 * @krmangalam.edu.in → teacher/faculty
 */

export const emailDomainConfig = {
  student: '@krmu.edu.in',
  teacher: '@krmangalam.edu.in',
};

const privilegedEmailRules = {
  college_admin: ['admin@krmangalam.edu.in'],
  // Example pattern-based IDs for coordinators can be added here.
  // Keep exact emails to avoid accidental elevation.
  school_coordinator: [
    'coordinator.engg@krmangalam.edu.in',
    'coordinator.mgmt@krmangalam.edu.in',
  ],
};

export const detectRoleFromEmail = (email) => {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();

  if (privilegedEmailRules.college_admin.includes(normalizedEmail)) {
    return 'college_admin';
  }

  if (privilegedEmailRules.school_coordinator.includes(normalizedEmail)) {
    return 'school_coordinator';
  }
  
  if (normalizedEmail.endsWith(emailDomainConfig.student)) {
    return 'student';
  }
  if (normalizedEmail.endsWith(emailDomainConfig.teacher)) {
    return 'teacher';
  }
  
  return null;
};

export const isValidUniversityEmail = (email) => {
  const normalizedEmail = (email || '').trim().toLowerCase();

  return (
    normalizedEmail.endsWith(emailDomainConfig.student) ||
    normalizedEmail.endsWith(emailDomainConfig.teacher)
  );
};

export const extractStudentIdFromEmail = (email) => {
  // From 2301420025@krmu.edu.in → Extract 2301420025
  const match = email.match(/^([0-9]+)@/);
  return match ? match[1] : null;
};

/**
 * Map student ID first 2 digits to school ID
 * 23XXXX → School 1
 * Can be customized based on your university's convention
 */
export const mapStudentIdToSchool = (studentId) => {
  if (!studentId || studentId.length < 2) return 1; // Default to School 1
  
  const prefix = parseInt(studentId.slice(0, 2), 10);
  // Simple mapping: 23→1, 24→2, etc. Adjust as needed
  const schoolId = (prefix - 23) % 12 + 1;
  return Math.min(Math.max(schoolId, 1), 12); // Ensure 1-12 range
};

export const getRoleDetectionMessage = (role) => {
  const messages = {
    student: '✓ Student account detected (@krmu.edu.in)',
    teacher: '✓ Faculty account detected (@krmangalam.edu.in)',
    school_coordinator: '✓ School coordinator account detected',
    college_admin: '✓ College admin account detected',
    null: '✗ Invalid email domain. Use @krmu.edu.in or @krmangalam.edu.in',
  };
  return messages[role] || messages.null;
};
