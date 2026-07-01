import React, { useState } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const [active, setactive] = useState("home")


    return (
        <nav className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm h-16 flex justify-center">
            <div className="mx-6 flex items-center justify-between w-full max-w-7xl">

                {/* Logo */}
                <div className="font-bold text-[#004AC6] text-2xl">
                    AlumniConnect
                </div>

                {/* Desktop Navigation */}
                {[
                    ["#", "Home", "home"],
                    ["#how-it-works", "How it works", "how-it-works"],
                    ["#features", "Features", "features"],
                    ["#success", "Success Stories", "success"],
                ].map(([id, label, tag]) => (
                    <div className="hidden lg:flex gap-8">

                        <a
                            key={id}
                            href={id}
                            onClick={() => { setactive(tag) }}
                            className={`${active === tag ? "text-[#004AC6]" : ""}`}
                        >
                            {label}
                        </a>
                    </div>
                ))}

                {/* Desktop Buttons */}
                < div className="hidden lg:flex gap-4" >

                    <button className="text-[#004AC6] px-4 py-2">
                        <Link to="/signin">Login</Link>
                    </button>

                    <button className="bg-[#004AC6] text-white rounded-xl px-5 py-2">
                        <Link to="/signup">Register</Link>
                    </button>

                </div>


                {/* Hamburger */}
                <button
                    className="lg:hidden flex flex-col gap-1.5"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span
                        className={`w-6 h-0.5 bg-black transition ${menuOpen && "rotate-45 translate-y-2"
                            }`}
                    />
                    <span
                        className={`w-6 h-0.5 bg-black transition ${menuOpen && "opacity-0"
                            }`}
                    />
                    <span
                        className={`w-6 h-0.5 bg-black transition ${menuOpen && "-rotate-45 -translate-y-2"
                            }`}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            {
                menuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white shadow-lg flex flex-col p-5 gap-4 lg:hidden">

                        {[
                            ["#", "Home", "home"],
                            ["#how-it-works", "How it works", "how-it-works"],
                            ["#features", "Features", "features"],
                            ["#success", "Success Stories", "success"],
                        ].map(([id, label, tag]) => (
                            <a
                                key={id}
                                href={id}
                                onClick={() => {
                                    setMenuOpen(false)
                                    setactive(tag)
                                }}
                                className={`cursor-pointer py-2 border-b border-gray-200 ${active === tag ? "text-[#004AC6]" : ""}`}

                            >
                                {label}
                            </a>
                        ))}

                        <div className="flex gap-3 mt-3">
                            <button className="flex-1 border border-[#004AC6] text-[#004AC6] rounded-xl py-2">
                                Login
                            </button>

                            <button className="flex-1 bg-[#004AC6] text-white rounded-xl py-2">
                                Register
                            </button>
                        </div>

                    </div>
                )
            }
        </nav >
    );
};

export default NavBar;