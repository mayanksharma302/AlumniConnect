import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
    Users,
    GraduationCap,
    UserCheck,
    UserX,
    BriefcaseBusiness,
    CalendarDays,
    Handshake,
    ShieldCheck,
    ArrowUpRight,
    RefreshCw,
    Clock3,
    MapPin,
    Building2,
    ChevronRight,
    Activity,
    CheckCircle2,
    AlertCircle,
    FileCheck2,
} from "lucide-react";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";


const AdminDashboard = () => {

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [profiles, setProfiles] =
        useState([]);

    const [jobs, setJobs] =
        useState([]);

    const [events, setEvents] =
        useState([]);

    const [mentorshipRequests, setMentorshipRequests] =
        useState([]);


    // =====================================================
    // AUTH
    // =====================================================

    const getToken = () => {

        return (
            sessionStorage.getItem(
                "accessToken"
            ) ||
            localStorage.getItem(
                "accessToken"
            )
        );

    };


    const getConfig = () => {

        const token =
            getToken();

        return {
            withCredentials: true,

            ...(token
                ? {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
                : {}),
        };

    };


    // =====================================================
    // NORMALIZE RESPONSE
    // =====================================================

    const extractArray = (
        response
    ) => {

        const body =
            response?.data;

        if (
            Array.isArray(body)
        ) {
            return body;
        }


        if (
            Array.isArray(
                body?.data
            )
        ) {
            return body.data;
        }


        if (
            Array.isArray(
                body?.profiles
            )
        ) {
            return body.profiles;
        }


        if (
            Array.isArray(
                body?.jobs
            )
        ) {
            return body.jobs;
        }


        if (
            Array.isArray(
                body?.events
            )
        ) {
            return body.events;
        }


        if (
            Array.isArray(
                body?.requests
            )
        ) {
            return body.requests;
        }


        return [];

    };


    // =====================================================
    // FETCH ALUMNI DIRECTORY
    // =====================================================

    const fetchProfiles =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/profile/alumni-directory`,
                        getConfig()
                    );


                return extractArray(
                    response
                );

            } catch (error) {

                console.error(
                    "Alumni directory error:",
                    error
                );

                throw error;

            }

        };


    // =====================================================
    // FETCH JOBS
    // =====================================================

    const fetchJobs =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/jobs/`,
                        getConfig()
                    );


                return extractArray(
                    response
                );

            } catch (error) {

                console.error(
                    "Jobs error:",
                    error
                );

                throw error;

            }

        };


    // =====================================================
    // FETCH EVENTS
    // =====================================================

    const fetchEvents =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/events/upcoming`,
                        getConfig()
                    );


                return extractArray(
                    response
                );

            } catch (error) {

                console.error(
                    "Events error:",
                    error
                );

                throw error;

            }

        };


    // =====================================================
    // FETCH MENTORSHIP
    // =====================================================

    const fetchMentorship =
        async () => {

            try {

                /*
                 * IMPORTANT:
                 * Backend route is actually "recieved"
                 * and we must keep that spelling.
                 */

                const response =
                    await axios.get(
                        `${API_URL}/api/mentorship/recieved`,
                        getConfig()
                    );


                return extractArray(
                    response
                );

            } catch (error) {

                console.error(
                    "Mentorship error:",
                    error
                );

                throw error;

            }

        };


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard =
        async (
            isRefresh = false
        ) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");


                /*
                 * Don't let one endpoint failure
                 * destroy the entire dashboard.
                 */

                const results =
                    await Promise.allSettled([
                        fetchProfiles(),
                        fetchJobs(),
                        fetchEvents(),
                        fetchMentorship(),
                    ]);


                const [
                    profileResult,
                    jobResult,
                    eventResult,
                    mentorshipResult,
                ] = results;


                if (
                    profileResult.status ===
                    "fulfilled"
                ) {

                    setProfiles(
                        profileResult.value
                    );

                } else {

                    setProfiles([]);

                }


                if (
                    jobResult.status ===
                    "fulfilled"
                ) {

                    setJobs(
                        jobResult.value
                    );

                } else {

                    setJobs([]);

                }


                if (
                    eventResult.status ===
                    "fulfilled"
                ) {

                    setEvents(
                        eventResult.value
                    );

                } else {

                    setEvents([]);

                }


                if (
                    mentorshipResult.status ===
                    "fulfilled"
                ) {

                    setMentorshipRequests(
                        mentorshipResult.value
                    );

                } else {

                    setMentorshipRequests([]);

                }


                const failed =
                    results.filter(
                        result =>
                            result.status ===
                            "rejected"
                    );


                if (
                    failed.length ===
                    results.length
                ) {

                    setError(
                        "Unable to load dashboard data. Please check your authentication and backend."
                    );

                } else if (
                    failed.length >
                    0
                ) {

                    setError(
                        "Some dashboard sections could not be loaded."
                    );

                }

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

                setError(
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        };


    useEffect(() => {

        loadDashboard();

    }, []);


    // =====================================================
    // NORMALIZE PROFILE
    // =====================================================

    const normalizedProfiles =
        useMemo(() => {

            return profiles.map(
                profile => {

                    const user =
                        profile?.userId &&
                            typeof profile.userId ===
                            "object"
                            ? profile.userId
                            : null;


                    const firstName =
                        profile?.firstName ||
                        user?.firstName ||
                        "";


                    const lastName =
                        profile?.lastName ||
                        user?.lastName ||
                        "";


                    const username =
                        user?.username ||
                        profile?.username ||
                        "";


                    const email =
                        user?.email ||
                        profile?.email ||
                        "";


                    return {
                        ...profile,

                        user,

                        name:
                            `${firstName} ${lastName}`
                                .trim() ||
                            username ||
                            email ||
                            "Alumni Member",

                        email,

                        role:
                            user?.role ||
                            profile?.role ||
                            "alumni",

                        emailVerified:
                            user?.emailVerified ??
                            profile?.emailVerified ??
                            false,

                        accountStatus:
                            user?.AccountStatus ||
                            profile?.AccountStatus ||
                            "unverified",
                    };

                }
            );

        }, [profiles]);


    // =====================================================
    // STATISTICS
    // =====================================================

    const statistics =
        useMemo(() => {

            const alumni =
                normalizedProfiles.filter(
                    profile =>
                        String(
                            profile.role
                        ).toLowerCase() ===
                        "alumni"
                );


            const verified =
                normalizedProfiles.filter(
                    profile =>
                        profile.emailVerified ===
                        true ||
                        String(
                            profile.accountStatus
                        ).toLowerCase() ===
                        "verified"
                );


            const unverified =
                Math.max(
                    alumni.length -
                    verified.length,
                    0
                );


            return {

                alumni:
                    alumni.length,

                verified:
                    verified.length,

                unverified:
                    unverified,

                jobs:
                    jobs.length,

                events:
                    events.length,

                mentorship:
                    mentorshipRequests.length,

            };

        }, [
            normalizedProfiles,
            jobs,
            events,
            mentorshipRequests,
        ]);


    // =====================================================
    // RECENT PROFILES
    // =====================================================

    const recentProfiles =
        useMemo(() => {

            return [
                ...normalizedProfiles,
            ]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt ||
                            0
                        ) -
                        new Date(
                            a.createdAt ||
                            0
                        )
                )
                .slice(0, 6);

        }, [
            normalizedProfiles,
        ]);


    // =====================================================
    // RECENT JOBS
    // =====================================================

    const recentJobs =
        useMemo(() => {

            return [
                ...jobs,
            ]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt ||
                            b.postedAt ||
                            0
                        ) -
                        new Date(
                            a.createdAt ||
                            a.postedAt ||
                            0
                        )
                )
                .slice(0, 5);

        }, [jobs]);


    // =====================================================
    // RECENT EVENTS
    // =====================================================

    const recentEvents =
        useMemo(() => {

            return [
                ...events,
            ]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt ||
                            0
                        ) -
                        new Date(
                            a.createdAt ||
                            0
                        )
                )
                .slice(0, 5);

        }, [events]);


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate =
        date => {

            if (!date) {
                return "—";
            }


            const parsed =
                new Date(date);


            if (
                Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return "—";

            }


            return parsed.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        };


    // =====================================================
    // JOB HELPERS
    // =====================================================

    const getJobTitle =
        job =>
            job?.title ||
            job?.jobTitle ||
            job?.position ||
            "Untitled Job";


    const getCompany =
        job =>
            job?.company ||
            job?.companyName ||
            job?.organization ||
            job?.companyDetails?.name ||
            "Company";


    // =====================================================
    // EVENT HELPERS
    // =====================================================

    const getEventTitle =
        event =>
            event?.title ||
            event?.eventName ||
            event?.name ||
            "Untitled Event";


    const getEventDate =
        event =>
            event?.date ||
            event?.eventDate ||
            event?.startDate ||
            event?.startTime;


    // =====================================================
    // USER AVATAR
    // =====================================================

    const getInitials =
        name => {

            return String(
                name ||
                "User"
            )
                .split(" ")
                .filter(Boolean)
                .map(
                    part =>
                        part[0]
                )
                .join("")
                .slice(0, 2)
                .toUpperCase();

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="space-y-6">

                <DashboardHeader
                    onRefresh={() =>
                        loadDashboard(
                            true
                        )
                    }
                    refreshing={
                        refreshing
                    }
                />


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[
                        1,
                        2,
                        3,
                        4,
                    ].map(
                        item => (

                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white"
                            />

                        )
                    )}

                </div>


                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                    <div className="h-80 animate-pulse rounded-2xl bg-white" />

                    <div className="h-80 animate-pulse rounded-2xl bg-white" />

                </div>

            </div>

        );

    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="space-y-6">


            {/* HEADER */}

            <DashboardHeader
                onRefresh={() =>
                    loadDashboard(
                        true
                    )
                }
                refreshing={
                    refreshing
                }
            />


            {/* ERROR */}

            {error && (

                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">

                    <AlertCircle
                        size={17}
                    />

                    {error}

                </div>

            )}


            {/* =================================================
                MAIN STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Alumni"
                    value={
                        statistics.alumni
                    }
                    description="Alumni profiles"
                    icon={
                        GraduationCap
                    }
                    href="/admin/alumni-verification"
                    iconClass="bg-violet-50 text-violet-600"
                />


                <StatCard
                    title="Verified Alumni"
                    value={
                        statistics.verified
                    }
                    description="Verified community members"
                    icon={
                        UserCheck
                    }
                    href="/admin/alumni-verification"
                    iconClass="bg-emerald-50 text-emerald-600"
                />


                <StatCard
                    title="Jobs"
                    value={
                        statistics.jobs
                    }
                    description="Published opportunities"
                    icon={
                        BriefcaseBusiness
                    }
                    href="/admin/jobs"
                    iconClass="bg-orange-50 text-orange-600"
                />


                <StatCard
                    title="Events"
                    value={
                        statistics.events
                    }
                    description="Upcoming community events"
                    icon={
                        CalendarDays
                    }
                    href="/admin/events"
                    iconClass="bg-pink-50 text-pink-600"
                />

            </div>


            {/* =================================================
                SECONDARY STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <StatCard
                    title="Unverified Alumni"
                    value={
                        statistics.unverified
                    }
                    description="Members requiring verification"
                    icon={
                        UserX
                    }
                    href="/admin/alumni-verification"
                    iconClass="bg-amber-50 text-amber-600"
                />


                <StatCard
                    title="Mentorship Requests"
                    value={
                        statistics.mentorship
                    }
                    description="Requests returned by the mentorship API"
                    icon={
                        Handshake
                    }
                    href="/admin/mentorship"
                    iconClass="bg-indigo-50 text-indigo-600"
                />

            </div>


            {/* =================================================
                RECENT ALUMNI + QUICK ACTIONS
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">


                {/* RECENT ALUMNI */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <SectionHeader
                        icon={
                            Users
                        }
                        title="Recent Alumni"
                        subtitle="Latest profiles from the alumni directory"
                        href="/admin/alumni-verification"
                    />


                    <div className="divide-y divide-gray-100">

                        {recentProfiles.length >
                            0 ? (

                            recentProfiles.map(
                                (
                                    profile,
                                    index
                                ) => (

                                    <div
                                        key={
                                            profile._id ||
                                            profile.user?._id ||
                                            index
                                        }
                                        className="flex items-center gap-3 px-5 py-3.5"
                                    >

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-xs font-bold text-[#004AC6]">

                                            {profile.profilePicture ? (

                                                <img
                                                    src={
                                                        profile.profilePicture
                                                    }
                                                    alt={
                                                        profile.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />

                                            ) : (

                                                getInitials(
                                                    profile.name
                                                )

                                            )}

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-center gap-2">

                                                <p className="truncate text-xs font-bold text-gray-800">

                                                    {
                                                        profile.name
                                                    }

                                                </p>


                                                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[8px] font-bold uppercase text-violet-600">

                                                    Alumni

                                                </span>

                                            </div>


                                            <p className="mt-0.5 truncate text-[10px] text-gray-400">

                                                {
                                                    profile.professionalHeadline ||
                                                    profile.email ||
                                                    "Alumni Member"
                                                }

                                            </p>

                                        </div>


                                        <div className="hidden text-right sm:block">

                                            <p className="text-[9px] text-gray-400">
                                                Joined
                                            </p>

                                            <p className="text-[10px] font-semibold text-gray-600">

                                                {
                                                    formatDate(
                                                        profile.createdAt
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <span
                                            title={
                                                profile.emailVerified ||
                                                    profile.accountStatus ===
                                                    "verified"
                                                    ? "Verified"
                                                    : "Unverified"
                                            }
                                            className={`h-2.5 w-2.5 rounded-full ${profile.emailVerified ||
                                                    profile.accountStatus ===
                                                    "verified"
                                                    ? "bg-emerald-500"
                                                    : "bg-amber-400"
                                                }`}
                                        />

                                    </div>

                                )
                            )

                        ) : (

                            <EmptyState
                                icon={
                                    Users
                                }
                                title="No alumni found"
                                description="The alumni directory currently has no profiles."
                            />

                        )}

                    </div>

                </section>


                {/* QUICK ACTIONS */}

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="mb-5">

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">

                                <ShieldCheck
                                    size={15}
                                />

                            </div>


                            <h2 className="text-sm font-bold text-gray-900">
                                Quick Actions
                            </h2>

                        </div>


                        <p className="mt-1 text-[10px] text-gray-400">
                            Manage your community
                        </p>

                    </div>


                    <div className="grid grid-cols-2 gap-3">

                        <QuickAction
                            to="/admin/users"
                            icon={
                                Users
                            }
                            title="Users"
                            description="View members"
                        />


                        <QuickAction
                            to="/admin/alumni-verification"
                            icon={
                                FileCheck2
                            }
                            title="Verification"
                            description="Review alumni"
                        />


                        <QuickAction
                            to="/admin/jobs"
                            icon={
                                BriefcaseBusiness
                            }
                            title="Jobs"
                            description="Manage jobs"
                        />


                        <QuickAction
                            to="/admin/events"
                            icon={
                                CalendarDays
                            }
                            title="Events"
                            description="Manage events"
                        />


                        <QuickAction
                            to="/admin/mentorship"
                            icon={
                                Handshake
                            }
                            title="Mentorship"
                            description="Review requests"
                        />


                        <QuickAction
                            to="/admin/reports"
                            icon={
                                Activity
                            }
                            title="Reports"
                            description="View reports"
                        />

                    </div>

                </section>

            </div>


            {/* =================================================
                JOBS + EVENTS
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">


                {/* JOBS */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <SectionHeader
                        icon={
                            BriefcaseBusiness
                        }
                        title="Recent Jobs"
                        subtitle="Latest opportunities"
                        href="/admin/jobs"
                    />


                    <div className="divide-y divide-gray-100">

                        {recentJobs.length >
                            0 ? (

                            recentJobs.map(
                                (
                                    job,
                                    index
                                ) => (

                                    <div
                                        key={
                                            job._id ||
                                            index
                                        }
                                        className="flex items-center gap-3 px-5 py-4"
                                    >

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                                            <BriefcaseBusiness
                                                size={17}
                                            />

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-xs font-bold text-gray-800">

                                                {
                                                    getJobTitle(
                                                        job
                                                    )
                                                }

                                            </p>


                                            <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">

                                                <Building2
                                                    size={11}
                                                />

                                                {
                                                    getCompany(
                                                        job
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <div className="hidden text-right sm:block">

                                            <p className="text-[9px] text-gray-400">
                                                Posted
                                            </p>

                                            <p className="text-[10px] font-semibold text-gray-600">

                                                {
                                                    formatDate(
                                                        job.createdAt ||
                                                        job.postedAt
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <EmptyState
                                icon={
                                    BriefcaseBusiness
                                }
                                title="No jobs found"
                                description="There are currently no jobs available."
                            />

                        )}

                    </div>

                </section>


                {/* EVENTS */}

                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <SectionHeader
                        icon={
                            CalendarDays
                        }
                        title="Upcoming Events"
                        subtitle="Latest community events"
                        href="/admin/events"
                    />


                    <div className="divide-y divide-gray-100">

                        {recentEvents.length >
                            0 ? (

                            recentEvents.map(
                                (
                                    event,
                                    index
                                ) => (

                                    <div
                                        key={
                                            event._id ||
                                            index
                                        }
                                        className="flex items-center gap-3 px-5 py-4"
                                    >

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">

                                            <CalendarDays
                                                size={17}
                                            />

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-xs font-bold text-gray-800">

                                                {
                                                    getEventTitle(
                                                        event
                                                    )
                                                }

                                            </p>


                                            <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-gray-400">

                                                <MapPin
                                                    size={11}
                                                />

                                                {
                                                    event.location ||
                                                    event.venue ||
                                                    "Online event"
                                                }

                                            </p>

                                        </div>


                                        <div className="hidden text-right sm:block">

                                            <p className="text-[9px] text-gray-400">
                                                Date
                                            </p>

                                            <p className="text-[10px] font-semibold text-gray-600">

                                                {
                                                    formatDate(
                                                        getEventDate(
                                                            event
                                                        )
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <EmptyState
                                icon={
                                    CalendarDays
                                }
                                title="No upcoming events"
                                description="There are currently no upcoming events."
                            />

                        )}

                    </div>

                </section>

            </div>


            {/* =================================================
                PLATFORM STATUS
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <CheckCircle2
                                size={17}
                                className="text-emerald-500"
                            />

                            <h2 className="text-sm font-bold text-gray-900">
                                Platform Overview
                            </h2>

                        </div>


                        <p className="mt-1 text-[10px] text-gray-400">
                            Current data returned by the platform APIs
                        </p>

                    </div>


                    <div className="grid grid-cols-3 gap-8">

                        <MiniStat
                            label="Alumni"
                            value={
                                statistics.alumni
                            }
                        />


                        <MiniStat
                            label="Jobs"
                            value={
                                statistics.jobs
                            }
                        />


                        <MiniStat
                            label="Events"
                            value={
                                statistics.events
                            }
                        />

                    </div>

                </div>

            </section>

        </div>

    );

};


// =========================================================
// HEADER
// =========================================================

const DashboardHeader = ({
    onRefresh,
    refreshing,
}) => {

    return (

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#004AC6]">
                    Overview
                </p>


                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                    Admin Dashboard
                </h1>


                <p className="mt-1 text-xs text-gray-400">
                    Monitor and manage your AlumniConnect community.
                </p>

            </div>


            <button
                type="button"
                onClick={
                    onRefresh
                }
                disabled={
                    refreshing
                }
                className="flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 shadow-sm transition hover:border-[#004AC6] hover:text-[#004AC6] disabled:opacity-60"
            >

                <RefreshCw
                    size={14}
                    className={
                        refreshing
                            ? "animate-spin"
                            : ""
                    }
                />

                {refreshing
                    ? "Refreshing..."
                    : "Refresh"}

            </button>

        </div>

    );

};


// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    href,
    iconClass,
}) => {

    const content = (

        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-xs font-semibold text-gray-400">
                        {title}
                    </p>


                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
                        {value}
                    </p>

                </div>


                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >

                    <Icon
                        size={20}
                    />

                </div>

            </div>


            <div className="mt-4 flex items-center justify-between">

                <p className="text-[10px] text-gray-400">
                    {description}
                </p>


                {href && (

                    <ArrowUpRight
                        size={15}
                        className="text-gray-300 group-hover:text-[#004AC6]"
                    />

                )}

            </div>

        </div>

    );


    return href ? (
        <Link
            to={href}
        >
            {content}
        </Link>
    ) : (
        content
    );

};


// =========================================================
// SECTION HEADER
// =========================================================

const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
    href,
}) => {

    return (

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

            <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">

                    <Icon
                        size={15}
                    />

                </div>


                <div>

                    <h2 className="text-sm font-bold text-gray-900">
                        {title}
                    </h2>


                    <p className="mt-0.5 text-[10px] text-gray-400">
                        {subtitle}
                    </p>

                </div>

            </div>


            <Link
                to={href}
                className="flex items-center gap-1 text-[10px] font-bold text-[#004AC6] hover:underline"
            >

                View All

                <ChevronRight
                    size={13}
                />

            </Link>

        </div>

    );

};


// =========================================================
// QUICK ACTION
// =========================================================

const QuickAction = ({
    to,
    icon: Icon,
    title,
    description,
}) => {

    return (

        <Link
            to={to}
            className="group rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition hover:border-blue-100 hover:bg-blue-50/50"
        >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#004AC6] shadow-sm">

                <Icon
                    size={16}
                />

            </div>


            <p className="mt-3 text-xs font-bold text-gray-800 group-hover:text-[#004AC6]">
                {title}
            </p>


            <p className="mt-0.5 text-[9px] text-gray-400">
                {description}
            </p>

        </Link>

    );

};


// =========================================================
// EMPTY STATE
// =========================================================

const EmptyState = ({
    icon: Icon,
    title,
    description,
}) => {

    return (

        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-300">

                <Icon
                    size={20}
                />

            </div>


            <p className="mt-3 text-xs font-bold text-gray-500">
                {title}
            </p>


            <p className="mt-1 max-w-xs text-[10px] leading-4 text-gray-400">
                {description}
            </p>

        </div>

    );

};


// =========================================================
// MINI STAT
// =========================================================

const MiniStat = ({
    label,
    value,
}) => {

    return (

        <div className="text-center">

            <p className="text-lg font-extrabold text-gray-900">
                {value}
            </p>


            <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                {label}
            </p>

        </div>

    );

};


export default AdminDashboard;