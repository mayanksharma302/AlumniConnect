import React from 'react'

const StatCard = ({ number, detail }) => {
    return (
        <div className='flex flex-col items-center justify-center h-28 lg:h-31.5 w-full lg:w-71 border rounded-2xl border-gray-300 bg-[#f3f3fe]'>
            <span className='text-2xl font-bold text-[#004AC6]'>{number}+</span>
            <span className='text-sm lg:text-base text-center px-2'>{detail}</span>
        </div>
    )
}

export default StatCard