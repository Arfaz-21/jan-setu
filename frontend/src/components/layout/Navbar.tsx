import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Globe, Menu, X, Landmark, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, mobileMenuOpen }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-inner">
                JS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white">
                    JAN SETU
                  </span>
                  <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-700/50 px-1.5 py-0.2 rounded font-medium">
                    KARNATAKA
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Citizen Application Readiness & Accountability Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors shadow-xs"
              title="Toggle between Kannada and English"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Demo Citizen Indicator */}
            <Link
              to="/profile"
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-300"
            >
              <div className="w-6 h-6 rounded-full bg-teal-600/30 text-teal-300 flex items-center justify-center font-bold text-[10px] border border-teal-500/40">
                MA
              </div>
              <span className="hidden md:inline font-medium text-slate-200">
                Mohammed Arfaz (Demo)
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
