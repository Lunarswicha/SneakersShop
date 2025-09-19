'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Consent = { analytics: boolean; marketing: boolean; personalization: boolean };
const defaultConsent: Consent = { analytics: false, marketing: false, personalization: false };

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>(defaultConsent);

  useEffect(() => {
    const c = localStorage.getItem('cookie-consent');
    if (!c) setOpen(true);
  }, []);

  function acceptAll() {
    localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true, marketing: true, personalization: true }));
    setOpen(false);
  }

  function save() {
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in-up">
      <div className="glass rounded-2xl shadow-2xl max-w-xl w-full p-8 animate-slide-in-right">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gradient">Cookie Preferences</h2>
            <p className="text-gray-600">
              We use cookies to enhance your experience. Choose your preferences below.
            </p>
          </div>

          <div className="space-y-4">
            {(['analytics','marketing','personalization'] as const).map((k, index) => (
              <div 
                key={k} 
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold capitalize">{k}</span>
                    <p className="text-sm text-gray-500">
                      {k === 'analytics' && 'Help us understand how you use our site'}
                      {k === 'marketing' && 'Show you relevant ads and offers'}
                      {k === 'personalization' && 'Customize your experience'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(consent as any)[k]} 
                    onChange={e => setConsent({ ...consent, [k]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500">
            See our <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link> for more information.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setOpen(false)} 
              className="btn-secondary ripple flex-1"
            >
              Only Necessary
            </button>
            <button 
              onClick={save} 
              className="btn-ghost ripple flex-1"
            >
              Save Preferences
            </button>
            <button 
              onClick={acceptAll} 
              className="btn-primary ripple flex-1"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
