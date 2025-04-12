const GOOGLE_TRANSLATE_API = 'https://translation.googleapis.com/language/translate/v2';
const API_KEY = 'AIzaSyDhUvdknH3Mr48UPt9RuvmVdG5OI6T0vNg';

export const translationApi = {
  /**
   * Get available languages
   * @returns {Promise<Array>} Array of language objects
   */
  getLanguages: async () => {
    try {
      const response = await fetch(
        `${GOOGLE_TRANSLATE_API}/languages?key=${API_KEY}&target=en`
      );
      if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.json();
      return data.data.languages.map(lang => ({
        code: lang.language,
        name: lang.name
      }));
    } catch (error) {
      console.error('Error fetching languages:', error);
      return [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'bn', name: 'Bengali' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' }
      ];
    }
  },

  /**
   * Translate text to target language
   * @param {string} text Text to translate
   * @param {string} target Target language code
   * @returns {Promise<string>} Translated text
   */
  translate: async (text, target) => {
    try {
      if (!text?.trim() || target === 'en') return text;

      const response = await fetch(`${GOOGLE_TRANSLATE_API}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: target,
          source: 'en' // assuming original content is in English
        })
      });

      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  },

  /**
   * Batch translate multiple texts
   * @param {string[]} texts Array of texts to translate
   * @param {string} target Target language code
   * @returns {Promise<string[]>} Array of translated texts
   */
  batchTranslate: async (texts, target) => {
    try {
      if (target === 'en') return texts;
      
      const validTexts = texts.filter(text => text?.trim());
      if (!validTexts.length) return texts;

      const response = await fetch(`${GOOGLE_TRANSLATE_API}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: validTexts,
          target: target,
          source: 'en'
        })
      });

      if (!response.ok) throw new Error('Batch translation failed');
      const data = await response.json();
      return data.data.translations.map(t => t.translatedText);
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    }
  }
}; 