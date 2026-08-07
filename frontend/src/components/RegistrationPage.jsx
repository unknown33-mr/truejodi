import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function RegistrationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    profileFor: 'Self',
    gender: 'Female',
    fullName: '',
    dob: '2000-01-01',
    age: 26,
    religion: 'Hindu',
    community: 'Brahmin',
    education: 'B.Tech / MBA',
    occupation: 'Software Engineer',
    state: 'Maharashtra',
    district: 'Mumbai',
    mobile: '9876543210',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    try {
      await register({
        ...formData,
        age: parseInt(formData.age) || 25
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/search');
      }, 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorText = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : 'Registration failed');
      setErrorMsg(errorText);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 flex flex-col font-sans text-slate-800" data-testid="registration-page">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden p-8 sm:p-12">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4">
              <Heart className="w-7 h-7 fill-white text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Begin Your Matrimony Journey</h1>
            <p className="text-sm text-rose-600 font-medium mt-1">Create your verified royal profile with JWT security</p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs" data-testid="reg-error-alert">
              {errorMsg}
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-3xl text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold">Registration Successful!</h2>
              <p className="text-sm max-w-md mx-auto">
                Welcome to Truejodi, <strong>{formData.fullName || 'Member'}</strong>! Your account has been securely created. Redirecting to search matches...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="registration-form">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Created For */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Profile Created For</label>
                  <select
                    name="profileFor"
                    value={formData.profileFor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-profile-for-select"
                  >
                    <option value="Self">Self</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Friend">Friend</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-gender-select"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-fullname-input"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-dob-input"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    name="age"
                    placeholder="e.g. 26"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-age-input"
                  />
                </div>

                {/* Religion */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Religion</label>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-religion-select"
                  >
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Christian">Christian</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                  </select>
                </div>

                {/* Community */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Community / Caste</label>
                  <input
                    type="text"
                    required
                    name="community"
                    placeholder="e.g. Brahmin, Rajput, Reddy, Khatri"
                    value={formData.community}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-community-input"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Education</label>
                  <input
                    type="text"
                    required
                    name="education"
                    placeholder="e.g. B.Tech, MBA, MBBS"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-education-input"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Occupation</label>
                  <input
                    type="text"
                    required
                    name="occupation"
                    placeholder="e.g. Software Engineer, Doctor, CA"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-occupation-input"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    name="state"
                    placeholder="e.g. Maharashtra, Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-state-input"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">District / City</label>
                  <input
                    type="text"
                    required
                    name="district"
                    placeholder="e.g. Mumbai, Bengaluru"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-district-input"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    required
                    name="mobile"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-mobile-input"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-email-input"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    name="password"
                    placeholder="Create secure password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-password-input"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    data-testid="reg-confirmpassword-input"
                  />
                </div>

              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  data-testid="reg-submit-btn"
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl shadow-lg hover:from-rose-700 hover:to-rose-800 transition-all text-base"
                >
                  Register Free Now
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
}
