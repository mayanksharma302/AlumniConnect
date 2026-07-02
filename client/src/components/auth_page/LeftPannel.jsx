import React from 'react'
import { GraduationCap, Check, Mail, User } from 'lucide-react'
import SideStep from "./SideStep";

const LeftPannel = () => {
    return (
        <div className="flex flex-col h-full w-full px-10 py-10">

            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <GraduationCap size={18} className="text-[#004AC6]" />
                </div>
                <span className="text-2xl font-bold">
                    AlumniConnect
                </span>
            </div>

            {/* Heading */}
            <div className="mt-20">
                <h1 className="text-4xl font-bold leading-tight">
                    Verify Your Email
                </h1>
                <p className="mt-5 text-blue-100 text-base leading-7 max-w-xs">
                    One step away from joining the AlumniConnect network.
                </p>
            </div>

            {/* Steps */}
            <div className="mt-16 space-y-8">

                {/* Step 1 */}
                <SideStep
                    active
                    step="Step 1"
                    title="Register"
                    icon={<Check size={16} />}
                />

                {/* Step 2 */}
                <SideStep
                    disabled
                    step="Step 2"
                    title="Verify Email"
                    icon={<Mail size={16} />}
                />

                {/* Step 3 */}
                <SideStep
                    disabled
                    step="Step 3"
                    title="Complete Profile"
                    icon={<User size={16} />}
                />
            </div>

            {/* Bottom */}
            <div className="mt-auto">
                <p className="text-sm text-blue-200 leading-6 max-w-xs">
                    Joining 15,000+ graduates from top institutions worldwide.
                </p>
            </div>
        </div>
    )
}

export default LeftPannel