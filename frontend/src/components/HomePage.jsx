import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Search, UserPlus, ShieldCheck, Users, Sparkles, CheckCircle2, 
  Award, ArrowRight, MessageSquareQuote, ChevronDown, PhoneCall, Mail, MapPin, Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MOCK_PROFILES, TESTIMONIALS, MEMBERSHIP_PLANS, FAQS } from '../mock';

export default function HomePage() {
  const [openFaq, setOpenFaq] = React.useState(null);
  const [contactSubmitted, setContactSubmitted] = React.useState(false);

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col font-sans text-slate-800" data-testid="home-page">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-900 via-rose-950 to-slate-950 text-white py-20 lg:py-28" data-testid="hero-section">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-400" /> India's Most Trusted Royal Matrimony Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-tight">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-rose-300">True Soulmate</span> With Grace & Dignity
              </h1>

              <p className="text-base sm:text-lg text-rose-100/80 max-w-2xl mx-auto lg:mx-0 font-light">
                Connecting compatible hearts across communities, cultures, and continents with 100% verified profiles, sacred values, and elite matchmaking.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/search"
                  data-testid="hero-search-partner-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all transform hover:-translate-y-0.5"
                >
                  <Search className="w-5 h-5" /> Search Partner
                </Link>
                <Link
                  to="/register"
                  data-testid="hero-register-now-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-rose-600 border border-rose-500 rounded-full shadow-lg hover:bg-rose-700 transition-all transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-5 h-5" /> Register Now
                </Link>
              </div>

              {/* Quick Trust badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-rose-900/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <h4 className="text-2xl font-bold text-amber-400">100%</h4>
                  <p className="text-xs text-rose-200/70">Verified Profiles</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-amber-400">50K+</h4>
                  <p className="text-xs text-rose-200/70">Happy Marriages</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-amber-400">Secure</h4>
                  <p className="text-xs text-rose-200/70">Privacy Protected</p>
                </div>
              </div>

            </div>

            {/* Right Couple Image Placeholder */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-rose-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-rose-500/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800"
                    alt="Happy Indian Couple"
                    className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-medium mb-2">
                      <Heart className="w-3.5 h-3.5 fill-white" /> Success Story
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white">Aarav & Meera</h3>
                    <p className="text-xs text-amber-300 font-medium">Married in Mumbai • Truejodi Verified Match</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Success Counter Section */}
      <section className="bg-white py-12 border-b border-rose-100 shadow-sm relative z-20 -mt-8 max-w-6xl mx-auto rounded-2xl px-6 sm:px-10" data-testid="success-counter-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-900">2,50,000+</h3>
            <p className="text-sm font-medium text-slate-500">Total Registered Users</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-900">1,35,000+</h3>
            <p className="text-sm font-medium text-slate-500">Registered Grooms</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-900">1,15,000+</h3>
            <p className="text-sm font-medium text-slate-500">Registered Brides</p>
          </div>
          <div className="space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-900">48,500+</h3>
            <p className="text-sm font-medium text-slate-500">Happy Families</p>
          </div>
        </div>
      </section>

      {/* About Platform Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-testid="about-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider">
              About Truejodi
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              Where Sacred Traditions Meet Modern Matchmaking
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Truejodi Matrimony was founded with a singular vision: to create a dignified, secure, and intuitive platform where eligible singles and their families can discover compatible life partners with absolute peace of mind.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                <p className="text-sm text-slate-700"><strong>Verified Backgrounds:</strong> Every profile undergoes manual verification for employment, mobile, and identity.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                <p className="text-sm text-slate-700"><strong>Privacy Control:</strong> Your photos and contact details remain hidden until you choose to connect.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                <p className="text-sm text-slate-700"><strong>Community Focused:</strong> Granular filters for religion, community, gotra, mother tongue, and location.</p>
              </div>
            </div>
            <div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 text-white font-semibold text-sm shadow-md hover:bg-rose-700 transition-colors"
              >
                Join Truejodi Today <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=500"
              alt="Indian Wedding Ceremony"
              className="rounded-2xl shadow-lg object-cover h-64 w-full"
            />
            <img
              src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=500"
              alt="Engagement Celebration"
              className="rounded-2xl shadow-lg object-cover h-64 w-full mt-8"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 border-y border-rose-100" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3">
            Simple 3-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">
            How Truejodi Works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-16 text-base">
            Your journey to a blissful lifetime partnership is simple, secure, and structured in three easy steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 relative group hover:shadow-xl transition-all">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-rose-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mt-4 mb-3">Create Your Profile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Register for free, add your career, education, family background, and upload your best profile photos.
              </p>
            </div>

            <div className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 relative group hover:shadow-xl transition-all">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mt-4 mb-3">Search & Filter</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use our advanced search filters to explore verified profiles tailored to your exact community and preferences.
              </p>
            </div>

            <div className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 relative group hover:shadow-xl transition-all">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-rose-700 text-white font-bold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 mt-4 mb-3">Connect & Meet</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Send interests, unlock verified contact details, and take the first step towards your happily ever after.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-testid="featured-profiles-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Verified Matches
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Featured Profiles on Truejodi</h2>
          </div>
          <Link
            to="/search"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-rose-700 font-semibold hover:text-rose-800 transition-colors"
          >
            Explore All Profiles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PROFILES.slice(0, 4).map((profile) => (
            <div key={profile.id} className="bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Verified
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-amber-300">
                  {profile.id}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">{profile.name}, {profile.age}</h3>
                  <p className="text-xs text-rose-600 font-medium mb-2">{profile.religion} • {profile.community}</p>
                  <p className="text-xs text-slate-600 mb-1">🎓 {profile.education}</p>
                  <p className="text-xs text-slate-600 mb-1">💼 {profile.occupation}</p>
                  <p className="text-xs text-slate-500">📍 {profile.district}, {profile.state}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Link
                    to="/search"
                    className="w-full text-center block py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us & Features */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8" data-testid="why-choose-us-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Excellence Guaranteed</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-2 mb-4">Why Families Trust Truejodi</h2>
            <p className="text-slate-400 text-base">We combine traditional matchmaking values with modern technology to deliver the most reliable matrimony experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 p-8 rounded-2xl border border-rose-900/30">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">100% Screened Profiles</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every profile is manually checked and verified via phone number, ID proof, and social footprint to ensure complete safety.
              </p>
            </div>

            <div className="bg-slate-800/60 p-8 rounded-2xl border border-rose-900/30">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">Smart Compatibility</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our advanced algorithm matches profiles based on community, lifestyle, career goals, and traditional values.
              </p>
            </div>

            <div className="bg-slate-800/60 p-8 rounded-2xl border border-rose-900/30">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">Absolute Privacy Control</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your contact info and photos are hidden until you approve connection requests. You remain in total control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-testid="membership-plans-section">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
            Royal Packages
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">Membership Plans Preview</h2>
          <p className="text-slate-600 text-base">Choose the plan that suits your matchmaking journey best.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MEMBERSHIP_PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-8 border relative flex flex-col justify-between ${
                plan.highlight ? 'border-rose-500 shadow-2xl ring-2 ring-rose-500/20' : 'border-rose-100 shadow-md'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-600 to-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                  {plan.badge}
                </div>
              )}
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">/ {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-slate-600">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/register"
                className={`w-full py-3 rounded-xl font-semibold text-center text-sm transition-all block ${
                  plan.highlight
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-rose-50/50 py-20 px-4 sm:px-6 lg:px-8 border-y border-rose-100" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
              Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">Happily Ever After</h2>
            <p className="text-slate-600 text-base">Read heartfelt stories from couples who found their soulmate on Truejodi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
                <div>
                  <MessageSquareQuote className="w-10 h-10 text-rose-400 mb-4 opacity-50" />
                  <p className="text-slate-700 italic text-sm leading-relaxed mb-6">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <img src={t.photo} alt={t.names} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">{t.names}</h4>
                    <p className="text-xs text-rose-600 font-medium">{t.location} • Married {t.marriedDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" data-testid="faq-section">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
            Got Questions?
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-base">Everything you need to know about Truejodi Matrimony.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                data-testid={`faq-toggle-${idx}`}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-serif font-semibold text-slate-900 hover:text-rose-600 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-rose-600 transition-transform ${openFaq === idx ? 'transform rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed border-t border-rose-50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gradient-to-tr from-rose-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8" data-testid="contact-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                Get In Touch
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold">We Are Here To Assist Your Matchmaking Journey</h2>
              <p className="text-rose-100/80 text-base">
                Have questions regarding membership plans, profile verification, or personalized matchmaking? Reach out to our dedicated support team.
              </p>
              
              <div className="space-y-4 text-sm pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-800/60 flex items-center justify-center text-amber-300">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-200">Helpline Number</p>
                    <p className="font-semibold text-white">+91 (022) 555-TRUEJODI</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-800/60 flex items-center justify-center text-amber-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-200">Email Support</p>
                    <p className="font-semibold text-white">support@truejodi.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-800/60 flex items-center justify-center text-amber-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-200">Corporate Office</p>
                    <p className="font-semibold text-white">BKC, Bandra East, Mumbai, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-serif font-bold mb-6">Send Us a Message</h3>
              {contactSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-lg">Thank You!</h4>
                  <p className="text-sm">Your message has been received. Our relationship manager will contact you shortly.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm"
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile or Email</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter phone or email"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm"
                      data-testid="contact-email-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm"
                      data-testid="contact-message-textarea"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    data-testid="contact-submit-btn"
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl shadow-md hover:from-rose-700 hover:to-rose-800 transition-all text-sm"
                  >
                    Send Enquiry
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
