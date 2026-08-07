import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Search, User, Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" data-testid="navbar-logo-link">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                True<span className="text-rose-600">jodi</span>
              </span>
              <span className="block text-[10px] tracking-widest text-amber-700 uppercase font-semibold">
                Royal Matrimony
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                data-testid={`nav-link-${link.name.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-rose-600 ${
                  isActive(link.path) ? 'text-rose-600 font-semibold border-b-2 border-rose-600 pb-1' : 'text-slate-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right CTA Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user && user !== false ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{user.fullName || user.email}</p>
                  <p className="text-[10px] text-rose-600 font-medium capitalize">{user.role || 'Member'}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  data-testid="nav-logout-btn"
                  className="p-2 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-btn"
                  className="px-5 py-2.5 text-sm font-semibold text-rose-700 hover:text-rose-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  data-testid="nav-register-btn"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-full shadow-md hover:shadow-lg hover:from-rose-700 hover:to-rose-800 transition-all transform hover:-translate-y-0.5"
                >
                  Register Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle-btn"
              className="p-2 rounded-lg text-slate-700 hover:bg-rose-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 pt-3 pb-6 space-y-3 animate-fadeIn" data-testid="mobile-menu-drawer">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {user && user !== false ? (
              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-full shadow-md"
              >
                Logout ({user.fullName || user.email})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-rose-700 border border-rose-200 rounded-full hover:bg-rose-50 transition-colors"
                  data-testid="mobile-nav-login"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-full shadow-md"
                  data-testid="mobile-nav-register"
                >
                  Register Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
