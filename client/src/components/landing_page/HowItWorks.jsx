import React from 'react'

const steps = [
    {
        number: '01',
        title: 'Create Your Profile',
        description: 'Sign up and build your alumni profile with your education, career journey, and areas where you can help or need guidance.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Find Your Match',
        description: 'Search and filter alumni by industry, role, skills, or location. Connect with the right people who align with your goals.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Connect & Collaborate',
        description: 'Send connection requests, schedule mentoring sessions, and start building meaningful professional relationships.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
    },
    {
        number: '04',
        title: 'Grow Together',
        description: 'Attend virtual and in-person events, receive referrals, and unlock new career opportunities through your network.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
]

const StepCard = ({ step, index }) => (
    <div className="flex flex-col items-center text-center gap-4 px-6 relative">
        {index < steps.length - 1 && (
            <div className="hidden lg:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] border-t-2 border-dashed border-blue-200 z-0" />
        )}
        <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#004AC6] border-2 border-blue-200 shadow-sm">
            {step.icon}
        </div>
        <div className="text-xs font-bold text-[#004AC6] bg-blue-50 px-3 py-1 rounded-full tracking-widest">
            STEP {step.number}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">{step.description}</p>
    </div>
)

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-16 lg:py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-10 lg:mb-14">
                    <span className="text-xs font-bold tracking-widest text-[#004AC6] uppercase bg-blue-50 px-4 py-1.5 rounded-full">
                        Simple Process
                    </span>
                    <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-gray-900">How It Works</h2>
                    <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm lg:text-base">
                        Getting started with AlumniConnect is easy. Follow these four simple steps to begin your journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
                    {steps.map((step, index) => (
                        <StepCard key={step.number} step={step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
