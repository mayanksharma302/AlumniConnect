// Imports
import React from 'react'
import CTA from '../components/landing_page/CTA'
import Hero from '../components/landing_page/Hero'
import Stats from '../components/landing_page/Stats'
import NavBar from '../components/landing_page/NavBar'
import Footer from '../components/landing_page/Footer'
import Features from '../components/landing_page/Features'
import HowItWorks from '../components/landing_page/HowItWorks'
import Testimonials from '../components/landing_page/Testimonials'

const LandingPage = () => {
    return (
        <>
            {/* Landing page */}
            <NavBar />
            <Hero id="#" />
            <Stats />
            <HowItWorks id="how-it-works" />
            <Features id="features" />
            <Testimonials />
            <CTA />
            <Footer />
        </>
    )
}

export default LandingPage