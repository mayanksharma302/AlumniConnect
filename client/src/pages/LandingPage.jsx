import React from 'react'
import NavBar from '../components/landing_page/NavBar'
import Hero from '../components/landing_page/Hero'
import Stats from '../components/landing_page/Stats'
import HowItWorks from '../components/landing_page/HowItWorks'
import Features from '../components/landing_page/Features'
import Testimonials from '../components/landing_page/Testimonials'
import CTA from '../components/landing_page/CTA'
import Footer from '../components/landing_page/Footer'

const LandingPage = () => {
    return (
        <>
            <NavBar />
            <Hero />
            <Stats />
            <HowItWorks />
            <Features />
            <Testimonials />
            <CTA />
            <Footer />
        </>
    )
}

export default LandingPage