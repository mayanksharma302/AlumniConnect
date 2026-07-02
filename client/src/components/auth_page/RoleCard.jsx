import React from 'react'

const RoleCard = ({ register, value, title, description }) => {
    return (

        <label className="border rounded-2xl p-4 cursor-pointer hover:border-[#004AC6] transition">
            <input
                type="radio"
                value={value}
                className="hidden"
                {...register("role", {
                    required: "Please select a role",
                })}
            />
            <h3 className="font-semibold text-lg">
                {title}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
                {description}
            </p>
        </label>
    )
}

export default RoleCard;