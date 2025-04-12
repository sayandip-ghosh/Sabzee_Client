import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function TranslateText({ children }) {
  const { translate, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    const translateText = async () => {
      if (typeof children === 'string') {
        const result = await translate(children);
        setTranslatedText(result);
      }
    };

    translateText();
  }, [children, currentLanguage, translate]);

  if (!children) return null;
  return <>{translatedText}</>;
}

export default TranslateText; 