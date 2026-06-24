import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className='h-16 flex justify-around relative'>
            <div className='mx-6 h-full flex items-center justify-between w-full'>
                {/* Logo */}
                <div className='font-bold text-[#004AC6] text-[24px]'>
                    AlumniConnect
                </div>

                {/* Desktop nav links */}
                <div className='hidden lg:flex font-light gap-8'>
                    <Link to="#">Home</Link>
                    <Link to="#how-it-works">How it works</Link>
                    <Link to="#features">Features</Link>
                    <Link to="#success">Success Stories</Link>
                    <Link to="#directory">Directory</Link>
                </div>

                {/* Desktop auth buttons */}
                <div className='hidden lg:flex h-10 items-center gap-4'>
                    <button className='text-[#004AC6] px-3.5 h-full'>Login</button>
                    <button className='text-white bg-[#004AC6] px-3.5 h-full rounded-2xl'>Register</button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className='lg:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8'
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className='lg:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 flex flex-col px-6 py-4 gap-4'>
                    <Link to="#" className='text-gray-700 py-2 border-b border-gray-100' onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="#how-it-works" className='text-gray-700 py-2 border-b border-gray-100' onClick={() => setMenuOpen(false)}>How it works</Link>
                    <Link to="#features" className='text-gray-700 py-2 border-b border-gray-100' onClick={() => setMenuOpen(false)}>Features</Link>
                    <Link to="#success" className='text-gray-700 py-2 border-b border-gray-100' onClick={() => setMenuOpen(false)}>Success Stories</Link>
                    <Link to="#directory" className='text-gray-700 py-2 border-b border-gray-100' onClick={() => setMenuOpen(false)}>Directory</Link>
                    <div className='flex gap-3 pt-2'>
                        <button className='text-[#004AC6] border border-[#004AC6] px-5 py-2 rounded-2xl flex-1'>Login</button>
                        <button className='text-white bg-[#004AC6] px-5 py-2 rounded-2xl flex-1'>Register</button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavBar