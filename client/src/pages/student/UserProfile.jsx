import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import {
    User,
    Mail,
    MapPin,
    GraduationCap,
    Briefcase,
    Code,
    Plus,
    Trash2,
    Camera,
    MessageSquare,
    Handshake,
    Sparkles,
    Calendar,
    Edit2,
    Save,
    X,
    ShieldCheck,
    Globe,
    Building2,
    ChevronRight,
} from "lucide-react";


const API_URL = "http://localhost:8000/api";


const UserProfile = () => {

    const { userId } = useParams();

    const token =
        sessionStorage.getItem("accessToken");

    const currentUser = JSON.parse(
        sessionStorage.getItem("user") || "{}"
    );


    /* =====================================================
       PROFILE STATE
    ===================================================== */

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [isOwnProfile, setIsOwnProfile] =
        useState(false);

    const [isAdmin] =
        useState(
            (currentUser?.role || "")
                .toLowerCase() === "admin"
        );


    /* =====================================================
       BASIC EDIT STATE
    ===================================================== */

    const [isEditingBasic, setIsEditingBasic] =
        useState(false);

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [headline, setHeadline] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [city, setCity] =
        useState("");

    const [state, setState] =
        useState("");

    const [country, setCountry] =
        useState("India");

    const [pincode, setPincode] =
        useState("");

    const [isUpdating, setIsUpdating] =
        useState(false);


    /* =====================================================
       SKILLS
    ===================================================== */

    const [skillInput, setSkillInput] =
        useState("");


    /* =====================================================
       EDUCATION
    ===================================================== */

    const [showAddEdu, setShowAddEdu] =
        useState(false);

    const [newEdu, setNewEdu] =
        useState({
            institution: "",
            degree: "",
            fieldOfStudy: "",
            graduationYear: "",
        });


    /* =====================================================
       EXPERIENCE
    ===================================================== */

    const [showAddExp, setShowAddExp] =
        useState(false);

    const [newExp, setNewExp] =
        useState({
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
        });


    /* =====================================================
       FETCH PROFILE
    ===================================================== */

    const fetchProfile = async () => {

        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {

            const headers = {
                Authorization:
                    `Bearer ${token}`,
            };


            const viewingOwnProfile =
                !userId ||
                userId === currentUser?._id;


            setIsOwnProfile(
                viewingOwnProfile
            );


            const response =
                viewingOwnProfile
                    ? await axios.get(
                        `${API_URL}/profile/get-profile`,
                        { headers }
                    )
                    : await axios.get(
                        `${API_URL}/profile/get-profile/${userId}`,
                        { headers }
                    );


            const p =
                response.data?.profile;


            if (!p) {
                setProfile(null);
                return;
            }


            setProfile(p);


            /*
             * IMPORTANT:
             * Schema uses professionalHeadline.
             */

            setFirstName(
                p.firstName || ""
            );

            setLastName(
                p.lastName || ""
            );

            setHeadline(
                p.professionalHeadline || ""
            );

            setAddress(
                p.location?.address || ""
            );

            setCity(
                p.location?.city || ""
            );

            setState(
                p.location?.state || ""
            );

            setCountry(
                p.location?.country ||
                "India"
            );

            setPincode(
                p.location?.pincode || ""
            );

        } catch (error) {

            console.error(
                "Profile fetch error:",
                error
            );

            if (
                error.response?.status ===
                404
            ) {

                setProfile(null);

                if (isOwnProfile) {

                    toast.warning(
                        "Your profile has not been created yet."
                    );

                }

            } else {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to fetch profile."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchProfile();

    }, [
        userId,
        token,
    ]);


    /* =====================================================
       IMAGE UPLOAD
    ===================================================== */

    const handleImageChange =
        async (event) => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                toast.error(
                    "Please upload an image file."
                );

                return;
            }


            const formData =
                new FormData();

            formData.append(
                "profileImage",
                file
            );


            try {

                const response =
                    await axios.post(
                        `${API_URL}/profile/set-profile-image`,
                        formData,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                                "Content-Type":
                                    "multipart/form-data",
                            },
                        }
                    );


                setProfile(
                    (previous) => ({
                        ...previous,
                        profilePicture:
                            response.data
                                ?.profile
                                ?.profilePicture,
                    })
                );


                toast.success(
                    "Profile picture updated!"
                );

            } catch (error) {

                console.error(
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to upload image."
                );

            }

        };


    /* =====================================================
       SAVE BASIC PROFILE
    ===================================================== */

    const handleSaveBasic =
        async (event) => {

            event.preventDefault();


            if (
                !firstName.trim() ||
                !lastName.trim() ||
                !city.trim() ||
                !state.trim()
            ) {

                toast.error(
                    "First Name, Last Name, City and State are required."
                );

                return;
            }


            try {

                setIsUpdating(true);


                const response =
                    await axios.put(
                        `${API_URL}/profile/update-profile`,
                        {
                            firstName:
                                firstName.trim(),

                            lastName:
                                lastName.trim(),

                            professionalHeadline:
                                headline.trim(),

                            location: {
                                address:
                                    address.trim(),

                                city:
                                    city.trim(),

                                state:
                                    state.trim(),

                                country:
                                    country.trim(),

                                pincode:
                                    pincode.trim(),
                            },
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                setIsEditingBasic(
                    false
                );

                toast.success(
                    "Profile updated successfully."
                );

            } catch (error) {

                console.error(
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to update profile."
                );

            } finally {

                setIsUpdating(false);

            }

        };


    /* =====================================================
       ADD SKILL
    ===================================================== */

    const handleAddSkill =
        async (event) => {

            event.preventDefault();

            const skill =
                skillInput.trim();

            if (!skill) {
                return;
            }


            try {

                const response =
                    await axios.post(
                        `${API_URL}/profile/add-skill`,
                        { skill },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                setSkillInput("");

                toast.success(
                    `${skill} added.`
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to add skill."
                );

            }

        };


    /* =====================================================
       REMOVE SKILL
    ===================================================== */

    const handleRemoveSkill =
        async (skill) => {

            try {

                const response =
                    await axios.delete(
                        `${API_URL}/profile/remove-skill/${encodeURIComponent(
                            skill
                        )}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                toast.success(
                    `${skill} removed.`
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to remove skill."
                );

            }

        };


    /* =====================================================
       ADD EDUCATION
    ===================================================== */

    const handleAddEducation =
        async (event) => {

            event.preventDefault();


            if (
                !newEdu.institution.trim() ||
                !newEdu.degree.trim()
            ) {

                toast.error(
                    "Institution and Degree are required."
                );

                return;
            }


            try {

                const response =
                    await axios.post(
                        `${API_URL}/profile/add-education`,
                        {
                            ...newEdu,

                            graduationYear:
                                parseInt(
                                    newEdu.graduationYear
                                ) ||
                                undefined,
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                setNewEdu({
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    graduationYear: "",
                });

                setShowAddEdu(false);

                toast.success(
                    "Education added."
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to add education."
                );

            }

        };


    /* =====================================================
       DELETE EDUCATION
    ===================================================== */

    const handleRemoveEducation =
        async (educationId) => {

            try {

                const response =
                    await axios.delete(
                        `${API_URL}/profile/delete-education/${educationId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                toast.success(
                    "Education removed."
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to delete education."
                );

            }

        };


    /* =====================================================
       ADD EXPERIENCE
    ===================================================== */

    const handleAddExperience =
        async (event) => {

            event.preventDefault();


            if (
                !newExp.company.trim() ||
                !newExp.position.trim()
            ) {

                toast.error(
                    "Company and Position are required."
                );

                return;
            }


            try {

                const response =
                    await axios.post(
                        `${API_URL}/profile/add-experience`,
                        newExp,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                setNewExp({
                    company: "",
                    position: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                });

                setShowAddExp(false);

                toast.success(
                    "Experience added."
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to add experience."
                );

            }

        };


    /* =====================================================
       DELETE EXPERIENCE
    ===================================================== */

    const handleRemoveExperience =
        async (experienceId) => {

            try {

                const response =
                    await axios.delete(
                        `${API_URL}/profile/delete-experience/${experienceId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    response.data.profile
                );

                toast.success(
                    "Experience removed."
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to delete experience."
                );

            }

        };


    /* =====================================================
       ADMIN VERIFY
    ===================================================== */

    const handleVerifyMember =
        async () => {

            const memberId =
                profile?.userId?._id;

            if (!memberId) {
                return;
            }


            try {

                const response =
                    await axios.post(
                        `${API_URL}/auth/verify-member/${memberId}`,
                        {},
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setProfile(
                    (previous) => ({
                        ...previous,

                        userId: {
                            ...previous.userId,

                            ...response
                                .data
                                .user,
                        },
                    })
                );


                toast.success(
                    response.data
                        ?.message ||
                    "Member verified."
                );

            } catch (error) {

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to verify member."
                );

            }

        };


    /* =====================================================
       HELPERS
    ===================================================== */

    const formatDate =
        (date) => {

            if (!date) {
                return "";
            }

            return new Date(
                date
            ).toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    year: "numeric",
                }
            );

        };


    const getName = () => {

        const fullName =
            `${profile?.firstName || ""} ${profile?.lastName || ""
                }`.trim();

        return (
            fullName ||
            profile?.userId?.email ||
            "Alumni Member"
        );

    };


    const initials =
        getName()
            .split(" ")
            .filter(Boolean)
            .map(
                (part) =>
                    part[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();


    const role =
        profile?.userId?.role ||
        "member";


    const isVerified =
        profile?.userId?.emailVerified ||
        profile?.userId?.AccountStatus ===
        "verified";


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 rounded-full border-4 border-blue-100 border-t-[#004AC6] animate-spin" />

                    <p className="mt-4 text-xs font-semibold text-gray-500">
                        Loading profile...
                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       PROFILE NOT FOUND
    ===================================================== */

    if (!profile) {

        return (

            <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#004AC6]">

                    <User size={28} />

                </div>

                <h2 className="mt-5 text-lg font-bold text-gray-900">
                    {isOwnProfile
                        ? "Your profile isn't ready yet"
                        : "Profile not found"}
                </h2>

                <p className="mt-2 text-xs leading-5 text-gray-400">

                    {isOwnProfile
                        ? "Complete your profile so other members can discover you."
                        : "This member has not completed their profile yet."}

                </p>


                {isOwnProfile && (

                    <Link
                        to="/student/dashboard"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#004AC6] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0038A8]"
                    >
                        Go to Dashboard
                        <ChevronRight
                            size={14}
                        />
                    </Link>

                )}

            </div>

        );

    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <div className="mx-auto max-w-6xl space-y-5 pb-10">


            {/* =================================================
               PROFILE HERO
            ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                {/* COVER */}

                <div className="relative h-36 overflow-hidden bg-gradient-to-r from-[#003A9B] via-[#004AC6] to-[#527DFF]">

                    <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/10" />

                    <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/10" />

                </div>


                {/* PROFILE CONTENT */}

                <div className="relative px-5 pb-6 sm:px-7">

                    <div className="pt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


                        {/* IDENTITY */}

                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">

                            <div className="relative shrink-0">

                                {profile.profilePicture ? (

                                    <img
                                        src={
                                            profile.profilePicture
                                        }
                                        alt={getName()}
                                        className="h-28 w-28 rounded-3xl border-4 border-white bg-white object-cover shadow-xl"
                                    />

                                ) : (

                                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-blue-50 text-3xl font-extrabold text-[#004AC6] shadow-xl">
                                        {initials}
                                    </div>

                                )}


                                {isOwnProfile && (

                                    <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#004AC6] text-white shadow-lg transition hover:bg-[#0038A8]">

                                        <Camera
                                            size={15}
                                        />

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleImageChange
                                            }
                                            hidden
                                        />

                                    </label>

                                )}

                            </div>


                            <div className="pb-1">

                                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">

                                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                                        {getName()}
                                    </h1>


                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#004AC6]">
                                        {role}
                                    </span>


                                    {isVerified && (

                                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-600">

                                            <ShieldCheck
                                                size={11}
                                            />

                                            Verified

                                        </span>

                                    )}

                                </div>


                                <p className="mt-1 text-xs font-semibold text-gray-600">

                                    {profile.professionalHeadline ||
                                        "Professional member of AlumniConnect"}

                                </p>


                                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] font-medium text-gray-400 sm:justify-start">

                                    <span className="flex items-center gap-1">

                                        <MapPin
                                            size={12}
                                        />

                                        {profile.location?.city ||
                                            "Location"}

                                        {profile.location?.state &&
                                            `, ${profile.location.state}`}

                                    </span>


                                    {profile.location?.country && (

                                        <span className="flex items-center gap-1">

                                            <Globe
                                                size={12}
                                            />

                                            {
                                                profile
                                                    .location
                                                    .country
                                            }

                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="flex flex-wrap justify-center gap-2 lg:justify-end">

                            {isOwnProfile ? (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsEditingBasic(
                                            true
                                        )
                                    }
                                    className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:border-[#004AC6] hover:text-[#004AC6]"
                                >
                                    <Edit2
                                        size={14}
                                    />
                                    Edit Profile
                                </button>

                            ) : (

                                <>

                                    <Link
                                        to={`/student/messages?chat=${profile.userId?._id ||
                                            profile.userId
                                            }`}
                                        className="flex h-10 items-center gap-2 rounded-xl bg-[#004AC6] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0038A8]"
                                    >
                                        <MessageSquare
                                            size={14}
                                        />
                                        Message
                                    </Link>


                                    <Link
                                        to={`/student/mentorship?request=${profile.userId?._id ||
                                            profile.userId
                                            }`}
                                        className="flex h-10 items-center gap-2 rounded-xl bg-blue-50 px-4 text-xs font-bold text-[#004AC6] transition hover:bg-blue-100"
                                    >
                                        <Handshake
                                            size={14}
                                        />
                                        Mentorship
                                    </Link>

                                </>

                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
               MAIN GRID
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[310px_1fr]">


                {/* =================================================
                   LEFT COLUMN
                ================================================= */}

                <div className="space-y-5">


                    {/* ABOUT */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">

                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">

                                    <User
                                        size={15}
                                    />

                                </div>

                                <h2 className="text-sm font-bold text-gray-900">
                                    About & Details
                                </h2>

                            </div>


                            {isOwnProfile && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsEditingBasic(
                                            !isEditingBasic
                                        )
                                    }
                                    className="text-[10px] font-bold text-[#004AC6] hover:underline"
                                >
                                    {isEditingBasic
                                        ? "Cancel"
                                        : "Edit"}
                                </button>

                            )}

                        </div>


                        {isEditingBasic ? (

                            <form
                                onSubmit={
                                    handleSaveBasic
                                }
                                className="space-y-3"
                            >

                                <div className="grid grid-cols-2 gap-2">

                                    <input
                                        value={
                                            firstName
                                        }
                                        onChange={(e) =>
                                            setFirstName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="First name"
                                        className="h-9 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />

                                    <input
                                        value={
                                            lastName
                                        }
                                        onChange={(e) =>
                                            setLastName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Last name"
                                        className="h-9 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />

                                </div>


                                <input
                                    value={
                                        headline
                                    }
                                    onChange={(e) =>
                                        setHeadline(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Professional headline"
                                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                />


                                <input
                                    value={
                                        address
                                    }
                                    onChange={(e) =>
                                        setAddress(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Address"
                                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                />


                                <div className="grid grid-cols-2 gap-2">

                                    <input
                                        value={
                                            city
                                        }
                                        onChange={(e) =>
                                            setCity(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="City"
                                        className="h-9 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />

                                    <input
                                        value={
                                            state
                                        }
                                        onChange={(e) =>
                                            setState(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="State"
                                        className="h-9 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />

                                </div>


                                <div className="grid grid-cols-2 gap-2">

                                    <input
                                        value={
                                            country
                                        }
                                        onChange={(e) =>
                                            setCountry(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Country"
                                        className="h-9 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                    />

                                    <input
                                        value={
                                            pincode
                                        }
                                        onChange={(e) =>
                                            setPincode(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Pincode"
                                        className="h-9 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    disabled={
                                        isUpdating
                                    }
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#004AC6] text-xs font-bold text-white hover:bg-[#0038A8] disabled:opacity-50"
                                >

                                    <Save
                                        size={14}
                                    />

                                    {isUpdating
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </form>

                        ) : (

                            <div className="space-y-4">

                                <InfoRow
                                    icon={
                                        <Mail
                                            size={14}
                                        />
                                    }
                                    label="Email"
                                    value={
                                        profile.userId
                                            ?.email ||
                                        currentUser
                                            ?.email ||
                                        "Private"
                                    }
                                />


                                <InfoRow
                                    icon={
                                        <MapPin
                                            size={14}
                                        />
                                    }
                                    label="Location"
                                    value={[
                                        profile.location
                                            ?.address,
                                        profile.location
                                            ?.city,
                                        profile.location
                                            ?.state,
                                        profile.location
                                            ?.country,
                                    ]
                                        .filter(Boolean)
                                        .join(", ") ||
                                        "Not provided"}
                                />


                                <InfoRow
                                    icon={
                                        <ShieldCheck
                                            size={14}
                                        />
                                    }
                                    label="Verification"
                                    value={
                                        isVerified
                                            ? "Verified Member"
                                            : "Pending Verification"
                                    }
                                    valueClass={
                                        isVerified
                                            ? "text-emerald-600"
                                            : "text-amber-600"
                                    }
                                />


                                {isAdmin &&
                                    !isVerified &&
                                    !isOwnProfile && (

                                        <button
                                            type="button"
                                            onClick={
                                                handleVerifyMember
                                            }
                                            className="w-full rounded-lg bg-[#004AC6] py-2 text-[10px] font-bold text-white hover:bg-[#0038A8]"
                                        >
                                            Verify Member
                                        </button>

                                    )}

                            </div>

                        )}

                    </section>


                    {/* SKILLS */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">

                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">

                                    <Code
                                        size={15}
                                    />

                                </div>

                                <h2 className="text-sm font-bold text-gray-900">
                                    Skills
                                </h2>

                            </div>

                        </div>


                        {isOwnProfile && (

                            <form
                                onSubmit={
                                    handleAddSkill
                                }
                                className="mb-4 flex gap-2"
                            >

                                <input
                                    value={
                                        skillInput
                                    }
                                    onChange={(e) =>
                                        setSkillInput(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Add a skill..."
                                    className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-xs outline-none focus:border-[#004AC6]"
                                />

                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#004AC6] px-3 text-xs font-bold text-white hover:bg-[#0038A8]"
                                >
                                    Add
                                </button>

                            </form>

                        )}


                        <div className="flex flex-wrap gap-2">

                            {profile.skills?.map(
                                (
                                    skill,
                                    index
                                ) => (

                                    <span
                                        key={
                                            `${skill}-${index}`
                                        }
                                        className="group flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#004AC6]"
                                    >

                                        {skill}

                                        {isOwnProfile && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveSkill(
                                                        skill
                                                    )
                                                }
                                                className="text-blue-300 hover:text-red-500"
                                            >
                                                <X
                                                    size={
                                                        11
                                                    }
                                                />
                                            </button>

                                        )}

                                    </span>

                                )
                            )}


                            {(!profile.skills ||
                                profile.skills
                                    .length ===
                                0) && (

                                    <p className="text-xs italic text-gray-400">
                                        No skills added yet.
                                    </p>

                                )}

                        </div>

                    </section>

                </div>


                {/* =================================================
                   RIGHT COLUMN
                ================================================= */}

                <div className="space-y-5">


                    {/* EDUCATION */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <SectionHeader
                            icon={
                                <GraduationCap
                                    size={16}
                                />
                            }
                            title="Education"
                            action={
                                isOwnProfile
                                    ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddEdu(
                                                    !showAddEdu
                                                )
                                            }
                                            className="flex items-center gap-1 text-[10px] font-bold text-[#004AC6] hover:underline"
                                        >
                                            {showAddEdu ? (
                                                <X
                                                    size={
                                                        13
                                                    }
                                                />
                                            ) : (
                                                <Plus
                                                    size={
                                                        13
                                                    }
                                                />
                                            )}

                                            {showAddEdu
                                                ? "Close"
                                                : "Add"}
                                        </button>
                                    )
                                    : null
                            }
                        />


                        {showAddEdu && (

                            <form
                                onSubmit={
                                    handleAddEducation
                                }
                                className="mb-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                            >

                                <p className="mb-3 text-xs font-bold text-[#004AC6]">
                                    Add Education
                                </p>


                                <div className="space-y-2">

                                    <input
                                        value={
                                            newEdu.institution
                                        }
                                        onChange={(e) =>
                                            setNewEdu({
                                                ...newEdu,
                                                institution:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        }
                                        placeholder="Institution"
                                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                        required
                                    />


                                    <div className="grid grid-cols-2 gap-2">

                                        <input
                                            value={
                                                newEdu.degree
                                            }
                                            onChange={(e) =>
                                                setNewEdu({
                                                    ...newEdu,
                                                    degree:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            }
                                            placeholder="Degree"
                                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                            required
                                        />

                                        <input
                                            value={
                                                newEdu.fieldOfStudy
                                            }
                                            onChange={(e) =>
                                                setNewEdu({
                                                    ...newEdu,
                                                    fieldOfStudy:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            }
                                            placeholder="Field of study"
                                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                        />

                                    </div>


                                    <input
                                        type="number"
                                        value={
                                            newEdu.graduationYear
                                        }
                                        onChange={(e) =>
                                            setNewEdu({
                                                ...newEdu,
                                                graduationYear:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        }
                                        placeholder="Graduation year"
                                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                    />


                                    <button
                                        type="submit"
                                        className="h-9 w-full rounded-lg bg-[#004AC6] text-xs font-bold text-white hover:bg-[#0038A8]"
                                    >
                                        Save Education
                                    </button>

                                </div>

                            </form>

                        )}


                        {profile.education?.length >
                            0 ? (

                            <div className="relative ml-2 space-y-5 border-l-2 border-blue-100 pl-6">

                                {profile.education.map(
                                    (
                                        edu
                                    ) => (

                                        <div
                                            key={
                                                edu._id
                                            }
                                            className="relative"
                                        >

                                            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-[#004AC6] bg-white" />


                                            <div className="flex items-start justify-between gap-4">

                                                <div>

                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        {
                                                            edu.institution
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-xs font-semibold text-gray-600">

                                                        {
                                                            edu.degree
                                                        }

                                                        {edu.fieldOfStudy &&
                                                            ` • ${edu.fieldOfStudy}`}

                                                    </p>


                                                    {edu.graduationYear && (

                                                        <p className="mt-1 text-[10px] font-semibold text-gray-400">
                                                            Class of{" "}
                                                            {
                                                                edu.graduationYear
                                                            }
                                                        </p>

                                                    )}

                                                </div>


                                                {isOwnProfile && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveEducation(
                                                                edu._id
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <EmptySection
                                icon={
                                    <GraduationCap
                                        size={20}
                                    />
                                }
                                text="No education records yet."
                            />

                        )}

                    </section>


                    {/* EXPERIENCE */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <SectionHeader
                            icon={
                                <Briefcase
                                    size={16}
                                />
                            }
                            title="Work Experience"
                            action={
                                isOwnProfile
                                    ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddExp(
                                                    !showAddExp
                                                )
                                            }
                                            className="flex items-center gap-1 text-[10px] font-bold text-[#004AC6] hover:underline"
                                        >
                                            {showAddExp ? (
                                                <X
                                                    size={
                                                        13
                                                    }
                                                />
                                            ) : (
                                                <Plus
                                                    size={
                                                        13
                                                    }
                                                />
                                            )}

                                            {showAddExp
                                                ? "Close"
                                                : "Add"}
                                        </button>
                                    )
                                    : null
                            }
                        />


                        {showAddExp && (

                            <form
                                onSubmit={
                                    handleAddExperience
                                }
                                className="mb-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                            >

                                <p className="mb-3 text-xs font-bold text-[#004AC6]">
                                    Add Experience
                                </p>


                                <div className="space-y-2">

                                    <div className="grid grid-cols-2 gap-2">

                                        <input
                                            value={
                                                newExp.company
                                            }
                                            onChange={(e) =>
                                                setNewExp({
                                                    ...newExp,
                                                    company:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            }
                                            placeholder="Company"
                                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                            required
                                        />

                                        <input
                                            value={
                                                newExp.position
                                            }
                                            onChange={(e) =>
                                                setNewExp({
                                                    ...newExp,
                                                    position:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            }
                                            placeholder="Position"
                                            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                            required
                                        />

                                    </div>


                                    <div className="grid grid-cols-2 gap-2">

                                        <div>

                                            <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                                                Start date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    newExp.startDate
                                                }
                                                onChange={(e) =>
                                                    setNewExp({
                                                        ...newExp,
                                                        startDate:
                                                            e
                                                                .target
                                                                .value,
                                                    })
                                                }
                                                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6]"
                                            />

                                        </div>


                                        <div>

                                            <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                                                End date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    newExp.endDate
                                                }
                                                disabled={
                                                    newExp.isCurrent
                                                }
                                                onChange={(e) =>
                                                    setNewExp({
                                                        ...newExp,
                                                        endDate:
                                                            e
                                                                .target
                                                                .value,
                                                    })
                                                }
                                                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#004AC6] disabled:bg-gray-100"
                                            />

                                        </div>

                                    </div>


                                    <label className="flex items-center gap-2 text-[10px] font-semibold text-gray-600">

                                        <input
                                            type="checkbox"
                                            checked={
                                                newExp.isCurrent
                                            }
                                            onChange={(e) =>
                                                setNewExp({
                                                    ...newExp,
                                                    isCurrent:
                                                        e
                                                            .target
                                                            .checked,
                                                    endDate:
                                                        e
                                                            .target
                                                            .checked
                                                            ? ""
                                                            : newExp.endDate,
                                                })
                                            }
                                            className="h-3.5 w-3.5 accent-[#004AC6]"
                                        />

                                        I currently work here

                                    </label>


                                    <button
                                        type="submit"
                                        className="h-9 w-full rounded-lg bg-[#004AC6] text-xs font-bold text-white hover:bg-[#0038A8]"
                                    >
                                        Save Experience
                                    </button>

                                </div>

                            </form>

                        )}


                        {profile.experience?.length >
                            0 ? (

                            <div className="relative ml-2 space-y-5 border-l-2 border-blue-100 pl-6">

                                {profile.experience.map(
                                    (
                                        item
                                    ) => (

                                        <div
                                            key={
                                                item._id
                                            }
                                            className="relative"
                                        >

                                            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-[#004AC6] bg-white" />


                                            <div className="flex items-start justify-between gap-4">

                                                <div>

                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        {
                                                            item.position
                                                        }
                                                    </h3>

                                                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">

                                                        <Building2
                                                            size={
                                                                13
                                                            }
                                                            className="text-gray-400"
                                                        />

                                                        {
                                                            item.company
                                                        }

                                                    </p>


                                                    <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">

                                                        <Calendar
                                                            size={
                                                                12
                                                            }
                                                        />

                                                        {
                                                            formatDate(
                                                                item.startDate
                                                            )
                                                        }

                                                        {" — "}

                                                        {item.isCurrent
                                                            ? "Present"
                                                            : formatDate(
                                                                item.endDate
                                                            )}

                                                    </p>

                                                </div>


                                                {isOwnProfile && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveExperience(
                                                                item._id
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <EmptySection
                                icon={
                                    <Briefcase
                                        size={20}
                                    />
                                }
                                text="No work experience added yet."
                            />

                        )}

                    </section>


                    {/* PROFILE FOOTER */}

                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">

                                <Sparkles
                                    size={15}
                                />

                            </div>

                            <div>

                                <p className="text-[10px] font-bold text-gray-700">
                                    AlumniConnect Profile
                                </p>

                                <p className="text-[9px] text-gray-400">
                                    Keep your profile updated
                                    for better connections.
                                </p>

                            </div>

                        </div>

                        <ChevronRight
                            size={15}
                            className="text-gray-300"
                        />

                    </div>

                </div>

            </div>

        </div>

    );

};


/* =========================================================
   SMALL COMPONENTS
========================================================= */

const InfoRow = ({
    icon,
    label,
    value,
    valueClass = "text-gray-800",
}) => {

    return (

        <div>

            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                {label}
            </p>

            <div
                className={`flex items-start gap-2 text-xs font-semibold ${valueClass}`}
            >

                <span className="mt-0.5 shrink-0 text-gray-400">
                    {icon}
                </span>

                <span className="break-words">
                    {value}
                </span>

            </div>

        </div>

    );

};


const SectionHeader = ({
    icon,
    title,
    action,
}) => {

    return (

        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">

            <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">
                    {icon}
                </div>

                <h2 className="text-sm font-bold text-gray-900">
                    {title}
                </h2>

            </div>

            {action}

        </div>

    );

};


const EmptySection = ({
    icon,
    text,
}) => {

    return (

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10 text-center">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
                {icon}
            </div>

            <p className="mt-3 text-xs font-semibold text-gray-400">
                {text}
            </p>

        </div>

    );

};


export default UserProfile;