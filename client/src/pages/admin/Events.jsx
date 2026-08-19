import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    RefreshCw,
    CalendarDays,
    MapPin,
    Clock3,
    Trash2,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Users,
    ExternalLink,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

const Events = () => {
    const [events, setEvents] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [dateFilter, setDateFilter] =
        useState("all");

    const [page, setPage] =
        useState(1);

    const [selectedEvent, setSelectedEvent] =
        useState(null);

    const [deleteEvent, setDeleteEvent] =
        useState(null);

    const [showCreateModal, setShowCreateModal] =
        useState(false);

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
    // FETCH EVENTS
    // =====================================================

    const fetchEvents = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axios.get(
                `${API_URL}/api/events/upcoming`,
                getConfig()
            );

            const body = response?.data;

            let data = [];

            if (Array.isArray(body)) {
                data = body;
            } else if (Array.isArray(body?.data)) {
                data = body.data;
            } else if (Array.isArray(body?.events)) {
                data = body.events;
            }

            setEvents(data);
        } catch (error) {
            console.error(
                "Events loading error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to load events."
            );

            setEvents([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // =====================================================
    // HELPERS
    // =====================================================

    const getTitle = (event) => {
        return (
            event?.title ||
            event?.name ||
            event?.eventName ||
            "Untitled Event"
        );
    };

    const getDescription = (event) => {
        return (
            event?.description ||
            event?.details ||
            event?.eventDescription ||
            "No description available."
        );
    };

    const getLocation = (event) => {
        if (
            typeof event?.location ===
            "string"
        ) {
            return event.location;
        }

        if (event?.location) {
            return [
                event.location.address,
                event.location.city,
                event.location.state,
            ]
                .filter(Boolean)
                .join(", ");
        }

        return (
            event?.venue ||
            event?.address ||
            "Online / Not specified"
        );
    };

    const getStartDate = (event) => {
        return (
            event?.startDate ||
            event?.date ||
            event?.eventDate ||
            event?.scheduledAt
        );
    };

    const getEndDate = (event) => {
        return (
            event?.endDate ||
            event?.endDateTime
        );
    };

    const getTime = (event) => {
        const date =
            getStartDate(event);

        if (!date) {
            return "Time not specified";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return "Time not specified";
        }

        return value.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

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

    const isUpcoming = (event) => {
        const date =
            getStartDate(event);

        if (!date) {
            return false;
        }

        const value =
            new Date(date);

        return (
            !Number.isNaN(
                value.getTime()
            ) &&
            value >= new Date()
        );
    };

    const isToday = (event) => {
        const date =
            getStartDate(event);

        if (!date) {
            return false;
        }

        const value =
            new Date(date);

        const today =
            new Date();

        return (
            value.getDate() ===
            today.getDate() &&
            value.getMonth() ===
            today.getMonth() &&
            value.getFullYear() ===
            today.getFullYear()
        );
    };

    // =====================================================
    // FILTER
    // =====================================================

    const filteredEvents =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return events.filter(
                (event) => {
                    const title =
                        getTitle(
                            event
                        ).toLowerCase();

                    const description =
                        getDescription(
                            event
                        ).toLowerCase();

                    const location =
                        getLocation(
                            event
                        ).toLowerCase();

                    const matchesSearch =
                        !query ||
                        title.includes(
                            query
                        ) ||
                        description.includes(
                            query
                        ) ||
                        location.includes(
                            query
                        );

                    const matchesDate =
                        dateFilter ===
                        "all" ||
                        (
                            dateFilter ===
                            "upcoming" &&
                            isUpcoming(
                                event
                            )
                        ) ||
                        (
                            dateFilter ===
                            "today" &&
                            isToday(
                                event
                            )
                        ) ||
                        (
                            dateFilter ===
                            "past" &&
                            !isUpcoming(
                                event
                            )
                        );

                    return (
                        matchesSearch &&
                        matchesDate
                    );
                }
            );
        }, [
            events,
            search,
            dateFilter,
        ]);

    // =====================================================
    // SORT
    // =====================================================

    const sortedEvents =
        useMemo(() => {
            return [
                ...filteredEvents,
            ].sort((a, b) => {
                const dateA =
                    new Date(
                        getStartDate(a) ||
                        0
                    ).getTime();

                const dateB =
                    new Date(
                        getStartDate(b) ||
                        0
                    ).getTime();

                return dateA - dateB;
            });
        }, [filteredEvents]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.max(
            Math.ceil(
                sortedEvents.length /
                ITEMS_PER_PAGE
            ),
            1
        );

    const safePage =
        Math.min(
            page,
            totalPages
        );

    const paginatedEvents =
        sortedEvents.slice(
            (safePage - 1) *
            ITEMS_PER_PAGE,
            safePage *
            ITEMS_PER_PAGE
        );

    useEffect(() => {
        setPage(1);
    }, [
        search,
        dateFilter,
    ]);

    // =====================================================
    // COUNTS
    // =====================================================

    const upcomingCount =
        events.filter(
            isUpcoming
        ).length;

    const todayCount =
        events.filter(
            isToday
        ).length;

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete =
        async () => {
            if (
                !deleteEvent?._id
            ) {
                return;
            }

            try {
                await axios.delete(
                    `${API_URL}/api/events/${deleteEvent._id}`,
                    getConfig()
                );

                setEvents(
                    (current) =>
                        current.filter(
                            (event) =>
                                event._id !==
                                deleteEvent._id
                        )
                );

                setDeleteEvent(
                    null
                );
            } catch (error) {
                console.error(
                    "Delete event error:",
                    error
                );

                alert(
                    error?.response
                        ?.data
                        ?.message ||
                    "Unable to delete event."
                );
            }
        };

    // =====================================================
    // CREATED
    // =====================================================

    const handleEventCreated =
        (newEvent) => {
            if (newEvent) {
                setEvents(
                    (current) => [
                        newEvent,
                        ...current,
                    ]
                );
            } else {
                fetchEvents(true);
            }

            setShowCreateModal(
                false
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
                        fetchEvents(
                            true
                        )
                    }
                    refreshing={
                        refreshing
                    }
                    onCreate={() =>
                        setShowCreateModal(
                            true
                        )
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {[1, 2, 3].map(
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

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <PageHeader
                onRefresh={() =>
                    fetchEvents(
                        true
                    )
                }
                refreshing={
                    refreshing
                }
                onCreate={() =>
                    setShowCreateModal(
                        true
                    )
                }
            />

            {/* ERROR */}

            {error && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">

                    <div className="flex items-center gap-2">
                        <AlertCircle
                            size={16}
                        />

                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchEvents(
                                true
                            )
                        }
                        className="font-bold underline"
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* STATS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <StatCard
                    title="Total Events"
                    value={
                        events.length
                    }
                    icon={
                        CalendarDays
                    }
                    iconClass="bg-blue-50 text-[#004AC6]"
                />

                <StatCard
                    title="Upcoming"
                    value={
                        upcomingCount
                    }
                    icon={
                        Clock3
                    }
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                    title="Today"
                    value={
                        todayCount
                    }
                    icon={
                        CalendarDays
                    }
                    iconClass="bg-violet-50 text-violet-600"
                />

            </div>

            {/* EVENT TABLE */}

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
                                placeholder="Search events, descriptions or locations..."
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                            />

                        </div>

                        <select
                            value={
                                dateFilter
                            }
                            onChange={(
                                e
                            ) =>
                                setDateFilter(
                                    e.target
                                        .value
                                )
                            }
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6]"
                        >

                            <option value="all">
                                All Events
                            </option>

                            <option value="upcoming">
                                Upcoming
                            </option>

                            <option value="today">
                                Today
                            </option>

                            <option value="past">
                                Past
                            </option>

                        </select>

                    </div>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px]">

                        <thead>

                            <tr className="border-b border-gray-100 bg-gray-50/70">

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Event
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Date & Time
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Location
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {paginatedEvents.length >
                                0 ? (

                                paginatedEvents.map(
                                    (
                                        event,
                                        index
                                    ) => {

                                        const upcoming =
                                            isUpcoming(
                                                event
                                            );

                                        return (
                                            <tr
                                                key={
                                                    event._id ||
                                                    index
                                                }
                                                className="transition hover:bg-gray-50/70"
                                            >

                                                {/* EVENT */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004AC6]">

                                                            <CalendarDays
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="max-w-[280px] truncate text-xs font-bold text-gray-800">

                                                                {
                                                                    getTitle(
                                                                        event
                                                                    )
                                                                }

                                                            </p>

                                                            <p className="mt-1 max-w-[300px] truncate text-[10px] text-gray-400">

                                                                {
                                                                    getDescription(
                                                                        event
                                                                    )
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* DATE */}

                                                <td className="px-5 py-4">

                                                    <div>

                                                        <p className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">

                                                            <CalendarDays
                                                                size={
                                                                    11
                                                                }
                                                                className="text-gray-400"
                                                            />

                                                            {
                                                                formatDate(
                                                                    getStartDate(
                                                                        event
                                                                    )
                                                                )
                                                            }

                                                        </p>

                                                        <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">

                                                            <Clock3
                                                                size={
                                                                    10
                                                                }
                                                            />

                                                            {
                                                                getTime(
                                                                    event
                                                                )
                                                            }

                                                        </p>

                                                    </div>

                                                </td>

                                                {/* LOCATION */}

                                                <td className="px-5 py-4">

                                                    <div className="flex max-w-[190px] items-center gap-1 text-[10px] text-gray-500">

                                                        <MapPin
                                                            size={
                                                                11
                                                            }
                                                            className="shrink-0 text-gray-400"
                                                        />

                                                        <span className="truncate">

                                                            {
                                                                getLocation(
                                                                    event
                                                                )
                                                            }

                                                        </span>

                                                    </div>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold ${upcoming
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-gray-100 text-gray-500"
                                                            }`}
                                                    >

                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${upcoming
                                                                ? "bg-emerald-500"
                                                                : "bg-gray-400"
                                                                }`}
                                                        />

                                                        {upcoming
                                                            ? "Upcoming"
                                                            : "Past"}

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedEvent(
                                                                    event
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 transition hover:border-[#004AC6] hover:text-[#004AC6]"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteEvent(
                                                                    event
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center rounded-lg border border-red-100 p-1.5 text-red-500 transition hover:bg-red-50"
                                                            title="Delete event"
                                                        >

                                                            <Trash2
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="px-5 py-16 text-center"
                                    >

                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-300">

                                            <CalendarDays
                                                size={
                                                    22
                                                }
                                            />

                                        </div>

                                        <p className="mt-3 text-sm font-bold text-gray-600">
                                            No events found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Try changing your search or create a new event.
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

                            {sortedEvents.length ===
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
                                sortedEvents.length
                            )}

                        </span>

                        {" "}of{" "}

                        <span className="font-bold text-gray-600">

                            {
                                sortedEvents.length
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

            {/* VIEW */}

            {selectedEvent && (
                <EventDetailsModal
                    event={
                        selectedEvent
                    }
                    onClose={() =>
                        setSelectedEvent(
                            null
                        )
                    }
                />
            )}

            {/* DELETE */}

            {deleteEvent && (
                <DeleteEventModal
                    event={
                        deleteEvent
                    }
                    onClose={() =>
                        setDeleteEvent(
                            null
                        )
                    }
                    onConfirm={
                        handleDelete
                    }
                />
            )}

            {/* CREATE */}

            {showCreateModal && (
                <CreateEventModal
                    onClose={() =>
                        setShowCreateModal(
                            false
                        )
                    }
                    onCreated={
                        handleEventCreated
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
    onCreate,
}) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#004AC6]">
                Administration
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                Events
            </h1>

            <p className="mt-1 text-xs text-gray-400">
                Manage events and community activities.
            </p>

        </div>

        <div className="flex gap-2">

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
                onClick={onCreate}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#004AC6] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#003da3]"
            >

                <Plus size={15} />

                Create Event

            </button>

        </div>

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
// CREATE EVENT MODAL
// =========================================================

const CreateEventModal = ({
    onClose,
    onCreated,
}) => {

    const [form, setForm] =
        useState({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
            meetingLink: "",
        });

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const getToken = () =>
        sessionStorage.getItem(
            "accessToken"
        ) ||
        localStorage.getItem(
            "accessToken"
        );

    const getConfig = () => {
        const token =
            getToken();

        return token
            ? {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
            : {};
    };

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;

        setForm(
            (current) => ({
                ...current,
                [name]: value,
            })
        );
    };

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setSubmitting(true);
            setError("");

            try {

                const payload = {
                    ...form,

                    startDate:
                        form.startDate
                            ? new Date(
                                form.startDate
                            ).toISOString()
                            : undefined,

                    endDate:
                        form.endDate
                            ? new Date(
                                form.endDate
                            ).toISOString()
                            : undefined,
                };

                const response =
                    await axios.post(
                        `${API_URL}/api/events/create`,
                        payload,
                        getConfig()
                    );

                const body =
                    response?.data;

                const createdEvent =
                    body?.data ||
                    body?.event ||
                    body;

                onCreated(
                    createdEvent
                );

            } catch (error) {

                console.error(
                    "Create event error:",
                    error
                );

                setError(
                    error?.response
                        ?.data
                        ?.message ||
                    "Unable to create event."
                );

            } finally {

                setSubmitting(
                    false
                );

            }
        };

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

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Create Event
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Publish a new community event.
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

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="max-h-[70vh] overflow-y-auto p-5"
                >

                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">

                        <Input
                            label="Event Title"
                            name="title"
                            value={
                                form.title
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. React Resume Review"
                            required
                        />

                        <div>

                            <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows={4}
                                required
                                placeholder="Describe the event..."
                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                            />

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <Input
                                label="Start Date & Time"
                                name="startDate"
                                type="datetime-local"
                                value={
                                    form.startDate
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <Input
                                label="End Date & Time"
                                name="endDate"
                                type="datetime-local"
                                value={
                                    form.endDate
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <Input
                                label="Location"
                                name="location"
                                value={
                                    form.location
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Google Meet / Ahmedabad"
                            />

                            <Input
                                label="Meeting Link"
                                name="meetingLink"
                                value={
                                    form.meetingLink
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://meet.google.com/..."
                            />

                        </div>

                    </div>

                    <div className="mt-6 flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="rounded-xl bg-[#004AC6] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#003da3] disabled:opacity-60"
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Event"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

// =========================================================
// INPUT
// =========================================================

const Input = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
}) => (
    <div>

        <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
            {label}
        </label>

        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
        />

    </div>
);

// =========================================================
// DETAILS MODAL
// =========================================================

const EventDetailsModal = ({
    event,
    onClose,
}) => {

    const title =
        event?.title ||
        event?.name ||
        event?.eventName ||
        "Untitled Event";

    const description =
        event?.description ||
        event?.details ||
        event?.eventDescription ||
        "No description available.";

    const location =
        typeof event?.location ===
            "string"
            ? event.location
            : [
                event?.location
                    ?.address,
                event?.location?.city,
                event?.location?.state,
            ]
                .filter(Boolean)
                .join(", ") ||
            event?.venue ||
            "Online / Not specified";

    const startDate =
        event?.startDate ||
        event?.date ||
        event?.eventDate ||
        event?.scheduledAt;

    const endDate =
        event?.endDate ||
        event?.endDateTime;

    const attendees =
        event?.attendees ||
        event?.rsvps ||
        [];

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

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Event Details
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Review event information.
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

                <div className="max-h-[70vh] overflow-y-auto p-5">

                    <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#004AC6]">

                            <CalendarDays
                                size={23}
                            />

                        </div>

                        <div className="min-w-0">

                            <h3 className="text-xl font-bold text-gray-900">
                                {title}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">

                                <span className="flex items-center gap-1 text-[10px] text-gray-500">

                                    <CalendarDays
                                        size={
                                            12
                                        }
                                    />

                                    {formatDateLocal(
                                        startDate
                                    )}

                                </span>

                                <span className="flex items-center gap-1 text-[10px] text-gray-500">

                                    <Clock3
                                        size={
                                            12
                                        }
                                    />

                                    {formatTimeLocal(
                                        startDate
                                    )}

                                </span>

                                <span className="flex items-center gap-1 text-[10px] text-gray-500">

                                    <MapPin
                                        size={
                                            12
                                        }
                                    />

                                    {location}

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="mt-6">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Description
                        </p>

                        <p className="whitespace-pre-wrap text-xs leading-5 text-gray-600">
                            {description}
                        </p>

                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <DetailItem
                            icon={
                                CalendarDays
                            }
                            label="Start"
                            value={
                                formatDateTimeLocal(
                                    startDate
                                )
                            }
                        />

                        <DetailItem
                            icon={
                                Clock3
                            }
                            label="End"
                            value={
                                formatDateTimeLocal(
                                    endDate
                                )
                            }
                        />

                        <DetailItem
                            icon={MapPin}
                            label="Location"
                            value={
                                location
                            }
                        />

                        <DetailItem
                            icon={Users}
                            label="Attendees"
                            value={
                                Array.isArray(
                                    attendees
                                )
                                    ? attendees.length
                                    : "—"
                            }
                        />

                    </div>

                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-4">

                    {event?.meetingLink ? (

                        <a
                            href={
                                event.meetingLink
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-[#004AC6] px-4 py-2 text-[10px] font-bold text-white"
                        >

                            Open Meeting

                            <ExternalLink
                                size={
                                    12
                                }
                            />

                        </a>

                    ) : (
                        <span className="text-[10px] text-gray-400">
                            No meeting link
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
};

// =========================================================
// DELETE MODAL
// =========================================================

const DeleteEventModal = ({
    event,
    onClose,
    onConfirm,
}) => {

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">

                    <Trash2
                        size={20}
                    />

                </div>

                <h2 className="mt-4 text-sm font-bold text-gray-900">
                    Delete this event?
                </h2>

                <p className="mt-2 text-xs leading-5 text-gray-400">

                    This will permanently remove{" "}

                    <span className="font-bold text-gray-600">

                        {event?.title ||
                            event?.name ||
                            "this event"}

                    </span>

                    {" "}from AlumniConnect.

                </p>

                <div className="mt-5 flex justify-end gap-2">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
};

// =========================================================
// DETAIL ITEM
// =========================================================

const DetailItem = ({
    icon: Icon,
    label,
    value,
}) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">

        <div className="flex items-center gap-2">

            <Icon
                size={14}
                className="text-[#004AC6]"
            />

            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                {label}
            </p>

        </div>

        <p className="mt-2 break-words text-xs font-semibold text-gray-700">
            {value}
        </p>

    </div>
);

// =========================================================
// DATE HELPERS FOR MODAL
// =========================================================

const formatDateLocal = (
    date
) => {
    if (!date) return "—";

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

const formatTimeLocal = (
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

    return value.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
        }
    );
};

const formatDateTimeLocal = (
    date
) => {
    if (!date) {
        return "Not specified";
    }

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return "Not specified";
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

export default Events;