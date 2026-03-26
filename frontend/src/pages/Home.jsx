import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const METRICS = [
  { label: 'Total Learners', value: '12K+' },
  { label: 'Active Faculty', value: '480+' },
  { label: 'Partner Colleges', value: '95+' },
];

const FEATURES = [
  {
    title: 'Smarter Course Operations',
    description: 'Streamline curriculum delivery, enrollment management, and faculty coordination in one place.',
  },
  {
    title: 'Assessment Intelligence',
    description: 'Run assignments, quizzes, and submissions with transparent evaluation workflows.',
  },
  {
    title: 'Real-Time Decision Signals',
    description: 'Track student engagement and platform performance through actionable analytics.',
  },
];

const TRUSTED_STACK = ['React', 'Node.js', 'MongoDB', 'Redis', 'JWT Auth', 'Microservices API'];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-shell">
      <div className="home-page">
        <header className="home-nav">
          <div className="home-brand">
            <span className="home-brand-mark">U</span>
            <div>
              <div className="home-brand-name">UniCore LMS</div>
              <div className="home-brand-sub">University Digital Learning Platform</div>
            </div>
          </div>

          <div className="home-nav-actions">
            {user ? (
              <Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link>
            ) : (
              <>
                <Link className="home-link" to="/login">Sign In</Link>
                <Link className="btn btn-primary" to="/register">Get Started Free</Link>
              </>
            )}
          </div>
        </header>

        <section className="home-hero">
          <div className="home-hero-left">
            <span className="home-pill">Trusted by Universities Nationwide</span>
            <h1 className="home-title">
              Transform
              <span className="home-title-accent"> Campus Learning</span>
              <br />
              Through a Unified Digital Platform
            </h1>
            <p className="home-subtitle">
              UniCore helps institutions modernize teaching, assessments, and analytics with a scalable
              microservices-based architecture built for real campus operations.
            </p>
            <div className="home-hero-actions">
              <Link className="btn btn-primary" to={user ? '/dashboard' : '/register'}>
                {user ? 'Open Dashboard' : 'Start For Free'}
              </Link>
              <Link className="btn btn-outline" to="/login">View Demo Access</Link>
            </div>
          </div>

          <div className="home-hero-right">
            <div className="home-orb" />
            <div className="home-dashboard-card">
              <div className="home-dashboard-head">
                <span>UniCore Impact Dashboard</span>
                <strong>+92%</strong>
              </div>
              <div className="home-dashboard-grid">
                {METRICS.map((item) => (
                  <div className="home-dashboard-metric" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="home-progress-track">
                <div className="home-progress-fill" />
              </div>
            </div>
          </div>
        </section>

        <section className="home-grid">
          {FEATURES.map((item) => (
            <article className="home-feature" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </section>

        <section className="home-stack-band">
          <div className="home-stack-label">Platform Stack</div>
          <div className="home-stack-list">
            {TRUSTED_STACK.map((item) => (
              <span className="home-stack-chip" key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="home-cta-band">
          <div>
            <h3>Ready to modernize your university LMS?</h3>
            <p>Deploy UniCore for faculty, students, and administrators with confidence.</p>
          </div>
          <div className="home-cta-actions">
            <Link className="btn btn-primary" to={user ? '/dashboard' : '/register'}>
              {user ? 'Open Platform' : 'Create Workspace'}
            </Link>
            {!user && <Link className="btn btn-outline" to="/login">Sign In</Link>}
          </div>
        </section>

        <footer className="home-footer">
          <div>Designed for institutions that need reliability, scale, and clarity in learning operations.</div>
          <div>
            {user ? <Link to="/dashboard">Continue to dashboard</Link> : <Link to="/login">Sign in to continue</Link>}
          </div>
        </footer>
      </div>
    </div>
  );
}
