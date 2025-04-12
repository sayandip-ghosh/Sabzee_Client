import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function LanguageSelector() {
  const { currentLanguage, availableLanguages, changeLanguage, isLoading } = useLanguage();

  return (
    <select
      value={currentLanguage}
      onChange={(e) => changeLanguage(e.target.value)}
      className="bg-green-600 text-white border border-green-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      disabled={isLoading}
    >
      {availableLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector; 