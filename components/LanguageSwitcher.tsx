import React, { useState } from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-700 text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
        aria-label="Select language"
      >
        <span>{selectedLanguage.flag}</span>
        <span className="hidden sm:inline">{selectedLanguage.name}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg z-10 animate-fade-in">
          <ul className="py-1">
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-cyan-500 hover:text-white transition-colors"
                >
                  <span>{lang.flag}</span>
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;