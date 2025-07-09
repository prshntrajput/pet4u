"use client"
import React, { useEffect } from 'react'
import LandingPage from './_components/LandingPage'
import { useRouter } from 'next/navigation';


const Home = () => {

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.replace("/pets");
    }
  }, []);
  return (
    <div>
      <LandingPage/>
    </div>
  )
}

export default Home