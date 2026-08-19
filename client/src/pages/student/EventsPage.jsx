import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
    CalendarDays,
    MapPin,
    Clock3,
    Users,
    Sparkles,
    CheckCircle2,
    Search,
    Filter,
    X,
    ChevronDown,
    Video,
    Building2,
    UserRound,
    Plus,
    Trash2,
    ListChecks,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

const EventsPage = () => {
    const [activeTab, setActiveTab] = useState("upcoming");

    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [myRsvps, setMyRsvps] = useState([]);
    const [attendees, setAttendees] = useState({});
    const [hostProfiles, setHostProfiles] = useState({});

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [search, setSearch] = useState("");
    const [eventType, setEventType] = useState("All Events");
    const [showFilters, setShowFilters] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        isVirtual: false,
    });

    const user = JSON.parse(
        sessionStorage.getItem("user") || "{}"
    );

    const token =
        sessionStorage.getItem("accessToken");

    const isAlumni =
        user?.role === "alumni";


    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const navigate = useNavigate();

    const fetchHostProfiles = async (organizerIds = []) => {
        const uniqueIds = [
            ...new Set(
                organizerIds
                    .filter(Boolean)
                    .map((id) => String(id))
            ),
        ];

        if (uniqueIds.length === 0) {
            return {};
        }

        const results = await Promise.all(
            uniqueIds.map(async (organizerId) => {
                try {
                    const response = await axios.get(
                        `${API_URL}/api/profile/get-profile/${organizerId}`,
                        authConfig
                    );

                    console.log(
                        "HOST PROFILE RESPONSE:",
                        organizerId,
                        response.data
                    );

                    return {
                        organizerId,
                        profile:
                            response.data?.profile ||
                            response.data,
                    };
                } catch (error) {
                    console.error(
                        `Host profile error for ${organizerId}:`,
                        error
                    );

                    return {
                        organizerId,
                        profile: null,
                    };
                }
            })
        );

        const profileMap = {};

        results.forEach(
            ({ organizerId, profile }) => {
                if (profile) {
                    profileMap[
                        String(organizerId)
                    ] = profile;
                }
            }
        );

        return profileMap;
    };


    /* =====================================================
       FETCH UPCOMING EVENTS
    ===================================================== */

    const fetchUpcomingEvents = async () => {
        if (!token) return [];

        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/api/events/upcoming`,
                authConfig
            );

            console.log(
                "UPCOMING EVENTS RESPONSE:",
                response.data
            );

            let eventList = [];

            if (Array.isArray(response.data)) {
                eventList = response.data;
            } else if (
                Array.isArray(response.data?.events)
            ) {
                eventList = response.data.events;
            } else if (
                Array.isArray(response.data?.data)
            ) {
                eventList = response.data.data;
            }

            console.log(
                "EVENT LIST:",
                eventList
            );

            setEvents(eventList);

            /*
             * Event.organizer contains the User ID.
             *
             * Name and profilePicture are stored
             * inside Profile, so fetch Profile using
             * the organizer User ID.
             */

            const organizerIds = eventList
                .map((event) => {
                    if (
                        event?.organizer &&
                        typeof event.organizer === "object"
                    ) {
                        return event.organizer?._id;
                    }

                    return event?.organizer;
                })
                .filter(Boolean);

            console.log(
                "UPCOMING ORGANIZER IDS:",
                organizerIds
            );

            const profiles =
                await fetchHostProfiles(
                    organizerIds
                );

            console.log(
                "UPCOMING HOST PROFILES:",
                profiles
            );

            setHostProfiles((previous) => ({
                ...previous,
                ...profiles,
            }));

            return eventList;

        } catch (error) {
            console.error(
                "Fetch events error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load events right now."
            );

            setEvents([]);

            return [];

        } finally {
            setLoading(false);
        }
    };


    /* =====================================================
       FETCH MY RSVPS
    ===================================================== */

    const fetchMyRsvps = async (
        upcomingEvents = []
    ) => {
        if (!token) return;

        try {
            const response = await axios.get(
                `${API_URL}/api/events/my-rsvps`,
                authConfig
            );

            console.log(
                "MY RSVPS RESPONSE:",
                response.data
            );

            let rsvpList = [];

            if (Array.isArray(response.data)) {
                rsvpList = response.data;
            } else if (
                Array.isArray(response.data?.data)
            ) {
                rsvpList = response.data.data;
            } else if (
                Array.isArray(response.data?.rsvps)
            ) {
                rsvpList = response.data.rsvps;
            }

            setMyRsvps(rsvpList);

            /*
             * Find organizer IDs.
             */

            const organizerIds = [];

            for (const entry of rsvpList) {

                const eventId =
                    entry.eventId?._id ||
                    entry.eventId;

                if (!eventId) {
                    continue;
                }

                let organizerId = null;

                /*
                 * Case 1:
                 * RSVP already contains organizer.
                 */

                if (
                    entry.eventId?.organizer
                ) {
                    organizerId =
                        typeof entry.eventId.organizer ===
                            "object"
                            ? entry.eventId.organizer?._id
                            : entry.eventId.organizer;
                }

                /*
                 * Case 2:
                 * RSVP only contains eventId.
                 *
                 * Find that event in Upcoming Events.
                 */

                if (!organizerId) {

                    const matchingEvent =
                        upcomingEvents.find(
                            (event) =>
                                String(event?._id) ===
                                String(eventId)
                        );

                    if (
                        matchingEvent?.organizer
                    ) {
                        organizerId =
                            typeof matchingEvent.organizer ===
                                "object"
                                ? matchingEvent.organizer?._id
                                : matchingEvent.organizer;
                    }
                }

                if (organizerId) {
                    organizerIds.push(
                        String(organizerId)
                    );
                }
            }

            const uniqueOrganizerIds = [
                ...new Set(organizerIds),
            ];

            console.log(
                "RSVP ORGANIZER IDS:",
                uniqueOrganizerIds
            );

            const profiles =
                await fetchHostProfiles(
                    uniqueOrganizerIds
                );

            console.log(
                "RSVP HOST PROFILES:",
                profiles
            );

            setHostProfiles((previous) => ({
                ...previous,
                ...profiles,
            }));

        } catch (error) {

            console.error(
                "Fetch RSVPs error:",
                error
            );

            setMyRsvps([]);
        }
    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        const loadEventsData = async () => {
            const upcomingEvents =
                await fetchUpcomingEvents();

            await fetchMyRsvps(
                upcomingEvents
            );

            if (isAlumni) {
                await fetchMyEvents();
            }
        };

        loadEventsData();
    }, [token]);


    /* =====================================================
       EVENT TYPE
    ===================================================== */

    const eventTypes = useMemo(() => {
        const types = events.map((event) => {
            if (event.isVirtual) {
                return "Virtual";
            }

            return "In Person";
        });

        return [
            "All Events",
            ...new Set(types),
        ];
    }, [events]);


    /* =====================================================
       FILTER EVENTS
    ===================================================== */

    const filteredEvents = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return events.filter((event) => {
            const searchableText = [
                event.title,
                event.description,
                event.location,
                event.organizer?.firstName,
                event.organizer?.lastName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query ||
                searchableText.includes(query);

            const matchesType =
                eventType === "All Events" ||
                (event.isVirtual
                    ? "Virtual"
                    : "In Person") === eventType;

            return (
                matchesSearch &&
                matchesType
            );
        });
    }, [
        events,
        search,
        eventType,
    ]);


    /* =====================================================
       RSVP CHECK
    ===================================================== */

    const isEventRSVPed = (eventId) => {
        return myRsvps.some(
            (entry) =>
                String(
                    entry.eventId?._id ||
                    entry.eventId
                ) === String(eventId) &&
                entry.rsvpStatus === "attending"
        );
    };


    /* =====================================================
       RSVP
    ===================================================== */

    const handleRsvp = async (eventId) => {
        if (!token) {
            toast.error(
                "Please login to RSVP."
            );
            return;
        }

        try {
            await axios.post(
                `${API_URL}/api/events/${eventId}/rsvp`,
                {
                    rsvpStatus: "attending",
                },
                authConfig
            );

            toast.success(
                "You're registered for this event."
            );

            await Promise.all([
                fetchUpcomingEvents(),
                fetchMyRsvps(),
            ]);

        } catch (error) {
            console.error(
                "RSVP error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to RSVP for this event."
            );
        }
    };


    /* =====================================================
       FETCH ATTENDEES
    ===================================================== */

    const fetchAttendees = async (eventId) => {
        if (!token || !isAlumni) return;

        try {
            const response = await axios.get(
                `${API_URL}/api/events/${eventId}/attendees`,
                authConfig
            );

            const attendeeList =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.attendees ||
                    response.data?.data ||
                    [];

            setAttendees((previous) => ({
                ...previous,
                [eventId]: attendeeList,
            }));

        } catch (error) {
            console.error(
                "Attendees error:",
                error
            );

            toast.error(
                "Unable to load attendees."
            );
        }
    };


    /* =====================================================
       CREATE EVENT
    ===================================================== */

    const handleCreateEvent = async (event) => {
        event.preventDefault();

        if (
            !form.title ||
            !form.description ||
            !form.eventDate ||
            !form.location
        ) {
            toast.error(
                "Please complete all required fields."
            );
            return;
        }

        try {
            setSubmitting(true);

            await axios.post(
                `${API_URL}/api/events/create`,
                form,
                authConfig
            );

            toast.success(
                "Event created successfully."
            );

            setForm({
                title: "",
                description: "",
                eventDate: "",
                location: "",
                isVirtual: false,
            });

            await fetchUpcomingEvents();
            await fetchMyEvents();

            setActiveTab("manage");

        } catch (error) {
            console.error(
                "Create event error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to create event."
            );

        } finally {
            setSubmitting(false);
        }
    };


    /* =====================================================
       DELETE EVENT
    ===================================================== */

    const handleDeleteEvent = async (eventId) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this event?"
            );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${API_URL}/api/events/${eventId}`,
                authConfig
            );

            toast.success(
                "Event deleted successfully."
            );

            await fetchUpcomingEvents();
            await fetchMyEvents();

        } catch (error) {
            console.error(
                "Delete event error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete event."
            );
        }
    };


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    const getDateParts = (value) => {
        if (!value) {
            return {
                day: "--",
                month: "TBD",
                year: "",
            };
        }

        const date =
            new Date(value);

        return {
            day: date.toLocaleDateString(
                "en-US",
                {
                    day: "2-digit",
                }
            ),
            month: date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                }
            ),
            year: date.toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                }
            ),
        };
    };


    const formatTime = (value) => {
        if (!value) return "Time TBD";

        return new Date(value).toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };


    const formatFullDate = (value) => {
        if (!value) return "Date TBD";

        return new Date(value).toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
            }
        );
    };


    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    const clearFilters = () => {
        setSearch("");
        setEventType("All Events");
    };


    const hasFilters =
        Boolean(search) ||
        eventType !== "All Events";


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-full bg-[#F8F9FF] px-4 py-5 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-7xl animate-pulse">

                    <div className="h-4 w-36 rounded bg-gray-200" />

                    <div className="mt-2 h-8 w-64 rounded bg-gray-200" />

                    <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-100" />

                    <div className="mt-6 h-14 rounded-xl border border-gray-200 bg-white" />

                    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (
                                <EventSkeleton
                                    key={item}
                                />
                            )
                        )}

                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="min-h-full bg-[#F8F9FF] px-4 py-5 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#004AC6]">
                            Alumni Community
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Community Events
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                            Join webinars, meetups, workshops,
                            and alumni-led sessions from your
                            network.
                        </p>

                    </div>


                    {/* EVENT COUNT */}

                    <div className="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-white px-3.5 py-2 shadow-sm">

                        <CalendarDays
                            size={15}
                            className="mr-2 text-[#004AC6]"
                        />

                        <span className="text-xs font-semibold text-gray-700">
                            {filteredEvents.length}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                            {filteredEvents.length === 1
                                ? "Event"
                                : "Events"}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    TABS
                ================================================= */}

                <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200">

                    <TabButton
                        active={
                            activeTab === "upcoming"
                        }
                        onClick={() =>
                            setActiveTab("upcoming")
                        }
                        icon={
                            <CalendarDays
                                size={15}
                            />
                        }
                        label="Upcoming Events"
                    />


                    <TabButton
                        active={
                            activeTab === "rsvps"
                        }
                        onClick={() =>
                            setActiveTab("rsvps")
                        }
                        icon={
                            <CheckCircle2
                                size={15}
                            />
                        }
                        label="My RSVPs"
                        count={
                            myRsvps.length
                        }
                    />


                    {isAlumni && (
                        <>
                            <TabButton
                                active={
                                    activeTab ===
                                    "create"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "create"
                                    )
                                }
                                icon={
                                    <Plus
                                        size={15}
                                    />
                                }
                                label="Create Event"
                            />

                            <TabButton
                                active={
                                    activeTab ===
                                    "manage"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "manage"
                                    )
                                }
                                icon={
                                    <ListChecks
                                        size={15}
                                    />
                                }
                                label="My Events"
                            />
                        </>
                    )}

                </div>


                {/* =================================================
                    UPCOMING EVENTS
                ================================================= */}

                {activeTab === "upcoming" && (

                    <>

                        {/* SEARCH */}

                        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">

                            <div className="flex flex-col gap-3 lg:flex-row">

                                <div className="relative flex-1">

                                    <Search
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search events, topics, locations..."
                                        className="h-11 w-full rounded-lg border border-gray-200 bg-[#FAFBFF] pl-10 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                                        >
                                            <X
                                                size={15}
                                            />
                                        </button>
                                    )}

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters(
                                            (value) =>
                                                !value
                                        )
                                    }
                                    className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition ${showFilters
                                        ? "border-[#004AC6] bg-blue-50 text-[#004AC6]"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md"
                                        }`}
                                >
                                    <Filter
                                        size={16}
                                    />

                                    Filters

                                    {hasFilters && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#004AC6] px-1.5 text-[10px] font-bold text-white">
                                            {[
                                                Boolean(
                                                    search
                                                ),
                                                eventType !==
                                                "All Events",
                                            ].filter(
                                                Boolean
                                            ).length}
                                        </span>
                                    )}
                                </button>

                            </div>


                            {showFilters && (
                                <div className="mt-3 border-t border-gray-100 pt-4">

                                    <FilterSelect
                                        label="Event Type"
                                        value={eventType}
                                        options={
                                            eventTypes
                                        }
                                        onChange={
                                            setEventType
                                        }
                                    />

                                </div>
                            )}


                            {hasFilters && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">

                                    <span className="text-xs font-medium text-gray-400">
                                        Active:
                                    </span>

                                    {search && (
                                        <FilterTag
                                            text={`"${search}"`}
                                            onRemove={() =>
                                                setSearch(
                                                    ""
                                                )
                                            }
                                        />
                                    )}

                                    {eventType !==
                                        "All Events" && (
                                            <FilterTag
                                                text={
                                                    eventType
                                                }
                                                onRemove={() =>
                                                    setEventType(
                                                        "All Events"
                                                    )
                                                }
                                            />
                                        )}

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="ml-1 text-xs font-bold text-[#004AC6] hover:underline"
                                    >
                                        Clear all
                                    </button>

                                </div>
                            )}

                        </div>


                        {/* EVENTS */}

                        {filteredEvents.length > 0 ? (

                            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {filteredEvents.map(
                                    (event) => (
                                        <EventCard
                                            key={event._id}
                                            event={event}
                                            hostProfiles={hostProfiles}
                                            isRSVPed={isEventRSVPed(event._id)}
                                            onRsvp={handleRsvp}
                                            onViewDetails={(eventId) =>
                                                navigate(`/student/events/${eventId}`)
                                            }
                                            isAlumni={isAlumni}
                                            onAttendees={fetchAttendees}
                                            attendees={attendees[event._id]}
                                        />
                                    )
                                )}

                            </div>

                        ) : (

                            <EmptyEvents
                                hasFilters={
                                    hasFilters
                                }
                                onClear={
                                    clearFilters
                                }
                            />

                        )}

                    </>

                )}


                {/* =================================================
                    MY RSVPS
                ================================================= */}

                {activeTab === "rsvps" && (

                    <div className="mt-6">

                        {myRsvps.length > 0 ? (

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                                {myRsvps.map(
                                    (entry) => (

                                        <RSVPCard
                                            key={entry._id}
                                            entry={entry}
                                            hostProfiles={hostProfiles}
                                        />

                                    )
                                )}

                            </div>

                        ) : (

                            <EmptyState
                                icon={
                                    <CheckCircle2
                                        size={25}
                                    />
                                }
                                title="No RSVPs yet"
                                description="Events you RSVP to will appear here."
                                actionLabel="Browse Events"
                                onClick={() =>
                                    setActiveTab(
                                        "upcoming"
                                    )
                                }
                            />

                        )}

                    </div>

                )}


                {/* =================================================
                    CREATE EVENT — ALUMNI ONLY
                ================================================= */}

                {activeTab === "create" &&
                    isAlumni && (

                        <CreateEventForm
                            form={form}
                            setForm={setForm}
                            submitting={
                                submitting
                            }
                            onSubmit={
                                handleCreateEvent
                            }
                        />

                    )}


                {/* =================================================
                    MANAGE EVENTS — ALUMNI ONLY
                ================================================= */}

                {activeTab === "manage" &&
                    isAlumni && (

                        <ManageEvents
                            events={myEvents}
                            attendees={
                                attendees
                            }
                            onAttendees={
                                fetchAttendees
                            }
                            onDelete={
                                handleDeleteEvent
                            }
                            formatFullDate={
                                formatFullDate
                            }
                            formatTime={
                                formatTime
                            }
                        />

                    )}

            </div>

        </div>
    );
};


/* =========================================================
   EVENT CARD
========================================================= */

const EventCard = ({
    event,
    hostProfiles,
    isRSVPed,
    onRsvp,
    onViewDetails,
    isAlumni,
    onAttendees,
    attendees,
}) => {

    const date =
        getDateParts(event.eventDate);


    const organizerId =
        typeof event?.organizer === "object"
            ? event?.organizer?._id
            : event?.organizer;

    const host =
        hostProfiles?.[String(organizerId)];

    const organizerName =
        `${host?.firstName || ""} ${host?.lastName || ""
            }`
            .trim() ||

        `${event?.organizer?.firstName || ""} ${event?.organizer?.lastName || ""
            }`
            .trim() ||

        "Alumni Member";

    const organizerImage =
        host?.profilePicture ||
        event?.organizer?.profilePicture ||
        "";

    const hostInitials =
        `${host?.firstName?.[0] || ""}${host?.lastName?.[0] || ""
            }`
            .toUpperCase() || "A";

    return (

        <article className="group flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg">


            {/* =================================================
                EVENT TOP
            ================================================= */}

            <div className="relative border-b border-gray-100 p-5">

                <div className="flex items-start gap-4">


                    {/* DATE BOX */}

                    <div className="flex h-[68px] w-[62px] shrink-0 flex-col overflow-hidden rounded-xl border border-blue-100 bg-blue-50 text-center">

                        <div className="bg-[#004AC6] py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                            {date.month}
                        </div>

                        <div className="flex flex-1 items-center justify-center">

                            <span className="text-xl font-bold text-[#004AC6]">
                                {date.day}
                            </span>

                        </div>

                    </div>


                    {/* TITLE */}

                    <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap gap-1.5">

                            {event.isVirtual ? (

                                <span className="inline-flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-1 text-[9px] font-bold text-purple-600">
                                    <Video
                                        size={11}
                                    />
                                    Virtual
                                </span>

                            ) : (

                                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-bold text-gray-500">
                                    <Building2
                                        size={11}
                                    />
                                    In Person
                                </span>

                            )}

                            {isRSVPed && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-1 text-[9px] font-bold text-green-600">
                                    <CheckCircle2
                                        size={11}
                                    />
                                    Registered
                                </span>
                            )}

                        </div>


                        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-5 text-gray-900">
                            {event.title}
                        </h3>

                    </div>

                </div>


                {/* TIME */}

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#004AC6]">

                    <Clock3 size={14} />

                    {formatTime(
                        event.eventDate
                    )}

                    <span className="text-gray-300">
                        •
                    </span>

                    <span className="text-gray-500">
                        {date.year}
                    </span>

                </div>

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="flex flex-1 flex-col p-5">

                <p className="line-clamp-3 text-sm leading-5 text-gray-500">
                    {event.description ||
                        "Join this community event and connect with members of the alumni network."}
                </p>


                {/* EVENT INFO */}

                <div className="mt-5 space-y-2">

                    <EventInfo
                        icon={
                            <MapPin
                                size={14}
                            />
                        }
                        text={
                            event.location ||
                            "Location TBD"
                        }
                    />

                    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">

                        {/* HOST IMAGE */}

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-[10px] font-bold text-[#004AC6]">

                            {organizerImage ? (
                                <img
                                    src={organizerImage}
                                    alt={organizerName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                hostInitials
                            )}

                        </div>

                        {/* HOST NAME */}

                        <div className="min-w-0">

                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                Hosted by
                            </p>

                            <p className="truncate text-xs font-bold text-gray-700">
                                {organizerName}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="mt-auto border-t border-gray-100 pt-5">

                    <div className="grid grid-cols-2 gap-2">

                        <Link
                            to={`/student/events/${event._id}`}
                            className="flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-sm transition hover:border-[#004AC6] hover:bg-blue-50 hover:text-[#004AC6]"
                        >
                            View Details
                        </Link>

                        <button
                            type="button"
                            disabled={isRSVPed}
                            onClick={() =>
                                onRsvp(event._id)
                            }
                            className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold shadow-sm transition ${isRSVPed
                                ? "cursor-default border-green-200 bg-green-50 text-green-600"
                                : "border-[#003da8] bg-[#004AC6] text-white hover:bg-[#003da8]"
                                }`}
                        >
                            {isRSVPed ? (
                                <>
                                    <CheckCircle2 size={14} />
                                    Registered
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={14} />
                                    RSVP
                                </>
                            )}
                        </button>

                    </div>

                </div>

            </div>

        </article>
    );
};


/* =========================================================
   EVENT INFO
========================================================= */

const EventInfo = ({
    icon,
    text,
}) => (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">

        <span className="shrink-0 text-[#004AC6]">
            {icon}
        </span>

        <span className="truncate text-xs font-semibold text-gray-600">
            {text}
        </span>

    </div>
);


/* =========================================================
   RSVP CARD
========================================================= */

const RSVPCard = ({
    entry,
    hostProfiles,
}) => {
    const event =
        entry.eventId || {};

    const organizerId =
        typeof event.organizer === "object"
            ? event.organizer._id
            : event.organizer;

    const host =
        hostProfiles?.[organizerId];

    const organizerName =
        `${host?.firstName || ""} ${host?.lastName || ""
            }`
            .trim() ||
        `${event.organizer?.firstName || ""} ${event.organizer?.lastName || ""
            }`
            .trim() ||
        "Alumni Member";

    const hostProfilePicture =
        host?.profilePicture ||
        event.organizer?.profilePicture ||
        "";

    const hostInitials =
        `${host?.firstName?.[0] || ""}${host?.lastName?.[0] || ""
            }`
            .toUpperCase() ||
        "A";

    return (
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            {/* EVENT HEADER */}

            <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#004AC6]">

                    <CalendarDays size={19} />

                </div>

                <div className="min-w-0">

                    <h3 className="truncate text-sm font-bold text-gray-900">
                        {event.title || "Event"}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        {formatFullDate(
                            event.eventDate
                        )}
                    </p>

                </div>

            </div>


            {/* EVENT INFORMATION */}

            <div className="mt-4 space-y-2">

                <EventInfo
                    icon={
                        <Clock3 size={13} />
                    }
                    text={formatTime(
                        event.eventDate
                    )}
                />

                <EventInfo
                    icon={
                        <MapPin size={13} />
                    }
                    text={
                        event.location ||
                        "Location TBD"
                    }
                />

                {/* HOST NAME */}

                <EventInfo
                    icon={
                        <UserRound size={13} />
                    }
                    text={`Hosted by ${organizerName}`}
                />

            </div>


            {/* HOST */}

            <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-[#004AC6]">

                    {hostProfilePicture ? (
                        <img
                            src={hostProfilePicture}
                            alt={organizerName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        hostInitials
                    )}

                </div>

                <div className="min-w-0">

                    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                        Event Host
                    </p>

                    <p className="truncate text-xs font-bold text-gray-800">
                        {organizerName}
                    </p>

                </div>

            </div>


            {/* RSVP STATUS */}

            <div className="mt-4">

                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-600">

                    <CheckCircle2 size={12} />

                    {entry.rsvpStatus || "attending"}

                </span>

            </div>

        </article>
    );
};


/* =========================================================
   CREATE EVENT
========================================================= */

const CreateEventForm = ({
    form,
    setForm,
    submitting,
    onSubmit,
}) => {

    return (

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#004AC6]">

                    <Plus size={18} />

                </div>

                <div>

                    <h2 className="text-base font-bold text-gray-900">
                        Host a New Event
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                        Create an event for your alumni community.
                    </p>

                </div>

            </div>


            <form
                onSubmit={onSubmit}
                className="mt-6 space-y-5"
            >

                <div className="grid gap-5 md:grid-cols-2">

                    <InputField
                        label="Event Title"
                        value={form.title}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                title: value,
                            })
                        }
                        placeholder="e.g. Alumni Career Workshop"
                    />


                    <InputField
                        label="Location"
                        value={form.location}
                        onChange={(value) =>
                            setForm({
                                ...form,
                                location: value,
                            })
                        }
                        placeholder="e.g. Ahmedabad"
                    />

                </div>


                <div>

                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                        Description
                    </label>

                    <textarea
                        value={
                            form.description
                        }
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description:
                                    event.target.value,
                            })
                        }
                        placeholder="Tell the community what this event is about..."
                        className="min-h-32 w-full resize-y rounded-lg border border-gray-200 bg-[#FAFBFF] px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                        required
                    />

                </div>


                <div className="grid gap-5 md:grid-cols-2">

                    <div>

                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Date & Time
                        </label>

                        <input
                            type="datetime-local"
                            value={
                                form.eventDate
                            }
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    eventDate:
                                        event.target.value,
                                })
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 bg-[#FAFBFF] px-3 text-sm text-gray-700 outline-none focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                            required
                        />

                    </div>


                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-[#FAFBFF] px-3.5 text-sm font-semibold text-gray-700">

                        <input
                            type="checkbox"
                            checked={
                                form.isVirtual
                            }
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    isVirtual:
                                        event.target
                                            .checked,
                                })
                            }
                            className="h-4 w-4 accent-[#004AC6]"
                        />

                        <div>

                            <p className="text-xs font-bold">
                                Virtual Event
                            </p>

                            <p className="text-[10px] text-gray-400">
                                This event will be held online.
                            </p>

                        </div>

                    </label>

                </div>


                <div className="flex justify-end border-t border-gray-100 pt-5">

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#003da8] bg-[#004AC6] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        <Plus size={14} />

                        {submitting
                            ? "Creating..."
                            : "Create Event"}

                    </button>

                </div>

            </form>

        </section>
    );
};


/* =========================================================
   MANAGE EVENTS
========================================================= */

const ManageEvents = ({
    events,
    attendees,
    onAttendees,
    onDelete,
}) => {

    return (

        <div className="mt-6 space-y-4">

            {events.length > 0 ? (

                events.map((event) => (

                    <section
                        key={event._id}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div>

                                <h3 className="text-base font-bold text-gray-900">
                                    {event.title}
                                </h3>

                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">

                                    <span className="flex items-center gap-1">
                                        <CalendarDays
                                            size={13}
                                        />
                                        {formatFullDate(
                                            event.eventDate
                                        )}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <MapPin
                                            size={13}
                                        />
                                        {event.location}
                                    </span>

                                </div>

                            </div>


                            <div className="flex flex-wrap gap-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        onAttendees(
                                            event._id
                                        )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 hover:shadow-md"
                                >

                                    <ListChecks
                                        size={14}
                                    />

                                    View Attendees

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        onDelete(
                                            event._id
                                        )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 hover:shadow-md"
                                >

                                    <Trash2
                                        size={14}
                                    />

                                    Delete

                                </button>

                            </div>

                        </div>


                        {attendees[
                            event._id
                        ]?.length > 0 && (

                                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">

                                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                        Attendees
                                    </p>

                                    <div className="flex flex-wrap gap-2">

                                        {attendees[
                                            event._id
                                        ].map(
                                            (
                                                attendee
                                            ) => (

                                                <span
                                                    key={
                                                        attendee._id
                                                    }
                                                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 shadow-sm"
                                                >
                                                    {attendee
                                                        .userId
                                                        ?.firstName ||
                                                        "Guest"}{" "}
                                                    {attendee
                                                        .userId
                                                        ?.lastName ||
                                                        ""}
                                                </span>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                    </section>

                ))

            ) : (

                <EmptyState
                    icon={
                        <CalendarDays
                            size={25}
                        />
                    }
                    title="No events created yet"
                    description="Events you create will appear here."
                />

            )}

        </div>
    );
};


/* =========================================================
   INPUT FIELD
========================================================= */

const InputField = ({
    label,
    value,
    onChange,
    placeholder,
}) => {

    return (

        <div>

            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                {label}
            </label>

            <input
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border border-gray-200 bg-[#FAFBFF] px-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                required
            />

        </div>
    );
};


/* =========================================================
   TAB BUTTON
========================================================= */

const TabButton = ({
    active,
    onClick,
    icon,
    label,
    count,
}) => {

    return (

        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${active
                ? "border-[#004AC6] text-[#004AC6]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
        >

            {icon}

            {label}

            {typeof count === "number" && (
                <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${active
                        ? "bg-blue-50 text-[#004AC6]"
                        : "bg-gray-100 text-gray-500"
                        }`}
                >
                    {count}
                </span>
            )}

        </button>
    );
};


/* =========================================================
   FILTER SELECT
========================================================= */

const FilterSelect = ({
    label,
    value,
    options,
    onChange,
}) => {

    return (

        <label className="block max-w-sm">

            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {label}
            </span>

            <div className="relative">

                <select
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-xs font-semibold text-gray-600 outline-none focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100"
                >

                    {options.map(
                        (option) => (
                            <option
                                key={option}
                                value={option}
                            >
                                {option}
                            </option>
                        )
                    )}

                </select>

                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

            </div>

        </label>
    );
};


/* =========================================================
   FILTER TAG
========================================================= */

const FilterTag = ({
    text,
    onRemove,
}) => {

    return (

        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#004AC6]">

            {text}

            <button
                type="button"
                onClick={onRemove}
                className="rounded-full p-0.5 hover:bg-blue-100"
            >
                <X size={11} />
            </button>

        </span>
    );
};


/* =========================================================
   EMPTY EVENTS
========================================================= */

const EmptyEvents = ({
    hasFilters,
    onClear,
}) => {

    return (

        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[#004AC6]">

                <CalendarDays
                    size={24}
                />

            </div>

            <h3 className="mt-4 text-base font-bold text-gray-900">
                No events found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
                {hasFilters
                    ? "Try changing your search or filters to find more events."
                    : "There are no upcoming events available right now. Check back soon."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 rounded-lg border border-[#003da8] bg-[#004AC6] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#003da8] hover:shadow-md"
                >
                    Clear Filters
                </button>
            )}

        </div>
    );
};


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
    icon,
    title,
    description,
    actionLabel,
    onClick,
}) => {

    return (

        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[#004AC6]">

                {icon}

            </div>

            <h3 className="mt-4 text-base font-bold text-gray-900">
                {title}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                {description}
            </p>

            {actionLabel && (
                <button
                    type="button"
                    onClick={onClick}
                    className="mt-5 rounded-lg border border-[#003da8] bg-[#004AC6] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#003da8] hover:shadow-md"
                >
                    {actionLabel}
                </button>
            )}

        </div>
    );
};


/* =========================================================
   EVENT SKELETON
========================================================= */

const EventSkeleton = () => {

    return (

        <div className="min-h-[420px] rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex gap-4">

                <div className="h-[68px] w-[62px] rounded-xl bg-gray-200" />

                <div className="flex-1">

                    <div className="h-5 w-20 rounded bg-gray-200" />

                    <div className="mt-3 h-5 w-4/5 rounded bg-gray-200" />

                </div>

            </div>

            <div className="mt-6 h-4 w-32 rounded bg-gray-100" />

            <div className="mt-6 space-y-2">

                <div className="h-3 w-full rounded bg-gray-100" />

                <div className="h-3 w-5/6 rounded bg-gray-100" />

                <div className="h-3 w-4/6 rounded bg-gray-100" />

            </div>

            <div className="mt-6 space-y-2">

                <div className="h-10 rounded bg-gray-100" />

                <div className="h-10 rounded bg-gray-100" />

            </div>

            <div className="mt-6 h-10 rounded bg-gray-200" />

        </div>
    );
};


/* =========================================================
   HELPERS
========================================================= */

const getDateParts = (value) => {

    if (!value) {
        return {
            day: "--",
            month: "TBD",
            year: "",
        };
    }

    const date =
        new Date(value);

    return {
        day: date.toLocaleDateString(
            "en-US",
            {
                day: "2-digit",
            }
        ),
        month: date.toLocaleDateString(
            "en-US",
            {
                month: "short",
            }
        ),
        year: date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
            }
        ),
    };
};


const formatTime = (value) => {

    if (!value) return "Time TBD";

    return new Date(
        value
    ).toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
        }
    );
};


const formatFullDate = (value) => {

    if (!value) return "Date TBD";

    return new Date(
        value
    ).toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
};


export default EventsPage;