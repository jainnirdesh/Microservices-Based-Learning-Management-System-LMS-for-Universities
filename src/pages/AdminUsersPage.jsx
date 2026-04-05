import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { allUsers } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const roleDisplay = {
  college_admin: 'College Admin',
  school_coordinator: 'School Coordinator',
  teacher: 'Teacher',
  student: 'Student',
};

export function AdminUsers() {
  const { signUp } = useAuth();
  const [users, setUsers] = useState(allUsers);
  const [schools, setSchools] = useState([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [enrollmentStudent, setEnrollmentStudent] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [enrollingStudent, setEnrollingStudent] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [issuedCredentials, setIssuedCredentials] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [enrollmentCountByStudent, setEnrollmentCountByStudent] = useState({});

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id, created_at, is_active')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map((u) => ({
          profileId: u.id,
        id: `USR-${u.id.slice(0, 8)}`,
        name: u.full_name || 'Unknown User',
        role: roleDisplay[u.role] || 'Student',
        dept: u.school_id ? null : 'University',
          schoolId: u.school_id,
        status: u.is_active ? 'Active' : 'Inactive',
        joined: new Date(u.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }));
      setUsers(mapped);
    }

    setLoadingUsers(false);
  };

  useEffect(() => {
    let mounted = true;

    async function safeFetchUsers() {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, school_id, created_at, is_active')
        .order('created_at', { ascending: false });

      if (mounted && !error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((u) => ({
          profileId: u.id,
          id: `USR-${u.id.slice(0, 8)}`,
          name: u.full_name || 'Unknown User',
          role: roleDisplay[u.role] || 'Student',
          dept: u.school_id ? null : 'University',
          schoolId: u.school_id,
          status: u.is_active ? 'Active' : 'Inactive',
          joined: new Date(u.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        }));
        setUsers(mapped);
      }

      if (mounted) {
        setLoadingUsers(false);
      }
    }

    safeFetchUsers();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchSchools() {
      const { data, error } = await supabase
        .from('schools')
        .select('id, code, name')
        .order('name', { ascending: true });

      if (mounted && !error && Array.isArray(data)) {
        setSchools(data);
      }
    }

    fetchSchools();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchSections() {
      const { data, error } = await supabase
        .from('sections')
        .select('id, code, name, school_id, academic_year, semester_no, is_active')
        .order('created_at', { ascending: false });

      if (mounted && !error && Array.isArray(data)) {
        setSections(data);
      }
    }

    fetchSections();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchEnrollments() {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select('student_id, status');

      if (mounted && !error && Array.isArray(data)) {
        const counts = data.reduce((acc, row) => {
          if (row.status !== 'active') return acc;
          acc[row.student_id] = (acc[row.student_id] || 0) + 1;
          return acc;
        }, {});
        setEnrollmentCountByStudent(counts);
      }
    }

    fetchEnrollments();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||u.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === 'all' || u.role === filterRole)
  );

  const schoolLabelById = schools.reduce((acc, school) => {
    acc[school.id] = `${school.code} - ${school.name}`;
    return acc;
  }, {});

  const getUserScopeLabel = (user) => {
    if (!user?.schoolId) return 'University';
    return schoolLabelById[user.schoolId] || `School ${user.schoolId}`;
  };

  const generateSystemPassword = () => {
    const random = Math.random().toString(36).slice(-10);
    return `Setup@${random}1!`;
  };

  const openCreateUserModal = () => {
    setCreateUserError('');
    setShowNewUserModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError('');
    setCreatingUser(true);

    const formData = new FormData(e.target);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const role = String(formData.get('role') || 'student');
    const schoolIdRaw = String(formData.get('schoolId') || '').trim();
    const schoolId = schoolIdRaw ? Number(schoolIdRaw) : null;
    const systemPassword = generateSystemPassword();

    const { error } = await signUp({
      email,
      password: systemPassword,
      fullName: name,
      role,
      schoolId,
    });

    if (error) {
      setCreateUserError(error.message || 'Failed to create user.');
      setCreatingUser(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setIssuedCredentials({
      name,
      email,
      role: roleDisplay[role] || role,
      resetMailSent: !resetError,
    });

    await fetchUsers();
    setShowNewUserModal(false);
    setCreatingUser(false);
    e.target.reset();
  };

  const handleViewUser = (user) => {
    setSelectedUser({ ...user, dept: getUserScopeLabel(user) });
    setShowViewUserModal(true);
  };

  const openEnrollmentModal = (user) => {
    if (!user?.profileId || enrollmentCountByStudent[user.profileId] > 0) {
      setEnrollmentError(`${user?.name || 'This student'} is already enrolled.`);
      return;
    }

    setEnrollmentError('');
    setEnrollmentSuccess('');
    setEnrollmentStudent(user);
    setSelectedSectionId('');
    setShowEnrollModal(true);
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();

    if (!enrollmentStudent?.profileId) {
      setEnrollmentError('Select a student first.');
      return;
    }

    if (!selectedSectionId) {
      setEnrollmentError('Select a section to enroll the student.');
      return;
    }

    const section = sections.find((item) => String(item.id) === String(selectedSectionId));

    if (!section) {
      setEnrollmentError('Selected section not found.');
      return;
    }

    setEnrollmentError('');
    setEnrollingStudent(true);

    const { error } = await supabase.from('student_enrollments').insert({
      school_id: section.school_id,
      section_id: section.id,
      student_id: enrollmentStudent.profileId,
      status: 'active',
    });

    if (error) {
      setEnrollmentError(error.message || 'Failed to enroll student.');
      setEnrollingStudent(false);
      return;
    }

    setEnrollmentSuccess(`${enrollmentStudent.name} enrolled into ${section.code} - ${section.name}`);
    setEnrollmentCountByStudent((prev) => ({
      ...prev,
      [enrollmentStudent.profileId]: (prev[enrollmentStudent.profileId] || 0) + 1,
    }));
    setShowEnrollModal(false);
    setEnrollingStudent(false);
  };

  const handleToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <button
          onClick={openCreateUserModal}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <Icon name="PlusCircle" size={16} />
          Add User
        </button>
      </div>

      {issuedCredentials && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-900 mb-1">User onboarding status</p>
          <p className="text-xs text-amber-800">
            {issuedCredentials.resetMailSent
              ? 'Account created and password setup email sent successfully.'
              : 'Account created, but password setup email could not be sent. Ask user to use Forgot password on Login page.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3 text-xs">
            <p><span className="font-semibold text-amber-900">Name:</span> {issuedCredentials.name}</p>
            <p><span className="font-semibold text-amber-900">Role:</span> {issuedCredentials.role}</p>
            <p><span className="font-semibold text-amber-900">Email:</span> {issuedCredentials.email}</p>
          </div>
        </div>
      )}

      {enrollmentSuccess && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-emerald-900">Enrollment completed</p>
          <p className="text-xs text-emerald-800 mt-1">{enrollmentSuccess}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Roles</option>
          <option value="Student">Students</option>
          <option value="Teacher">Teachers</option>
          <option value="School Coordinator">School Coordinators</option>
          <option value="College Admin">College Admin</option>
        </select>
      </div>

      {/* Users List */}
      {loadingUsers && (
        <div className="text-sm text-gray-500">Loading users from Supabase...</div>
      )}

      <div className="space-y-2">
        {filtered.map((user) => (
          <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-white ${
                  user.role === 'Teacher' || user.role === 'School Coordinator' ? 'bg-violet-600' : 'bg-blue-600'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.id} • {getUserScopeLabel(user)}</p>
                </div>
              </div>

              <div className="text-right mr-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  user.role === 'Teacher' || user.role === 'School Coordinator'
                    ? 'bg-violet-50 text-violet-700'
                    : user.role === 'College Admin'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {user.role}
                </span>
                <p className="text-xs text-gray-400 mt-1">{user.status}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewUser(user)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  View
                </button>
                {user.role === 'Student' && (enrollmentCountByStudent[user.profileId] > 0 ? (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded bg-emerald-50 text-emerald-700">
                    Enrolled
                  </span>
                ) : (
                  <button
                    onClick={() => openEnrollmentModal(user)}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    Enroll
                  </button>
                ))}
                <button
                  onClick={() => handleToggleUserStatus(user.id)}
                  className="btn-ghost text-xs px-3 py-1.5"
                  title="Toggle status"
                >
                  <Icon name="Edit" size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showViewUserModal} title="User Details" onClose={() => setShowViewUserModal(false)}>
        {selectedUser ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">User ID</p>
              <p className="font-medium text-gray-900">{selectedUser.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{selectedUser.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department / Scope</p>
              <p className="font-medium text-gray-900">{selectedUser.dept}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Joined On</p>
              <p className="font-medium text-gray-900">{selectedUser.joined}</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowViewUserModal(false)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal isOpen={showEnrollModal} title="Enroll Student" onClose={() => setShowEnrollModal(false)}>
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Student</label>
            <input
              type="text"
              value={enrollmentStudent ? `${enrollmentStudent.name} (${enrollmentStudent.id})` : ''}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code} - {section.name} {section.academic_year ? `(${section.academic_year})` : ''}
                </option>
              ))}
            </select>
            {sections.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">No sections found yet. Create sections first, then enroll the student.</p>
            )}
          </div>
          {enrollmentError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{enrollmentError}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={enrollingStudent || sections.length === 0}>
              {enrollingStudent ? 'Enrolling...' : 'Enroll Student'}
            </button>
            <button type="button" onClick={() => setShowEnrollModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* New User Modal */}
      <Modal isOpen={showNewUserModal} title="Add New User" onClose={() => setShowNewUserModal(false)}>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="student@krmu.edu.in"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
            <select
              name="role"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="school_coordinator">School Coordinator</option>
              <option value="college_admin">College Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">School (optional)</label>
            <select
              name="schoolId"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">University scope</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.code} - {school.name}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
            Password setup link will be sent to the user email after account creation.
          </p>
          {createUserError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{createUserError}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={creatingUser}>
              {creatingUser ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" onClick={() => setShowNewUserModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
