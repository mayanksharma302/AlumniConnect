import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    GraduationCap,
    Check
} from "lucide-react";
import LeftPannel from "../components/auth_page/LeftPannel";
import RoleCard from "../components/auth_page/RoleCard";
import TrustLables from "../components/auth_page/TrustLables";
import { Toaster, toast } from 'sonner';
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const password = watch("password");

    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await toast.promise(
                axios.post("http://localhost:8000/api/auth/register", {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                }),
                {
                    loading: "Creating your account...",
                    success: (response) => {
                        navigate("/signin");
                        return response.data?.message || "Registration successful. Now you can signin";
                    },
                    error: (error) =>
                        error.response?.data?.message ||
                        "Registration failed",
                }
            );
        } catch {
            // Error is already handled by toast.promise
        }
    };

    return (

        <div className="h-screen bg-[#F8F9FF] flex overflow-hidden">

            {/* LEFT PANEL */}
            <div className="hidden lg:flex w-[32%] bg-[#004AC6] text-white h-screen sticky top-0">
                <LeftPannel />
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 h-screen overflow-y-auto">
                <div className="min-h-full flex justify-center items-center p-8">
                    <div className="w-full max-w-lg">
                        <h1 className="text-4xl font-bold text-center">
                            Create Account
                        </h1>
                        <p className="text-center text-gray-500 mt-3">
                            Create your account to get started.
                        </p>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="mt-10 space-y-6"
                        >
                            {/* Username */}
                            <div>
                                <div className="relative mt-2">
                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        className="w-full h-12 border rounded-xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#004AC6]"
                                        {...register("username", {
                                            required: "Username is required",

                                            minLength: {
                                                value: 3,
                                                message: "Username must be at least 3 characters",
                                            },

                                            maxLength: {
                                                value: 30,
                                                message: "Username cannot exceed 30 characters",
                                            },

                                            pattern: {
                                                value: /^[a-zA-Z][a-zA-Z0-9._]*$/,
                                                message:
                                                    "Username must start with a letter and contain only letters, numbers, '.' or '_'.",
                                            },

                                            validate: {
                                                noConsecutiveDots: (value) =>
                                                    !/\.\./.test(value) ||
                                                    "Username cannot contain consecutive '.'",

                                                noConsecutiveUnderscores: (value) =>
                                                    !/__/.test(value) ||
                                                    "Username cannot contain consecutive '_'",

                                                noEndDot: (value) =>
                                                    !value.endsWith(".") ||
                                                    "Username cannot end with '.'",

                                                noEndUnderscore: (value) =>
                                                    !value.endsWith("_") ||
                                                    "Username cannot end with '_'",
                                            },
                                        })}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <div className="relative mt-2">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full h-12 border rounded-xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#004AC6]"
                                        {...register("email", {
                                            required:
                                                "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid Email",
                                            },
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative mt-2">
                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter password"
                                        className="w-full h-12 border rounded-xl pl-11 pr-11 outline-none focus:ring-2 focus:ring-[#004AC6]"
                                        {...register("password", {
                                            required:
                                                "Password is required",
                                            minLength: {
                                                value: 8,
                                                message:
                                                    "Minimum 8 characters",
                                            },
                                            validate: {
                                                uppercase: (v) => /[A-Z]/.test(v) || "Must contain uppercase",
                                                lowercase: (v) => /[a-z]/.test(v) || "Must contain lowercase",
                                                number: (v) => /\d/.test(v) || "Must contain number",
                                            },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <div className="relative mt-2">
                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm password"
                                        className="w-full h-12 border rounded-xl pl-11 pr-11 outline-none focus:ring-2 focus:ring-[#004AC6]"
                                        {...register("confirmPassword", {
                                            required:
                                                "Please confirm your password",

                                            validate: (value) =>
                                                value === password ||
                                                "Passwords do not match",
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Register As */}
                            <div>
                                <label className="font-medium text-sm">
                                    Register As
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                    <RoleCard
                                        register={register}
                                        value="student"
                                        title="Student"
                                        description="Find mentors, internships and alumni."
                                    />
                                    <RoleCard
                                        register={register}
                                        value="alumni"
                                        title="Alumni"
                                        description="Mentor students and share referrals."
                                    />
                                </div>
                                {errors.role && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            {/* Terms */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        {...register("terms", {
                                            required:
                                                "Please accept Terms & Conditions",
                                        })}
                                    />
                                    <span className="text-sm text-gray-600">
                                        I agree to the{" "}
                                        <span className="text-[#004AC6] font-medium">
                                            Terms & Conditions
                                        </span>
                                        {" "}and{" "}
                                        <span className="text-[#004AC6] font-medium">
                                            Privacy Policy
                                        </span>
                                    </span>
                                </label>
                                {errors.terms && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.terms.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 rounded-xl bg-[#004AC6] hover:bg-[#003EA8] transition text-white font-semibold"
                            >
                                {isSubmitting
                                    ? "Creating Account..."
                                    : "Create Account"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-8">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="px-4 text-xs text-gray-400">OR</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Login */}
                        <p className="text-center text-gray-600">
                            Already have an account?{" "}
                            <a href="/signin" className="text-[#004AC6] font-semibold">Sign In</a>
                        </p>

                        {/* Trust */}
                        <div className="flex justify-center flex-wrap gap-5 mt-8 text-sm text-gray-500">
                            <TrustLables text="Secure Registration" />
                            <TrustLables text="Email Verification Required" />
                            <TrustLables text="Privacy Protected" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;