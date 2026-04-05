export const stats = [
  { label: 'Students Enrolled', value: '12,480', change: '+8.2%', up: true },
  { label: 'Active Courses', value: '348', change: '+5.1%', up: true },
  { label: 'System Uptime', value: '99.97%', change: '+0.02%', up: true },
  { label: 'Submissions Today', value: '2,341', change: '-3.4%', up: false },
];

export const features = [
  {
    title: 'Microservices Architecture',
    desc: 'Independently deployable services for User, Course, Assessment, and Notification domains ensure fault isolation and horizontal scalability.',
    icon: 'Grid',
  },
  {
    title: 'API Gateway Layer',
    desc: 'Centralized gateway handles authentication, rate limiting, load balancing, and request routing across all backend services.',
    icon: 'Share2',
  },
  {
    title: 'Distributed Assessment Engine',
    desc: 'Asynchronous grading pipelines with message queues decouple submission ingestion from evaluation for high throughput.',
    icon: 'ClipboardList',
  },
  {
    title: 'Real-time Notifications',
    desc: 'WebSocket-based notification service delivers instant updates for deadlines, grades, and announcements with guaranteed delivery.',
    icon: 'Bell',
  },
  {
    title: 'Role-Based Access Control',
    desc: 'Granular permission system with JWT-based authentication separates Admin, Faculty, and Student access at the service level.',
    icon: 'Shield',
  },
  {
    title: 'Analytics & Observability',
    desc: 'Centralized logging, distributed tracing, and Prometheus-compatible metrics give full visibility into system performance.',
    icon: 'BarChart2',
  },
];

export const recentUsers = [
  { id: 'USR-001', name: 'Arjun Mehta', role: 'Student', dept: 'Computer Science', status: 'Active', joined: 'Mar 18, 2025' },
  { id: 'USR-002', name: 'Priya Sharma', role: 'Faculty', dept: 'Electronics', status: 'Active', joined: 'Mar 15, 2025' },
  { id: 'USR-003', name: 'Rahul Verma', role: 'Student', dept: 'Mechanical', status: 'Inactive', joined: 'Mar 12, 2025' },
  { id: 'USR-004', name: 'Neha Gupta', role: 'Student', dept: 'Computer Science', status: 'Active', joined: 'Mar 10, 2025' },
  { id: 'USR-005', name: 'Vikram Singh', role: 'Faculty', dept: 'Mathematics', status: 'Active', joined: 'Mar 08, 2025' },
  { id: 'USR-006', name: 'Anjali Patel', role: 'Student', dept: 'Civil', status: 'Active', joined: 'Mar 06, 2025' },
];

export const enrollmentData = [
  { month: 'Sep', students: 3200 },
  { month: 'Oct', students: 4800 },
  { month: 'Nov', students: 5100 },
  { month: 'Dec', students: 4600 },
  { month: 'Jan', students: 7200 },
  { month: 'Feb', students: 9800 },
  { month: 'Mar', students: 12480 },
];

export const serviceUsageData = [
  { name: 'User Service', requests: 42000 },
  { name: 'Course Service', requests: 38000 },
  { name: 'Assessment', requests: 28000 },
  { name: 'Notification', requests: 19000 },
  { name: 'Analytics', requests: 11000 },
];

export const facultyCourses = [
  { id: 'CS401', title: 'Distributed Systems', students: 68, submissions: 52, status: 'Active', deadline: 'Apr 2, 2025' },
  { id: 'CS305', title: 'Operating Systems', students: 74, submissions: 61, status: 'Active', deadline: 'Apr 8, 2025' },
  { id: 'CS210', title: 'Data Structures', students: 92, submissions: 85, status: 'Closed', deadline: 'Mar 20, 2025' },
];

export const submissions = [
  { student: 'Arjun Mehta', assignment: 'Microservices Design Doc', submitted: 'Mar 28', score: 88, status: 'Graded' },
  { student: 'Neha Gupta', assignment: 'Microservices Design Doc', submitted: 'Mar 27', score: null, status: 'Pending' },
  { student: 'Rahul Verma', assignment: 'Microservices Design Doc', submitted: 'Mar 29', score: 74, status: 'Graded' },
  { student: 'Anjali Patel', assignment: 'Microservices Design Doc', submitted: 'Mar 28', score: null, status: 'Pending' },
];

export const studentCourses = [
  { id: 'CS401', title: 'Distributed Systems', faculty: 'Dr. Vikram Singh', progress: 68, credits: 4, next: 'Apr 2' },
  { id: 'CS305', title: 'Operating Systems', faculty: 'Dr. Priya Sharma', progress: 45, credits: 4, next: 'Apr 5' },
  { id: 'MA201', title: 'Engineering Mathematics', faculty: 'Prof. Anjali Roy', progress: 82, credits: 3, next: 'Apr 3' },
  { id: 'CS210', title: 'Data Structures', faculty: 'Dr. Rahul Gupta', progress: 91, credits: 3, next: 'Completed' },
];

export const deadlines = [
  { course: 'CS401', task: 'Microservices Design Document', due: 'Apr 2, 2025', priority: 'High' },
  { course: 'MA201', task: 'Problem Set 6', due: 'Apr 3, 2025', priority: 'Medium' },
  { course: 'CS305', task: 'Memory Management Lab', due: 'Apr 8, 2025', priority: 'Medium' },
];

export const performanceData = [
  { subject: 'DS', score: 88 },
  { subject: 'OS', score: 74 },
  { subject: 'Math', score: 91 },
  { subject: 'DSA', score: 95 },
];

// Extended Student Data
export const courseDetails = [
  {
    id: 'CS401',
    title: 'Distributed Systems',
    faculty: 'Dr. Vikram Singh',
    credits: 4,
    semester: 'VI',
    description: 'Study of modern distributed computing systems, consensus algorithms, and microservices architecture.',
    materials: [
      { id: 1, name: 'Lecture Slides - Week 1', date: 'Mar 1, 2025', type: 'PDF', size: '2.4 MB' },
      { id: 2, name: 'Lecture Slides - Week 2', date: 'Mar 8, 2025', type: 'PDF', size: '2.1 MB' },
      { id: 3, name: 'Sample Code - RPC Implementation', date: 'Mar 2, 2025', type: 'ZIP', size: '156 KB' },
    ],
    assignments: [
      { id: 1, title: 'Design Document: Microservices', dueDate: 'Apr 2, 2025', status: 'Pending' },
      { id: 2, title: 'Implementation: Simple RPC', dueDate: 'Apr 9, 2025', status: 'Pending' },
    ],
  },
  {
    id: 'CS305',
    title: 'Operating Systems',
    faculty: 'Dr. Priya Sharma',
    credits: 4,
    semester: 'VI',
    description: 'Comprehensive study of OS concepts including processes, memory management, and concurrency.',
    materials: [
      { id: 1, name: 'OS Internals Overview', date: 'Feb 20, 2025', type: 'PDF', size: '3.2 MB' },
      { id: 2, name: 'Process Management Notes', date: 'Mar 5, 2025', type: 'PDF', size: '2.8 MB' },
    ],
    assignments: [],
  },
];

export const studentAssignments = [
  { id: 1, course: 'CS401', title: 'Microservices Design Document', dueDate: 'Apr 2, 2025', submitted: true, score: 88, feedback: 'Excellent architecture choices and clear documentation.' },
  { id: 2, course: 'CS305', title: 'Memory Management Lab', dueDate: 'Apr 5, 2025', submitted: false, daysLeft: 8, description: 'Implement memory allocation and deallocation strategies' },
  { id: 3, course: 'MA201', title: 'Problem Set 6', dueDate: 'Apr 3, 2025', submitted: false, daysLeft: 6, description: 'Complete problems 11-25 from textbook' },
];

export const studentGrades = [
  { course: 'CS401', title: 'Distributed Systems', scored: 352, total: 400, percentage: 88, grade: 'A', status: 'Final' },
  { course: 'CS305', title: 'Operating Systems', scored: 295, total: 400, percentage: 73.75, grade: 'B', status: 'Mid-semester' },
  { course: 'MA201', title: 'Engineering Mathematics', scored: 368, total: 400, percentage: 92, grade: 'A+', status: 'Final' },
  { course: 'CS210', title: 'Data Structures', scored: 391, total: 400, percentage: 97.75, grade: 'A+', status: 'Final' },
];

export const studentNotifications = [
  { id: 1, type: 'grade', title: 'Assignment Graded', message: 'Microservices Design Document has been graded (88/100)', time: '2h ago', read: false },
  { id: 2, type: 'deadline', title: 'Deadline Reminder', message: 'Memory Management Lab due in 8 days', time: '5h ago', read: false },
  { id: 3, type: 'announcement', title: 'New Announcement', message: 'CS401 lecture rescheduled to Friday 2 PM', time: '1d ago', read: false },
  { id: 4, type: 'announcement', title: 'Course Update', message: 'New materials added to CS305', time: '2d ago', read: true },
];

// Faculty Data
export const allStudents = [
  { id: 'USR-001', name: 'Arjun Mehta', email: 'arjun.mehta@uni.edu', courses: 4, avgScore: 88, status: 'Active' },
  { id: 'USR-003', name: 'Rahul Verma', email: 'rahul.verma@uni.edu', courses: 4, avgScore: 76, status: 'Active' },
  { id: 'USR-004', name: 'Neha Gupta', email: 'neha.gupta@uni.edu', courses: 4, avgScore: 85, status: 'Active' },
  { id: 'USR-007', name: 'Anjali Patel', email: 'anjali.patel@uni.edu', courses: 3, avgScore: 92, status: 'Active' },
  { id: 'USR-008', name: 'Rohan Singh', email: 'rohan.singh@uni.edu', courses: 4, avgScore: 79, status: 'Active' },
];

export const allCourses = [
  { id: 'CS401', title: 'Distributed Systems', semester: 'VI', students: 68, avgScore: 81.5, status: 'Active' },
  { id: 'CS305', title: 'Operating Systems', semester: 'VI', students: 74, avgScore: 78.2, status: 'Active' },
  { id: 'CS210', title: 'Data Structures', semester: 'IV', students: 92, avgScore: 85.3, status: 'Closed' },
  { id: 'CS102', title: 'Programming Fundamentals', semester: 'II', students: 156, avgScore: 80.1, status: 'Active' },
];

export const assignmentSubmissions = [
  { id: 1, student: 'Arjun Mehta', assignment: 'Design Document', submissionDate: 'Mar 28', score: 88, feedback: 'Great work', status: 'Graded' },
  { id: 2, student: 'Neha Gupta', assignment: 'Design Document', submissionDate: 'Mar 27', score: null, feedback: '', status: 'Pending' },
  { id: 3, student: 'Rahul Verma', assignment: 'Design Document', submissionDate: 'Mar 29', score: 74, feedback: 'Needs improvement in architecture', status: 'Graded' },
  { id: 4, student: 'Anjali Patel', assignment: 'Design Document', submissionDate: 'Mar 28', score: 95, feedback: 'Excellent', status: 'Graded' },
];

export const courseAssignments = [
  { id: 1, title: 'Microservices Design Document', course: 'CS401', dueDate: 'Apr 2, 2025', submitted: 4, total: 6, status: 'Active' },
  { id: 2, title: 'RPC Implementation', course: 'CS401', dueDate: 'Apr 9, 2025', submitted: 0, total: 6, status: 'Draft' },
];

// Admin Data
export const allUsers = [
  ...recentUsers,
  { id: 'USR-007', name: 'Rohan Singh', role: 'Student', dept: 'Electrical', status: 'Active', joined: 'Mar 05, 2025' },
  { id: 'USR-008', name: 'Kavya Iyer', role: 'Faculty', dept: 'Civil', status: 'Active', joined: 'Mar 04, 2025' },
  { id: 'USR-009', name: 'Amit Kumar', role: 'Student', dept: 'Computer Science', status: 'Inactive', joined: 'Mar 03, 2025' },
];

export const adminCourses = [
  ...allCourses,
  { id: 'CS501', title: 'Advanced Networks', semester: 'VIII', students: 45, avgScore: 82.5, status: 'Active' },
  { id: 'EE201', title: 'Circuit Analysis', semester: 'III', students: 78, avgScore: 76.8, status: 'Active' },
];

export const systemHealth = [
  { service: 'User Service', uptime: 99.98, responseTime: 45, lastCheck: 'now' },
  { service: 'Course Service', uptime: 99.92, responseTime: 52, lastCheck: 'now' },
  { service: 'Assessment Service', uptime: 99.99, responseTime: 38, lastCheck: 'now' },
  { service: 'Notification Service', uptime: 99.85, responseTime: 125, lastCheck: '1m ago' },
];

// Calendar Events & Schedule
export const calendarEvents = [
  { id: 1, title: 'CS401 Lecture', course: 'CS401', date: 'Apr 2, 2025', time: '10:00 AM', type: 'class', location: 'Room 105' },
  { id: 2, title: 'Microservices Design Document Due', course: 'CS401', date: 'Apr 2, 2025', time: '11:59 PM', type: 'deadline', priority: 'high' },
  { id: 3, title: 'Memory Management Lab', course: 'CS305', date: 'Apr 5, 2025', time: '11:59 PM', type: 'deadline', priority: 'high' },
  { id: 4, title: 'Problem Set 6 Due', course: 'MA201', date: 'Apr 3, 2025', time: '11:59 PM', type: 'deadline', priority: 'medium' },
  { id: 5, title: 'Midterm Exam', course: 'CS401', date: 'Apr 15, 2025', time: '2:00 PM', type: 'exam', location: 'Exam Hall A' },
];

export const weeklySchedule = [
  { day: 'Monday', classes: [
    { time: '9:00-10:00', course: 'CS401', faculty: 'Dr. Vikram Singh', room: '105' },
    { time: '11:00-12:00', course: 'MA201', faculty: 'Prof. Anjali Roy', room: '201' },
  ]},
  { day: 'Tuesday', classes: [
    { time: '10:00-11:00', course: 'CS305', faculty: 'Dr. Priya Sharma', room: '110' },
    { time: '2:00-3:30', course: 'CS210', faculty: 'Dr. Rahul Gupta', room: '305' },
  ]},
  { day: 'Wednesday', classes: [
    { time: '9:00-10:00', course: 'CS401', faculty: 'Dr. Vikram Singh', room: '105' },
  ]},
  { day: 'Thursday', classes: [
    { time: '10:00-11:00', course: 'CS305', faculty: 'Dr. Priya Sharma', room: '110' },
    { time: '11:00-12:00', course: 'MA201', faculty: 'Prof. Anjali Roy', room: '201' },
  ]},
  { day: 'Friday', classes: [
    { time: '2:00-3:30', course: 'CS210', faculty: 'Dr. Rahul Gupta', room: '305' },
  ]},
];

export const announcements = [
  { id: 1, course: 'CS401', title: 'Lecture Rescheduled', message: 'CS401 lecture moved to Friday 2 PM due to faculty meeting', date: 'Apr 1, 2025', author: 'Dr. Vikram Singh', read: false },
  { id: 2, course: 'MA201', title: 'Extra Class Session', message: 'Additional problem-solving session on Wednesday 4 PM', date: 'Apr 1, 2025', author: 'Prof. Anjali Roy', read: false },
  { id: 3, course: 'CS305', title: 'Lab Deadline Extended', message: 'Memory Management Lab due extended to Apr 8', date: 'Mar 31, 2025', author: 'Dr. Priya Sharma', read: true },
];

export const studyProgress = [
  { course: 'CS401', completed: 78, total: 100, timeSpent: 45, recommendedHours: 50 },
  { course: 'CS305', completed: 65, total: 100, timeSpent: 32, recommendedHours: 45 },
  { course: 'MA201', completed: 92, total: 100, timeSpent: 52, recommendedHours: 48 },
  { course: 'CS210', completed: 100, total: 100, timeSpent: 48, recommendedHours: 45 },
];

export const performanceInsights = [
  { subject: 'Distributed Systems', score: 88, classAvg: 81, strength: true },
  { subject: 'Operating Systems', score: 74, classAvg: 79, strength: false },
  { subject: 'Mathematics', score: 91, classAvg: 85, strength: true },
  { subject: 'Data Structures', score: 95, classAvg: 88, strength: true },
];

export const recommendations = [
  { id: 1, type: 'course', title: 'Advanced Algorithms', reason: 'Strong performance in DSA', difficulty: 'Advanced' },
  { id: 2, type: 'resource', title: 'OS Concepts Deep Dive', reason: 'Improve Operating Systems knowledge', link: 'https://example.com' },
  { id: 3, type: 'focus', title: 'Process Management', reason: 'Weak area in CS305', difficulty: 'Intermediate' },
];

export const studyMaterials = [
  { id: 1, course: 'CS401', title: 'Microservices Architecture Guide', type: 'PDF', size: '2.4 MB', downloads: 45 },
  { id: 2, course: 'CS401', title: 'Distributed Systems Video Series', type: 'Video', duration: '120 mins', views: 87 },
  { id: 3, course: 'CS305', title: 'Memory Management Tutorial', type: 'Interactive', duration: '45 mins', views: 52 },
  { id: 4, course: 'MA201', title: 'Calculus Problem Set Solutions', type: 'PDF', size: '1.2 MB', downloads: 120 },
];

export const achievements = [
  { id: 1, title: 'Perfect Attendance', description: 'Attend all classes for a month', earned: true, date: 'Mar 2025', icon: '📅' },
  { id: 2, title: 'Top Scorer', description: 'Score above 90% in a course', earned: true, date: 'Feb 2025', icon: '🏆' },
  { id: 3, title: 'Assignment Master', description: 'Submit 10 assignments on time', earned: false, progress: 8, icon: '📝' },
  { id: 4, title: 'Quick Learner', description: 'Complete course 1 week early', earned: false, progress: 0, icon: '⚡' },
  { id: 5, title: 'Discussion Champion', description: 'Get 20 upvotes in forums', earned: false, progress: 12, icon: '💬' },
];

export const forumTopics = [
  { id: 1, course: 'CS401', title: 'How to implement RPC?', replies: 8, upvotes: 24, author: 'Arjun Mehta', status: 'answered' },
  { id: 2, course: 'CS305', title: 'Understanding Page Replacement Algorithms', replies: 5, upvotes: 18, author: 'Neha Gupta', status: 'answered' },
  { id: 3, course: 'MA201', title: 'Integration problems help', replies: 3, upvotes: 12, author: 'Rahul Verma', status: 'open' },
  { id: 4, course: 'CS401', title: 'Consensus algorithms comparison', replies: 12, upvotes: 35, author: 'Anjali Patel', status: 'answered' },
];

export const studyGroups = [
  { id: 1, name: 'CS401 Study Group', course: 'CS401', members: 5, leader: 'Arjun Mehta', focused: true },
  { id: 2, name: 'Math Wizards', course: 'MA201', members: 8, leader: 'Neha Gupta', focused: false },
  { id: 3, name: 'OS Learners', course: 'CS305', members: 4, leader: 'Rohan Singh', focused: true },
];

export const tutoringRequests = [
  { id: 1, subject: 'Distributed Systems', tutor: 'Dr. Vikram Singh', status: 'scheduled', date: 'Apr 3, 2025', time: '3:00 PM', rating: null },
  { id: 2, subject: 'Operating Systems Concepts', tutor: 'Rahul Singh (Senior Student)', status: 'completed', date: 'Mar 28, 2025', rating: 4.5 },
  { id: 3, subject: 'Calculus Integration', tutor: 'Math Lab Assistant', status: 'pending', date: null, rating: null },
];

export const studyPlan = [
  { id: 1, course: 'CS401', milestone: 'Understand RPC concepts', dueDate: 'Apr 5', status: 'in-progress', timeEstimate: '8 hours' },
  { id: 2, course: 'CS401', milestone: 'Complete design document', dueDate: 'Apr 2', status: 'urgent', timeEstimate: '6 hours' },
  { id: 3, course: 'CS305', milestone: 'Study memory management', dueDate: 'Apr 8', status: 'not-started', timeEstimate: '10 hours' },
];

export const resourcesByTopic = [
  { topic: 'Distributed Systems', resources: [
    { title: 'CAP Theorem Explained', type: 'article', difficulty: 'beginner', timeToRead: '15 mins' },
    { title: 'Building Scalable Systems', type: 'video', difficulty: 'intermediate', duration: '45 mins' },
    { title: 'Load Balancing Strategies', type: 'interactive', difficulty: 'advanced', timeToComplete: '60 mins' },
  ]},
  { topic: 'Memory Management', resources: [
    { title: 'Heap vs Stack', type: 'article', difficulty: 'beginner', timeToRead: '10 mins' },
    { title: 'Garbage Collection Algorithms', type: 'video', difficulty: 'intermediate', duration: '30 mins' },
  ]},
];
