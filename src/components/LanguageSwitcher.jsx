import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' }
  ];

  return (
    <div className="language-switcher">
      <Globe size={16} />
      <select 
        value={language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
