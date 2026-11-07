import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileCheck, Volume2,
  Clock, FileText, UserCheck, Shield, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { t, language } = useLanguage();

  const navItems = [
    {
      to: '/dashboard',
      label: t('dashboard', 'Citizen Dashboard'),
      kn_label: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      icon: LayoutDashboard,
    },
    {
      to: '/schemes',
      label: t('schemes', 'Scheme Explorer'),
      kn_label: 'ಯೋಜನೆಗಳ ಪರಿಶೀಲನೆ',
      icon: Search,
    },
    {
      to: '/documents',
      label: t('document_checker', 'Document Readiness'),
      kn_label: 'ದಾಖಲೆಗಳ ಸಿದ್ಧತೆ',
      icon: FileCheck,
      badge: 'Core',
    },
    {
      to: '/voice',
      label: t('voice_assistant', 'Kannada Voice Guide'),
      kn_label: 'ಕನ್ನಡ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ',
      icon: Volume2,
      badge: 'Audio',
    },
    {
      to: '/sakala',
      label: t('sakala_tracker', 'Sakala Tracker'),
      kn_label: 'ಸಕಾಲ ಟ್ರ್ಯಾಕರ್',
      icon: Clock,
    },
    {
      to: '/appeals',
      label: t('appeal_generator', 'Appeal Draft Generator'),
      kn_label: 'ಮೇಲ್ಮನವಿ ಪತ್ರ ರಚನೆ',
      icon: FileText,
    },
    {
      to: '/profile',
      label: t('profile_privacy', 'Profile & Privacy'),
      kn_label: 'ವಿವರ ಮತ್ತು ಗೌಪ್ಯತೆ',
      icon: UserCheck,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {language === 'kn' ? 'ಮುಖ್ಯ ಮೆನು' : 'Platform Navigation'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-700/80 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{language === 'kn' ? item.kn_label : item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/40">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Official Portals reference section */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Karnataka Portals</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </div>
        <ul className="space-y-1 text-slate-400">
          <li>
            <a
              href="https://sevasindhuservices.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-300 flex items-center justify-between py-1"
            >
              <span>Seva Sindhu</span>
              <span className="text-[10px] text-slate-500">Official</span>
            </a>
          </li>
          <li>
            <a
              href="https://ssp.postmatric.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-300 flex items-center justify-between py-1"
            >
              <span>SSP Post-Matric</span>
              <span className="text-[10px] text-slate-500">Official</span>
            </a>
          </li>
          <li>
            <a
              href="https://nadakacheri.karnataka.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-300 flex items-center justify-between py-1"
            >
              <span>Nadakacheri (AJKS)</span>
              <span className="text-[10px] text-slate-500">Official</span>
            </a>
          </li>
        </ul>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-500/80 shrink-0" />
          <span>INNOVEX Season 02 – PS1 GovTech</span>
        </div>
      </div>
    </aside>
  );
};
