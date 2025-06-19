'use client'

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import DarkModeToggle from '@/components/DarkModeToggle'
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar({ user, setUser, allowedEmails }) {
  const [darkMode, setDarkMode] = useState(false);

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
          {/* Navigation Links - Left Side */}
          <div className="flex items-center">
            <div className="flex space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  className="h-8 w-auto"
                  src={darkMode ? "/icons/logofullinvertedwhite.png" : "/icons/logofullinverted.png"}
                  alt="Logo"
                  width={64}
                  height={64}
                />
              </div>
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

          {/* Logo and User Profile - Right Side */}
          <div className="flex items-center">
            <DarkModeToggle onToggle={(mode) => setDarkMode(mode)} />
            {/* User Profile */}
            <div className="ml-4 flex items-center">
              {user ? (
                <>
                  <div className="flex items-center">
                    {user.photoURL && (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt="Profile"
                        width={32}
                        height={32}
                      />
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-100">
                      {user.displayName || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={clearLocalStorage}
                    className="ml-4 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    title="Clear website data"
                  >
                    Clear Data
                  </button>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="ml-4 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}