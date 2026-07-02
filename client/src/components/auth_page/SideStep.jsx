const SideStep = ({
    step,
    title,
    icon,
    active = false,
    completed = false,
    disabled = false,
}) => {

    const container =
        active
            ? "opacity-100"
            : completed
                ? "opacity-100"
                : "opacity-40";

    const circle =
        completed
            ? "bg-white text-[#004AC6]"
            : active
                ? "bg-white text-[#004AC6]"
                : "bg-[#2B67D6] text-white";

    return (
        <div className={`flex items-center gap-4 ${container}`}>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${circle}`}>
                {icon}
            </div>

            <div>
                <p className="text-xs text-blue-200">
                    {step}
                </p>

                <h4 className="font-semibold text-lg">
                    {title}
                </h4>
            </div>

        </div>
    );
};

export default SideStep;