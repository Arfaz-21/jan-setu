import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultEn?: string) => string;
}

const UI_TRANSLATIONS: Record<string, Record<Language, string>> = {
  app_title: { en: 'JAN SETU', kn: 'ಜನ ಸೇತು' },
  tagline: { en: 'Citizen Application Readiness & Accountability Platform', kn: 'ನಾಗರಿಕ ಅರ್ಜಿ ಸಿದ್ಧತೆ ಮತ್ತು ಹೊಣೆಗಾರಿಕೆ ವೇದಿಕೆ' },
  dashboard: { en: 'Dashboard', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  schemes: { en: 'Scheme Explorer', kn: 'ಯೋಜನೆಗಳ ಪರಿಶೀಲನೆ' },
  document_checker: { en: 'Document Readiness', kn: 'ದಾಖಲೆಗಳ ಸಿದ್ಧತೆ' },
  voice_assistant: { en: 'Kannada Voice Guide', kn: 'ಕನ್ನಡ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ' },
  sakala_tracker: { en: 'Sakala Tracker', kn: 'ಸಕಾಲ ಟ್ರ್ಯಾಕರ್' },
  appeal_generator: { en: 'Appeal Generator', kn: 'ಮೇಲ್ಮನವಿ ಪತ್ರ ರಚನೆ' },
  profile_privacy: { en: 'Profile & Privacy', kn: 'ವಿವರ ಮತ್ತು ಗೌಪ್ಯತೆ' },
  check_readiness_btn: { en: 'Check Document Readiness', kn: 'ದಾಖಲೆಗಳ ಸಿದ್ಧತೆ ಪರಿಶೀಲಿಸಿ' },
  explore_schemes_btn: { en: 'Explore Schemes', kn: 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ' },
  disclaimer: { en: 'GovTech Prototype: For informational assistance. Never guarantees eligibility or automatic approval.', kn: 'ಮಾದರಿ ವ್ಯವಸ್ಥೆ: ಮಾಹಿತಿ ಸಹಾಯಕ್ಕಾಗಿ ಮಾತ್ರ. ಸ್ವಯಂಚಾಲಿತ ಅನುಮೋದನೆಯನ್ನು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ.' },
  verified: { en: 'Verified', kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  attention_required: { en: 'Attention Required', kn: 'ಗಮನ ಅಗತ್ಯವಿದೆ' },
  unable_to_verify: { en: 'Unable to Verify', kn: 'ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ' },
  score_label: { en: 'Application Readiness Score', kn: 'ಅರ್ಜಿ ಸಿದ್ಧತಾ ಸ್ಕೋರ್' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('jan_setu_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('jan_setu_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'kn' : 'en'));
  };

  const t = (key: string, defaultEn?: string): string => {
    if (UI_TRANSLATIONS[key]) {
      return UI_TRANSLATIONS[key][language] || defaultEn || key;
    }
    return defaultEn || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
