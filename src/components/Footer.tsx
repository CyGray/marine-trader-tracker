// @/components/Footer.tsx
'use client'

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-blue-950 dark:bg-gray-900 text-white py-8 border-t-2 border-deep-blue dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/icons/logofullinvertedwhite.png"
                alt="Marine Trader Logo"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-blue-100 dark:text-gray-300 text-sm">
              Your trusted investment tracking platform
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/wallets" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Wallets
                </Link>
              </li>
              <li>
                <Link href="/investments" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Investments
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Transaction History
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white dark:text-gray-100 text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-blue-100 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white dark:text-gray-100 text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-blue-100 dark:text-gray-300">official.marinetrader@gmail.com</li>
              <li className="text-blue-100 dark:text-gray-300">+63 996-640-4275</li>
              <li className="text-blue-100 dark:text-gray-300">Luzuriaga St., Bacolod City</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-blue-800 dark:border-gray-700 text-center text-blue-300 dark:text-gray-400">
          <p>&copy; 2025 Marine Trader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}