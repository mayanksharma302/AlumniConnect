import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    RefreshCw,
    Users,
    GraduationCap,
    BriefcaseBusiness,
    CalendarDays,
    Handshake,
    CheckCircle2,
    Clock3,
    XCircle,
    UserCheck,
    TrendingUp,
    Activity,
    FileText,
    Download,
    AlertCircle,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

const Reports = () => {
    const [users, setUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [events, setEvents] = useState([]);
    const [mentorship, setMentorship] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

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
        const token = getToken();

        return token
            ? {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
            : {};
    };

    // =====================================================
    // GENERIC ARRAY EXTRACTOR
    // =====================================================

    const extractArray = (body) => {
        if (Array.isArray(body)) {
            return body;
        }

        if (Array.isArray(body?.data)) {
            return body.data;
        }

        if (Array.isArray(body?.users)) {
            return body.users;
        }

        if (Array.isArray(body?.profiles)) {
            return body.profiles;
        }

        if (Array.isArray(body?.jobs)) {
            return body.jobs;
        }

        if (Array.isArray(body?.events)) {
            return body.events;
        }

        if (Array.isArray(body?.requests)) {
            return body.requests;
        }

        return [];
    };

    // =====================================================
    // FETCH REPORT DATA
    // =====================================================

    const fetchReports = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const results = await Promise.allSettled([
                axios.get(
                    `${API_URL}/api/jobs/`,
                    getConfig()
                ),

                axios.get(
                    `${API_URL}/api/events/upcoming`,
                    getConfig()
                ),

                axios.get(
                    `${API_URL}/api/mentorship/recieved`,
                    getConfig()
                ),
            ]);

            const jobsResult = results[0];
            const eventsResult = results[1];
            const mentorshipResult = results[2];

            // =================================================
            // JOBS
            // =================================================

            if (
                jobsResult &&
                jobsResult.status === "fulfilled"
            ) {
                const body =
                    jobsResult.value?.data;

                setJobs(
                    Array.isArray(body)
                        ? body
                        : Array.isArray(
                            body?.data
                        )
                            ? body.data
                            : Array.isArray(
                                body?.jobs
                            )
                                ? body.jobs
                                : []
                );
            } else {
                console.error(
                    "Jobs report request failed:",
                    jobsResult?.reason
                );

                setJobs([]);
            }

            // =================================================
            // EVENTS
            // =================================================

            if (
                eventsResult &&
                eventsResult.status === "fulfilled"
            ) {
                const body =
                    eventsResult.value?.data;

                setEvents(
                    Array.isArray(body)
                        ? body
                        : Array.isArray(
                            body?.data
                        )
                            ? body.data
                            : Array.isArray(
                                body?.events
                            )
                                ? body.events
                                : []
                );
            } else {
                console.error(
                    "Events report request failed:",
                    eventsResult?.reason
                );

                setEvents([]);
            }

            // =================================================
            // MENTORSHIP
            // =================================================

            if (
                mentorshipResult &&
                mentorshipResult.status ===
                "fulfilled"
            ) {
                const body =
                    mentorshipResult.value?.data;

                setMentorship(
                    Array.isArray(body)
                        ? body
                        : Array.isArray(
                            body?.requests
                        )
                            ? body.requests
                            : Array.isArray(
                                body?.data
                            )
                                ? body.data
                                : []
                );
            } else {
                console.error(
                    "Mentorship report request failed:",
                    mentorshipResult?.reason
                );

                setMentorship([]);
            }

            // =================================================
            // CHECK ALL FAILED
            // =================================================

            const failedRequests =
                results.filter(
                    (result) =>
                        result.status ===
                        "rejected"
                );

            if (
                failedRequests.length ===
                results.length
            ) {
                setError(
                    "Unable to load report data. Please check your backend."
                );
            }
        } catch (error) {
            console.error(
                "Reports loading error:",
                error
            );

            setError(
                error?.response?.data
                    ?.message ||
                "Unable to load report data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // =====================================================
    // USER ANALYTICS
    // =====================================================

    const userStats = useMemo(() => {
        const students =
            users.filter(
                (user) =>
                    String(
                        user?.role
                    ).toLowerCase() ===
                    "student"
            ).length;

        const alumni =
            users.filter(
                (user) =>
                    String(
                        user?.role
                    ).toLowerCase() ===
                    "alumni"
            ).length;

        const admins =
            users.filter(
                (user) =>
                    String(
                        user?.role
                    ).toLowerCase() ===
                    "admin"
            ).length;

        const verified =
            users.filter(
                (user) =>
                    user?.emailVerified ===
                    true
            ).length;

        return {
            total: users.length,
            students,
            alumni,
            admins,
            verified,
        };
    }, [users]);

    // =====================================================
    // ALUMNI ANALYTICS
    // =====================================================

    const alumniStats = useMemo(() => {
        const alumniProfiles =
            profiles.filter(
                (profile) =>
                    String(
                        profile?.userId
                            ?.role ||
                        profile?.role ||
                        ""
                    ).toLowerCase() ===
                    "alumni"
            );

        const verified =
            alumniProfiles.filter(
                (profile) =>
                    profile?.userId
                        ?.emailVerified ===
                    true ||
                    profile?.emailVerified ===
                    true
            ).length;

        return {
            total:
                alumniProfiles.length ||
                userStats.alumni,
            verified,
            pending:
                Math.max(
                    (
                        alumniProfiles.length ||
                        userStats.alumni
                    ) - verified,
                    0
                ),
        };
    }, [
        profiles,
        userStats.alumni,
    ]);

    // =====================================================
    // JOB ANALYTICS
    // =====================================================

    const jobStats = useMemo(() => {
        return {
            total: jobs.length,
        };
    }, [jobs]);

    // =====================================================
    // EVENT ANALYTICS
    // =====================================================

    const eventStats = useMemo(() => {
        const now =
            new Date();

        const upcoming =
            events.filter(
                (event) => {
                    const date =
                        event?.startDate ||
                        event?.date ||
                        event?.eventDate ||
                        event?.scheduledAt;

                    if (!date) {
                        return false;
                    }

                    const value =
                        new Date(
                            date
                        );

                    return (
                        !Number.isNaN(
                            value.getTime()
                        ) &&
                        value >= now
                    );
                }
            );

        return {
            total: events.length,
            upcoming:
                upcoming.length,
        };
    }, [events]);

    // =====================================================
    // MENTORSHIP ANALYTICS
    // =====================================================

    const mentorshipStats =
        useMemo(() => {
            const pending =
                mentorship.filter(
                    (request) =>
                        String(
                            request?.status
                        ).toLowerCase() ===
                        "pending"
                ).length;

            const accepted =
                mentorship.filter(
                    (request) =>
                        String(
                            request?.status
                        ).toLowerCase() ===
                        "accepted"
                ).length;

            const rejected =
                mentorship.filter(
                    (request) => {
                        const status =
                            String(
                                request?.status
                            ).toLowerCase();

                        return (
                            status ===
                            "rejected" ||
                            status ===
                            "declined"
                        );
                    }
                ).length;

            return {
                total:
                    mentorship.length,
                pending,
                accepted,
                rejected,
            };
        }, [mentorship]);

    // =====================================================
    // OVERALL TOTAL
    // =====================================================

    const platformStats = useMemo(
        () => [
            {
                label: "Users",
                value:
                    userStats.total,
                icon: Users,
                iconClass:
                    "bg-blue-50 text-[#004AC6]",
            },
            {
                label: "Alumni",
                value:
                    alumniStats.total,
                icon: GraduationCap,
                iconClass:
                    "bg-violet-50 text-violet-600",
            },
            {
                label: "Jobs",
                value:
                    jobStats.total,
                icon:
                    BriefcaseBusiness,
                iconClass:
                    "bg-orange-50 text-orange-600",
            },
            {
                label: "Events",
                value:
                    eventStats.total,
                icon:
                    CalendarDays,
                iconClass:
                    "bg-emerald-50 text-emerald-600",
            },
        ],
        [
            userStats,
            alumniStats,
            jobStats,
            eventStats,
        ]
    );

    // =====================================================
    // ROLE DISTRIBUTION
    // =====================================================

    const roleDistribution =
        useMemo(() => {
            const total =
                Math.max(
                    userStats.total,
                    1
                );

            return [
                {
                    label: "Students",
                    value:
                        userStats.students,
                    percentage:
                        Math.round(
                            (userStats.students /
                                total) *
                            100
                        ),
                    className:
                        "bg-blue-500",
                },
                {
                    label: "Alumni",
                    value:
                        userStats.alumni,
                    percentage:
                        Math.round(
                            (userStats.alumni /
                                total) *
                            100
                        ),
                    className:
                        "bg-violet-500",
                },
                {
                    label: "Admins",
                    value:
                        userStats.admins,
                    percentage:
                        Math.round(
                            (userStats.admins /
                                total) *
                            100
                        ),
                    className:
                        "bg-gray-500",
                },
            ];
        }, [userStats]);

    // =====================================================
    // VERIFICATION DISTRIBUTION
    // =====================================================

    const verificationDistribution =
        useMemo(() => {
            const total =
                Math.max(
                    alumniStats.total,
                    1
                );

            return [
                {
                    label: "Verified",
                    value:
                        alumniStats.verified,
                    percentage:
                        Math.round(
                            (alumniStats.verified /
                                total) *
                            100
                        ),
                    className:
                        "bg-emerald-500",
                },
                {
                    label: "Pending",
                    value:
                        alumniStats.pending,
                    percentage:
                        Math.round(
                            (alumniStats.pending /
                                total) *
                            100
                        ),
                    className:
                        "bg-amber-500",
                },
            ];
        }, [
            alumniStats,
        ]);

    // =====================================================
    // MENTORSHIP DISTRIBUTION
    // =====================================================

    const mentorshipDistribution =
        useMemo(() => {
            const total =
                Math.max(
                    mentorshipStats.total,
                    1
                );

            return [
                {
                    label: "Accepted",
                    value:
                        mentorshipStats.accepted,
                    percentage:
                        Math.round(
                            (mentorshipStats.accepted /
                                total) *
                            100
                        ),
                    className:
                        "bg-emerald-500",
                },
                {
                    label: "Pending",
                    value:
                        mentorshipStats.pending,
                    percentage:
                        Math.round(
                            (mentorshipStats.pending /
                                total) *
                            100
                        ),
                    className:
                        "bg-amber-500",
                },
                {
                    label: "Rejected",
                    value:
                        mentorshipStats.rejected,
                    percentage:
                        Math.round(
                            (mentorshipStats.rejected /
                                total) *
                            100
                        ),
                    className:
                        "bg-red-500",
                },
            ];
        }, [
            mentorshipStats,
        ]);

    // =====================================================
    // RECENT ACTIVITY
    // =====================================================

    const recentActivity =
        useMemo(() => {
            const activity = [];

            users.forEach(
                (user) => {
                    if (
                        user?.createdAt
                    ) {
                        activity.push({
                            type: "user",
                            title:
                                "New user registered",
                            subtitle:
                                user?.username ||
                                user?.email ||
                                "New user",
                            date:
                                user.createdAt,
                            icon: Users,
                            iconClass:
                                "bg-blue-50 text-[#004AC6]",
                        });
                    }
                }
            );

            jobs.forEach(
                (job) => {
                    if (
                        job?.createdAt
                    ) {
                        activity.push({
                            type: "job",
                            title:
                                "New job posted",
                            subtitle:
                                job?.title ||
                                job?.jobTitle ||
                                "New job",
                            date:
                                job.createdAt,
                            icon:
                                BriefcaseBusiness,
                            iconClass:
                                "bg-orange-50 text-orange-600",
                        });
                    }
                }
            );

            events.forEach(
                (event) => {
                    if (
                        event?.createdAt
                    ) {
                        activity.push({
                            type: "event",
                            title:
                                "New event created",
                            subtitle:
                                event?.title ||
                                event?.name ||
                                "New event",
                            date:
                                event.createdAt,
                            icon:
                                CalendarDays,
                            iconClass:
                                "bg-emerald-50 text-emerald-600",
                        });
                    }
                }
            );

            mentorship.forEach(
                (request) => {
                    if (
                        request?.createdAt
                    ) {
                        activity.push({
                            type:
                                "mentorship",
                            title:
                                "Mentorship request",
                            subtitle:
                                request?.message ||
                                "New mentorship request",
                            date:
                                request.createdAt,
                            icon:
                                Handshake,
                            iconClass:
                                "bg-violet-50 text-violet-600",
                        });
                    }
                }
            );

            return activity
                .sort(
                    (a, b) =>
                        new Date(
                            b.date
                        ) -
                        new Date(
                            a.date
                        )
                )
                .slice(0, 8);
        }, [
            users,
            jobs,
            events,
            mentorship,
        ]);

    // =====================================================
    // PRINT REPORT
    // =====================================================

    const handlePrint =
        () => {
            window.print();
        };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="space-y-6">

                <PageHeader
                    onRefresh={() =>
                        fetchReports(
                            true
                        )
                    }
                    refreshing={
                        refreshing
                    }
                    onPrint={
                        handlePrint
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={
                                    item
                                }
                                className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white"
                            />
                        )
                    )}

                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    <div className="h-80 animate-pulse rounded-2xl bg-white" />

                    <div className="h-80 animate-pulse rounded-2xl bg-white" />

                </div>

            </div>
        );
    }

    return (
        <div
            id="admin-report"
            className="space-y-6"
        >

            {/* HEADER */}

            <PageHeader
                onRefresh={() =>
                    fetchReports(
                        true
                    )
                }
                refreshing={
                    refreshing
                }
                onPrint={
                    handlePrint
                }
            />

            {/* ERROR */}

            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">

                    <AlertCircle
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}

            {/* PLATFORM STATS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {platformStats.map(
                    (stat) => (
                        <StatCard
                            key={
                                stat.label
                            }
                            {...stat}
                        />
                    )
                )}

            </div>

            {/* USER OVERVIEW */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                <ReportCard
                    title="Users by Role"
                    subtitle="Current platform user distribution"
                    icon={Users}
                >

                    <div className="space-y-5">

                        {roleDistribution.map(
                            (item) => (
                                <ProgressRow
                                    key={
                                        item.label
                                    }
                                    {...item}
                                />
                            )
                        )}

                    </div>

                </ReportCard>

                {/* ALUMNI */}

                <ReportCard
                    title="Alumni Verification"
                    subtitle="Current alumni verification overview"
                    icon={
                        UserCheck
                    }
                >

                    <div className="space-y-5">

                        {verificationDistribution.map(
                            (item) => (
                                <ProgressRow
                                    key={
                                        item.label
                                    }
                                    {...item}
                                />
                            )
                        )}

                    </div>

                </ReportCard>

            </div>

            {/* MENTORSHIP + PLATFORM */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                <ReportCard
                    title="Mentorship Requests"
                    subtitle="Current mentorship request status"
                    icon={
                        Handshake
                    }
                >

                    <div className="space-y-5">

                        {mentorshipDistribution.map(
                            (item) => (
                                <ProgressRow
                                    key={
                                        item.label
                                    }
                                    {...item}
                                />
                            )
                        )}

                    </div>

                </ReportCard>

                <ReportCard
                    title="Platform Summary"
                    subtitle="Key application metrics"
                    icon={
                        TrendingUp
                    }
                >

                    <div className="grid grid-cols-2 gap-3">

                        <MiniMetric
                            label="Verified Users"
                            value={
                                userStats.verified
                            }
                            icon={
                                CheckCircle2
                            }
                            className="text-emerald-600 bg-emerald-50"
                        />

                        <MiniMetric
                            label="Upcoming Events"
                            value={
                                eventStats.upcoming
                            }
                            icon={
                                CalendarDays
                            }
                            className="text-blue-600 bg-blue-50"
                        />

                        <MiniMetric
                            label="Accepted Mentorship"
                            value={
                                mentorshipStats.accepted
                            }
                            icon={
                                CheckCircle2
                            }
                            className="text-violet-600 bg-violet-50"
                        />

                        <MiniMetric
                            label="Pending Mentorship"
                            value={
                                mentorshipStats.pending
                            }
                            icon={Clock3}
                            className="text-amber-600 bg-amber-50"
                        />

                    </div>

                </ReportCard>

            </div>

            {/* CONTENT OVERVIEW */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                        <Activity
                            size={18}
                        />

                    </div>

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Content Overview
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Jobs and events currently available on the platform.
                        </p>

                    </div>

                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <ContentMetric
                        icon={
                            BriefcaseBusiness
                        }
                        title="Job Opportunities"
                        value={
                            jobStats.total
                        }
                        description="Jobs currently returned by the jobs API."
                        className="bg-orange-50 text-orange-600"
                    />

                    <ContentMetric
                        icon={
                            CalendarDays
                        }
                        title="Events"
                        value={
                            eventStats.total
                        }
                        description="Events currently returned by the events API."
                        className="bg-blue-50 text-[#004AC6]"
                    />

                </div>

            </section>

            {/* RECENT ACTIVITY */}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-100 p-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">

                            <Activity
                                size={18}
                            />

                        </div>

                        <div>

                            <h2 className="text-sm font-bold text-gray-900">
                                Recent Activity
                            </h2>

                            <p className="mt-0.5 text-[10px] text-gray-400">
                                Latest records available from the current APIs.
                            </p>

                        </div>

                    </div>

                </div>

                <div className="divide-y divide-gray-100">

                    {recentActivity.length >
                        0 ? (
                        recentActivity.map(
                            (
                                item,
                                index
                            ) => (
                                <ActivityRow
                                    key={`${item.type}-${index}`}
                                    {...item}
                                />
                            )
                        )
                    ) : (
                        <div className="px-5 py-12 text-center">

                            <FileText
                                size={22}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 text-xs font-bold text-gray-600">
                                No recent activity
                            </p>

                        </div>
                    )}

                </div>

            </section>

            {/* REPORT FOOTER */}

            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">

                <div className="flex items-center gap-2 text-[10px] text-gray-400">

                    <FileText
                        size={13}
                    />

                    Report generated from current platform data

                </div>

                <span className="text-[10px] font-semibold text-gray-500">

                    {new Date().toLocaleString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        }
                    )}

                </span>

            </div>

        </div>
    );
};

// =========================================================
// HEADER
// =========================================================

const PageHeader = ({
    onRefresh,
    refreshing,
    onPrint,
}) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#004AC6]">
                Administration
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                Reports & Analytics
            </h1>

            <p className="mt-1 text-xs text-gray-400">
                Overview of users, alumni, jobs, events and mentorship activity.
            </p>

        </div>

        <div className="flex gap-2 print:hidden">

            <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 shadow-sm transition hover:border-[#004AC6] hover:text-[#004AC6] disabled:opacity-60"
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

            <button
                type="button"
                onClick={onPrint}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#004AC6] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#003da3]"
            >

                <Download
                    size={14}
                />

                Print Report

            </button>

        </div>

    </div>
);

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
    label,
    value,
    icon: Icon,
    iconClass,
}) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="flex items-start justify-between">

            <div>

                <p className="text-xs font-semibold text-gray-400">
                    {label}
                </p>

                <p className="mt-2 text-2xl font-extrabold text-gray-900">
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

    </div>
);

// =========================================================
// REPORT CARD
// =========================================================

const ReportCard = ({
    title,
    subtitle,
    icon: Icon,
    children,
}) => (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">

                <Icon
                    size={18}
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

        <div className="mt-6">
            {children}
        </div>

    </section>
);

// =========================================================
// PROGRESS ROW
// =========================================================

const ProgressRow = ({
    label,
    value,
    percentage,
    className,
}) => (
    <div>

        <div className="flex items-center justify-between">

            <span className="text-xs font-semibold text-gray-600">
                {label}
            </span>

            <span className="text-[10px] font-bold text-gray-500">
                {value} · {percentage}%
            </span>

        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

            <div
                className={`h-full rounded-full transition-all ${className}`}
                style={{
                    width: `${Math.min(
                        Math.max(
                            percentage,
                            0
                        ),
                        100
                    )}%`,
                }}
            />

        </div>

    </div>
);

// =========================================================
// MINI METRIC
// =========================================================

const MiniMetric = ({
    label,
    value,
    icon: Icon,
    className,
}) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">

        <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`}
        >

            <Icon
                size={15}
            />

        </div>

        <p className="mt-3 text-[10px] font-semibold text-gray-400">
            {label}
        </p>

        <p className="mt-1 text-xl font-extrabold text-gray-800">
            {value}
        </p>

    </div>
);

// =========================================================
// CONTENT METRIC
// =========================================================

const ContentMetric = ({
    icon: Icon,
    title,
    value,
    description,
    className,
}) => (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">

        <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}
        >

            <Icon
                size={19}
            />

        </div>

        <div className="min-w-0">

            <p className="text-xs font-bold text-gray-700">
                {title}
            </p>

            <p className="mt-1 text-xl font-extrabold text-gray-900">
                {value}
            </p>

            <p className="mt-1 text-[9px] leading-4 text-gray-400">
                {description}
            </p>

        </div>

    </div>
);

// =========================================================
// ACTIVITY ROW
// =========================================================

const ActivityRow = ({
    title,
    subtitle,
    date,
    icon: Icon,
    iconClass,
}) => (
    <div className="flex items-center gap-3 px-5 py-4">

        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >

            <Icon
                size={15}
            />

        </div>

        <div className="min-w-0 flex-1">

            <p className="text-xs font-bold text-gray-700">
                {title}
            </p>

            <p className="mt-0.5 max-w-[500px] truncate text-[9px] text-gray-400">
                {subtitle}
            </p>

        </div>

        <p className="shrink-0 text-[9px] font-medium text-gray-400">
            {formatActivityDate(
                date
            )}
        </p>

    </div>
);

// =========================================================
// ACTIVITY DATE
// =========================================================

const formatActivityDate = (
    date
) => {
    if (!date) {
        return "—";
    }

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return "—";
    }

    return value.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

export default Reports;