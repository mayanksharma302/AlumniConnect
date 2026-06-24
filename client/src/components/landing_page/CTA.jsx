import React, { useState } from 'react'

const CTA = () => {
    const [email, setEmail] = useState('')

    return (
        <section className="py-16 lg:py-20 bg-gradient-to-br from-[#004AC6] via-[#1a5fd9] to-[#0a3a9e] relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full bg-white opacity-5 blur-3xl" />
            <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full bg-white opacity-5 blur-3xl" />

            <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                <span className="text-xs font-bold tracking-widest text-blue-200 uppercase bg-white/10 px-4 py-1.5 rounded-full">
                    Join Today
                </span>
                <h2 className="mt-5 text-3xl lg:text-4xl font-bold text-white leading-snug">
                    Ready to Connect with Your <br className="hidden sm:block" /> Alumni Network?
                </h2>
                <p className="mt-4 text-blue-100 text-sm lg:text-base max-w-xl mx-auto leading-relaxed">
                    Join thousands of students and alumni who are already leveraging AlumniConnect to build their careers and give back to their community.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-5 py-3.5 rounded-xl text-sm bg-white/95 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/50 transition"
                    />
                    <button className="bg-white text-[#004AC6] font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-blue-50 hover:scale-105 active:scale-100 transition-all duration-200 shadow-lg whitespace-nowrap">
                        Get Started Free
                    </button>
                </div>

                <p className="mt-4 text-blue-200 text-xs">
                    No credit card required · Free forever for students
                </p>

                <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-4 lg:gap-6 text-sm text-blue-100">
                    {['10,000+ Active Members', '1,200 Mentors Available', '850 Successful Referrals'].map((item) => (
                        <div key={item} className="flex items-center gap-2 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CTA
