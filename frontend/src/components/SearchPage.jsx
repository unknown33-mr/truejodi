import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Phone, Mail, Eye, EyeOff, Heart, CheckCircle2, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MOCK_PROFILES } from '../mock';

export default function SearchPage() {
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('35');
  const [religionFilter, setReligionFilter] = useState('All');
  const [communityFilter, setCommunityFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Unlocked contact states for mock interaction
  const [unlockedContacts, setUnlockedContacts] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [interestSent, setInterestSent] = useState({});

  const toggleContact = (id) => {
    setUnlockedContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendInterest = (id) => {
    setInterestSent((prev) => ({ ...prev, [id]: true }));
  };

  // Filter logic
  const filteredProfiles = MOCK_PROFILES.filter((profile) => {
    if (genderFilter !== 'All' && profile.gender !== genderFilter) return false;
    if (profile.age < parseInt(ageFrom || 18) || profile.age > parseInt(ageTo || 60)) return false;
    if (religionFilter !== 'All' && profile.religion !== religionFilter) return false;
    if (communityFilter && !profile.community.toLowerCase().includes(communityFilter.toLowerCase())) return false;
    if (educationFilter && !profile.education.toLowerCase().includes(educationFilter.toLowerCase())) return false;
    if (occupationFilter && !profile.occupation.toLowerCase().includes(occupationFilter.toLowerCase())) return false;
    if (stateFilter && !profile.state.toLowerCase().includes(stateFilter.toLowerCase())) return false;
    if (districtFilter && !profile.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col font-sans text-slate-800" data-testid="search-page">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
            Matchmaking Explorer
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Find Compatible Profiles</h1>
          <p className="text-slate-600 text-sm mt-1">Use advanced filters to explore verified matches tailored to your preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm h-fit space-y-5" data-testid="search-filters-sidebar">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100">
              <h3 className="font-serif font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-600" /> Advanced Filters
              </h3>
              <button
                onClick={() => {
                  setGenderFilter('All');
                  setAgeFrom('21');
                  setAgeTo('35');
                  setReligionFilter('All');
                  setCommunityFilter('');
                  setEducationFilter('');
                  setOccupationFilter('');
                  setStateFilter('');
                  setDistrictFilter('');
                }}
                className="text-xs text-rose-600 font-semibold hover:underline"
                data-testid="reset-filters-btn"
              >
                Reset
              </button>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-gender-select"
              >
                <option value="All">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                  data-testid="filter-age-from-input"
                />
                <input
                  type="number"
                  placeholder="To"
                  value={ageTo}
                  onChange={(e) => setAgeTo(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                  data-testid="filter-age-to-input"
                />
              </div>
            </div>

            {/* Religion */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Religion</label>
              <select
                value={religionFilter}
                onChange={(e) => setReligionFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-religion-select"
              >
                <option value="All">All Religions</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Sikh">Sikh</option>
                <option value="Christian">Christian</option>
                <option value="Jain">Jain</option>
              </select>
            </div>

            {/* Community */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Community</label>
              <input
                type="text"
                placeholder="e.g. Brahmin, Rajput"
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-community-input"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education</label>
              <input
                type="text"
                placeholder="e.g. B.Tech, MBA"
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-education-input"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                placeholder="e.g. Engineer, Doctor"
                value={occupationFilter}
                onChange={(e) => setOccupationFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-occupation-input"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-state-input"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District / City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600"
                data-testid="filter-district-input"
              />
            </div>

            <button
              onClick={() => {}}
              data-testid="search-apply-filters-btn"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl text-xs shadow-md hover:from-rose-700 hover:to-rose-800 transition-all"
            >
              Apply Filters
            </button>
          </div>

          {/* Search Results Grid */}
          <div className="lg:col-span-3 space-y-6" data-testid="search-results-section">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-rose-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-600">
                Showing <span className="text-rose-600 font-bold">{filteredProfiles.length}</span> verified matches
              </p>
              <div className="text-xs text-slate-500">
                Contact numbers hidden for privacy
              </div>
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-rose-100 text-center space-y-3">
                <Search className="w-12 h-12 text-rose-300 mx-auto" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">No Profiles Found</h3>
                <p className="text-xs text-slate-500">Try adjusting your search filters to find more matches.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProfiles.map((profile) => {
                  const isUnlocked = unlockedContacts[profile.id];
                  const isInterested = interestSent[profile.id];

                  return (
                    <div
                      key={profile.id}
                      data-testid={`profile-card-${profile.id}`}
                      className="bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Photo & ID Banner */}
                        <div className="relative h-60 overflow-hidden">
                          <img
                            src={profile.photo}
                            alt={profile.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Verified Profile
                          </div>
                          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-amber-300">
                            {profile.id}
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-6 space-y-3">
                          <div>
                            <h3 className="text-xl font-serif font-bold text-slate-900">
                              {profile.name}, {profile.age} yrs
                            </h3>
                            <p className="text-xs text-rose-600 font-semibold">
                              {profile.religion} • {profile.community}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <div>🎓 <strong>Education:</strong> {profile.education}</div>
                            <div>💼 <strong>Occupation:</strong> {profile.occupation}</div>
                            <div>📍 <strong>Location:</strong> {profile.district}, {profile.state}</div>
                          </div>

                          <p className="text-xs text-slate-500 italic pt-1">
                            "{profile.bio}"
                          </p>

                          {/* Contact Hidden / Shown section */}
                          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-rose-600" /> Mobile:</span>
                              <span className="font-mono font-semibold">
                                {isUnlocked ? profile.mobile : '+91 XXXXX XXXXX'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-rose-600" /> Email:</span>
                              <span className="font-mono font-semibold">
                                {isUnlocked ? profile.email : 'xxxxxx@example.com'}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleContact(profile.id)}
                              data-testid={`toggle-contact-btn-${profile.id}`}
                              className="mt-2 w-full py-1.5 text-center bg-white border border-rose-200 text-rose-700 rounded-lg font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                            >
                              {isUnlocked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {isUnlocked ? 'Hide Contact Details' : 'Show Contact Details'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-6 pb-6 pt-2 flex items-center gap-3 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          data-testid={`view-profile-btn-${profile.id}`}
                          className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition-colors text-center"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleSendInterest(profile.id)}
                          data-testid={`send-interest-btn-${profile.id}`}
                          className={`flex-1 py-2.5 font-semibold rounded-xl text-xs transition-all text-center flex items-center justify-center gap-1 ${
                            isInterested
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-sm'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isInterested ? 'fill-white' : ''}`} />
                          {isInterested ? 'Interest Sent' : 'Send Interest'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* View Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" data-testid="profile-modal">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100 p-8 relative">
            
            <button
              onClick={() => setSelectedProfile(null)}
              data-testid="close-profile-modal-btn"
              className="absolute top-6 right-6 p-2 rounded-full bg-rose-50 text-slate-700 hover:bg-rose-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-rose-100 pb-6 mb-6">
              <img
                src={selectedProfile.photo}
                alt={selectedProfile.name}
                className="w-32 h-32 rounded-2xl object-cover shadow-md"
              />
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  {selectedProfile.name}, {selectedProfile.age}
                </h2>
                <p className="text-sm text-rose-600 font-medium">
                  {selectedProfile.religion} • {selectedProfile.community}
                </p>
                <p className="text-xs text-slate-500 font-mono">Profile ID: {selectedProfile.id}</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-700">
              <div>
                <h4 className="font-serif font-bold text-slate-900 mb-2 border-l-2 border-rose-600 pl-2">
                  About & Background
                </h4>
                <p className="text-slate-600 leading-relaxed bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                  "{selectedProfile.bio}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-rose-600">Education & Career</h5>
                  <p>🎓 <strong>Education:</strong> {selectedProfile.education}</p>
                  <p>💼 <strong>Occupation:</strong> {selectedProfile.occupation}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-rose-600">Location & Roots</h5>
                  <p>📍 <strong>District:</strong> {selectedProfile.district}</p>
                  <p>🗺️ <strong>State:</strong> {selectedProfile.state}</p>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2">
                <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-rose-700">Secured Contact Details</h5>
                <p className="flex items-center gap-2">📱 <strong>Mobile:</strong> <span className="font-mono">{selectedProfile.mobile}</span></p>
                <p className="flex items-center gap-2">✉️ <strong>Email:</strong> <span className="font-mono">{selectedProfile.email}</span></p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setSelectedProfile(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSendInterest(selectedProfile.id);
                  setSelectedProfile(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl text-sm shadow-md hover:from-rose-700 hover:to-rose-800 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" /> Send Interest Now
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
