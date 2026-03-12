'use client';

import { useEffect, useState } from 'react';
import { Language } from './translations';

// Custom event for language changes
const LANGUAGE_CHANGE_EVENT = 'language-changed';

// Module-level listeners array to ensure events are captured
const listeners: Array<(lang: Language) => void> = [];

// Initialize global listener once (runs when module loads)
if (typeof window !== 'undefined') {
  window.addEventListener(LANGUAGE_CHANGE_EVENT, (e: Event) => {
    const customEvent = e as CustomEvent<Language>;
    if (customEvent.detail && (customEvent.detail === 'en' || customEvent.detail === 'zh')) {
      // Notify all listeners
      listeners.forEach(listener => listener(customEvent.detail));
    }
  });
}

export function setLanguageAndNotify(lang: Language) {
  localStorage.setItem('language', lang);
  // Dispatch custom event for same-tab updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }));
  }
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

    // Register this component's listener
    const handleLanguageChange = (lang: Language) => {
      setLanguage(lang);
    };

    listeners.push(handleLanguageChange);

    // Cleanup
    return () => {
      const index = listeners.indexOf(handleLanguageChange);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  // Return 'en' while not mounted to prevent hydration mismatch
  return mounted ? language : 'en';
}
