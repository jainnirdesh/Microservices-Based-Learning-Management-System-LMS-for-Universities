import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithPassword, refreshProfile, getDefaultPathByRole } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    const { data, error } = await signInWithPassword(form.email, form.password);

    if (error) {
      setErrorMessage(error.message || 'Unable to sign in. Please try again.');
      setLoading(false);
      return;
    }

    const metadataRole = data?.user?.user_metadata?.role || data?.session?.user?.user_metadata?.role;
    const nextPath = getDefaultPathByRole(metadataRole);
    setLoading(false);
    navigate(nextPath, { replace: true });

    refreshProfile().catch(() => {});
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setInfoMessage('');

    if (!form.email) {
      setErrorMessage('Enter your email first, then click Forgot password.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setErrorMessage(error.message || 'Unable to send reset link.');
      return;
    }

    setInfoMessage('Password reset link sent. Check your email inbox.');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
            <Icon name="Layers" size={14} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-gray-900">UniCore LMS</span>
        </Link>

        <div className="card p-7">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Sign in to your account</h1>
            <p className="text-sm text-gray-400">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-600">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-primary-600 hover:underline">Forgot password?</button>
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMessage}
              </p>
            )}

            {infoMessage && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                {infoMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/" className="hover:text-gray-600">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
