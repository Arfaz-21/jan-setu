import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DisclaimerBanner: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          {language === 'kn' ? (
            <>
              <strong>ಮಾದರಿ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ:</strong> ಜನ ಸೇತು ಅರ್ಜಿ ಸಿದ್ಧತೆ ಮತ್ತು ಪರಿಶೀಲನೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಅಲ್ಲ ಮತ್ತು ನೇರ ಅನುಮೋದನೆಯನ್ನು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ.
            </>
          ) : (
            <>
              <strong>GovTech Prototype:</strong> JAN SETU evaluates application readiness and statutory service timelines. It complements official portals and never guarantees eligibility or automatic approval.
            </>
          )}
        </span>
      </div>
    </div>
  );
};
