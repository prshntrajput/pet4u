"use client"
import React, { useEffect } from 'react'
import Register from '../_components/Register'
import { useRouter } from 'next/navigation';


const Page = () => {

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.replace("/pets");
    }
  }, []);
  return (
    <div>
        <Register/>
    </div>
  )
}

export default Page