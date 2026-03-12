'use client';

export const dynamic = 'force-dynamic';

import { useLanguageSafe } from '@/lib/use-language-safe';
import { t } from '@/lib/translations';

export default function SettingsPage() {
  const language = useLanguageSafe();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">{t(language, 'settings.title')}</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t(language, 'settings.about')}</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>{t(language, 'settings.appName')}</strong> {t(language, 'settings.appDescription')}
            </p>

            <h3 className="font-semibold text-lg mt-6 text-gray-800">{t(language, 'settings.features')}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t(language, 'settings.feature1')}</li>
              <li>{t(language, 'settings.feature2')}</li>
              <li>{t(language, 'settings.feature3')}</li>
              <li>{t(language, 'settings.feature4')}</li>
              <li>{t(language, 'settings.feature5')}</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6 text-gray-800">{t(language, 'settings.howWorks')}</h3>
            <p>
              {t(language, 'settings.howWorksDesc')}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t(language, 'settings.cookNow')}</li>
              <li>{t(language, 'settings.almostThere')}</li>
              <li>{t(language, 'settings.useSoon')}</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6 text-gray-800">{t(language, 'settings.dataSection')}</h3>
            <p>
              {t(language, 'settings.dataDesc')}
            </p>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t(language, 'settings.tips')}</h2>
          <ul className="space-y-3 text-gray-700">
            <li>{t(language, 'settings.tip1')}</li>
            <li>{t(language, 'settings.tip2')}</li>
            <li>{t(language, 'settings.tip3')}</li>
            <li>{t(language, 'settings.tip4')}</li>
            <li>{t(language, 'settings.tip5')}</li>
          </ul>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t(language, 'settings.support')}</h2>
          <p className="text-gray-700">
            {t(language, 'settings.supportDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
