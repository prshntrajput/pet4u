"use client"
import React, { useEffect } from 'react'
import Login from '../_components/Login'
import { useRouter } from 'next/navigation';

const Page = () => {

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.replace("/pets"); // redirect to home/dashboard
    }
  }, []);

  return (


    <div>
        <Login/>
    </div>
  )
}

export default Page