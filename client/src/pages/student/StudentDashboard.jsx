import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    GraduationCap,
    MessageSquare,
    Pencil,
    UserRoundPlus,
    Users,
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [recommendedAlumni, setRecommendedAlumni] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);
    const [myRsvps, setMyRsvps] = useState([]);
    const [mentorshipRequests, setMentorshipRequests] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    const token = sessionStorage.getItem("accessToken");

    const authConfig = useMemo(
        () => ({
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        [token]
    );

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);

            const requests = [
                axios
                    .get(`${API_URL}/profile/get-profile`, authConfig)
                    .then((res) => setProfile(res.data?.profile || null))
                    .catch((err) => {
                        // A missing profile is valid for a newly registered user.
                        if (err.response?.status !== 404) {
                            console.error("Profile:", err);
                        }
                    }),

                axios
                    .get(`${API_URL}/profile/alumni-directory?limit=3`, authConfig)
                    .then((res) => {

                        const profiles = res.data?.profiles || [];

                        // Student portal can only display alumni.
                        const alumniOnly = profiles.filter(
                            (profile) =>
                                profile.role === "alumni" ||
                                profile.userId?.role === "alumni"
                        );

                        setRecommendedAlumni(alumniOnly);
                    })
                    .catch((err) => {
                        console.error("Alumni directory:", err);
                        setRecommendedAlumni([]);
                    }),

                axios
                    .get(`${API_URL}/jobs/`, authConfig)
                    .then((res) => {
                        setJobs(res.data?.data || []);
                    })
                    .catch((err) => console.error("Jobs:", err)),

                axios
                    .get(`${API_URL}/events/upcoming`, authConfig)
                    .then((res) => {
                        setEvents(res.data?.events || []);
                    })
                    .catch((err) => console.error("Upcoming events:", err)),

                axios
                    .get(`${API_URL}/events/my-rsvps`, authConfig)
                    .then((res) => {
                        setMyRsvps(res.data?.data || []);
                    })
                    .catch((err) => console.error("My RSVPs:", err)),

                axios
                    .get(`${API_URL}/mentorship/sent`, authConfig)
                    .then((res) => {
                        setMentorshipRequests(res.data?.requests || []);
                    })
                    .catch((err) => console.error("Mentorship requests:", err)),

                axios
                    .get(`${API_URL}/message/conversations`, authConfig)
                    .then((res) => {
                        setConversations(res.data?.data || []);
                    })
                    .catch((err) => console.error("Conversations:", err)),
            ];

            await Promise.allSettled(requests);
            setLoading(false);
        };

        fetchDashboardData();
    }, [token, authConfig]);

    const username =
        profile?.firstName
            ? `${profile.firstName} ${profile.lastName || ""}`.trim()
            : user.username || "Student";

    const acceptedMentors = mentorshipRequests.filter(
        (request) => request.status === "accepted"
    ).length;

    const pendingMentorshipRequests = mentorshipRequests.filter(
        (request) => request.status === "pending"
    ).length;

    /*
     * There is no referral-request controller/endpoint in the supplied
     * controllers. Therefore this dashboard does NOT invent a referral
     * count. The reference UI card is kept, but the value is "--".
     */
    const referralRequests = "--";

    /*
     * Profile controller exposes these fields:
     * firstName, lastName, professional headline, education,
     * experience, skills, location and profilePicture.
     */
    const profileProgress = useMemo(() => {
        if (!profile) return 0;

        const checks = [
            Boolean(profile.firstName),
            Boolean(profile.lastName),
            Boolean(profile.proffesionalHeadLine),
            Array.isArray(profile.education) && profile.education.length > 0,
            Array.isArray(profile.experience) && profile.experience.length > 0,
            Array.isArray(profile.skills) && profile.skills.length > 0,
            Boolean(profile.location?.city),
            Boolean(profile.location?.state),
            Boolean(profile.profilePicture),
        ];

        return Math.round(
            (checks.filter(Boolean).length / checks.length) * 100
        );
    }, [profile]);

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getOtherParticipant = (conversation) => {
        const currentUserId = user._id?.toString();

        return (
            conversation.participants?.find(
                (participant) =>
                    participant?._id?.toString() !== currentUserId
            ) || conversation.participants?.[0]
        );
    };

    const getInitials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="w-10 h-10 rounded-full border-4 border-[#004AC6] border-t-transparent animate-spin" />
                    <p className="text-sm text-gray-500">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            {/* Welcome */}
            <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#2563eb] to-[#2864df] px-6 py-6 min-h-[170px]">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Welcome Back, {username} 👋
                    </h1>

                    <p className="mt-1 text-[13px] sm:text-sm text-white/90 max-w-[470px] leading-5">
                        You have {pendingMentorshipRequests} pending mentorship{" "}
                        {pendingMentorshipRequests === 1 ? "request" : "requests"}{" "}
                        and {events.length} upcoming events. Time to grow your network!
                    </p>

                    <div className="flex gap-3 mt-3">
                        <Link
                            to="/student/directory"
                            className="rounded-md bg-white px-4 py-3 text-[13px] font-semibold text-[#2563eb] hover:bg-gray-50"
                        >
                            Browse Alumni
                        </Link>

                        <Link
                            to="/student/jobs"
                            className="rounded-md border border-white/30 bg-white/10 px-4 py-3 text-[13px] font-semibold text-white hover:bg-white/20"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                </div>

                <GraduationCap
                    size={82}
                    strokeWidth={1.2}
                    className="absolute right-7 top-5 text-white opacity-20"
                />
            </section>

            {/* Verification */}
            <section className="flex items-center justify-between gap-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-[#2563eb]">
                        <Clock3 size={11} />
                    </div>
                    <p className="text-[14px] sm:text-[13px] text-gray-600">
                        Your verification request is under review. This usually takes 2-3 business days.
                    </p>
                </div>

                <button className="shrink-0 text-[14px] font-medium text-[#2563eb] hover:underline">
                    View Status
                </button>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Mentorship Requests"
                    value={mentorshipRequests.length}
                />
                <StatCard label="Accepted Mentors" value={acceptedMentors} />
                <StatCard label="Referral Requests" value={referralRequests} />
                <StatCard label="Events Joined" value={myRsvps.length} />
            </section>

            {/* Quick actions */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                    icon={<UserRoundPlus size={14} />}
                    label="Find Mentor"
                    to="/student/mentorship"
                />
                <QuickAction
                    icon={<BriefcaseBusiness size={14} />}
                    label="Browse Jobs"
                    to="/student/jobs"
                />
                <QuickAction
                    icon={<CalendarDays size={14} />}
                    label="Upcoming Events"
                    to="/student/events"
                />
                <QuickAction
                    icon={<MessageSquare size={14} />}
                    label="Messages"
                    to="/student/messages"
                />
            </section>

            {/* Recommended Alumni */}
            <section>
                <SectionHeader
                    title="Recommended Alumni"
                    linkText="See All →"
                    link="/directory"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedAlumni.map((alumni) => (
                        <AlumniCard
                            key={alumni._id}
                            alumni={alumni}
                        />
                    ))}

                    {recommendedAlumni.length === 0 && (
                        <EmptyCard
                            icon={<Users size={20} />}
                            text="No alumni available right now."
                        />
                    )}
                </div>
            </section>

            {/* Mentorship + Profile */}
            <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className="dashboard-card p-5">
                    <SectionHeader
                        title="My Mentorship Requests"
                        linkText="View All"
                        link="/mentorship"
                    />

                    <div className="space-y-3">
                        {mentorshipRequests.slice(0, 3).map((request) => {
                            const mentor = request.mentorId;
                            const mentorName =
                                mentor?.firstName
                                    ? `${mentor.firstName} ${mentor.lastName || ""}`.trim()
                                    : mentor?.email || "Mentor";

                            return (
                                <div
                                    key={request._id}
                                    className="flex items-center gap-3 rounded-md border border-gray-200 px-2.5 py-3"
                                >
                                    <div className="h-10 w-10 rounded-full bg-[#eef2ff] flex items-center justify-center text-[13px] font-semibold text-[#2563eb]">
                                        {getInitials(mentorName)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold text-gray-800 truncate">
                                            {mentorName}
                                        </p>
                                        <p className="text-[12px] text-gray-400">
                                            Requested on {formatDate(request.createdAt)}
                                        </p>
                                    </div>

                                    <StatusBadge status={request.status} />
                                </div>
                            );
                        })}

                        {mentorshipRequests.length === 0 && (
                            <EmptyInline text="You have not sent any mentorship requests yet." />
                        )}
                    </div>
                </div>

                <div className="dashboard-card p-5">
                    <h3 className="text-[11px] font-bold text-gray-900">
                        Profile Progress
                    </h3>

                    <div className="flex flex-col items-center justify-center py-3">
                        <ProgressCircle value={profileProgress} />

                        <p className="mt-2 text-center text-sm text-gray-500 max-w-[210px]">
                            Complete your profile with education, experience,
                            skills and profile photo to stand out.
                        </p>

                        <Link
                            to="/student/profile"
                            className="mt-2 w-full rounded-md bg-[#004ac6] py-3 text-center text-[13px] font-semibold text-white hover:bg-[#0039a6]"
                        >
                            Complete your profile
                        </Link>
                    </div>
                </div>
            </section>

            {/* Referral opportunities + Upcoming Events */}
            <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className="dashboard-card p-5">
                    <SectionHeader
                        title="Referral Opportunities"
                        linkText="Explore More"
                        link="/jobs"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {jobs.slice(0, 2).map((job) => (
                            <div
                                key={job._id}
                                className="rounded-md border border-gray-200/80 shadow-sm p-4"
                            >
                                <span className="rounded-sm bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-[#2563eb]">
                                    ACTIVE OPPORTUNITY
                                </span>

                                <h4 className="mt-2 text-[14px] font-bold text-gray-800">
                                    {job.jobTitle}
                                </h4>

                                <p className="mt-1 text-[12px] text-gray-500">
                                    {job.company}
                                </p>

                                <p className="mt-1 text-[12px] text-gray-400 line-clamp-3">
                                    {job.jobDescription}
                                </p>

                                <a
                                    href={job.applyLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 block w-full rounded-md bg-indigo-50 py-1.5 text-center text-[12px] font-semibold text-[#2563eb]"
                                >
                                    Apply / View Job
                                </a>
                            </div>
                        ))}

                        {jobs.length === 0 && (
                            <EmptyCard
                                icon={<BriefcaseBusiness size={20} />}
                                text="No active job opportunities."
                            />
                        )}
                    </div>
                </div>

                <div className="dashboard-card p-5">
                    <SectionHeader
                        title="Upcoming Events"
                        linkText="Calendar"
                        link="/events"
                    />

                    <div className="space-y-3">
                        {events.slice(0, 2).map((event) => (
                            <div
                                key={event._id}
                                className="flex gap-3 rounded-md border border-gray-200/80 shadow-sm p-3"
                            >
                                <div className="flex h-9 w-8 flex-col items-center justify-center rounded bg-gray-50">
                                    <span className="text-[11px] font-bold text-gray-500">
                                        {new Date(event.eventDate).toLocaleDateString(
                                            "en-US",
                                            { month: "short" }
                                        ).toUpperCase()}
                                    </span>
                                    <span className="text-lg font-bold text-gray-800">
                                        {new Date(event.eventDate).getDate()}
                                    </span>
                                </div>

                                <div className="min-w-0">
                                    <h4 className="text-[13px] font-semibold text-gray-800 truncate">
                                        {event.title}
                                    </h4>

                                    <p className="mt-0.5 text-[12px] text-gray-500 truncate">
                                        {event.location}
                                    </p>

                                    <Link
                                        to="/student/events"
                                        className="text-[10px] font-medium text-[#2563eb]"
                                    >
                                        View Event
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {events.length === 0 && (
                            <EmptyInline text="No upcoming events." />
                        )}
                    </div>
                </div>
            </section>

            {/* Recent conversations */}
            <section className="dashboard-card p-5">
                <SectionHeader
                    title="Recent Conversations"
                    linkText="All Messages"
                    link="/messages"
                />

                <div className="space-y-2">
                    {conversations.slice(0, 3).map((conversation) => {
                        const other = getOtherParticipant(conversation);

                        const name =
                            other?.firstName
                                ? `${other.firstName} ${other.lastName || ""}`.trim()
                                : other?.email || "Conversation";

                        return (
                            <Link
                                key={conversation._id}
                                to="/student/messages"
                                className="flex items-center gap-4 border-b border-gray-100 py-3 last:border-b-0 hover:bg-gray-50 transition"
                            >
                                {other?.profilePicture ? (
                                    <img
                                        src={other.profilePicture}
                                        alt={name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[13px] font-bold text-[#2563eb]">
                                        {getInitials(name)}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-gray-800">
                                        {name}
                                    </p>

                                    <p className="truncate text-[12px] text-gray-500">
                                        {conversation.lastMessage?.text ||
                                            "No messages yet."}
                                    </p>
                                </div>

                                <span className="text-[11px] text-gray-400">
                                    {formatDate(conversation.updatedAt)}
                                </span>
                            </Link>
                        );
                    })}

                    {conversations.length === 0 && (
                        <EmptyInline text="No conversations yet." />
                    )}
                </div>
            </section>

            <Link
                to="/student/profile"
                className="fixed bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#004ac6] text-white shadow-lg hover:bg-[#0039a6]"
                title="Edit profile"
            >
                <Pencil size={15} />
            </Link>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="dashboard-card dashboard-stat-card px-4 py-4">
        <p className="text-[13px] font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

const QuickAction = ({ icon, label, to }) => (
    <Link
        to={to}
        className="dashboard-action flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004AC6]/20 transition"
    >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#2563eb]">
            {icon}
        </div>
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
    </Link>
);

const SectionHeader = ({ title, linkText, link }) => (
    <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-gray-900">{title}</h3>
        {link && (
            <Link
                to={link}
                className="text-[12px] font-medium text-[#2563eb] hover:underline"
            >
                {linkText}
            </Link>
        )}
    </div>
);

const StatusBadge = ({ status }) => {
    const normalized = status || "pending";

    const styles = {
        pending: "bg-amber-50 text-amber-600",
        accepted: "bg-emerald-50 text-emerald-600",
        rejected: "bg-red-50 text-red-500",
    };

    return (
        <span
            className={`shrink-0 rounded px-1.5 py-1 text-[10px] font-medium ${styles[normalized] || styles.pending
                }`}
        >
            {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
        </span>
    );
};

const ProgressCircle = ({ value }) => {
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (circumference * value) / 100;

    return (
        <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="7"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#075bd6"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">
                    {value}%
                </span>
            </div>
        </div>
    );
};

const AlumniCard = ({ alumni }) => {
    const name =
        `${alumni.firstName || ""} ${alumni.lastName || ""}`.trim() ||
        "Alumni";

    return (
        <div className="dashboard-inner-card overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md transition">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        {alumni.profilePicture ? (
                            <img
                                src={alumni.profilePicture}
                                alt={name}
                                className="h-11 w-11 rounded-md object-cover"
                            />
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-[14px] font-bold text-[#2563eb]">
                                {name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>
                        )}

                        <div>
                            <h4 className="text-[13px] font-bold text-gray-800">
                                {name}
                            </h4>

                            <p className="mt-0.5 text-[12px] text-gray-500 line-clamp-3">
                                {alumni.proffesionalHeadLine ||
                                    "Alumni Professional"}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                                {alumni.location?.city || "Location unavailable"}
                            </p>
                        </div>
                    </div>

                    <span className="rounded bg-emerald-50 px-1 py-0.5 text-[5px] font-medium text-emerald-600">
                        Available
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                    {(alumni.skills || []).slice(0, 3).map((skill) => (
                        <span
                            key={skill}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[5px] text-gray-500"
                        >
                            {skill}
                        </span>
                    ))}
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                    <Link
                        to={`/directory/${alumni.userId?._id || alumni._id}`}
                        className="rounded border border-[#2563eb] py-1.5 text-center text-[10px] font-medium text-[#2563eb]"
                    >
                        View Profile
                    </Link>

                    <Link
                        to="/student/mentorship"
                        className="rounded bg-[#004ac6] py-1.5 text-center text-[11px] font-semibold text-white"
                    >
                        Request Mentorship
                    </Link>
                </div>
            </div>
        </div>
    );
};

const EmptyCard = ({ icon, text }) => (
    <div className="dashboard-empty-card min-h-[120px] flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-5 text-center text-gray-400 shadow-sm">
        {icon}
        <p className="mt-2 text-[13px]">{text}</p>
    </div>
);

const EmptyInline = ({ text }) => (
    <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-[13px] text-gray-500 shadow-sm">
        {text}
    </div>
);

export default StudentDashboard;