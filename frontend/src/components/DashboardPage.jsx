import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, ShieldCheck, Heart, Camera, Save, Trash2, Plus, Star,
  MapPin, Briefcase, Users, Lock, Sparkles, CheckCircle2, ChevronRight, LogOut, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth, photoUrl } from '../context/AuthContext';

const emptyPrefs = {
  ageFrom: '', ageTo: '', religion: '', community: '', motherTongue: '',
  education: '', occupation: '', state: '', district: '',
  maritalStatus: '', heightFrom: '', heightTo: ''
};
const emptyPrivacy = {
  hideMobile: true, hideEmail: true, hideWhatsapp: true,
  hidePhotos: false, profileVisibility: 'Public', whoCanView: 'Everyone',
  showLastSeen: true, hideOnlineStatus: false, hideLocation: false,
};

const TABS = [
  { key: 'personal',   label: 'Personal Info',      icon: User },
  { key: 'contact',    label: 'Contact Info',       icon: MapPin },
  { key: 'religion',   label: 'Religion & Community', icon: Heart },
  { key: 'career',     label: 'Education & Career', icon: Briefcase },
  { key: 'lifestyle',  label: 'Lifestyle',          icon: Sparkles },
  { key: 'family',     label: 'Family Details',     icon: Users },
  { key: 'preferences',label: 'Partner Preferences',icon: Star },
  { key: 'gallery',    label: 'Photo Gallery',      icon: Camera },
  { key: 'privacy',    label: 'Privacy Settings',   icon: Lock },
];

export default function DashboardPage() {
  const { user, logout, BACKEND_URL, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && user !== false) {
      setFormData({
        fullName: user.fullName || '',
        profileFor: user.profileFor || 'Self',
        gender: user.gender || 'Female',
        dob: user.dob || '',
        age: user.age || '',
        height: user.height || '',
        maritalStatus: user.maritalStatus || 'Never Married',
        religion: user.religion || 'Hindu',
        community: user.community || '',
        motherTongue: user.motherTongue || '',
        education: user.education || '',
        occupation: user.occupation || '',
        annualIncome: user.annualIncome || '',
        state: user.state || '',
        district: user.district || '',
        mobile: user.mobile || '',
        whatsapp: user.whatsapp || '',
        email: user.email || '',
        aboutMe: user.aboutMe || '',
        familyDetails: user.familyDetails || '',
        partnerExpectations: user.partnerExpectations || '',
        diet: user.diet || '',
        smoking: user.smoking || '',
        drinking: user.drinking || '',
        disability: user.disability || '',
        manglik: user.manglik || '',
        horoscope: user.horoscope || '',
        languages: (user.languages || []).join(', '),
        hobbies: (user.hobbies || []).join(', '),
        partnerPreferences: { ...emptyPrefs, ...(user.partnerPreferences || {}) },
        privacySettings: { ...emptyPrivacy, ...(user.privacySettings || {}) },
        photos: user.photos || [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user !== false) {
      axios.get(`${BACKEND_URL}/api/recommendations?limit=8`, )
        .then((r) => setRecommendations(r.data.recommendations || []))
        .catch(() => {});
    }
  }, [user, BACKEND_URL]);

  const completionPct = useMemo(() => {
    if (!formData) return 0;
    const fields = [
      'fullName','gender','age','dob','height','maritalStatus','religion','community','motherTongue',
      'education','occupation','annualIncome','state','district','mobile','email','aboutMe',
      'familyDetails','partnerExpectations','diet','smoking','drinking','hobbies','languages'
    ];
    let filled = fields.filter((f) => {
      const v = formData[f];
      return v !== undefined && v !== null && String(v).trim() !== '';
    }).length;
    if ((formData.photos || []).length > 0) filled += 1;
    return Math.round((filled / (fields.length + 1)) * 100);
  }, [formData]);

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading your dashboard...
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, partnerPreferences: { ...p.partnerPreferences, [name]: value } }));
  };
  const handlePrivacyChange = (name, value) => {
    setFormData((p) => ({ ...p, privacySettings: { ...p.privacySettings, [name]: value } }));
  };

  const flash = (kind, text) => {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        hobbies: formData.hobbies.split(',').map(s => s.trim()).filter(Boolean),
      };
      delete payload.photos; // photos managed separately
      await axios.put(`${BACKEND_URL}/api/users/profile`, payload, );
      await refreshUser();
      flash('success', 'Profile updated successfully!');
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if ((formData.photos || []).length >= 3) {
      flash('error', 'Maximum 3 photos allowed. Delete one to add another.');
      e.target.value = '';
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/users/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((p) => ({ ...p, photos: res.data.photos }));
      flash('success', 'Photo uploaded successfully');
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/users/photos/${photoId}`, );
      setFormData((p) => ({ ...p, photos: res.data.photos }));
      flash('success', 'Photo deleted');
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/users/photos/${photoId}/primary`, {}, );
      setFormData((p) => ({ ...p, photos: res.data.photos }));
      flash('success', 'Primary photo updated');
    } catch (err) {
      flash('error', 'Failed to set primary photo');
    }
  };

  const handleAccountDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/users/me`, );
      await logout();
      navigate('/');
    } catch (err) {
      flash('error', 'Failed to delete account');
    }
  };

  const primaryPhoto = (formData.photos || []).find(p => p.is_primary) || (formData.photos || [])[0];
  const heroPhotoUrl = primaryPhoto
    ? photoUrl(primaryPhoto)
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col text-slate-800" data-testid="dashboard-page">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">

        {/* Welcome / Completion header */}
        <div className="bg-gradient-to-r from-rose-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6" data-testid="dashboard-hero">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src={heroPhotoUrl} alt={formData.fullName} className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md" />
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Member Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold" data-testid="dashboard-welcome">Welcome, {formData.fullName || 'Member'}!</h1>
              <p className="text-rose-100/80 text-xs mt-0.5">
                Profile ID: {user?.id?.slice(0, 8).toUpperCase() || '—'} • {formData.community || 'Community'} • {formData.district || 'City'}
              </p>
            </div>
          </div>

          <div className="bg-rose-900/80 border border-rose-700/50 p-5 rounded-2xl text-center min-w-[220px]" data-testid="dashboard-completion">
            <p className="text-xs text-rose-200 font-medium mb-1">Profile Completion</p>
            <div className="text-3xl font-extrabold text-amber-300 mb-2" data-testid="completion-percent">{completionPct}%</div>
            <div className="w-full bg-rose-950 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }}></div>
            </div>
            <p className="text-[10px] text-rose-200 mt-2">Complete your profile to get better matches</p>
          </div>
        </div>

        {message && (
          <div
            data-testid="dashboard-toast"
            className={`mb-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
              message.kind === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {message.kind === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-rose-100 shadow-sm space-y-1" data-testid="dashboard-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  data-testid={`tab-${t.key}`}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
                    activeTab === t.key ? 'bg-rose-600 text-white shadow-md' : 'text-slate-700 hover:bg-rose-50'
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>

            <div className="bg-white p-3 rounded-2xl border border-rose-100 shadow-sm">
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                data-testid="dashboard-logout-btn"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8">
              <form onSubmit={handleSave} className="space-y-6">

                {activeTab === 'personal' && (
                  <Section title="Personal Information" subtitle="Update your personal identity and details.">
                    <Grid>
                      <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} testid="input-fullname" />
                      <Select label="Profile Created For" name="profileFor" value={formData.profileFor} onChange={handleChange} testid="select-profile-for"
                        options={['Self','Son','Daughter','Brother','Sister','Friend']} />
                      <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} testid="select-gender"
                        options={['Female','Male','Other']} />
                      <Field label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} testid="input-dob" />
                      <Field label="Age" name="age" type="number" value={formData.age} onChange={handleChange} testid="input-age" />
                      <Field label="Height" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 5 ft 6 in" testid="input-height" />
                      <Select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} testid="select-marital-status"
                        options={['Never Married','Divorced','Widowed','Awaiting Divorce']} />
                    </Grid>
                    <Textarea label="About Me" name="aboutMe" value={formData.aboutMe} onChange={handleChange}
                      placeholder="Share a few lines about yourself..." testid="textarea-about" />
                  </Section>
                )}

                {activeTab === 'contact' && (
                  <Section title="Contact Information" subtitle="Manage your phone, email, and location.">
                    <Grid>
                      <Field label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} testid="input-mobile" />
                      <Field label="WhatsApp Number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} testid="input-whatsapp" />
                      <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} testid="input-email" />
                      <Field label="State" name="state" value={formData.state} onChange={handleChange} testid="input-state" />
                      <Field label="City / District" name="district" value={formData.district} onChange={handleChange} testid="input-district" />
                    </Grid>
                  </Section>
                )}

                {activeTab === 'religion' && (
                  <Section title="Religion & Community" subtitle="Your religious background and language.">
                    <Grid cols={3}>
                      <Select label="Religion" name="religion" value={formData.religion} onChange={handleChange} testid="select-religion"
                        options={['Hindu','Muslim','Sikh','Christian','Jain','Buddhist','Parsi','Jewish','Other']} />
                      <Field label="Community / Caste" name="community" value={formData.community} onChange={handleChange} testid="input-community" />
                      <Field label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleChange} testid="input-mother-tongue"
                        placeholder="e.g. Hindi, Tamil, Marathi" />
                      <Select label="Manglik Status (optional)" name="manglik" value={formData.manglik} onChange={handleChange} testid="select-manglik"
                        options={['','Manglik','Non-Manglik','Anshik Manglik','Don\'t Know']} />
                      <Select label="Horoscope (optional)" name="horoscope" value={formData.horoscope} onChange={handleChange} testid="select-horoscope"
                        options={['','Available','Not Available','Don\'t Believe']} />
                    </Grid>
                  </Section>
                )}

                {activeTab === 'career' && (
                  <Section title="Education & Profession" subtitle="Your qualifications and career details.">
                    <Grid>
                      <Field label="Highest Education" name="education" value={formData.education} onChange={handleChange}
                        placeholder="e.g. B.Tech, MBA" testid="input-education" />
                      <Field label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange}
                        placeholder="e.g. Software Engineer" testid="input-occupation" />
                      <Select label="Annual Income Range (optional)" name="annualIncome" value={formData.annualIncome} onChange={handleChange} testid="select-income"
                        options={['','Below 5 LPA','5-10 LPA','10-15 LPA','15-25 LPA','25-50 LPA','50-100 LPA','100+ LPA']} />
                    </Grid>
                  </Section>
                )}

                {activeTab === 'lifestyle' && (
                  <Section title="Lifestyle" subtitle="Diet, habits, languages, hobbies.">
                    <Grid cols={3}>
                      <Select label="Diet" name="diet" value={formData.diet} onChange={handleChange} testid="select-diet"
                        options={['','Vegetarian','Non-Vegetarian','Eggetarian','Jain','Vegan']} />
                      <Select label="Smoking Habit" name="smoking" value={formData.smoking} onChange={handleChange} testid="select-smoking"
                        options={['','No','Occasionally','Yes']} />
                      <Select label="Drinking Habit" name="drinking" value={formData.drinking} onChange={handleChange} testid="select-drinking"
                        options={['','No','Occasionally','Yes']} />
                      <Field label="Disability (optional)" name="disability" value={formData.disability} onChange={handleChange} testid="input-disability" placeholder="None / describe" />
                      <Field label="Languages Known" name="languages" value={formData.languages} onChange={handleChange}
                        placeholder="Comma separated e.g. English, Hindi" testid="input-languages" />
                      <Field label="Hobbies & Interests" name="hobbies" value={formData.hobbies} onChange={handleChange}
                        placeholder="Comma separated e.g. Reading, Travel" testid="input-hobbies" />
                    </Grid>
                  </Section>
                )}

                {activeTab === 'family' && (
                  <Section title="Family Details" subtitle="Your family background and values.">
                    <Textarea label="Family Background" name="familyDetails" value={formData.familyDetails} onChange={handleChange}
                      rows={5} placeholder="Family type, father & mother occupation, siblings..." testid="textarea-family" />
                  </Section>
                )}

                {activeTab === 'preferences' && (
                  <Section title="Partner Preferences" subtitle="Describe your ideal partner. Used to power recommendations.">
                    <Grid cols={3}>
                      <Field label="Min Age" name="ageFrom" type="number" value={formData.partnerPreferences.ageFrom} onChange={handlePrefChange} testid="pref-age-from" />
                      <Field label="Max Age" name="ageTo" type="number" value={formData.partnerPreferences.ageTo} onChange={handlePrefChange} testid="pref-age-to" />
                      <Field label="Preferred Religion" name="religion" value={formData.partnerPreferences.religion} onChange={handlePrefChange} testid="pref-religion" />
                      <Field label="Preferred Community" name="community" value={formData.partnerPreferences.community} onChange={handlePrefChange} testid="pref-community" />
                      <Field label="Preferred Mother Tongue" name="motherTongue" value={formData.partnerPreferences.motherTongue} onChange={handlePrefChange} testid="pref-mother-tongue" />
                      <Field label="Preferred Marital Status" name="maritalStatus" value={formData.partnerPreferences.maritalStatus} onChange={handlePrefChange} testid="pref-marital-status" />
                      <Field label="Preferred Education" name="education" value={formData.partnerPreferences.education} onChange={handlePrefChange} testid="pref-education" />
                      <Field label="Preferred Occupation" name="occupation" value={formData.partnerPreferences.occupation} onChange={handlePrefChange} testid="pref-occupation" />
                      <Field label="Preferred State" name="state" value={formData.partnerPreferences.state} onChange={handlePrefChange} testid="pref-state" />
                      <Field label="Preferred City" name="district" value={formData.partnerPreferences.district} onChange={handlePrefChange} testid="pref-district" />
                      <Field label="Min Height" name="heightFrom" value={formData.partnerPreferences.heightFrom} onChange={handlePrefChange} placeholder="e.g. 5 ft 2 in" testid="pref-height-from" />
                      <Field label="Max Height" name="heightTo" value={formData.partnerPreferences.heightTo} onChange={handlePrefChange} placeholder="e.g. 6 ft 0 in" testid="pref-height-to" />
                    </Grid>
                    <Textarea label="Additional Partner Expectations" name="partnerExpectations" value={formData.partnerExpectations} onChange={handleChange}
                      rows={4} placeholder="Describe qualities you're looking for..." testid="textarea-partner-expectations" />
                  </Section>
                )}

                {activeTab === 'gallery' && (
                  <Section title="Photo Gallery" subtitle={`Upload up to 3 profile photos. Currently: ${(formData.photos || []).length}/3.`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(formData.photos || []).map((p) => (
                        <div key={p.id} className="relative group rounded-2xl overflow-hidden border border-rose-200 shadow-sm h-56 bg-slate-100" data-testid={`photo-tile-${p.id}`}>
                          <img src={photoUrl(p)} alt="profile" className="w-full h-full object-cover" />
                          {p.is_primary && (
                            <span className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" /> Primary
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/70 to-transparent">
                            {!p.is_primary && (
                              <button type="button" onClick={() => handleSetPrimary(p.id)} data-testid={`set-primary-${p.id}`}
                                className="flex-1 py-1.5 text-[10px] font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                                Make Primary
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeletePhoto(p.id)} data-testid={`delete-photo-${p.id}`}
                              className="flex-1 py-1.5 text-[10px] font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center justify-center gap-1">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {(formData.photos || []).length < 3 && (
                        <label
                          className="h-56 rounded-2xl border-2 border-dashed border-rose-300 flex flex-col items-center justify-center text-rose-500 cursor-pointer hover:bg-rose-50 transition-colors"
                          data-testid="upload-photo-tile"
                        >
                          <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" data-testid="photo-file-input" />
                          {uploading ? (
                            <span className="text-xs font-medium">Uploading...</span>
                          ) : (
                            <>
                              <Plus className="w-8 h-8 mb-2" />
                              <span className="text-xs font-semibold">Add Photo</span>
                              <span className="text-[10px] mt-1 text-slate-400">JPG/PNG/WEBP, max 5MB</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </Section>
                )}

                {activeTab === 'privacy' && (
                  <Section title="Privacy Settings" subtitle="Control who sees your details and how you appear.">
                    <div className="space-y-3 text-sm">
                      <PrivacyToggle label="Hide contact number until interest is accepted" desc="Only members whose interest you accept can see your number."
                        value={formData.privacySettings.hideMobile} onChange={(v) => handlePrivacyChange('hideMobile', v)} testid="privacy-hide-mobile" />
                      <PrivacyToggle label="Hide email address" value={formData.privacySettings.hideEmail}
                        onChange={(v) => handlePrivacyChange('hideEmail', v)} testid="privacy-hide-email" />
                      <PrivacyToggle label="Hide WhatsApp number" value={formData.privacySettings.hideWhatsapp}
                        onChange={(v) => handlePrivacyChange('hideWhatsapp', v)} testid="privacy-hide-whatsapp" />
                      <PrivacyToggle label="Hide profile photo" value={formData.privacySettings.hidePhotos}
                        onChange={(v) => handlePrivacyChange('hidePhotos', v)} testid="privacy-hide-photos" />
                      <PrivacyToggle label="Hide exact location (show only city / state)" value={formData.privacySettings.hideLocation}
                        onChange={(v) => handlePrivacyChange('hideLocation', v)} testid="privacy-hide-location" />
                      <PrivacyToggle label="Show last seen" value={formData.privacySettings.showLastSeen}
                        onChange={(v) => handlePrivacyChange('showLastSeen', v)} testid="privacy-show-last-seen" />
                      <PrivacyToggle label="Hide online status" value={formData.privacySettings.hideOnlineStatus}
                        onChange={(v) => handlePrivacyChange('hideOnlineStatus', v)} testid="privacy-hide-online" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Select label="Who can view your profile" name="whoCanView"
                          value={formData.privacySettings.whoCanView}
                          onChange={(e) => handlePrivacyChange('whoCanView', e.target.value)}
                          testid="privacy-who-can-view"
                          options={['Everyone','Verified Members','Same Community','Premium Members Only']} />
                        <Select label="Profile Visibility" name="profileVisibility"
                          value={formData.privacySettings.profileVisibility}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          testid="privacy-profile-visibility"
                          options={['Public','Private','Hidden']} />
                      </div>

                      <div className="pt-4 border-t border-rose-100 mt-4">
                        <p className="font-semibold text-slate-900 text-sm mb-2">Danger Zone</p>
                        <button type="button" onClick={() => setShowDeleteConfirm(true)} data-testid="delete-account-btn"
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Permanently Delete Account
                        </button>
                      </div>
                    </div>
                  </Section>
                )}

                {activeTab !== 'gallery' && activeTab !== 'privacy' && (
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" data-testid="save-profile-btn" disabled={saving}
                      className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl shadow-md hover:from-rose-700 hover:to-rose-800 transition-all text-sm flex items-center gap-2 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
                {activeTab === 'privacy' && (
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" data-testid="save-privacy-btn" disabled={saving}
                      className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl shadow-md hover:from-rose-700 hover:to-rose-800 transition-all text-sm flex items-center gap-2 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Recommended For You */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8" data-testid="recommended-section">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Smart Matches
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Recommended For You</h3>
                  <p className="text-xs text-slate-500 mt-1">Sorted by weighted compatibility score based on your preferences.</p>
                </div>
                <Link to="/search" className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1">
                  Explore All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Complete your Partner Preferences to see personalized matches.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.map((p) => {
                    const photo = (p.photos || [])[0];
                    return (
                      <div key={p.id} data-testid={`recommendation-card-${p.id}`}
                        className="bg-rose-50/30 rounded-2xl border border-rose-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-44 bg-slate-100">
                          <img
                            src={photo ? photoUrl(photo) : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'}
                            alt={p.fullName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-600/95 text-white px-2 py-0.5 rounded-full text-[10px] font-bold" data-testid={`rec-score-${p.id}`}>
                            {p.compatibility}% Match
                          </div>
                        </div>
                        <div className="p-3 space-y-1 flex-1">
                          <h4 className="font-serif font-bold text-slate-900 text-sm truncate">{p.fullName}, {p.age}</h4>
                          <p className="text-[11px] text-rose-600 font-semibold truncate">{p.religion} • {p.community}</p>
                          <p className="text-[11px] text-slate-500 truncate">📍 {p.district || '—'}, {p.state || '—'}</p>
                          <p className="text-[11px] text-slate-500 truncate">🎓 {p.education || '—'}</p>
                        </div>
                        <div className="p-3 pt-0">
                          <Link to="/search" className="w-full block py-2 text-center text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      {/* Delete account confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" data-testid="delete-account-modal">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 p-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Permanently Delete Account?</h3>
              <p className="text-sm text-slate-500">This will remove your profile, photos and preferences from Truejodi. This action cannot be undone.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold" data-testid="cancel-delete-btn">
                Cancel
              </button>
              <button onClick={handleAccountDelete} className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold" data-testid="confirm-delete-btn">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* ---------------- Small building blocks ---------------- */
function Section({ title, subtitle, children }) {
  return (
    <div className="space-y-6" data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="border-b border-rose-100 pb-4">
        <h3 className="text-xl font-serif font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
function Grid({ children, cols = 2 }) {
  const c = cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return <div className={`grid grid-cols-1 ${c} gap-5`}>{children}</div>;
}
function Field({ label, testid, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <input
        {...props}
        data-testid={testid}
        className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
      />
    </div>
  );
}
function Select({ label, options = [], testid, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <select
        {...props}
        data-testid={testid}
        className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
      >
        {options.map((o) => <option key={o} value={o}>{o || '— Select —'}</option>)}
      </select>
    </div>
  );
}
function Textarea({ label, testid, rows = 4, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <textarea
        {...props}
        rows={rows}
        data-testid={testid}
        className="w-full px-4 py-3 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
      />
    </div>
  );
}
function PrivacyToggle({ label, desc, value, onChange, testid }) {
  return (
    <label className="flex items-start gap-3 p-4 bg-rose-50/40 rounded-2xl border border-rose-100 cursor-pointer">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
        data-testid={testid}
        className="mt-1 w-4 h-4 text-rose-600 rounded border-rose-300" />
      <div>
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </label>
  );
}
