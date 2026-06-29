import React from 'react'
import HeroImage from '../../assets/hero_image.png'

const Hero = () => {
    return (
        <section className='px-6 py-8 bg-linear-to-b from-blue-200 from-30% to-white to-70%'>
            <div className='max-w-[1400px] mx-auto py-12 flex flex-col-reverse lg:flex-row items-center justify-evenly gap-10'>
                {/* Text content */}
                <div className='flex flex-col gap-4 text-center lg:text-left items-center lg:items-start max-w-xl 2xl:max-w-2xl'>
                    <div className='bg-[#D0E1FB] px-3 py-2 w-fit rounded-full text-base flex'>BRIDGE THE GAP</div>
                    <div className='flex flex-col text-[24px] sm:text-[36px] lg:text-[40px] xl:text-[48px] 2xl:text-[56px] font-bold leading-tight'>
                        <span>Connect, Learn, and</span>
                        <span>Grow Through Your</span>
                        <span className='text-[#004AC6]'>Alumni Network</span>
                    </div>
                    <div className='pr-0 lg:pr-6 max-w-md text-sm lg:text-base'>
                        Find mentors, receive job referrals, attend alumni events, and build
                        meaningful professional connections.
                    </div>
                    <div className='flex gap-4 pt-4 flex-wrap justify-center lg:justify-start'>
                        <button className='bg-[#004AC6] py-4 px-6 text-white rounded-3xl'>Get Started</button>
                        <button className='py-4 px-6 rounded-3xl border-2 border-gray-300'>Browse Alumni</button>
                    </div>
                    <div className='h-9 text-sm lg:text-base'>
                        Trusted by 10,000+ Students and Alumni
                    </div>
                </div>

                {/* Hero image */}
                <div className='flex justify-center'>
                    <img src={HeroImage} alt="Alumni network dashboard preview" className='drop-shadow-md w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[440px] xl:max-w-[520px] 2xl:max-w-none' />
                </div>
            </div>
        </section>
    )
}

export default Hero