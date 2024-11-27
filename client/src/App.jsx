import React from 'react';
import { Navbar } from './components/NavBar';
import { Hero } from './components/Hero';
import { FeaturedPets } from './components/FeaturedPets';
import { HowItWorks } from './components/HowItWorks';


function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedPets />
        <HowItWorks />
      </main>
    </div>
  );
}

export default App;