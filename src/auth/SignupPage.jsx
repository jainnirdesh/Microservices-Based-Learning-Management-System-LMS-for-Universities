import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import {
  detectRoleFromEmail,
  isValidUniversityEmail,
  extractStudentIdFromEmail,
  mapStudentIdToSchool,
  getRoleDetectionMessage,
} from '../lib/emailRoleDetector';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [detectedRole, setDetectedRole] = useState(null);
  const [detectedSchool, setDetectedSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-detect role and school when email changes
  const handleEmailChange = (newEmail) => {
    setForm({ ...form, email: newEmail });
    
    const role = detectRoleFromEmail(newEmail);
    setDetectedRole(role);
    
    if (role === 'student') {
      const studentId = extractStudentIdFromEmail(newEmail);
      const schoolId = mapStudentIdToSchool(studentId);
      setDetectedSchool(schoolId);
    } else {
      setDetectedSchool(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate email domain
    if (!isValidUniversityEmail(form.email)) {
      setErrorMessage('Please use a valid university email (@krmu.edu.in or @krmangalam.edu.in)');
      return;
    }

    if (!detectedRole) {
      setErrorMessage('Could not detect role from email. Please try again.');
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.name,
      role: detectedRole,
      schoolId: detectedSchool || null,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Unable to create account.');
      return;
    }

    setSuccessMessage('Account created. Check your email for verification link before login.');
    setTimeout(() => navigate('/login'), 1400);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
            <Icon name="Layers" size={14} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-gray-900">UniCore LMS</span>
        </Link>

        <div className="card p-7">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-400">Join UniCore — it takes less than a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Arjun Mehta"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">University email</label>
              <input
                type="email"
                className="input-field"
                placeholder="example@krmu.edu.in or faculty@krmangalam.edu.in"
                value={form.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Role & School</label>
              <div className="border rounded-lg p-3 bg-gray-50">
                {detectedRole ? (
                  <div className="flex flex-col gap-1">
                    <p className={`text-sm font-medium ${detectedRole === 'student' ? 'text-green-700' : 'text-blue-700'}`}>
                      {getRoleDetectionMessage(detectedRole)}
                    </p>
                    {detectedSchool && (
                      <p className="text-xs text-gray-600">
                        School assignment: <strong>School {detectedSchool}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {form.email ? getRoleDetectionMessage(null) : 'Enter university email above'}
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              )}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          By signing up, you agree to the{' '}
          <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
