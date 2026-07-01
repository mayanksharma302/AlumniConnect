import React from 'react'
import { Check } from "lucide-react";

const TrustLables = ({ text }) => {
    return (
        <div className="flex items-center gap-1">
            <Check size={14} className="text-green-500" />
            <span>{text}</span>
        </div>
    )
}

export default TrustLables