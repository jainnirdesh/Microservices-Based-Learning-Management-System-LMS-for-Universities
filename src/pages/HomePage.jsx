import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icon } from '../components/Icon';
import { features, stats } from '../data/mockData';

// ---- Architecture Diagram Card ----
function ArchCard() {
  const services = [
    { label: 'User Service', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Course Service', color: 'bg-violet-50 border-violet-200 text-violet-700' },
    { label: 'Assessment', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { label: 'Notification', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  ];
  return (
    <div className="card p-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-green-400"></span>
        <span className="text-xs text-gray-400 font-mono">system / architecture</span>
      </div>
      <p className="text-xs font-medium text-gray-500 mb-5">Microservices Topology</p>

      {/* Client */}
      <div className="flex justify-center mb-3">
        <div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-xs font-medium text-gray-600 w-32 text-center">
          Client Layer
        </div>
      </div>
      <div className="flex justify-center mb-3">
        <div className="w-px h-5 bg-gray-200"></div>
      </div>

      {/* Gateway */}
      <div className="flex justify-center mb-3">
        <div className="border border-primary-200 bg-primary-50 rounded-lg px-4 py-2.5 text-xs font-semibold text-primary-700 w-40 text-center">
          API Gateway
        </div>
      </div>
      <div className="flex justify-center mb-3">
        <div className="w-px h-5 bg-gray-200"></div>
      </div>

      {/* Services */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {services.map((s) => (
          <div
            key={s.label}
            className={`border rounded-lg px-3 py-2.5 text-xs font-medium text-center ${s.color}`}
          >
            {s.label}
          </div>
        ))}
      </div>
      <div className="flex justify-center mb-3">
        <div className="w-px h-5 bg-gray-200"></div>
      </div>

      {/* DB */}
      <div className="flex justify-center gap-3">
        {['PostgreSQL', 'MongoDB', 'Redis'].map((db) => (
          <div
            key={db}
            className="border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-gray-500 font-mono"
          >
            {db}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Dashboard Preview ----
function DashboardPreview() {
  return (
    <div className="card overflow-hidden border-gray-200">
      {/* Top bar */}
      <div className="h-9 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-300"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-300"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-300"></div>
        <span className="ml-3 text-xs text-gray-400 font-mono">unicore.university.edu/admin</span>
      </div>

      <div className="flex h-60">
        {/* Sidebar preview */}
        <div className="w-36 bg-white border-r border-gray-100 p-3 flex flex-col gap-1">
          {['Dashboard', 'Users', 'Courses', 'Assessments', 'Analytics'].map((item, i) => (
            <div
              key={item}
              className={`text-xs px-2 py-1.5 rounded-md font-medium ${
                i === 0 ? 'bg-primary-50 text-primary-700' : 'text-gray-400'
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content preview */}
        <div className="flex-1 p-4 bg-surface">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { l: 'Students', v: '12,480' },
              { l: 'Courses', v: '348' },
              { l: 'Uptime', v: '99.9%' },
            ].map((k) => (
              <div key={k.l} className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-card">
                <div className="text-xs text-gray-400 mb-1">{k.l}</div>
                <div className="text-sm font-semibold text-gray-900">{k.v}</div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bg-white border border-gray-100 rounded-lg p-3 mb-2 shadow-card">
            <div className="text-xs text-gray-400 mb-2">Enrollment Growth</div>
            <div className="flex items-end gap-1 h-12">
              {[30, 45, 40, 60, 70, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-primary-100 rounded-sm" style={{ height: `${h}%` }}>
                  <div className="w-full bg-primary-500 rounded-sm" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Table preview */}
          <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-card">
            <div className="text-xs text-gray-400 mb-1.5">Recent Users</div>
            {['Arjun Mehta · Student', 'Priya Sharma · Faculty'].map((r) => (
              <div key={r} className="text-xs text-gray-500 py-1 border-b border-gray-50 last:border-0">{r}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Icon map for features ----
const iconMap = { Grid: 'Grid', Share2: 'Share2', ClipboardList: 'ClipboardList', Bell: 'Bell', Shield: 'Shield', BarChart2: 'BarChart2' };

// ---- MAIN ----
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                <span className="text-xs font-medium text-primary-700">B.Tech Major Project · 2025</span>
              </div>
              <h1 className="text-4xl md:text-[2.75rem] font-semibold text-gray-900 leading-tight tracking-tight mb-5">
                Modern Learning Management System Built on{' '}
                <span className="text-primary-600">Microservices</span>
              </h1>
              <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg">
                UniCore is an enterprise-grade LMS designed for universities — built on distributed microservices with fault isolation, horizontal scalability, and independent service deployment.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/admin" className="btn-primary px-5 py-2.5 text-sm">
                  Explore Platform
                </Link>
                <a href="#features" className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2">
                  View Architecture
                  <Icon name="ChevronRight" size={14} />
                </a>
              </div>
              {/* trust line */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['A', 'P', 'R', 'N'].map((l) => (
                    <div key={l} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Designed for 10,000+ concurrent users</p>
              </div>
            </div>

            {/* Right */}
            <div>
              <ArchCard />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-gray-100 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: '12,480', desc: 'Across all departments' },
              { label: 'Active Courses', value: '348', desc: 'Current semester' },
              { label: 'System Uptime', value: '99.97%', desc: 'Last 90 days' },
              { label: 'Submissions', value: '2,341', desc: 'Processed today' },
            ].map((s) => (
              <div key={s.label} className="card p-6 text-center">
                <div className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{s.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-0.5">{s.label}</div>
                <div className="text-xs text-gray-400">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-4">
              Built for scale from the ground up
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Every component is designed with distributed systems principles — ensuring reliability, performance, and maintainability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-card-md transition-shadow duration-200">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                  <Icon name={f.icon} size={17} className="text-primary-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section id="platform" className="py-20 px-6 bg-surface border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Platform Preview</p>
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-4">
              A unified admin interface
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Real-time dashboards, user management, course oversight, and analytics — all accessible from a single control plane.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-4">Ready to explore?</h2>
          <p className="text-gray-500 mb-8">Access the admin panel, faculty tools, or student portal.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/admin" className="btn-primary px-6 py-2.5">Admin Dashboard</Link>
            <Link to="/faculty" className="btn-secondary px-6 py-2.5">Faculty Portal</Link>
            <Link to="/student" className="btn-secondary px-6 py-2.5">Student Portal</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
              <Icon name="Layers" size={12} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-gray-900">UniCore LMS</span>
          </div>
          <p className="text-xs text-gray-400">
            B.Tech Major Project — Microservices-Based Learning Management System
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="#features" className="hover:text-gray-600">Features</a>
            <a href="#platform" className="hover:text-gray-600">Platform</a>
            <Link to="/login" className="hover:text-gray-600">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
