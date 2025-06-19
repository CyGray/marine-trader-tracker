// @/app/page.jsx
'use client'

import MarineTraderTracker from "@/app/MarineTraderTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebaseConfig';

export default function Home() {
  const [user, setUser] = useState(null);
  const allowedEmails = ['work.uykyleyuan@gmail.com', 'fritzgioranztayo@gmail.com']; // Add your allowed emails here
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && allowedEmails.includes(user.email)) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} setUser={setUser} allowedEmails={allowedEmails} />
      <main className="flex-grow">
        <MarineTraderTracker user={user} />
      </main>
      <Footer />
    </div>
  );
}