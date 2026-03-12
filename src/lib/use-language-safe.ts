'use client';

import { useEffect, useState } from 'react';
import { Language } from './translations';

// Custom event for language changes
const LANGUAGE_CHANGE_EVENT = 'language-changed';

export function setLanguageAndNotify(lang: Language) {
  localStorage.setItem('language', lang);
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }));
}

// Safe hook that doesn't require context - uses localStorage
export function useLanguageSafe(): Language {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLanguage(saved);
    }
    setMounted(true);

    // Listen for custom language change events
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && (customEvent.detail === 'en' || customEvent.detail === 'zh')) {
        setLanguage(customEvent.detail);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
  }, []);

  // Return 'en' while not mounted to prevent hydration mismatch
  return mounted ? language : 'en';
}
