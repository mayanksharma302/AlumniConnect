import React, {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    CalendarDays,
    Clock3,
    MapPin,
    Plus,
    Search,
    Trash2,
    Users,
    Video,
    X,
    ExternalLink,
    ChevronDown,
    CheckCircle2,
} from "lucide-react";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";


const Events = () => {

    /* =====================================================
       STATE
    ===================================================== */

    const [events, setEvents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [creating, setCreating] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [attendeesEvent, setAttendeesEvent] =
        useState(null);

    const [attendees, setAttendees] =
        useState([]);

    const [loadingAttendees, setLoadingAttendees] =
        useState(false);


    /* =====================================================
       FORM
    ===================================================== */

    const initialForm = {
        title: "",
        description: "",
        eventDate: "",
        location: "",
        isVirtual: false,
    };


    const [form, setForm] =
        useState(initialForm);


    /* =====================================================
       AUTH
    ===================================================== */

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
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        };

    };


    /* =====================================================
       FETCH MY EVENTS
       
       GET /api/events/my-events
    ===================================================== */

    const fetchMyEvents = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/api/events/my-events`,
                    getConfig()
                );

            const data =
                response.data;


            if (
                Array.isArray(
                    data?.data
                )
            ) {

                setEvents(
                    data.data
                );

            } else if (
                Array.isArray(
                    data?.events
                )
            ) {

                setEvents(
                    data.events
                );

            } else if (
                Array.isArray(data)
            ) {

                setEvents(data);

            } else {

                setEvents([]);

            }

        } catch (err) {

            console.error(
                "Fetch events error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load your events."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchMyEvents();

    }, []);


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (
        e
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]:
                    type ===
                        "checkbox"
                        ? checked
                        : value,
            })
        );

    };


    /* =====================================================
       CREATE EVENT
       
       POST /api/events/create
    ===================================================== */

    const handleCreateEvent = async (
        e
    ) => {

        e.preventDefault();

        setCreating(true);
        setError("");


        try {

            const payload = {
                title:
                    form.title.trim(),

                description:
                    form.description.trim(),

                eventDate:
                    form.eventDate,

                location:
                    form.location.trim(),

                isVirtual:
                    form.isVirtual,
            };


            console.log(
                "Creating event:",
                payload
            );


            await axios.post(
                `${API_URL}/api/events/create`,
                payload,
                getConfig()
            );


            setForm(
                initialForm
            );

            setShowCreateModal(
                false
            );


            await fetchMyEvents();

        } catch (err) {

            console.error(
                "Create event error:",
                err?.response?.data ||
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to create the event."
            );

        } finally {

            setCreating(false);

        }

    };


    /* =====================================================
       DELETE EVENT
       
       DELETE /api/events/:eventId
    ===================================================== */

    const handleDelete = async (
        eventId
    ) => {

        if (!eventId) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this event?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(
                eventId
            );


            await axios.delete(
                `${API_URL}/api/events/${eventId}`,
                getConfig()
            );


            setEvents(
                (previous) =>
                    previous.filter(
                        (event) =>
                            getEventId(
                                event
                            ) !== eventId
                    )
            );

        } catch (err) {

            console.error(
                "Delete event error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to delete the event."
            );

        } finally {

            setDeletingId(
                null
            );

        }

    };


    /* =====================================================
       GET ATTENDEES
       
       GET /api/events/:eventId/attendees
    ===================================================== */

    const handleViewAttendees = async (
        event
    ) => {

        const eventId =
            getEventId(
                event
            );


        if (!eventId) {
            return;
        }


        setAttendeesEvent(
            event
        );

        setAttendees([]);

        setLoadingAttendees(
            true
        );


        try {

            const response =
                await axios.get(
                    `${API_URL}/api/events/${eventId}/attendees`,
                    getConfig()
                );


            const data =
                response.data;


            if (
                Array.isArray(
                    data?.attendees
                )
            ) {

                setAttendees(
                    data.attendees
                );

            } else if (
                Array.isArray(
                    data?.data
                )
            ) {

                setAttendees(
                    data.data
                );

            } else if (
                Array.isArray(data)
            ) {

                setAttendees(data);

            }

        } catch (err) {

            console.error(
                "Attendees error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load attendees."
            );

        } finally {

            setLoadingAttendees(
                false
            );

        }

    };


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredEvents =
        events.filter(
            (event) => {

                const text = [
                    event?.title,
                    event?.description,
                    event?.location,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    search.toLowerCase()
                );

            }
        );


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="space-y-6">

                <div className="flex items-center justify-between">

                    <div className="space-y-2">

                        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />

                        <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />

                    </div>


                    <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200" />

                </div>


                <div className="h-16 animate-pulse rounded-2xl bg-gray-200" />


                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                    {[1, 2, 3, 4].map(
                        (item) => (

                            <div
                                key={
                                    item
                                }
                                className="h-64 animate-pulse rounded-2xl bg-gray-200"
                            />

                        )
                    )}

                </div>

            </div>

        );

    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div className="space-y-6">


            {/* =================================================
               HEADER
            ================================================= */}

            <section>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <p className="mb-1 text-[9px] font-black uppercase tracking-[2px] text-[#004AC6]">
                            Alumni Community
                        </p>


                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                            Events
                        </h1>


                        <p className="mt-2 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm">

                            Create and manage events for
                            students and fellow alumni.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setShowCreateModal(
                                true
                            )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#004AC6] px-5 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#0038A8]"
                    >

                        <Plus
                            size={15}
                        />

                        Create Event

                    </button>

                </div>

            </section>


            {/* =================================================
               ERROR
            ================================================= */}

            {error && (

                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                    <p className="text-[10px] font-semibold text-red-600">
                        {error}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="text-red-400 hover:text-red-600"
                    >

                        <X
                            size={15}
                        />

                    </button>

                </div>

            )}


            {/* =================================================
               INFO
            ================================================= */}

            <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#004AC6] shadow-sm">

                        <CalendarDays
                            size={17}
                        />

                    </div>


                    <div>

                        <p className="text-xs font-bold text-blue-900">
                            Bring the alumni community together.
                        </p>


                        <p className="mt-0.5 text-[10px] text-blue-700/70">
                            Host workshops, networking sessions, webinars and meetups.
                        </p>

                    </div>

                </div>


                <div className="text-[10px] font-bold text-[#004AC6]">

                    {events.length}{" "}
                    {events.length === 1
                        ? "event"
                        : "events"}{" "}
                    hosted

                </div>

            </div>


            {/* =================================================
               SEARCH
            ================================================= */}

            <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative flex-1">

                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />


                    <input
                        type="text"
                        value={
                            search
                        }
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search your events..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-xs font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                    />

                </div>


                <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[10px] font-semibold text-gray-500">

                    <CalendarDays
                        size={14}
                        className="text-[#004AC6]"
                    />

                    {filteredEvents.length}{" "}
                    Results

                </div>

            </div>


            {/* =================================================
               EVENTS
            ================================================= */}

            {filteredEvents.length ===
                0 ? (

                <EmptyEvents
                    search={
                        Boolean(
                            search
                        )
                    }
                    onCreate={() =>
                        setShowCreateModal(
                            true
                        )
                    }
                />

            ) : (

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                    {filteredEvents.map(
                        (
                            event
                        ) => (

                            <EventCard
                                key={
                                    getEventId(
                                        event
                                    )
                                }
                                event={
                                    event
                                }
                                deleting={
                                    deletingId ===
                                    getEventId(
                                        event
                                    )
                                }
                                onDelete={
                                    handleDelete
                                }
                                onAttendees={
                                    handleViewAttendees
                                }
                            />

                        )
                    )}

                </div>

            )}


            {/* =================================================
               CREATE MODAL
            ================================================= */}

            {showCreateModal && (

                <CreateEventModal
                    form={
                        form
                    }
                    creating={
                        creating
                    }
                    onChange={
                        handleChange
                    }
                    onClose={() =>
                        setShowCreateModal(
                            false
                        )
                    }
                    onSubmit={
                        handleCreateEvent
                    }
                />

            )}


            {/* =================================================
               ATTENDEES MODAL
            ================================================= */}

            {attendeesEvent && (

                <AttendeesModal
                    event={
                        attendeesEvent
                    }
                    attendees={
                        attendees
                    }
                    loading={
                        loadingAttendees
                    }
                    onClose={() =>
                        setAttendeesEvent(
                            null
                        )
                    }
                />

            )}

        </div>

    );

};


/* =========================================================
   EVENT CARD
========================================================= */

const EventCard = ({
    event,
    deleting,
    onDelete,
    onAttendees,
}) => {

    const title =
        event?.title ||
        "Untitled Event";


    const description =
        event?.description ||
        "No description available.";


    const location =
        event?.location ||
        "Location not specified";


    const eventDate =
        event?.eventDate;


    const isVirtual =
        Boolean(
            event?.isVirtual
        );


    const eventId =
        getEventId(
            event
        );


    return (

        <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">


            {/* =================================================
               TOP BANNER
            ================================================= */}

            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#003A9B] via-[#004AC6] to-[#527DFF]">

                <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />

                <div className="absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-white/5" />


                <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">

                    <CalendarDays
                        size={21}
                    />

                </div>


                <span className="absolute bottom-4 left-5 rounded-md bg-white px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-[#004AC6]">

                    {isVirtual
                        ? "Virtual Event"
                        : "Community Event"}

                </span>

            </div>


            {/* =================================================
               CONTENT
            ================================================= */}

            <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                        <h2 className="text-sm font-bold text-gray-900">
                            {title}
                        </h2>


                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-400">
                            {description}
                        </p>

                    </div>


                    <div className="shrink-0 rounded-xl bg-blue-50 px-2.5 py-2 text-center">

                        <div className="text-[8px] font-black uppercase tracking-wider text-[#004AC6]">
                            Event
                        </div>

                    </div>

                </div>


                {/* =================================================
                   META
                ================================================= */}

                <div className="mt-5 space-y-2.5">


                    <MetaRow
                        icon={
                            <CalendarDays
                                size={13}
                            />
                        }
                        text={
                            formatEventDate(
                                eventDate
                            )
                        }
                    />


                    <MetaRow
                        icon={
                            <Clock3
                                size={13}
                            />
                        }
                        text={
                            formatEventTime(
                                eventDate
                            )
                        }
                    />


                    <MetaRow
                        icon={
                            isVirtual ? (
                                <Video
                                    size={13}
                                />
                            ) : (
                                <MapPin
                                    size={13}
                                />
                            )
                        }
                        text={
                            isVirtual
                                ? "Online / Virtual"
                                : location
                        }
                    />

                </div>

            </div>


            {/* =================================================
               FOOTER
            ================================================= */}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3.5">


                <button
                    type="button"
                    onClick={() =>
                        onAttendees(
                            event
                        )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[9px] font-bold text-gray-600 transition hover:border-blue-200 hover:text-[#004AC6]"
                >

                    <Users
                        size={12}
                    />

                    View Attendees

                </button>


                <div className="flex items-center gap-1">

                    {event?.meetingLink && (

                        <a
                            href={
                                event.meetingLink
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-bold text-[#004AC6] hover:bg-blue-50"
                        >

                            Join

                            <ExternalLink
                                size={11}
                            />

                        </a>

                    )}


                    <button
                        type="button"
                        disabled={
                            deleting
                        }
                        onClick={() =>
                            onDelete(
                                eventId
                            )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    >

                        <Trash2
                            size={12}
                        />

                        {deleting
                            ? "Deleting..."
                            : "Delete"}

                    </button>

                </div>

            </div>

        </article>

    );

};


/* =========================================================
   META ROW
========================================================= */

const MetaRow = ({
    icon,
    text,
}) => {

    return (

        <div className="flex items-center gap-2.5 text-[10px] font-medium text-gray-500">

            <span className="text-[#004AC6]">
                {icon}
            </span>


            <span className="truncate">
                {text}
            </span>

        </div>

    );

};


/* =========================================================
   CREATE EVENT MODAL
========================================================= */

const CreateEventModal = ({
    form,
    creating,
    onChange,
    onClose,
    onSubmit,
}) => {

    return (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">


                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Create Event
                        </h2>


                        <p className="mt-1 text-[9px] text-gray-400">
                            Create an event for the alumni community.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>


                {/* FORM */}

                <form
                    onSubmit={
                        onSubmit
                    }
                    className="overflow-y-auto p-5"
                >

                    <div className="space-y-4">


                        <FormInput
                            label="Event Title"
                            name="title"
                            value={
                                form.title
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. React Developer Career Workshop"
                            required
                        />


                        <div>

                            <label className="mb-1.5 block text-[10px] font-bold text-gray-600">

                                Description

                                <span className="ml-0.5 text-red-500">
                                    *
                                </span>

                            </label>


                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    onChange
                                }
                                rows={5}
                                required
                                placeholder="Describe what the event is about..."
                                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                            />

                        </div>


                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                            <div>

                                <label className="mb-1.5 block text-[10px] font-bold text-gray-600">

                                    Event Date & Time

                                    <span className="ml-0.5 text-red-500">
                                        *
                                    </span>

                                </label>


                                <input
                                    type="datetime-local"
                                    name="eventDate"
                                    value={
                                        form.eventDate
                                    }
                                    onChange={
                                        onChange
                                    }
                                    required
                                    className="h-10 w-full rounded-xl border border-gray-200 px-3.5 text-xs text-gray-700 outline-none transition focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                                />

                            </div>


                            <FormInput
                                label="Location"
                                name="location"
                                value={
                                    form.location
                                }
                                onChange={
                                    onChange
                                }
                                placeholder="e.g. Ahmedabad / Google Meet"
                                required
                            />

                        </div>


                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">

                            <input
                                type="checkbox"
                                name="isVirtual"
                                checked={
                                    form.isVirtual
                                }
                                onChange={
                                    onChange
                                }
                                className="h-4 w-4 accent-[#004AC6]"
                            />


                            <div>

                                <p className="text-[10px] font-bold text-gray-700">
                                    This is a virtual event
                                </p>


                                <p className="mt-0.5 text-[9px] text-gray-400">
                                    Mark this if the event will be held online.
                                </p>

                            </div>

                        </label>

                    </div>


                    {/* ACTIONS */}

                    <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="rounded-lg border border-gray-200 px-5 py-2.5 text-[10px] font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={
                                creating
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-[#004AC6] px-5 py-2.5 text-[10px] font-bold text-white hover:bg-[#0038A8] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {creating ? (

                                <>
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>

                            ) : (

                                <>
                                    <CheckCircle2
                                        size={13}
                                    />

                                    Create Event
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};


/* =========================================================
   ATTENDEES MODAL
========================================================= */

const AttendeesModal = ({
    event,
    attendees,
    loading,
    onClose,
}) => {

    return (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

            <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">


                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Event Attendees
                        </h2>


                        <p className="mt-1 max-w-sm truncate text-[9px] text-gray-400">
                            {event?.title}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>


                <div className="max-h-[60vh] overflow-y-auto p-5">

                    {loading ? (

                        <div className="flex items-center justify-center py-12">

                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#004AC6] border-t-transparent" />

                        </div>

                    ) : attendees.length ===
                        0 ? (

                        <div className="py-12 text-center">

                            <Users
                                size={25}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 text-xs font-bold text-gray-600">
                                No attendees yet
                            </p>


                            <p className="mt-1 text-[10px] text-gray-400">
                                Students who RSVP as attending will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-2">

                            {attendees.map(
                                (
                                    attendee,
                                    index
                                ) => (

                                    <AttendeeRow
                                        key={
                                            attendee?._id ||
                                            attendee?.userId?._id ||
                                            index
                                        }
                                        attendee={
                                            attendee
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

};


/* =========================================================
   ATTENDEE
========================================================= */

const AttendeeRow = ({
    attendee,
}) => {

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


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


    useEffect(() => {

        const fetchProfile = async () => {

            /*
             * Depending on the populated attendee response,
             * userId may be:
             *
             * attendee.userId._id
             * attendee.userId
             * attendee.user._id
             * attendee.user._id
             */

            const userId =
                attendee?.userId?._id ||
                attendee?.userId ||
                attendee?.user?._id ||
                attendee?.user?.id ||
                attendee?.user?._id ||
                attendee?._id;


            if (!userId) {

                console.warn(
                    "No attendee user ID found:",
                    attendee
                );

                setLoading(false);
                return;

            }


            try {

                const token =
                    getToken();


                const response =
                    await axios.get(
                        `${API_URL}/api/profile/get-profile/${userId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                console.log(
                    "Attendee profile:",
                    response.data
                );


                /*
                 * Your profile API response is:
                 *
                 * {
                 *   message: "...",
                 *   profile: {...}
                 * }
                 */

                setProfile(
                    response.data?.profile ||
                    response.data
                );

            } catch (error) {

                console.error(
                    "Attendee profile error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProfile();

    }, [attendee]);


    /* =====================================================
       NAME
    ===================================================== */

    const name = loading
        ? "Loading..."
        : profile?.firstName
            ? `${profile.firstName} ${profile.lastName || ""
                }`.trim()
            : "Alumni Member";


    /* =====================================================
       IMAGE
    ===================================================== */

    const image =
        profile?.profilePicture ||
        null;


    return (

        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">

            {/* PROFILE IMAGE */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-[10px] font-bold text-[#004AC6]">

                {image ? (

                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display =
                                "none";
                        }}
                    />

                ) : (

                    getInitials(
                        name ===
                            "Loading..."
                            ? "AM"
                            : name
                    )

                )}

            </div>


            {/* USER INFO */}

            <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-bold text-gray-800">

                    {name}

                </p>


                {profile?.professionalHeadline && (

                    <p className="truncate text-[9px] text-gray-400">

                        {
                            profile.professionalHeadline
                        }

                    </p>

                )}


                {profile?.location?.city && (

                    <p className="truncate text-[9px] text-gray-400">

                        {
                            profile.location.city
                        }

                        {profile.location.state
                            ? `, ${profile.location.state}`
                            : ""}

                    </p>

                )}

            </div>

        </div>

    );

};


/* =========================================================
   EMPTY
========================================================= */

const EmptyEvents = ({
    search,
    onCreate,
}) => {

    return (

        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-5 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#004AC6]">

                {search ? (
                    <Search
                        size={23}
                    />
                ) : (
                    <CalendarDays
                        size={23}
                    />
                )}

            </div>


            <h2 className="text-sm font-bold text-gray-800">

                {search
                    ? "No events found"
                    : "No events hosted yet"}

            </h2>


            <p className="mt-2 max-w-sm text-[10px] leading-5 text-gray-400">

                {search
                    ? "Try a different search term."
                    : "Create your first event and bring students and alumni together."}

            </p>


            {!search && (

                <button
                    type="button"
                    onClick={
                        onCreate
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#004AC6] px-4 py-2.5 text-[10px] font-bold text-white"
                >

                    <Plus
                        size={13}
                    />

                    Create Your First Event

                </button>

            )}

        </div>

    );

};


/* =========================================================
   FORM INPUT
========================================================= */

const FormInput = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
}) => {

    return (

        <div>

            <label className="mb-1.5 block text-[10px] font-bold text-gray-600">

                {label}

                {required && (

                    <span className="ml-0.5 text-red-500">
                        *
                    </span>

                )}

            </label>


            <input
                type="text"
                name={name}
                value={
                    value
                }
                onChange={
                    onChange
                }
                placeholder={
                    placeholder
                }
                required={
                    required
                }
                className="h-10 w-full rounded-xl border border-gray-200 px-3.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
            />

        </div>

    );

};


/* =========================================================
   HELPERS
========================================================= */

const getEventId = (
    event
) => {

    return (
        event?._id ||
        event?.id
    );

};


const getInitials = (
    name = ""
) => {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (word) =>
                word[0]?.toUpperCase()
        )
        .join("") || "U";

};


const formatEventDate = (
    value
) => {

    if (!value) {
        return "Date not specified";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date not specified";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

};


const formatEventTime = (
    value
) => {

    if (!value) {
        return "Time not specified";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Time not specified";

    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
        }
    );

};


export default Events;