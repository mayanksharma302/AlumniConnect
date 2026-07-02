import { GraduationCap } from "lucide-react";
import SideStep from "./SideStep";

const LeftPanel = ({
    title,
    subtitle,
    steps = [],
    currentStep = 1,
}) => {
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
                    {title}
                </h1>

                <p className="mt-5 text-blue-100 text-base leading-7 max-w-xs">
                    {subtitle}
                </p>
            </div>

            {/* Steps */}
            <div className="mt-16 space-y-8">

                {steps.map((step, index) => {
                    const number = index + 1;

                    return (
                        <SideStep
                            key={number}
                            step={`Step ${number}`}
                            title={step.title}
                            icon={step.icon}
                            active={number === currentStep}
                            completed={number < currentStep}
                            disabled={number > currentStep}
                        />
                    );
                })}

            </div>

            {/* Footer */}
            <div className="mt-auto">
                <p className="text-sm text-blue-200 leading-6 max-w-xs">
                    Joining 15,000+ graduates from top institutions worldwide.
                </p>
            </div>

        </div>
    );
};

export default LeftPanel;