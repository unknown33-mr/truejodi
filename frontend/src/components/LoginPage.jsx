import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(identifier, password);
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorText = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : 'Invalid email or password');
      setErrorMsg(errorText);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 flex flex-col font-sans text-slate-800" data-testid="login-page">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4">
              <Heart className="w-7 h-7 fill-white text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-rose-600 font-medium mt-1">Log in to your Truejodi matrimony account</p>
          </div>

          {loginSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3 animate-fadeIn">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-lg">Login Successful!</h3>
              <p className="text-xs">Redirecting you to your partner search dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs" data-testid="login-error-alert">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter mobile or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all"
                    data-testid="login-identifier-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all"
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                    data-testid="login-remember-checkbox"
                  />
                  <span className="text-slate-600">Remember Me</span>
                </label>
                <span className="text-rose-600 font-semibold hover:underline cursor-pointer" data-testid="forgot-password-link">
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                data-testid="login-submit-btn"
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl shadow-md hover:from-rose-700 hover:to-rose-800 transition-all text-sm"
              >
                Login
              </button>

              <div className="pt-4 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Don't have a Truejodi account?{' '}
                  <Link to="/register" className="text-rose-600 font-semibold hover:underline" data-testid="login-to-register-link">
                    Register Free
                  </Link>
                </p>
              </div>
            </form>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
