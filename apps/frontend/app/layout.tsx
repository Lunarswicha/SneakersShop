import './globals.css';
import Link from 'next/link';
import CookieBanner from '../components/CookieBanner';
import Header from '../components/Header';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export const metadata = {
  title: 'SneakerShop  Discover, collect, run',
  description: 'Modern sneakers ecommerce demo with cart and checkout',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
        <NotificationProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto max-w-6xl p-6 animate-fade-in-up">{children}</main>
            <footer className="mt-20 border-t glass backdrop-blur-md">
              <div className="mx-auto max-w-6xl px-6 py-8 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-6">
                  <Link href="/privacy" className="hover:text-black transition-colors duration-200 hover:underline">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:text-black transition-colors duration-200 hover:underline">
                    Terms
                  </Link>
                  <Link href="/legal" className="hover:text-black transition-colors duration-200 hover:underline">
                    Legal
                  </Link>
                </div>
                <div className="text-gray-500">
                  Â 2024 SneakerShop. All rights reserved.
                </div>
              </div>
            </footer>
            <CookieBanner />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
