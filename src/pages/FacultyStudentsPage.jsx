import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { allStudents } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function FacultyStudents() {
  const [students, setStudents] = useState(allStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function fetchStudents() {
      setLoadingStudents(true);

      let query = supabase
        .from('profiles')
        .select('id, full_name, role, school_id, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (profile?.role === 'school_coordinator' && profile?.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error } = await query;

      if (mounted && !error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((s, idx) => ({
          id: `STU-${s.id.slice(0, 8)}`,
          name: s.full_name || 'Student',
          email: `${s.id.slice(0, 8)}@university.edu`,
          avgScore: 70 + (idx % 25),
          courses: 3 + (idx % 3),
          schoolId: s.school_id,
        }));
        setStudents(mapped);
      }

      if (mounted) {
        setLoadingStudents(false);
      }
    }

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, [profile?.role, profile?.school_id]);

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return b.avgScore - a.avgScore;
      return a.id.localeCompare(b.id);
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500 mt-1">Manage enrolled students and track performance</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="name">Sort by Name</option>
          <option value="score">Sort by Score</option>
          <option value="id">Sort by ID</option>
        </select>
      </div>

      {/* Students Grid */}
      {loadingStudents && (
        <div className="text-sm text-gray-500">Loading students from Supabase...</div>
      )}

      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-700">{student.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{student.id}</p>
                  <p className="text-xs text-gray-400">{student.email}</p>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-sm font-semibold text-gray-900 mb-1">{student.avgScore}%</div>
                <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      student.avgScore >= 80 ? 'bg-green-500' : student.avgScore >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${student.avgScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{student.courses} courses</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <button className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 flex-1">
                <Icon name="Eye" size={12} />
                View Profile
              </button>
              <button className="btn-ghost text-xs px-3 py-1 flex items-center gap-1 flex-1">
                <Icon name="MessageSquare" size={12} />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
