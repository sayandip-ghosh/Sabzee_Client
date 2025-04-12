import React, { createContext, useContext, useState, useEffect } from 'react';
import { translationApi } from '../services/translationApi';

const LanguageContext = createContext();

// Cache translations to avoid repeated API calls
const translationCache = new Map();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('userLanguage') || 'en';
  });
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      const languages = await translationApi.getLanguages();
      setAvailableLanguages(languages);
    };
    fetchLanguages();
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('userLanguage', currentLanguage);
  }, [currentLanguage]);

  const translate = async (text) => {
    if (!text || currentLanguage === 'en') return text;

    const cacheKey = `${currentLanguage}:${text}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      setIsLoading(true);
      const translated = await translationApi.translate(text, currentLanguage);
      translationCache.set(cacheKey, translated);
      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    } finally {
      setIsLoading(false);
    }
  };

  const batchTranslate = async (texts) => {
    if (!texts?.length || currentLanguage === 'en') return texts;

    try {
      setIsLoading(true);
      return await translationApi.batchTranslate(texts, currentLanguage);
    } catch (error) {
      console.error('Batch translation failed:', error);
      return texts;
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    translationCache.clear(); // Clear cache when language changes
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        availableLanguages,
        isLoading,
        translate,
        batchTranslate,
        changeLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 