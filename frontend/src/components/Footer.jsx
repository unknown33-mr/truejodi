import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-rose-900/30" data-testid="footer-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-serif">
                True<span className="text-rose-500">jodi</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Truejodi Matrimony is India's most trusted royal matchmaking platform, blending traditional values with advanced verified profiles to help you find your eternal soulmate.
            </p>
            <div className="flex items-center gap-3 text-xs text-amber-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Mobile & ID Profiles
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif text-base font-semibold mb-4 border-l-2 border-rose-600 pl-3">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-rose-400 transition-colors">Home Page</Link></li>
              <li><Link to="/search" className="hover:text-rose-400 transition-colors">Search Partners</Link></li>
              <li><Link to="/register" className="hover:text-rose-400 transition-colors">Register Free</Link></li>
              <li><Link to="/login" className="hover:text-rose-400 transition-colors">Member Login</Link></li>
            </ul>
          </div>

          {/* Explore Communities */}
          <div>
            <h4 className="text-white font-serif text-base font-semibold mb-4 border-l-2 border-rose-600 pl-3">
              Top Communities
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/search?community=Brahmin" className="hover:text-rose-400 transition-colors">Brahmin Matrimony</Link></li>
              <li><Link to="/search?community=Rajput" className="hover:text-rose-400 transition-colors">Rajput Matrimony</Link></li>
              <li><Link to="/search?community=Reddy" className="hover:text-rose-400 transition-colors">Reddy Matrimony</Link></li>
              <li><Link to="/search?community=Khatri" className="hover:text-rose-400 transition-colors">Khatri Matrimony</Link></li>
              <li><Link to="/search?community=Nair" className="hover:text-rose-400 transition-colors">Nair Matrimony</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-white font-serif text-base font-semibold mb-4 border-l-2 border-rose-600 pl-3">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 mt-1 shrink-0" />
                <span>Truejodi Towers, BKC, Bandra East, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <span>+91 (022) 555-TRUEJODI</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                <span>support@truejodi.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Truejodi Matrimony Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Use</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Safeguards</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
