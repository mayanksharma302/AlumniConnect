import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    Eye,
    EyeOff,
    UserRound,
    Lock,
    Briefcase,
    TrendingUp
} from "lucide-react";
import TrustLables from "../components/auth_page/TrustLables";
import LeftPannel from "../components/auth_page/LeftPannel";

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm(
        { mode: "onSubmit", reValidateMode: "onChange" }
    );

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/auth/login",
                {
                    identifier: data.identifier,
                    password: data.password,
                }
            );


            console.log(res.data);
            alert("Login Successful");
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || "Invalid Email or Password");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FF] flex">

            {/* LEFT PANEL */}
            <div className="hidden lg:flex w-[32%] bg-[#004AC6] text-white">
                <LeftPannel />
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <h2 className="text-4xl font-bold text-center">
                        Sign In
                    </h2>
                    <p className="text-center text-gray-500 mt-2">
                        Sign in to access your dashboard.
                    </p>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-10 space-y-6"
                    >

                        {/* Username / EMAIL */}
                        <div>
                            <div className="relative mt-2">
                                <UserRound
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter your usename or email address"
                                    className="w-full border rounded-xl pl-11 pr-4 h-12 outline-none focus:ring-2 focus:ring-[#004AC6]"
                                    {...register("identifier", {
                                        required: "Email or Username is required",

                                        validate: (value) => {
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,29}$/;

                                            if (emailRegex.test(value)) return true;
                                            if (usernameRegex.test(value)) return true;

                                            return "Enter a valid email or username";
                                        },
                                    })}
                                />
                            </div>
                            {errors.identifier && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.identifier.message}
                                </p>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <div className="relative mt-2">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full border rounded-xl pl-11 pr-11 h-12 outline-none focus:ring-2 focus:ring-[#004AC6]"
                                    {...register("password",
                                        {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Minimum 6 characters" },
                                        })
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (<EyeOff size={18} />) : (<Eye size={18} />)}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* REMEMBER */}
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" {...register("remember")} />
                                Remember me
                            </label>
                            <button type="button" className="text-[#004AC6] text-sm">
                                Forgot Password?
                            </button>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-xl bg-[#004AC6] text-white font-semibold hover:bg-[#0038A8] transition"
                        >
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-4 text-xs text-gray-400">OR</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Register */}
                    <p className="text-center">
                        Don't have an account?{" "}
                        <a href="/register" className="text-[#004AC6] font-semibold">
                            Create Account
                        </a>
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Students and Alumni use the same login
                        portal.
                    </p>

                    {/* Trust */}
                    <div className="flex justify-center gap-5 mt-8 flex-wrap text-xs text-gray-500">
                        <TrustLables text="Verified Alumni" />
                        <TrustLables text="Secure Authentication" />
                        <TrustLables text="University Trusted" />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center gap-8 mt-14 text-sm text-gray-500">
                        <button>Privacy Policy</button>
                        <button>Terms</button>
                        <button>Help Center</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SignIn;