import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const DEFAULT_BACKEND_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'truejodi-frontend.onrender.com' ||
    window.location.hostname === 'unknown33-mr.github.io')
    ? 'https://truejodi.onrender.com'
    : 'http://localhost:8001';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const TOKEN_KEY = 'truejodi_access_token';

// Configure axios once with an interceptor that injects the Bearer token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(false);
      return null;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/me`);
      setUser(res.data);
      return res.data;
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(false);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
    if (res.data.access_token) localStorage.setItem(TOKEN_KEY, res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (formData) => {
    const res = await axios.post(`${BACKEND_URL}/api/auth/register`, formData);
    if (res.data.access_token) localStorage.setItem(TOKEN_KEY, res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(false);
  };

  const updateProfile = async (payload) => {
    const res = await axios.put(`${BACKEND_URL}/api/users/profile`, payload);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, BACKEND_URL, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Resolve a photo record or storage_path to a displayable URL.
 * For file paths served through /api/files/, include auth token as query param
 * because <img src> cannot send headers.
 */
export function photoUrl(photo) {
  if (!photo) return '';
  const path = typeof photo === 'string' ? photo : (photo.storage_path || photo.url);
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const token = localStorage.getItem(TOKEN_KEY);
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${BACKEND_URL}/api/files/${path}${query}`;
}
