import React from 'react'

const features = [
    {
        title: 'Mentorship Program',
        description: 'Connect with experienced alumni who can guide your career path, share industry insights, and help you navigate professional challenges.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        color: '#004AC6',
        bg: '#EEF4FF',
    },
    {
        title: 'Job Referrals',
        description: 'Get direct referrals from alumni working at top companies. Bypass the resume black hole and get your application noticed.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        color: '#059669',
        bg: '#ECFDF5',
    },
    {
        title: 'Alumni Events',
        description: 'Join virtual and in-person networking events, webinars, workshops, and reunions to expand your professional circle.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        color: '#D97706',
        bg: '#FFFBEB',
    },
    {
        title: 'Alumni Directory',
        description: 'Search our comprehensive directory of alumni by graduation year, industry, company, or location to find exactly who you need.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        color: '#7C3AED',
        bg: '#F5F3FF',
    },
    {
        title: 'Knowledge Sharing',
        description: 'Access articles, industry insights, and curated resources shared by alumni experts across different domains and sectors.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
        color: '#DB2777',
        bg: '#FDF2F8',
    },
    {
        title: 'Career Guidance',
        description: 'Get personalized career advice, resume reviews, and mock interviews from alumni who have successfully navigated similar paths.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        color: '#0891B2',
        bg: '#ECFEFF',
    },
]

const FeatureCard = ({ feature }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
        <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: feature.bg, color: feature.color }}
        >
            {feature.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
        <a href="#" style={{ color: feature.color }} className="text-sm font-medium flex items-center gap-1 mt-auto hover:gap-2 transition-all">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </a>
    </div>
)

const Features = () => {
    return (
        <section id="features" className="py-16 lg:py-20 bg-[#F8FAFC]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-10 lg:mb-14">
                    <span className="text-xs font-bold tracking-widest text-[#004AC6] uppercase bg-blue-50 px-4 py-1.5 rounded-full">
                        Platform Features
                    </span>
                    <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
                    <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm lg:text-base">
                        AlumniConnect provides a comprehensive suite of tools and resources to help you build meaningful connections and advance your career.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
