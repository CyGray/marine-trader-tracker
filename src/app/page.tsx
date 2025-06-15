'use client'

import MarineTraderTracker from "@/app/MarineTraderTracker";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <>
      <Navbar />
      <MarineTraderTracker />
    </>
  );
}