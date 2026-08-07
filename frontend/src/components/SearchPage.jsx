import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ShieldCheck, Phone, Mail, Heart, X, Sparkles, Lock, Unlock, Clock, MailQuestion, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth, photoUrl } from '../context/AuthContext';

const emptyFilters = {
  gender: 'All', ageFrom: 21, ageTo: 40,
  religion: 'All', community: '', motherTongue: '',
  education: '', occupation: '',
  state: '', district: '',
  maritalStatus: 'All', heightFrom: '', heightTo: '',
};

export default function SearchPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [interestBusy, setInterestBusy] = useState({});
  const [toast, setToast] = useState(null);
  const { BACKEND_URL } = useAuth();

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== 'All' && v !== null && v !== undefined) params[k] = v;
      });
      const res = await axios.get(`${BACKEND_URL}/api/profiles/search`, { params });
      setProfiles(res.data.results || []);
    } catch (err) {
      console.error('Search failed', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, filters]);

  useEffect(() => { runSearch(); }, []);

  const flash = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const change = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const handleSendInterest = async (profile) => {
    if (interestBusy[profile.id]) return;
    setInterestBusy((p) => ({ ...p, [profile.id]: true }));
    try {
      const res = await axios.post(`${BACKEND_URL}/api/interests/send/${profile.id}`);
      const newInterest = res.data.interest;
      setProfiles((prev) => prev.map((p) => p.id === profile.id
        ? { ...p, interest: { status: newInterest.status, direction: 'sent', interest_id: newInterest.id } }
        : p));
      if (selectedProfile && selectedProfile.id === profile.id) {
        setSelectedProfile((sp) => ({ ...sp, interest: { status: newInterest.status, direction: 'sent', interest_id: newInterest.id } }));
      }
      flash('success', newInterest.status === 'accepted' ? 'Interest already accepted!' : 'Interest sent successfully');
    } catch (err) {
      flash('error', err.response?.data?.detail || 'Failed to send interest');
    } finally {
      setInterestBusy((p) => ({ ...p, [profile.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col text-slate-800" data-testid="search-page">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
            Matchmaking Explorer
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Find Compatible Profiles</h1>
          <p className="text-slate-600 text-sm mt-1">Advanced filters + weighted compatibility scoring, all real-time from the database.</p>
        </div>

        {toast && (
          <div
            data-testid="search-toast"
            className={`mb-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
              toast.kind === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {toast.kind === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {toast.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Filters */}
          <aside className="lg:col-span-1 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm h-fit space-y-4" data-testid="search-filters-sidebar">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <h3 className="font-serif font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-600" /> Filters
              </h3>
              <button onClick={() => setFilters(emptyFilters)} data-testid="reset-filters-btn"
                className="text-xs text-rose-600 font-semibold hover:underline">Reset</button>
            </div>

            <FilterSelect label="Gender" value={filters.gender} onChange={(v) => change('gender', v)}
              options={['All','Female','Male']} testid="filter-gender-select" />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={filters.ageFrom} onChange={(e) => change('ageFrom', e.target.value)}
                  data-testid="filter-age-from-input"
                  className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600" />
                <input type="number" value={filters.ageTo} onChange={(e) => change('ageTo', e.target.value)}
                  data-testid="filter-age-to-input"
                  className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600" />
              </div>
            </div>

            <FilterSelect label="Religion" value={filters.religion} onChange={(v) => change('religion', v)}
              options={['All','Hindu','Muslim','Sikh','Christian','Jain','Buddhist','Parsi']} testid="filter-religion-select" />

            <FilterInput label="Community / Caste" value={filters.community} onChange={(v) => change('community', v)}
              placeholder="e.g. Brahmin, Rajput" testid="filter-community-input" />

            <FilterInput label="Mother Tongue" value={filters.motherTongue} onChange={(v) => change('motherTongue', v)}
              placeholder="e.g. Hindi, Tamil" testid="filter-mother-tongue-input" />

            <FilterInput label="Education" value={filters.education} onChange={(v) => change('education', v)}
              placeholder="e.g. B.Tech, MBA" testid="filter-education-input" />

            <FilterInput label="Occupation" value={filters.occupation} onChange={(v) => change('occupation', v)}
              placeholder="e.g. Engineer" testid="filter-occupation-input" />

            <FilterInput label="State" value={filters.state} onChange={(v) => change('state', v)}
              placeholder="e.g. Maharashtra" testid="filter-state-input" />

            <FilterInput label="City / District" value={filters.district} onChange={(v) => change('district', v)}
              placeholder="e.g. Mumbai" testid="filter-district-input" />

            <FilterSelect label="Marital Status" value={filters.maritalStatus} onChange={(v) => change('maritalStatus', v)}
              options={['All','Never Married','Divorced','Widowed','Awaiting Divorce']} testid="filter-marital-status" />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={filters.heightFrom} onChange={(e) => change('heightFrom', e.target.value)}
                  placeholder="Min e.g. 5 ft" data-testid="filter-height-from-input"
                  className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600" />
                <input type="text" value={filters.heightTo} onChange={(e) => change('heightTo', e.target.value)}
                  placeholder="Max e.g. 6 ft" data-testid="filter-height-to-input"
                  className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600" />
              </div>
            </div>

            <button onClick={runSearch} data-testid="search-apply-filters-btn"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl text-xs shadow-md hover:from-rose-700 hover:to-rose-800 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Apply Filters
            </button>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4" data-testid="search-results-section">
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-rose-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-600">
                Showing <span className="text-rose-600 font-bold" data-testid="results-count">{profiles.length}</span> verified matches
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Sorted by compatibility
              </div>
            </div>

            {loading ? (
              <div className="bg-white p-12 rounded-3xl border border-rose-100 text-center text-slate-500 text-sm">
                Searching profiles...
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-rose-100 text-center space-y-3">
                <Search className="w-12 h-12 text-rose-300 mx-auto" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">No Profiles Found</h3>
                <p className="text-xs text-slate-500">Try relaxing your filters to see more matches.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profiles.map((profile) => {
                  const interest = profile.interest || { status: 'none' };
                  const isAccepted = interest.status === 'accepted';
                  const isPending = interest.status === 'pending';
                  const isDeclined = interest.status === 'declined';
                  const isReceived = interest.direction === 'received';
                  const showContact = isAccepted && !!profile.mobile;
                  const photo = (profile.photos || [])[0];
                  return (
                    <div key={profile.id} data-testid={`profile-card-${profile.id}`}
                      className="bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
                      <div>
                        <div className="relative h-56 overflow-hidden bg-slate-100">
                          <img src={photo ? photoUrl(photo) : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800'}
                            alt={profile.fullName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Verified
                          </div>
                          <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold" data-testid={`match-score-${profile.id}`}>
                            {profile.compatibility}% Match
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="text-xl font-serif font-bold text-slate-900">{profile.fullName}, {profile.age} yrs</h3>
                            <p className="text-xs text-rose-600 font-semibold">{profile.religion} • {profile.community} • {profile.motherTongue || '—'}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <div>🎓 <strong>Education:</strong> {profile.education || '—'}</div>
                            <div>💼 <strong>Occupation:</strong> {profile.occupation || '—'}</div>
                            <div>📍 <strong>Location:</strong> {profile.district || '—'}, {profile.state || '—'}</div>
                            <div>📏 <strong>Height:</strong> {profile.height || '—'} • <strong>Status:</strong> {profile.maritalStatus || '—'}</div>
                          </div>

                          {profile.aboutMe && (
                            <p className="text-xs text-slate-500 italic pt-1 line-clamp-2">&ldquo;{profile.aboutMe}&rdquo;</p>
                          )}

                          <div className={`p-3 rounded-xl border text-xs space-y-1 ${showContact ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50/50 border-rose-100'}`}>
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-rose-600" /> Mobile:</span>
                              <span className="font-mono font-semibold" data-testid={`card-mobile-${profile.id}`}>
                                {showContact ? profile.mobile : '+91 XXXXX XXXXX'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-rose-600" /> Email:</span>
                              <span className="font-mono font-semibold" data-testid={`card-email-${profile.id}`}>
                                {showContact ? profile.email : 'xxxxxx@example.com'}
                              </span>
                            </div>
                            <div className="mt-2 text-center text-[11px] font-semibold flex items-center justify-center gap-1.5" data-testid={`interest-state-${profile.id}`}>
                              {isAccepted ? (
                                <span className="text-emerald-700 flex items-center gap-1"><Unlock className="w-3.5 h-3.5" /> Contact unlocked — you both accepted</span>
                              ) : isPending && isReceived ? (
                                <span className="text-amber-700 flex items-center gap-1"><MailQuestion className="w-3.5 h-3.5" /> They sent you an interest — respond in Dashboard</span>
                              ) : isPending ? (
                                <span className="text-amber-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Interest pending — awaiting their response</span>
                              ) : isDeclined ? (
                                <span className="text-slate-500 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Interest declined</span>
                              ) : (
                                <span className="text-slate-500 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Send interest to unlock contact</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-2 flex items-center gap-3 border-t border-slate-100">
                        <button onClick={() => setSelectedProfile(profile)} data-testid={`view-profile-btn-${profile.id}`}
                          className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition-colors">
                          View Profile
                        </button>
                        <button
                          onClick={() => handleSendInterest(profile)}
                          data-testid={`send-interest-btn-${profile.id}`}
                          disabled={isPending || isAccepted || isDeclined || interestBusy[profile.id]}
                          className={`flex-1 py-2.5 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1 ${
                            isAccepted
                              ? 'bg-emerald-600 text-white'
                              : isPending
                                ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                                : isDeclined
                                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-sm disabled:opacity-60'
                          }`}>
                          <Heart className={`w-3.5 h-3.5 ${isAccepted ? 'fill-white' : ''}`} />
                          {isAccepted ? 'Match Accepted'
                            : isPending && isReceived ? 'Awaiting Your Reply'
                            : isPending ? 'Interest Sent'
                            : isDeclined ? 'Declined'
                            : (interestBusy[profile.id] ? 'Sending...' : 'Send Interest')}
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

      {/* Detail modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" data-testid="profile-modal">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100 p-8 relative">
            <button onClick={() => setSelectedProfile(null)} data-testid="close-profile-modal-btn"
              className="absolute top-6 right-6 p-2 rounded-full bg-rose-50 text-slate-700 hover:bg-rose-100 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-rose-100 pb-6 mb-6">
              <img
                src={(selectedProfile.photos || [])[0] ? photoUrl(selectedProfile.photos[0]) : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'}
                alt={selectedProfile.fullName}
                className="w-32 h-32 rounded-2xl object-cover shadow-md"
              />
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    {selectedProfile.compatibility}% Match
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedProfile.fullName}, {selectedProfile.age}</h2>
                <p className="text-sm text-rose-600 font-medium">{selectedProfile.religion} • {selectedProfile.community}</p>
                <p className="text-xs text-slate-500">Height: {selectedProfile.height || '—'} • {selectedProfile.maritalStatus || '—'}</p>
              </div>
            </div>

            <div className="space-y-5 text-sm text-slate-700">
              {selectedProfile.aboutMe && (
                <Block title="About">
                  <p className="text-slate-600 leading-relaxed bg-rose-50/40 p-4 rounded-xl border border-rose-100">&ldquo;{selectedProfile.aboutMe}&rdquo;</p>
                </Block>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Panel title="Education & Career">
                  <p>🎓 <strong>Education:</strong> {selectedProfile.education || '—'}</p>
                  <p>💼 <strong>Occupation:</strong> {selectedProfile.occupation || '—'}</p>
                  <p>💰 <strong>Income:</strong> {selectedProfile.annualIncome || '—'}</p>
                </Panel>
                <Panel title="Location & Language">
                  <p>📍 <strong>City:</strong> {selectedProfile.district || '—'}</p>
                  <p>🗺️ <strong>State:</strong> {selectedProfile.state || '—'}</p>
                  <p>🗣️ <strong>Mother Tongue:</strong> {selectedProfile.motherTongue || '—'}</p>
                </Panel>
                <Panel title="Lifestyle">
                  <p>🍽️ <strong>Diet:</strong> {selectedProfile.diet || '—'}</p>
                  <p>🚬 <strong>Smoking:</strong> {selectedProfile.smoking || '—'}</p>
                  <p>🍷 <strong>Drinking:</strong> {selectedProfile.drinking || '—'}</p>
                </Panel>
                <Panel title="Family & Faith">
                  <p>🪔 <strong>Manglik:</strong> {selectedProfile.manglik || '—'}</p>
                  <p>👨‍👩‍👧 <strong>Family:</strong> {selectedProfile.familyDetails || '—'}</p>
                </Panel>
              </div>
              {selectedProfile.partnerExpectations && (
                <Block title="Partner Expectations">
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedProfile.partnerExpectations}
                  </p>
                </Block>
              )}

              <div className={`p-4 rounded-xl border space-y-2 ${selectedProfile.interest?.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-rose-700">Contact</h5>
                <p className="flex items-center gap-2">📱 <strong>Mobile:</strong> <span className="font-mono">{selectedProfile.mobile || 'Locked — send interest to reveal'}</span></p>
                <p className="flex items-center gap-2">✉️ <strong>Email:</strong> <span className="font-mono">{selectedProfile.email || 'Locked — send interest to reveal'}</span></p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
              <button onClick={() => setSelectedProfile(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
                Close
              </button>
              {(() => {
                const ist = selectedProfile.interest || { status: 'none' };
                if (ist.status === 'accepted') {
                  return (
                    <div className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm text-center flex items-center justify-center gap-2" data-testid="modal-interest-accepted">
                      <Unlock className="w-4 h-4" /> Contact Unlocked
                    </div>
                  );
                }
                if (ist.status === 'pending' && ist.direction === 'received') {
                  return (
                    <div className="flex-1 py-3 bg-amber-100 text-amber-800 font-semibold rounded-xl text-sm text-center flex items-center justify-center gap-2" data-testid="modal-interest-pending-received">
                      <MailQuestion className="w-4 h-4" /> Respond in Dashboard
                    </div>
                  );
                }
                if (ist.status === 'pending') {
                  return (
                    <div className="flex-1 py-3 bg-amber-100 text-amber-800 font-semibold rounded-xl text-sm text-center flex items-center justify-center gap-2" data-testid="modal-interest-pending-sent">
                      <Clock className="w-4 h-4" /> Interest Pending
                    </div>
                  );
                }
                if (ist.status === 'declined') {
                  return (
                    <div className="flex-1 py-3 bg-slate-100 text-slate-500 font-semibold rounded-xl text-sm text-center" data-testid="modal-interest-declined">
                      Interest Declined
                    </div>
                  );
                }
                return (
                  <button
                    onClick={() => handleSendInterest(selectedProfile)}
                    disabled={interestBusy[selectedProfile.id]}
                    data-testid="modal-send-interest-btn"
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl text-sm shadow-md hover:from-rose-700 hover:to-rose-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <Heart className="w-4 h-4 fill-white" /> {interestBusy[selectedProfile.id] ? 'Sending...' : 'Send Interest'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* Building blocks */
function FilterSelect({ label, value, onChange, options, testid }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
        className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function FilterInput({ label, value, onChange, testid, ...rest }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
        {...rest}
        className="w-full px-3 py-2.5 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600" />
    </div>
  );
}
function Block({ title, children }) {
  return (
    <div>
      <h4 className="font-serif font-bold text-slate-900 mb-2 border-l-2 border-rose-600 pl-2">{title}</h4>
      {children}
    </div>
  );
}
function Panel({ title, children }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
      <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-rose-600">{title}</h5>
      {children}
    </div>
  );
}
