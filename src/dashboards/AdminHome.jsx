import React, { useEffect, useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { Table, StatusBadge } from '../components/Table';
import { Icon } from '../components/Icon';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { recentUsers, enrollmentData, serviceUsageData } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

const roleDisplay = {
  college_admin: 'College Admin',
  school_coordinator: 'School Coordinator',
  teacher: 'Faculty',
  student: 'Student',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-card px-3 py-2 text-xs">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-medium text-gray-900">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function AdminHome() {
  const [recentRegistrations, setRecentRegistrations] = useState(recentUsers);

  useEffect(() => {
    let mounted = true;

    const fetchRecentRegistrations = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, school_id, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!mounted) return;

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((user, index) => ({
          id: `USR-${String(index + 1).padStart(3, '0')}`,
          name: user.full_name || 'Unknown User',
          role: roleDisplay[user.role] || 'Student',
          dept: user.school_id ? `School ${user.school_id}` : 'University',
          status: user.is_active ? 'Active' : 'Inactive',
          joined: new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }));

        setRecentRegistrations(mapped);
      }
    };

    fetchRecentRegistrations();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Students" value="12,480" change="+8.2%" up icon="Users" />
        <KpiCard label="Active Subjects" value="348" change="+5.1%" up icon="BookOpen" />
        <KpiCard label="Active Users (24h)" value="1,842" change="+12.3%" up icon="Activity" />
        <KpiCard label="System Uptime" value="99.97%" change="+0.02%" up icon="Zap" />
      </div>

      {/* Charts row */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Enrollment chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Enrollment Growth</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly student registrations</p>
            </div>
            <span className="tag bg-green-50 text-green-700">+8.2%</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={enrollmentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#2563EB' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service usage */}
        <div className="card p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Service Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">API calls per service (today)</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={serviceUsageData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="requests" fill="#DBEAFE" radius={[0, 4, 4, 0]}>
                {serviceUsageData.map((_, i) => (
                  <rect key={i} fill={i === 0 ? '#2563EB' : '#DBEAFE'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Registrations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Recently created user accounts from Supabase</p>
          </div>
        </div>
        <Table
          columns={['User', 'Role', 'Department', 'Status', 'Joined']}
            rows={recentRegistrations}
          renderRow={(u) => (
            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 px-4 first:pl-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary-700">{u.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`tag ${u.role === 'Faculty' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{u.dept}</td>
              <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
              <td className="py-3 px-4 text-sm text-gray-400">{u.joined}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
