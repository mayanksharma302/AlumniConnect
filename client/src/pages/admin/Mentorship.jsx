import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    RefreshCw,
    Users,
    Clock3,
    CheckCircle2,
    XCircle,
    Eye,
    X,
    MessageSquareText,
    CalendarDays,
    UserRound,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

const Mentorship = () => {
    const [requests, setRequests] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [page, setPage] =
        useState(1);

    const ITEMS_PER_PAGE = 8;

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
    // FETCH RECEIVED REQUESTS
    // =====================================================

    const fetchMentorship =
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                /*
                 * IMPORTANT:
                 * Your backend route is spelled:
                 *
                 * /api/mentorship/recieved
                 *
                 * Keep this spelling because that is
                 * the route currently defined in your
                 * backend.
                 */

                const response =
                    await axios.get(
                        `${API_URL}/api/mentorship/recieved`,
                        getConfig()
                    );

                const body =
                    response?.data;

                let data = [];

                if (
                    Array.isArray(body)
                ) {
                    data = body;
                } else if (
                    Array.isArray(
                        body?.requests
                    )
                ) {
                    data = body.requests;
                } else if (
                    Array.isArray(
                        body?.data
                    )
                ) {
                    data = body.data;
                }

                setRequests(data);
            } catch (error) {
                console.error(
                    "Mentorship loading error:",
                    error
                );

                setError(
                    error?.response
                        ?.data
                        ?.message ||
                    "Unable to load mentorship requests."
                );

                setRequests([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

    useEffect(() => {
        fetchMentorship();
    }, []);

    // =====================================================
    // NORMALIZE REQUEST
    // =====================================================

    const normalizedRequests =
        useMemo(() => {
            return requests.map(
                (request) => {
                    const mentee =
                        request?.menteeId &&
                            typeof request.menteeId ===
                            "object"
                            ? request.menteeId
                            : null;

                    const mentor =
                        request?.mentorId &&
                            typeof request.mentorId ===
                            "object"
                            ? request.mentorId
                            : null;

                    return {
                        ...request,

                        mentee,

                        mentor,

                        menteeName:
                            getUserName(
                                mentee
                            ),

                        mentorName:
                            getUserName(
                                mentor
                            ),

                        menteeEmail:
                            mentee?.email ||
                            "Not available",

                        mentorEmail:
                            mentor?.email ||
                            "Not available",

                        status:
                            String(
                                request?.status ||
                                "pending"
                            ).toLowerCase(),

                        message:
                            request?.message ||
                            "No message provided.",
                    };
                }
            );
        }, [requests]);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredRequests =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return normalizedRequests.filter(
                (request) => {
                    const matchesSearch =
                        !query ||
                        request.menteeName
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        request.mentorName
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        request.menteeEmail
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        request.mentorEmail
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        request.message
                            .toLowerCase()
                            .includes(
                                query
                            );

                    const matchesStatus =
                        statusFilter ===
                        "all" ||
                        request.status ===
                        statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            normalizedRequests,
            search,
            statusFilter,
        ]);

    // =====================================================
    // COUNTS
    // =====================================================

    const counts = useMemo(() => {
        return {
            total:
                normalizedRequests.length,

            pending:
                normalizedRequests.filter(
                    (request) =>
                        request.status ===
                        "pending"
                ).length,

            accepted:
                normalizedRequests.filter(
                    (request) =>
                        request.status ===
                        "accepted"
                ).length,

            rejected:
                normalizedRequests.filter(
                    (request) =>
                        request.status ===
                        "rejected" ||
                        request.status ===
                        "declined"
                ).length,
        };
    }, [normalizedRequests]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.max(
            Math.ceil(
                filteredRequests.length /
                ITEMS_PER_PAGE
            ),
            1
        );

    const safePage =
        Math.min(
            page,
            totalPages
        );

    const paginatedRequests =
        filteredRequests.slice(
            (safePage - 1) *
            ITEMS_PER_PAGE,
            safePage *
            ITEMS_PER_PAGE
        );

    useEffect(() => {
        setPage(1);
    }, [
        search,
        statusFilter,
    ]);

    // =====================================================
    // DATE
    // =====================================================

    const formatDate = (date) => {
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

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="space-y-6">

                <PageHeader
                    onRefresh={() =>
                        fetchMentorship(
                            true
                        )
                    }
                    refreshing={
                        refreshing
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

                <div className="h-[500px] animate-pulse rounded-2xl bg-white" />

            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <PageHeader
                onRefresh={() =>
                    fetchMentorship(
                        true
                    )
                }
                refreshing={
                    refreshing
                }
            />

            {/* IMPORTANT INFO */}

            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-[#004AC6]"
                />

                <div>

                    <p className="text-xs font-bold text-[#004AC6]">
                        Mentorship overview
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-blue-700/70">
                        This page uses the existing
                        mentorship endpoint and displays
                        the requests available to the
                        authenticated account.
                    </p>

                </div>

            </div>

            {/* STATS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    title="Total Requests"
                    value={
                        counts.total
                    }
                    icon={Users}
                    iconClass="bg-blue-50 text-[#004AC6]"
                />

                <StatCard
                    title="Pending"
                    value={
                        counts.pending
                    }
                    icon={Clock3}
                    iconClass="bg-amber-50 text-amber-600"
                />

                <StatCard
                    title="Accepted"
                    value={
                        counts.accepted
                    }
                    icon={
                        CheckCircle2
                    }
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                    title="Rejected"
                    value={
                        counts.rejected
                    }
                    icon={XCircle}
                    iconClass="bg-red-50 text-red-600"
                />

            </div>

            {/* TABLE */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                {/* TOOLBAR */}

                <div className="border-b border-gray-100 p-4 sm:p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="relative w-full lg:max-w-md">

                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Search student, mentor or message..."
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                            />

                        </div>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                e
                            ) =>
                                setStatusFilter(
                                    e.target
                                        .value
                                )
                            }
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6]"
                        >

                            <option value="all">
                                All Requests
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="accepted">
                                Accepted
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>

                            <option value="declined">
                                Declined
                            </option>

                        </select>

                    </div>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[950px]">

                        <thead>

                            <tr className="border-b border-gray-100 bg-gray-50/70">

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Student
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Mentor
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Message
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Date
                                </th>

                                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {paginatedRequests.length >
                                0 ? (

                                paginatedRequests.map(
                                    (
                                        request,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                request._id ||
                                                index
                                            }
                                            className="transition hover:bg-gray-50/70"
                                        >

                                            {/* STUDENT */}

                                            <td className="px-5 py-4">

                                                <PersonCell
                                                    name={
                                                        request.menteeName
                                                    }
                                                    email={
                                                        request.menteeEmail
                                                    }
                                                    type="student"
                                                />

                                            </td>

                                            {/* MENTOR */}

                                            <td className="px-5 py-4">

                                                <PersonCell
                                                    name={
                                                        request.mentorName
                                                    }
                                                    email={
                                                        request.mentorEmail
                                                    }
                                                    type="mentor"
                                                />

                                            </td>

                                            {/* MESSAGE */}

                                            <td className="px-5 py-4">

                                                <div className="flex max-w-[270px] items-start gap-2">

                                                    <MessageSquareText
                                                        size={
                                                            13
                                                        }
                                                        className="mt-0.5 shrink-0 text-gray-400"
                                                    />

                                                    <p className="line-clamp-2 text-[10px] leading-4 text-gray-500">
                                                        {
                                                            request.message
                                                        }
                                                    </p>

                                                </div>

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-5 py-4">

                                                <StatusBadge
                                                    status={
                                                        request.status
                                                    }
                                                />

                                            </td>

                                            {/* DATE */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">

                                                    <CalendarDays
                                                        size={
                                                            11
                                                        }
                                                        className="text-gray-400"
                                                    />

                                                    {
                                                        formatDate(
                                                            request.createdAt
                                                        )
                                                    }

                                                </div>

                                            </td>

                                            {/* ACTION */}

                                            <td className="px-5 py-4 text-right">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRequest(
                                                            request
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 transition hover:border-[#004AC6] hover:text-[#004AC6]"
                                                >

                                                    <Eye
                                                        size={
                                                            13
                                                        }
                                                    />

                                                    View

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-5 py-16 text-center"
                                    >

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-300">

                                            <Users
                                                size={
                                                    22
                                                }
                                            />

                                        </div>

                                        <p className="mt-3 text-sm font-bold text-gray-600">
                                            No mentorship requests found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Try changing your search or status filter.
                                        </p>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* PAGINATION */}

                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-[10px] font-medium text-gray-400">

                        Showing{" "}

                        <span className="font-bold text-gray-600">

                            {filteredRequests.length ===
                                0
                                ? 0
                                : (safePage -
                                    1) *
                                ITEMS_PER_PAGE +
                                1}

                        </span>

                        {" "}–{" "}

                        <span className="font-bold text-gray-600">

                            {Math.min(
                                safePage *
                                ITEMS_PER_PAGE,
                                filteredRequests.length
                            )}

                        </span>

                        {" "}of{" "}

                        <span className="font-bold text-gray-600">

                            {
                                filteredRequests.length
                            }

                        </span>

                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            disabled={
                                safePage <=
                                1
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        Math.max(
                                            current -
                                            1,
                                            1
                                        )
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#004AC6] hover:text-[#004AC6] disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            <ChevronLeft
                                size={
                                    15
                                }
                            />

                        </button>

                        <span className="text-[10px] font-bold text-gray-500">

                            {safePage} /{" "}
                            {totalPages}

                        </span>

                        <button
                            type="button"
                            disabled={
                                safePage >=
                                totalPages
                            }
                            onClick={() =>
                                setPage(
                                    (
                                        current
                                    ) =>
                                        Math.min(
                                            current +
                                            1,
                                            totalPages
                                        )
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#004AC6] hover:text-[#004AC6] disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            <ChevronRight
                                size={
                                    15
                                }
                            />

                        </button>

                    </div>

                </div>

            </section>

            {/* DETAILS MODAL */}

            {selectedRequest && (
                <RequestDetailsModal
                    request={
                        selectedRequest
                    }
                    onClose={() =>
                        setSelectedRequest(
                            null
                        )
                    }
                />
            )}

        </div>
    );
};

// =========================================================
// HEADER
// =========================================================

const PageHeader = ({
    onRefresh,
    refreshing,
}) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#004AC6]">
                Administration
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                Mentorship
            </h1>

            <p className="mt-1 text-xs text-gray-400">
                Review mentorship requests and connections.
            </p>

        </div>

        <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
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

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
    title,
    value,
    icon: Icon,
    iconClass,
}) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="flex items-start justify-between">

            <div>

                <p className="text-xs font-semibold text-gray-400">
                    {title}
                </p>

                <p className="mt-2 text-2xl font-extrabold text-gray-900">
                    {value}
                </p>

            </div>

            <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
            >

                <Icon size={20} />

            </div>

        </div>

    </div>
);

// =========================================================
// PERSON CELL
// =========================================================

const PersonCell = ({
    name,
    email,
    type,
}) => {

    const initials =
        String(name || "User")
            .split(" ")
            .filter(Boolean)
            .map(
                (part) =>
                    part[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();

    const isStudent =
        type ===
        "student";

    return (
        <div className="flex items-center gap-3">

            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[9px] font-bold ${isStudent
                        ? "bg-blue-50 text-[#004AC6]"
                        : "bg-violet-50 text-violet-600"
                    }`}
            >

                {initials}

            </div>

            <div className="min-w-0">

                <p className="max-w-[150px] truncate text-[10px] font-bold text-gray-700">

                    {name}

                </p>

                <p className="max-w-[160px] truncate text-[9px] text-gray-400">

                    {email}

                </p>

            </div>

        </div>
    );
};

// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({
    status,
}) => {

    const config = {
        pending: {
            label: "Pending",
            className:
                "bg-amber-50 text-amber-600",
            dot:
                "bg-amber-500",
        },

        accepted: {
            label: "Accepted",
            className:
                "bg-emerald-50 text-emerald-600",
            dot:
                "bg-emerald-500",
        },

        rejected: {
            label: "Rejected",
            className:
                "bg-red-50 text-red-600",
            dot:
                "bg-red-500",
        },

        declined: {
            label: "Declined",
            className:
                "bg-red-50 text-red-600",
            dot:
                "bg-red-500",
        },
    };

    const current =
        config[status] ||
        {
            label:
                status ||
                "Unknown",
            className:
                "bg-gray-100 text-gray-500",
            dot:
                "bg-gray-400",
        };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold ${current.className}`}
        >

            <span
                className={`h-1.5 w-1.5 rounded-full ${current.dot}`}
            />

            {current.label}

        </span>
    );
};

// =========================================================
// DETAILS MODAL
// =========================================================

const RequestDetailsModal = ({
    request,
    onClose,
}) => {

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Mentorship Request
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            View request details.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    >

                        <X size={18} />

                    </button>

                </div>

                {/* CONTENT */}

                <div className="max-h-[70vh] overflow-y-auto p-5">

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <PersonDetail
                            icon={
                                GraduationCap
                            }
                            label="Student"
                            name={
                                request.menteeName
                            }
                            email={
                                request.menteeEmail
                            }
                            className="blue"
                        />

                        <PersonDetail
                            icon={
                                UserRound
                            }
                            label="Mentor"
                            name={
                                request.mentorName
                            }
                            email={
                                request.mentorEmail
                            }
                            className="violet"
                        />

                    </div>

                    {/* STATUS */}

                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                    Request Status
                                </p>

                                <div className="mt-2">

                                    <StatusBadge
                                        status={
                                            request.status
                                        }
                                    />

                                </div>

                            </div>

                            <div className="text-right">

                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                    Requested
                                </p>

                                <p className="mt-2 text-[10px] font-semibold text-gray-600">

                                    {formatFullDate(
                                        request.createdAt
                                    )}

                                </p>

                            </div>

                        </div>

                    </div>

                    {/* MESSAGE */}

                    <div className="mt-4">

                        <div className="mb-2 flex items-center gap-2">

                            <MessageSquareText
                                size={14}
                                className="text-[#004AC6]"
                            />

                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Request Message
                            </p>

                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">

                            <p className="whitespace-pre-wrap text-xs leading-5 text-gray-600">

                                {
                                    request.message
                                }

                            </p>

                        </div>

                    </div>

                </div>

                {/* FOOTER */}

                <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-5 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-[#004AC6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003da3]"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
};

// =========================================================
// PERSON DETAIL
// =========================================================

const PersonDetail = ({
    icon: Icon,
    label,
    name,
    email,
    className,
}) => {

    const iconClass =
        className === "violet"
            ? "bg-violet-50 text-violet-600"
            : "bg-blue-50 text-[#004AC6]";

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                >

                    <Icon size={17} />

                </div>

                <div className="min-w-0">

                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-xs font-bold text-gray-700">
                        {name}
                    </p>

                    <p className="mt-0.5 truncate text-[9px] text-gray-400">
                        {email}
                    </p>

                </div>

            </div>

        </div>
    );
};

// =========================================================
// DATE
// =========================================================

const formatFullDate = (
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

    return value.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );
};

// =========================================================
// USER NAME
// =========================================================

const getUserName = (
    user
) => {
    if (!user) {
        return "Unknown User";
    }

    const firstName =
        user?.firstName ||
        user?.profile?.firstName ||
        "";

    const lastName =
        user?.lastName ||
        user?.profile?.lastName ||
        "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    return (
        fullName ||
        user?.username ||
        user?.name ||
        user?.email ||
        "Unknown User"
    );
};

export default Mentorship;