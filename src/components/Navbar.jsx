import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
            <Icon name="Layers" size={14} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">UniCore LMS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'Platform', 'Docs'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="btn-secondary text-sm">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile menu btn */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Icon name={mobileOpen ? 'X' : 'Menu'} size={18} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
          {['Features', 'Platform', 'Docs'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-600">
              {item}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
            <Link to="/login" className="btn-secondary text-center">Log in</Link>
            <Link to="/signup" className="btn-primary text-center">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
