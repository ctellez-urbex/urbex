"use client";

import Hero from './components/Hero';
import Services from './components/Services';
import Clients from './components/Clients';
import About from './components/About';
import Team from './components/Team';
import Contact from './components/Contact';


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Services />
      <About />
      <Clients />
      <Team />
      <Contact />
    </div>          
  );
}
