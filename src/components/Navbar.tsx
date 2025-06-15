'use client'

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('Logged out successfully');
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
    <nav className="bg-white border-b-2 border-deep-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Navigation Links - Left Side */}
          <div className="flex items-center">
            <div className="flex space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  className="h-8 w-auto"
                  src="/icons/logofullinverted.png"
                  alt="Logo"
                  width={64}
                  height={64}
                />
              </div>
              <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/partnerships" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Partnerships
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Logo and User Profile - Right Side */}
          <div className="flex items-center">
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
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user.displayName || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={clearLocalStorage}
                    className="ml-4 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    title="Clear website data"
                  >
                    Clear Data
                  </button>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="ml-4 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
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

/**
 * How to use the setUser functions and share user data with other components:
 * 
 * 1. In your page.tsx, you can use the same Firebase auth listener pattern to get the user:
 * 
 *    import { useEffect, useState } from 'react';
 *    import { getAuth, User } from 'firebase/auth';
 *    import { app } from '../lib/firebaseConfig';
 *    
 *    const auth = getAuth(app);
 *    
 *    export default function Page() {
 *      const [user, setUser] = useState<User | null>(null);
 *    
 *      useEffect(() => {
 *        const unsubscribe = auth.onAuthStateChanged((user) => {
 *          setUser(user);
 *        });
 *        return () => unsubscribe();
 *      }, []);
 *    
 *      return (
 *        <>
 *          <Navbar />
 *          {/* Other components that need user data - pass as prop }
 *          <Component1 user={user} />
 *          <Component2 user={user} />
 *        </>
 *      );
 *    }
 * 
 * 2. Alternatively, you can use React Context or a state management library like Redux or Zustand
 *    to share the user state across components without prop drilling.
 * 
 * 3. The Navbar component manages its own user state internally, but the auth state is synchronized
 *    with Firebase, so any login/logout in the Navbar will automatically reflect in the auth state
 *    that other components can listen to.
 * 
 * 4. For components that need user data, you have two options:
 *    a) Listen to auth state changes directly in each component (like in Navbar)
 *    b) Get the user from the parent component (page.tsx) via props
 * 
 * Note: Make sure your firebaseConfig.ts is properly set up with your Firebase project credentials.
 */