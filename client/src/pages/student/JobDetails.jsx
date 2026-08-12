import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    Building2,
    CheckCircle2,
    Clock3,
    ExternalLink,
    GraduationCap,
    MapPin,
    MessageSquare,
    Users,
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";

const JobDetails = () => {
    const { jobId } = useParams();
    const location = useLocation();

    const [job, setJob] = useState(
        location.state?.job || null
    );

    const [loading, setLoading] = useState(
        !location.state?.job
    );

    const [alumniProfile, setAlumniProfile] = useState(null);
    const [alumniLoading, setAlumniLoading] = useState(false);


    /* =====================================================
       SET JOB FROM ROUTER STATE
    ===================================================== */

    useEffect(() => {
        if (location.state?.job) {
            setJob(location.state.job);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [location.state]);


    /* =====================================================
       GET ALUMNI ID FROM JOB
    ===================================================== */

    const getAlumniId = (jobData) => {
        if (!jobData) return null;

        const postedBy =
            jobData.postedBy ||
            jobData.createdBy ||
            jobData.userId;

        if (!postedBy) return null;

        if (typeof postedBy === "string") {
            return postedBy;
        }

        return (
            postedBy?._id ||
            postedBy?.userId?._id ||
            postedBy?.userId ||
            null
        );
    };


    /* =====================================================
       FETCH ALUMNI PROFILE
    ===================================================== */

    useEffect(() => {
        const fetchAlumniProfile = async () => {
            if (!job) return;

            const alumniId = getAlumniId(job);

            console.log("Job:", job);
            console.log("Alumni ID:", alumniId);

            if (!alumniId) {
                console.warn(
                    "No alumni ID found in job object:",
                    job
                );

                setAlumniProfile(null);
                return;
            }

            try {
                setAlumniLoading(true);

                const token =
                    sessionStorage.getItem("accessToken");

                const response = await axios.get(
                    `${API_URL}/api/profile/get-profile/${alumniId}`,
                    {
                        headers: token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {},
                    }
                );

                console.log(
                    "Alumni profile response:",
                    response.data
                );

                /*
                 * Your backend response is:
                 *
                 * {
                 *   message: "...",
                 *   profile: {
                 *      firstName,
                 *      lastName,
                 *      profilePicture,
                 *      userId: {
                 *          _id,
                 *          email,
                 *          role
                 *      }
                 *   }
                 * }
                 */

                setAlumniProfile(
                    response.data?.profile || null
                );

            } catch (error) {
                console.error(
                    "Failed to fetch alumni profile:",
                    error
                );

                setAlumniProfile(null);

            } finally {
                setAlumniLoading(false);
            }
        };

        fetchAlumniProfile();

    }, [job]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-full bg-[#F8F9FF] p-5 sm:p-6">

                <div className="mx-auto max-w-6xl animate-pulse">

                    <div className="h-8 w-36 rounded-lg bg-gray-200" />

                    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

                        <div className="space-y-5">

                            <div className="h-48 rounded-xl border border-gray-200 bg-white" />

                            <div className="h-[500px] rounded-xl border border-gray-200 bg-white" />

                        </div>

                        <div className="h-80 rounded-xl border border-gray-200 bg-white" />

                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       JOB NOT FOUND
    ===================================================== */

    if (!job) {
        return (
            <div className="min-h-full bg-[#F8F9FF] px-5 py-6">

                <div className="mx-auto max-w-6xl">

                    <Link
                        to="/student/jobs"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                    >
                        <ArrowLeft size={16} />
                        Back to Jobs
                    </Link>


                    <div className="mt-5 rounded-xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#004AC6]">
                            <Briefcase size={25} />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-gray-900">
                            Job opportunity not found
                        </h2>

                        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                            This job may no longer be available.
                        </p>

                        <Link
                            to="/student/jobs"
                            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#003da8] bg-[#004AC6] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md"
                        >
                            Browse Jobs
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       NORMALIZE JOB DATA
    ===================================================== */

    const title =
        job.title ||
        job.jobTitle ||
        "Untitled Position";

    const company =
        job.company ||
        job.companyName ||
        "Company not specified";

    const locationName =
        job.location ||
        "Location not specified";

    const jobType =
        job.jobType ||
        job.type ||
        "Not specified";

    const experience =
        job.experience ||
        "Not specified";

    const industry =
        job.industry ||
        "Technology";

    const description =
        job.description ||
        "No job description has been provided.";

    const responsibilities =
        job.responsibilities ||
        job.responsibility ||
        [];

    const requiredSkills =
        job.requiredSkills ||
        job.skills ||
        [];

    const preferredSkills =
        job.preferredSkills ||
        [];


    /* =====================================================
       ALUMNI PROFILE DATA
    ===================================================== */

    const alumniId =
        alumniProfile?.userId?._id ||
        (typeof alumniProfile?.userId === "string"
            ? alumniProfile.userId
            : null);


    const alumniFirstName =
        alumniProfile?.firstName || "";


    const alumniLastName =
        alumniProfile?.lastName || "";


    const alumniName =
        `${alumniFirstName} ${alumniLastName}`.trim() ||
        "Alumni Member";


    const alumniProfilePicture =
        alumniProfile?.profilePicture || "";


    const alumniEmail =
        alumniProfile?.userId?.email || "";


    /* =====================================================
       ALUMNI INITIALS
    ===================================================== */

    const alumniInitials =
        `${alumniFirstName?.[0] || ""}${alumniLastName?.[0] || ""}`
            .toUpperCase() || "A";


    /* =====================================================
       COMPANY
    ===================================================== */

    const companyInitial =
        company.charAt(0).toUpperCase();


    /* =====================================================
       APPLY LINK
    ===================================================== */

    const applyLink =
        job.applyLink ||
        job.applicationLink ||
        job.applicationUrl;


    /* =====================================================
       MESSAGE ALUMNI OBJECT
    ===================================================== */

    const messageAlumni = {
        _id: alumniId,

        firstName:
            alumniProfile?.firstName || "",

        lastName:
            alumniProfile?.lastName || "",

        username:
            alumniName,

        email:
            alumniEmail,

        profilePicture:
            alumniProfilePicture,
    };


    /* =====================================================
       MESSAGE LINK
    ===================================================== */

    const messageLink = {
        pathname: "/student/messages",
        search: `?chat=${alumniId}`,
    };


    return (
        <div className="min-h-full bg-[#F8F9FF] px-4 py-5 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-6xl">


                {/* =================================================
                    BREADCRUMB
                ================================================= */}

                <div className="flex items-center gap-2 text-xs text-gray-400">

                    <Link
                        to="/student/jobs"
                        className="font-medium text-[#004AC6] hover:underline"
                    >
                        Jobs & Referrals
                    </Link>

                    <span>/</span>

                    <span className="truncate">
                        {title}
                    </span>

                </div>


                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">


                    {/* =================================================
                        LEFT COLUMN
                    ================================================= */}

                    <main className="min-w-0">


                        {/* =================================================
                            JOB HEADER
                        ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">


                                {/* COMPANY */}

                                <div className="flex min-w-0 gap-4">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-lg font-bold text-[#004AC6]">

                                        {job.companyLogo ||
                                            job.logo ? (

                                            <img
                                                src={
                                                    job.companyLogo ||
                                                    job.logo
                                                }
                                                alt={company}
                                                className="h-full w-full object-cover"
                                            />

                                        ) : (

                                            companyInitial

                                        )}

                                    </div>


                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                                {title}
                                            </h1>

                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#004AC6]">
                                                {jobType}
                                            </span>

                                        </div>


                                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">

                                            <span className="flex items-center gap-1">
                                                <Building2 size={13} />
                                                {company}
                                            </span>

                                            <span className="hidden text-gray-300 sm:block">
                                                •
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <MapPin size={13} />
                                                {locationName}
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {/* APPLY */}

                                {applyLink && (
                                    <a
                                        href={applyLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#003da8] bg-[#004AC6] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md"
                                    >
                                        Apply Now
                                        <ExternalLink size={14} />
                                    </a>
                                )}

                            </div>


                            {/* =================================================
                                JOB META
                            ================================================= */}

                            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

                                <InfoBox
                                    label="Company"
                                    value={company}
                                    icon={<Building2 size={14} />}
                                />

                                <InfoBox
                                    label="Location"
                                    value={locationName}
                                    icon={<MapPin size={14} />}
                                />

                                <InfoBox
                                    label="Type"
                                    value={jobType}
                                    icon={<Briefcase size={14} />}
                                />

                                <InfoBox
                                    label="Experience"
                                    value={experience}
                                    icon={<Clock3 size={14} />}
                                />

                            </div>

                        </section>


                        {/* =================================================
                            JOB DESCRIPTION
                        ================================================= */}

                        <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <SectionTitle
                                icon={<Briefcase size={16} />}
                                title="Job Description"
                            />

                            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
                                {description}
                            </p>


                            {/* =================================================
                                RESPONSIBILITIES
                            ================================================= */}

                            {responsibilities.length > 0 && (

                                <div className="mt-7">

                                    <h3 className="text-sm font-bold text-gray-900">
                                        Responsibilities
                                    </h3>

                                    <div className="mt-3 space-y-3">

                                        {responsibilities.map(
                                            (item, index) => {

                                                const text =
                                                    typeof item === "string"
                                                        ? item
                                                        : item?.description ||
                                                        item?.text ||
                                                        item?.title ||
                                                        "";

                                                if (!text) {
                                                    return null;
                                                }

                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-2.5"
                                                    >

                                                        <CheckCircle2
                                                            size={15}
                                                            className="mt-0.5 shrink-0 text-[#004AC6]"
                                                        />

                                                        <p className="text-sm leading-5 text-gray-600">
                                                            {text}
                                                        </p>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* =================================================
                                SKILLS
                            ================================================= */}

                            {(requiredSkills.length > 0 ||
                                preferredSkills.length > 0) && (

                                    <div className="mt-7">

                                        <h3 className="text-sm font-bold text-gray-900">
                                            Skills & Competencies
                                        </h3>


                                        {/* REQUIRED */}

                                        {requiredSkills.length > 0 && (

                                            <div className="mt-4">

                                                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                    Required Skills
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-2">

                                                    {requiredSkills.map(
                                                        (skill, index) => {

                                                            const skillName =
                                                                typeof skill === "string"
                                                                    ? skill
                                                                    : skill?.name ||
                                                                    skill?.title ||
                                                                    "";

                                                            if (!skillName) {
                                                                return null;
                                                            }

                                                            return (
                                                                <Skill
                                                                    key={index}
                                                                    text={skillName}
                                                                    primary
                                                                />
                                                            );
                                                        }
                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {/* PREFERRED */}

                                        {preferredSkills.length > 0 && (

                                            <div className="mt-4">

                                                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                                    Preferred Skills
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-2">

                                                    {preferredSkills.map(
                                                        (skill, index) => {

                                                            const skillName =
                                                                typeof skill === "string"
                                                                    ? skill
                                                                    : skill?.name ||
                                                                    skill?.title ||
                                                                    "";

                                                            if (!skillName) {
                                                                return null;
                                                            }

                                                            return (
                                                                <Skill
                                                                    key={index}
                                                                    text={skillName}
                                                                />
                                                            );
                                                        }
                                                    )}

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                )}

                        </section>


                        {/* =================================================
                            OPPORTUNITY DETAILS
                        ================================================= */}

                        <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                            <SectionTitle
                                icon={<GraduationCap size={16} />}
                                title="Opportunity Details"
                            />

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">

                                <DetailRow
                                    label="Industry"
                                    value={industry}
                                />

                                <DetailRow
                                    label="Experience"
                                    value={experience}
                                />

                                <DetailRow
                                    label="Job Type"
                                    value={jobType}
                                />

                                <DetailRow
                                    label="Location"
                                    value={locationName}
                                />

                            </div>

                        </section>

                    </main>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside className="space-y-5">


                        {/* =================================================
                            ALUMNI CARD
                        ================================================= */}

                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                            {/* HEADER */}

                            <div className="h-20 bg-gradient-to-r from-[#004AC6] to-[#2563EB]" />


                            {/* PROFILE */}

                            <div className="-mt-10 px-5 pb-5">

                                {/* PROFILE IMAGE */}

                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-blue-50 text-xl font-bold text-[#004AC6] shadow-md">

                                    {alumniProfilePicture ? (

                                        <img
                                            src={alumniProfilePicture}
                                            alt={alumniName}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    ) : (

                                        <span>
                                            {alumniInitials}
                                        </span>

                                    )}

                                </div>


                                {/* PROFILE INFORMATION */}

                                <div className="mt-3">

                                    {alumniLoading ? (

                                        <div className="animate-pulse">

                                            <div className="h-4 w-32 rounded bg-gray-200" />

                                            <div className="mt-2 h-3 w-20 rounded bg-gray-100" />

                                        </div>

                                    ) : (

                                        <>
                                            <h2 className="text-base font-bold text-gray-900">
                                                {alumniName}
                                            </h2>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Alumni
                                            </p>

                                            {alumniEmail && (
                                                <p className="mt-2 truncate text-[11px] text-gray-400">
                                                    {alumniEmail}
                                                </p>
                                            )}
                                        </>

                                    )}

                                </div>


                                {/* =================================================
                                    MESSAGE ALUMNI
                                ================================================= */}

                                {alumniId ? (

                                    <Link
                                        to={messageLink}
                                        state={{
                                            chatTarget: messageAlumni,
                                        }}
                                        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#003da8] bg-[#004AC6] text-xs font-bold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md"
                                    >
                                        <MessageSquare size={14} />
                                        Message Alumni
                                    </Link>

                                ) : (

                                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-center">

                                        <p className="text-[11px] font-medium text-amber-700">
                                            Alumni information unavailable
                                        </p>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* =================================================
                            ABOUT OPPORTUNITY
                        ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                            <h2 className="text-sm font-bold text-gray-900">
                                About This Opportunity
                            </h2>

                            <div className="mt-4 space-y-3">

                                <SidebarInfo
                                    icon={<Briefcase size={15} />}
                                    label="Position"
                                    value={title}
                                />

                                <SidebarInfo
                                    icon={<Building2 size={15} />}
                                    label="Company"
                                    value={company}
                                />

                                <SidebarInfo
                                    icon={<MapPin size={15} />}
                                    label="Location"
                                    value={locationName}
                                />

                                <SidebarInfo
                                    icon={<Clock3 size={15} />}
                                    label="Experience"
                                    value={experience}
                                />

                            </div>

                        </section>


                        {/* =================================================
                            QUICK ACTIONS
                        ================================================= */}

                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                            <h2 className="text-sm font-bold text-gray-900">
                                Quick Actions
                            </h2>

                            <div className="mt-4 space-y-2">

                                {alumniId && (

                                    <Link
                                        to={messageLink}
                                        state={{
                                            chatTarget: messageAlumni,
                                        }}
                                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#004AC6] bg-white text-xs font-semibold text-[#004AC6] shadow-sm transition hover:bg-blue-50 hover:shadow-md"
                                    >
                                        <MessageSquare size={14} />
                                        Ask the Alumni
                                    </Link>

                                )}

                                <Link
                                    to="/student/jobs"
                                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                                >
                                    <Briefcase size={14} />
                                    Browse More Jobs
                                </Link>

                            </div>

                        </section>

                    </aside>

                </div>


                {/* =================================================
                    BACK
                ================================================= */}

                <div className="mt-5 pb-5">

                    <Link
                        to="/student/jobs"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#004AC6] hover:underline"
                    >
                        <ArrowLeft size={14} />
                        Back to all opportunities
                    </Link>

                </div>

            </div>

        </div>
    );
};


/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({
    icon,
    title,
}) => {
    return (
        <div className="flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-[#004AC6]">
                {icon}
            </div>

            <h2 className="text-sm font-bold text-gray-900">
                {title}
            </h2>

        </div>
    );
};


/* =========================================================
   INFO BOX
========================================================= */

const InfoBox = ({
    label,
    value,
    icon,
}) => {
    return (
        <div className="rounded-lg border border-gray-100 bg-[#FAFBFF] p-3">

            <div className="flex items-center gap-1.5 text-[#004AC6]">

                {icon}

                <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    {label}
                </span>

            </div>

            <p className="mt-1.5 truncate text-xs font-semibold text-gray-700">
                {value || "Not specified"}
            </p>

        </div>
    );
};


/* =========================================================
   DETAIL ROW
========================================================= */

const DetailRow = ({
    label,
    value,
}) => {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">

            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                {label}
            </p>

            <p className="mt-1 text-xs font-semibold text-gray-700">
                {value || "Not specified"}
            </p>

        </div>
    );
};


/* =========================================================
   SIDEBAR INFO
========================================================= */

const SidebarInfo = ({
    icon,
    label,
    value,
}) => {
    return (
        <div className="flex items-start gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#004AC6]">
                {icon}
            </div>

            <div className="min-w-0">

                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-xs font-semibold text-gray-700">
                    {value || "Not specified"}
                </p>

            </div>

        </div>
    );
};


/* =========================================================
   SKILL
========================================================= */

const Skill = ({
    text,
    primary = false,
}) => {
    return (
        <span
            className={`rounded-md border px-2.5 py-1.5 text-[10px] font-medium ${primary
                ? "border-blue-100 bg-blue-50 text-[#004AC6]"
                : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
        >
            {text}
        </span>
    );
};


export default JobDetails;