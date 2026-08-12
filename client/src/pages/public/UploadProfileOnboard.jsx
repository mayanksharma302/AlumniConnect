import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import LeftPanel from "../../components/auth_page/LeftPannel";
import TrustLables from "../../components/auth_page/TrustLables";
import { User, UserPlus, Mail, Camera, Upload, ShieldCheck, Image, Users } from "lucide-react";

const UploadProfileOnboard = () => {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm();

    const authSteps = [
        { title: "Register", icon: <UserPlus size={16} /> },
        { title: "Verify Email", icon: <Mail size={16} /> },
        { title: "Complete Profile", icon: <User size={16} /> }
    ];

    const handleImage = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be below 5MB.");
            return;
        }

        setValue("profileImage", file);

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    };

    const onSubmit = async (data) => {
        const token = sessionStorage.getItem("accessToken");
        const formData = new FormData();
        formData.append("profileImage", data.profileImage);

        try {
            const response = await axios.post("http://localhost:8000/api/profile/set-profile-image", formData,
                { headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` } }
            );

            toast.success(
                response.data.message ||
                "Profile photo uploaded successfully."
            );

            navigate("/complete-profile");
        }
        catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Unable to upload profile photo."
            );
        }
    };

    return (

        <div className="min-h-screen page-shell flex">

            {/* Sidebar */}

            <div className="hidden lg:flex w-[32%] bg-[#004AC6] text-white">

                <LeftPanel

                    title="Upload Profile Photo"

                    subtitle="Add a profile photo to help others recognize and connect with you."

                    steps={authSteps}

                    currentStep={3}

                />

            </div>

            {/* Right */}

            <div className="flex-1 flex items-center justify-center px-6 py-10">

                <div className="w-full max-w-xl page-card rounded-[28px] p-8 sm:p-10">

                    <h1 className="page-title">

                        Upload Profile Photo

                    </h1>

                    <p className="page-subtitle">

                        Add a photo to personalize your AlumniConnect experience.

                    </p>

                    <form

                        onSubmit={handleSubmit(onSubmit)}

                        className="mt-10 space-y-6"
                    >
                        <div className="flex flex-col items-center">

                            <label
                                htmlFor="profileImage"
                                className="cursor-pointer"
                            >

                                <div className="relative">

                                    {

                                        preview ?

                                            (

                                                <img

                                                    src={preview}

                                                    alt="preview"

                                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"

                                                />

                                            )

                                            :

                                            (

                                                <div className="w-32 h-32 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">

                                                    <Camera
                                                        size={34}
                                                        className="text-gray-400"
                                                    />

                                                </div>

                                            )

                                    }

                                    <div className="absolute bottom-1 right-1 bg-[#004AC6] text-white rounded-full p-2">

                                        <Upload size={14} />

                                    </div>

                                </div>

                            </label>

                            <input

                                id="profileImage"

                                accept="image/*"

                                hidden

                                onChange={(e) => handleImage(e.target.files[0])}

                                type="file"
                                {...register("profileImage", {
                                    required: "Profile image is required",
                                })}

                            />
                            {errors.profileImage && (
                                <p className="mt-2 text-sm text-red-500 text-center">
                                    {errors.profileImage.message}
                                </p>
                            )}

                            <p className="mt-4 text-sm text-gray-500">

                                Upload Profile Photo

                            </p>

                        </div>

                        <div className="rounded-2xl border bg-blue-50 p-5">

                            <div className="flex items-start gap-3">

                                <Image
                                    size={22}
                                    className="mt-0.5 text-[#004AC6]"
                                />

                                <div>

                                    <h4 className="font-semibold text-[#004AC6]">
                                        Profile Photo Tips
                                    </h4>

                                    <ul className="mt-2 space-y-1 text-sm text-gray-600">

                                        <li>• Clear face photo</li>

                                        <li>• JPG, PNG or WEBP</li>

                                        <li>• Maximum size 5 MB</li>

                                        <li>• Square images work best</li>

                                    </ul>

                                </div>

                            </div>

                        </div>

                        <div className="flex gap-4 pt-4">

                            <button
                                type="button"
                                onClick={() => navigate("/complete-profile")}
                                className="secondary-btn h-12 flex-1"
                            >
                                Skip for Now
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="primary-btn h-12 flex-1 disabled:opacity-70"
                            >
                                {isSubmitting ? "Saving..." : "Upload Photo"}
                            </button>

                        </div>

                        <div className="my-10 h-px bg-gray-200" />

                        <div className="flex flex-wrap justify-center gap-5">

                            <TrustLables
                                icon={<ShieldCheck size={14} />}
                                text="Secure Upload"
                            />

                            <TrustLables
                                icon={<Image size={14} />}
                                text="Professional Profile"
                            />

                            <TrustLables
                                icon={<Users size={14} />}
                                text="Verified Community"
                            />

                        </div>

                        <p className="mt-8 text-center text-sm leading-7 text-gray-500">

                            Your profile helps students, alumni, recruiters and mentors
                            discover and connect with you more effectively.

                        </p>
                    </form>
                </div>
            </div>
        </div >
    );
};

export default UploadProfileOnboard;
