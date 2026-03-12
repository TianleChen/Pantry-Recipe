'use client';

import Link from 'next/link';
import { Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { setLanguageAndNotify } from '@/lib/use-language-safe';

export default function Navigation() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'zh' | null;
    if (saved) setLanguage(saved);
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: 'en' | 'zh') => {
    setLanguage(lang);
    setLanguageAndNotify(lang);
  };

  const navItems = {
    en: {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      recipes: 'Recipes',
      favorites: 'Favorites',
      settings: 'Settings',
    },
    zh: {
      dashboard: '仪表板',
      inventory: '库存',
      recipes: '食谱',
      favorites: '收藏',
      settings: '设置',
    },
  };

  const labels = navItems[language];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🥘 Pantry Recipe</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              {labels.dashboard}
            </Link>
            <Link href="/inventory" className="text-gray-700 hover:text-blue-600 font-medium">
              {labels.inventory}
            </Link>
            <Link href="/recipes" className="text-gray-700 hover:text-blue-600 font-medium">
              {labels.recipes}
            </Link>
            <Link href="/favorites" className="text-gray-700 hover:text-blue-600 font-medium">
              {labels.favorites}
            </Link>
            <Link href="/settings" className="text-gray-700 hover:text-blue-600 font-medium">
              {labels.settings}
            </Link>

            {/* Language Switcher */}
            {mounted && (
              <div className="flex items-center gap-2 border-l pl-4 ml-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('zh')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    language === 'zh'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  中文
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {mounted && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 text-sm rounded font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('zh')}
                  className={`px-2 py-1 text-sm rounded font-medium transition-colors ${
                    language === 'zh'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  中
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 border-t pt-4 space-y-2">
            <Link
              href="/"
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {labels.dashboard}
            </Link>
            <Link
              href="/inventory"
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {labels.inventory}
            </Link>
            <Link
              href="/recipes"
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {labels.recipes}
            </Link>
            <Link
              href="/favorites"
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {labels.favorites}
            </Link>
            <Link
              href="/settings"
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {labels.settings}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
