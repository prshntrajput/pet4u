import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../routing/components/NavBar'



const Layout = () => {
  return (
  <>
    <Navbar/>
    <div className='pt-20'><Outlet/></div>
    </>
  )
}

export default Layout