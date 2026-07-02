import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import LeftPanel from "../components/auth_page/LeftPannel";
import TrustLables from "../components/auth_page/TrustLables";

import {
    UserPlus,
    User,
    Mail,
    ShieldCheck,
    MailCheck,
    Users
} from "lucide-react";

const VerifyEmail = () => {
    const navigate = useNavigate();

    const inputRef = useRef(null);

    const [timer, setTimer] = useState(300);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            otp: "",
        },
    });

    const otp = watch("otp") || "";

    const authSteps = [
        {
            title: "Register",
            icon: <UserPlus size={16} />,
        },
        {
            title: "Verify Email",
            icon: <Mail size={16} />,
        },
        {
            title: "Complete Profile",
            icon: <User size={16} />,
        },
    ];

    const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
    const seconds = String(timer % 60).padStart(2, "0");
    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (e) => {

        const value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setValue("otp", value, {
            shouldValidate: true,
        });

    };

    const onSubmit = async (data) => {

        try {
            const email = sessionStorage.getItem("verificationEmail");
            const response = await axios.get(
                "http://localhost:8000/api/auth/verify-email",
                {
                    params: {
                        otp: data.otp,
                        email,
                    },
                }
            );

            toast.success(
                response.data.message ||
                "Email verified successfully"
            );

            navigate("/complete-profile");

        }

        catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Invalid OTP"
            );

        }

    };


    return (
        <div className="min-h-screen bg-[#F8F9FF] flex">

            {/* LEFT PANEL */}
            <div className="hidden lg:flex w-[32%] bg-[#004AC6] text-white">
                <LeftPanel
                    title="Create Your Account"
                    subtitle="Join AlumniConnect and start building your professional network."
                    steps={authSteps}
                    currentStep={2}
                />
            </div>

            {/* RIGHT PANEL */}

            <div className="flex-1 flex items-center justify-center px-8">

                <div className="w-full max-w-xl">

                    <h1 className="text-4xl font-bold text-[#181C32]">
                        Email Verification
                    </h1>

                    <p className="mt-2 text-gray-500">
                        We sent a 6-digit verification code to your registered mail.
                    </p>

                    {/* OTP */}

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">

                        {/* Hidden OTP Input */}

                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            maxLength={6}
                            className="absolute opacity-0 w-px h-px"
                            {...register("otp", {
                                required: "OTP is required",
                                pattern: {
                                    value: /^\d{6}$/,
                                    message: "Please enter all 6 digits",
                                },
                            })}
                            ref={(el) => {
                                register("otp").ref(el);
                                inputRef.current = el;
                            }}
                            onChange={handleOtpChange}
                        />

                        {/* OTP Boxes */}

                        <div
                            onClick={() => inputRef.current?.focus()}
                            className="flex justify-center gap-4 cursor-text"
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-16 w-16 rounded-xl border flex items-center justify-center text-2xl font-bold transition ${index < otp.length
                                        ? "border-[#004AC6] bg-blue-50"
                                        : "border-gray-300"
                                        }`}
                                >
                                    {otp[index] || ""}
                                </div>
                            ))}
                        </div>

                        {errors.otp && (
                            <p className="mt-3 text-center text-sm text-red-500">
                                {errors.otp.message}
                            </p>
                        )}

                        {/* Timer */}

                        <div className="mt-8 flex items-center justify-between">

                            <p className="text-sm text-gray-500">
                                Code expires in{" "}
                                <span className="font-semibold text-black">
                                    {minutes}:{seconds}
                                </span>
                            </p>

                            <button
                                type="button"
                                disabled={timer > 0}
                                className="font-medium text-[#004AC6] disabled:text-gray-400"
                            >
                                Resend Code
                            </button>

                        </div>

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-8 h-12 w-full rounded-xl bg-[#004AC6] text-white font-semibold transition hover:bg-[#0038A8] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? "Verifying..." : "Verify Email"}
                        </button>

                    </form>

                    {/* Divider */}

                    <div className="my-10 h-px bg-gray-200" />

                    {/* Trust */}

                    <div className="flex justify-center gap-5 flex-wrap">

                        <TrustLables
                            icon={<ShieldCheck size={14} />}
                            text="Secure Verification"
                        />

                        <TrustLables
                            icon={<MailCheck size={14} />}
                            text="Account Protection"
                        />

                        <TrustLables
                            icon={<Users size={14} />}
                            text="Verified Community"
                        />

                    </div>

                    <p className="text-center text-sm text-gray-500 mt-8 leading-7">

                        Email verification confirms account ownership.

                        Student/Alumni verification will be completed later.

                    </p>

                </div>

            </div>

        </div >
    );
}

export default VerifyEmail