import React from 'react'
import { Navbar } from './NavBar'
import { Hero } from './Hero'
import { FeaturedPets } from './FeaturedPets'
import { HowItWorks } from './HowItWorks'

const LandingPage = () => {
  return (
     <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedPets />
        <HowItWorks />
      </main>
    </div>
  )
}

export default LandingPage