import React from 'react'

const SideStep = ({ icon, step, title, active = false, completed = false, disabled = false }) => {
    return (
        <div className="flex items-center gap-4">

            <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${completed
                        ? "bg-white text-[#004AC6]"
                        : active
                            ? "bg-white text-[#004AC6]"
                            : "bg-[#2B61D4] text-blue-300"
                    }
            `}
            >
                {icon}
            </div>

            <div>
                <p className={`text-xs ${disabled ? "text-blue-300" : "text-blue-100"}`}>
                    {step}
                </p>
                <h3 className={`font-semibold text-xl ${disabled ? "text-blue-300" : "text-white"}`}>{title} </h3>
            </div>
        </div>
    )
}

export default SideStep
