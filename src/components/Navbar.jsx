'use client'

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import DarkModeToggle from '@/components/DarkModeToggle'
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({ user, setUser, allowedEmails }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Check for dark mode preference
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (allowedEmails.includes(result.user.email)) {
        setUser(result.user);
      } else {
        await signOut(auth);
        setUser(null);
        alert('Access denied. Your email is not authorized.');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear all website data in localStorage?')) {
      localStorage.clear();
      alert('localStorage has been cleared. Page will reload.');
      window.location.reload();
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-950 border-b-2 border-deep-blue dark:border-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side - Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Image
                className="h-7 w-auto"
                src={darkMode ? "/icons/logofullinvertedwhite.png" : "/icons/logofullinverted.png"}
                alt="Logo"
                width={56}
                height={56}
              />
            </div>
            
            {/* Desktop Navigation - Left-aligned */}
            <div className="hidden md:flex md:ml-10 items-center space-x-8">
              <Link href="/" className="text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/partnerships" className="text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300 px-3 py-2 text-sm font-medium">
                Partnerships
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300 px-3 py-2 text-sm font-medium">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Side - Icons and Profile */}
          <div className="flex items-center">
            <DarkModeToggle onToggle={(mode) => setDarkMode(mode)} />
            
            {/* Profile Icon */}
            <div className="ml-4 flex items-center">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex items-center"
                  >
                    {user.photoURL ? (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt="Profile"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-700 dark:text-gray-200">
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Mobile menu button - Far right */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none border border-gray-700 dark:border-gray-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-950">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/partnerships"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Partnerships
          </Link>
          <Link
            href="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          {user && (
            <>
              <button
                onClick={() => {
                  clearLocalStorage();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear Data
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}