import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const roleToPath = {
  college_admin: '/admin',
  school_coordinator: '/faculty',
  teacher: '/faculty',
  student: '/student',
};

async function getProfileByUserId(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, school_id')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfileInBackground = async (userId) => {
      const userProfile = await getProfileByUserId(userId);
      if (mounted) {
        setProfile(userProfile);
      }
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session ?? null;

      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (mounted) {
        setLoading(false);
      }

      if (currentSession?.user?.id) {
        loadProfileInBackground(currentSession.user.id);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (mounted) {
        setLoading(false);
      }

      if (nextSession?.user?.id) {
        loadProfileInBackground(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      roleToPath,
      async signInWithPassword(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
      },
      async signUp({ email, password, fullName, role, schoolId }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              school_id: schoolId || null,
            },
          },
        });

        return { data, error };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async refreshProfile() {
        if (!user?.id) return null;
        const fresh = await getProfileByUserId(user.id);
        setProfile(fresh);
        return fresh;
      },
      getDefaultPathByRole(role) {
        return roleToPath[role] || '/';
      },
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
