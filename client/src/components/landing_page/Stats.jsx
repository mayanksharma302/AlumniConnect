import React from 'react'
import StatCard from './StatCard'

const Stats = () => {
    return (
        <section className='grid grid-cols-2 lg:flex py-8 justify-evenly bg-white border-b border-gray-300 gap-4 px-6 lg:px-0 lg:gap-0'>
            <StatCard number="10,000" detail="Registered Alumni" />
            <StatCard number="1,200" detail="Active Mentors" />
            <StatCard number="850" detail="Successful Referals" />
            <StatCard number="200" detail="Event Hosted" />
        </section>
    )
}

export default Stats