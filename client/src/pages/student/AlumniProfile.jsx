import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    GraduationCap,
    MessageSquare,
    Mail,
    Calendar,
    UserRound,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const AlumniProfile = () => {
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = sessionStorage.getItem("accessToken");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `${API_URL}/api/profile/get-profile/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("Profile response:", response.data);

                const profileData = response.data?.profile;

                if (!profileData) {
                    toast.error("Profile not found.");
                    return;
                }

                // Student portal → alumni profiles only
                if (profileData.userId?.role !== "alumni") {
                    toast.error("This is not an alumni profile.");
                    setProfile(null);
                    return;
                }

                setProfile(profileData);

            } catch (error) {
                console.error("Profile error:", error);

                toast.error(
                    error.response?.data?.message ||
                    "Unable to load alumni profile."
                );

            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchProfile();
        }

    }, [userId, token]);

    const getName = () => {
        if (!profile) return "Alumni Member";

        return (
            `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
            "Alumni Member"
        );
    };

    const getLocation = () => {
        const city = profile?.location?.city;
        const state = profile?.location?.state;

        if (city && state) {
            return `${city}, ${state}`;
        }

        return city || state || "Location not available";
    };

    const getInitials = () => {
        return getName()
            .split(" ")
            .filter(Boolean)
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-full bg-[#F8F9FF] p-6">
                <div className="mx-auto max-w-5xl animate-pulse">

                    <div className="h-8 w-32 rounded bg-gray-200" />

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                        <div className="flex gap-5">
                            <div className="h-24 w-24 rounded-full bg-gray-200" />

                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-48 rounded bg-gray-200" />
                                <div className="h-4 w-72 rounded bg-gray-100" />
                                <div className="h-3 w-40 rounded bg-gray-100" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-full bg-[#F8F9FF] p-6">
                <div className="mx-auto max-w-5xl">

                    <Link
                        to="/student/directory"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} />
                        Back to Alumni Directory
                    </Link>

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">

                        <UserRound
                            size={40}
                            className="mx-auto text-gray-300"
                        />

                        <h2 className="mt-4 text-lg font-bold text-gray-800">
                            Alumni profile not found
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            This profile may no longer be available.
                        </p>

                    </div>
                </div>
            </div>
        );
    }

    const name = getName();
    const userIdValue =
        profile.userId?._id ||
        profile.userId ||
        userId;

    return (
        <div className="min-h-full bg-[#F8F9FF] px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-5xl">

                {/* BACK */}

                <Link
                    to="/student/directory"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
                >
                    <ArrowLeft size={16} />
                    Alumni Directory
                </Link>


                {/* PROFILE HEADER */}

                <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-5">

                            {profile.profilePicture ? (
                                <img
                                    src={profile.profilePicture}
                                    alt={name}
                                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-2xl font-bold text-[#004AC6] shadow-md">
                                    {getInitials()}
                                </div>
                            )}

                            <div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {name}
                                    </h1>

                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                        Alumni
                                    </span>

                                </div>

                                <p className="mt-2 text-sm font-medium text-gray-600">
                                    {profile.proffesionalHeadLine ||
                                        "Professional headline not added"}
                                </p>

                                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-400">
                                    <MapPin size={15} />
                                    {getLocation()}
                                </div>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="flex gap-3">

                            <Link
                                to={{
                                    pathname: "/student/messages",
                                    search: `?chat=${userIdValue}`,
                                    state: {
                                        chatTarget: {
                                            _id: userIdValue,
                                            firstName: profile.firstName,
                                            lastName: profile.lastName,
                                            profilePicture:
                                                profile.profilePicture,
                                        },
                                    },
                                }}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#003da8] bg-[#004AC6] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0038A8] hover:shadow-md"
                            >
                                <MessageSquare size={17} />
                                Message
                            </Link>

                        </div>

                    </div>

                </section>


                {/* INFORMATION */}

                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">

                    {/* ABOUT */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                        <h2 className="text-lg font-bold text-gray-900">
                            About
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-gray-600">
                            {profile.bio ||
                                "This alumni has not added an introduction yet."}
                        </p>

                    </section>


                    {/* QUICK INFO */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-gray-900">
                            Information
                        </h2>

                        <div className="mt-5 space-y-4">

                            <InfoItem
                                icon={<Briefcase size={17} />}
                                label="Company"
                                value={
                                    profile.company ||
                                    "Not available"
                                }
                            />

                            <InfoItem
                                icon={<GraduationCap size={17} />}
                                label="Graduation"
                                value={
                                    profile.graduationYear ||
                                    "Not available"
                                }
                            />

                            <InfoItem
                                icon={<MapPin size={17} />}
                                label="Location"
                                value={getLocation()}
                            />

                        </div>

                    </section>

                </div>


                {/* SKILLS */}

                <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold text-gray-900">
                        Skills
                    </h2>

                    {profile.skills?.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">

                            {profile.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600"
                                >
                                    {skill}
                                </span>
                            ))}

                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-gray-400">
                            No skills added.
                        </p>
                    )}

                </section>


                {/* WORK EXPERIENCE */}

                <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-bold text-gray-900">
                        Work Experience
                    </h2>

                    {profile.workExperience?.length > 0 ? (
                        <div className="mt-5 space-y-4">

                            {profile.workExperience.map(
                                (experience, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                    >

                                        <h3 className="font-semibold text-gray-900">
                                            {experience.position ||
                                                experience.jobTitle ||
                                                "Position"}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {experience.company ||
                                                "Company"}
                                        </p>

                                    </div>
                                )
                            )}

                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-gray-400">
                            No work experience added.
                        </p>
                    )}

                </section>

            </div>

        </div>
    );
};


const InfoItem = ({ icon, label, value }) => {
    return (
        <div className="flex items-start gap-3">

            <div className="mt-0.5 rounded-lg border border-blue-100 bg-blue-50 p-2 text-[#004AC6]">
                {icon}
            </div>

            <div>
                <p className="text-xs font-medium text-gray-400">
                    {label}
                </p>

                <p className="mt-0.5 text-sm font-semibold text-gray-700">
                    {value}
                </p>
            </div>

        </div>
    );
};

export default AlumniProfile;