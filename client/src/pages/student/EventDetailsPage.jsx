import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Users,
    Video,
    Building2,
    UserRound,
    Share2,
    Bookmark,
    ChevronRight,
    Info,
    Sparkles,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const EventDetailsPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [myRsvps, setMyRsvps] = useState([]);
    const [attendees, setAttendees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);

    const [hostProfile, setHostProfile] = useState(null);
    const [hostLoading, setHostLoading] = useState(false);

    const token =
        sessionStorage.getItem("accessToken");

    const user = JSON.parse(
        sessionStorage.getItem("user") || "{}"
    );

    const isAlumni =
        user?.role === "alumni";

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };


    /* =====================================================
       LOAD EVENT
    ===================================================== */

    useEffect(() => {
        loadEvent();
    }, [eventId]);


    const loadEvent = async () => {
        if (!token || !eventId) return;

        try {
            setLoading(true);

            /*
             * Your currently existing API is:
             *
             * GET /api/events/upcoming
             *
             * So we use that endpoint and find the
             * requested event by ID.
             *
             * This avoids assuming a GET /events/:id
             * endpoint that hasn't been confirmed.
             */

            const [
                eventsResponse,
                rsvpResponse,
            ] = await Promise.all([
                axios.get(
                    `${API_URL}/api/events/upcoming`,
                    authConfig
                ),
                axios.get(
                    `${API_URL}/api/events/my-rsvps`,
                    authConfig
                ),
            ]);

            const eventList =
                Array.isArray(eventsResponse.data)
                    ? eventsResponse.data
                    : eventsResponse.data?.events ||
                    eventsResponse.data?.data ||
                    [];

            const rsvpList =
                Array.isArray(rsvpResponse.data)
                    ? rsvpResponse.data
                    : rsvpResponse.data?.data ||
                    rsvpResponse.data?.rsvps ||
                    [];

            const selectedEvent =
                eventList.find(
                    (item) =>
                        String(item._id) ===
                        String(eventId)
                );

            if (!selectedEvent) {
                toast.error(
                    "Event could not be found."
                );

                navigate("/events");
                return;
            }

            setEvents(eventList);
            setEvent(selectedEvent);
            setMyRsvps(rsvpList);

            // Fetch complete organizer profile
            const organizerId =
                selectedEvent?.organizer?._id ||
                selectedEvent?.organizer;

            if (organizerId) {
                try {
                    setHostLoading(true);

                    const profileResponse = await axios.get(
                        `${API_URL}/api/profile/get-profile/${organizerId}`,
                        authConfig
                    );

                    console.log(
                        "Event host profile:",
                        profileResponse.data
                    );

                    setHostProfile(
                        profileResponse.data?.profile || null
                    );

                } catch (profileError) {
                    console.error(
                        "Unable to load event host profile:",
                        profileError
                    );

                    // We still have organizer data from the event
                    setHostProfile(
                        typeof selectedEvent.organizer === "object"
                            ? selectedEvent.organizer
                            : null
                    );

                } finally {
                    setHostLoading(false);
                }
            }

            /*
             * Alumni can see attendees.
             */

            if (isAlumni) {
                try {
                    const attendeeResponse =
                        await axios.get(
                            `${API_URL}/api/events/${eventId}/attendees`,
                            authConfig
                        );

                    const attendeeList =
                        Array.isArray(
                            attendeeResponse.data
                        )
                            ? attendeeResponse.data
                            : attendeeResponse.data
                                ?.attendees ||
                            attendeeResponse.data
                                ?.data ||
                            [];

                    setAttendees(
                        attendeeList
                    );
                } catch (attendeeError) {
                    console.error(
                        "Attendees error:",
                        attendeeError
                    );
                }
            }

        } catch (error) {
            console.error(
                "Event details error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load event details."
            );

        } finally {
            setLoading(false);
        }
    };


    /* =====================================================
       RSVP STATUS
    ===================================================== */

    const isRSVPed = useMemo(() => {
        return myRsvps.some(
            (entry) =>
                String(
                    entry.eventId?._id ||
                    entry.eventId
                ) === String(eventId) &&
                entry.rsvpStatus === "attending"
        );
    }, [myRsvps, eventId]);


    /* =====================================================
       RSVP
    ===================================================== */

    const handleRsvp = async () => {
        if (isRSVPed) return;

        try {
            setRsvpLoading(true);

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

            setMyRsvps((previous) => [
                ...previous,
                {
                    eventId: event,
                    rsvpStatus: "attending",
                },
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

        } finally {
            setRsvpLoading(false);
        }
    };


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    const eventDate = event
        ? new Date(event.eventDate)
        : null;

    const formattedDate = eventDate
        ? eventDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }
        )
        : "Date TBD";

    const formattedTime = eventDate
        ? eventDate.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        )
        : "Time TBD";


    const organizer =
        event?.organizer || {};

    const hostFirstName =
        hostProfile?.firstName ||
        organizer?.firstName ||
        "";

    const hostLastName =
        hostProfile?.lastName ||
        organizer?.lastName ||
        "";

    const organizerName =
        `${hostFirstName} ${hostLastName}`
            .trim() ||
        "Alumni Member";

    const hostProfilePicture =
        hostProfile?.profilePicture ||
        organizer?.profilePicture ||
        "";

    const hostLocation =
        hostProfile?.location;

    const hostHeadline =
        hostProfile?.proffesionalHeadline ||
        hostProfile?.professionalHeadline ||
        "Alumni Community Member";

    const hostInitials =
        `${hostFirstName?.[0] || ""}${hostLastName?.[0] || ""
            }`
            .toUpperCase() || "A";


    /* =====================================================
       SIMILAR EVENTS
    ===================================================== */

    const similarEvents = events
        .filter(
            (item) =>
                String(item._id) !==
                String(eventId)
        )
        .slice(0, 3);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-full bg-[#FAF8FF] px-4 py-6 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-7xl animate-pulse">

                    <div className="h-4 w-24 rounded bg-gray-200" />

                    <div className="mt-5 h-[330px] rounded-2xl bg-gray-200" />

                    <div className="mt-6 grid gap-8 lg:grid-cols-3">

                        <div className="space-y-5 lg:col-span-2">

                            <div className="h-32 rounded-xl bg-gray-200" />
                            <div className="h-48 rounded-xl bg-gray-200" />
                            <div className="h-40 rounded-xl bg-gray-200" />

                        </div>

                        <div className="h-72 rounded-2xl bg-gray-200" />

                    </div>

                </div>

            </div>
        );
    }


    if (!event) return null;


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="min-h-full bg-[#FAF8FF] text-gray-900">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


                {/* =================================================
                    BREADCRUMB
                ================================================= */}

                <div className="flex items-center gap-2 py-5 text-xs">

                    <button
                        type="button"
                        onClick={() => navigate("/student/events")}
                        className="font-semibold text-gray-500 hover:text-[#004AC6]"
                    >
                        Events
                    </button>

                    <ChevronRight
                        size={14}
                        className="text-gray-400"
                    />

                    <span className="truncate font-semibold text-gray-900">
                        {event.title}
                    </span>

                </div>


                {/* =================================================
                    HERO
                ================================================= */}

                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#002B78] via-[#004AC6] to-[#2563EB]">

                    {/* Decorative shapes */}

                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />


                    <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-12">

                        <div className="max-w-4xl">

                            {/* BADGES */}

                            <div className="flex flex-wrap gap-2">

                                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#004AC6]">
                                    Community Event
                                </span>

                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur">
                                    {event.isVirtual
                                        ? "Virtual Event"
                                        : "In Person"}
                                </span>

                                {isRSVPed && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-[10px] font-bold text-white">
                                        <CheckCircle2
                                            size={11}
                                        />
                                        Registered
                                    </span>
                                )}

                            </div>


                            {/* TITLE */}

                            <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {event.title}
                            </h1>


                            {/* DESCRIPTION */}

                            <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">
                                {event.description}
                            </p>


                            {/* META */}

                            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/20 pt-6">

                                <HeroMeta
                                    icon={
                                        <CalendarDays
                                            size={17}
                                        />
                                    }
                                    label={
                                        formattedDate
                                    }
                                />

                                <HeroMeta
                                    icon={
                                        <Clock3
                                            size={17}
                                        />
                                    }
                                    label={
                                        formattedTime
                                    }
                                />

                                <HeroMeta
                                    icon={
                                        event.isVirtual
                                            ? <Video
                                                size={
                                                    17
                                                }
                                            />
                                            : <MapPin
                                                size={
                                                    17
                                                }
                                            />
                                    }
                                    label={
                                        event.location ||
                                        "Location TBD"
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="grid gap-8 py-8 lg:grid-cols-3">

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <main className="space-y-8 lg:col-span-2">


                        {/* ABOUT */}

                        <section>

                            <SectionHeading
                                icon={
                                    <Info size={18} />
                                }
                                title="About This Event"
                            />

                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                                <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                                    {event.description ||
                                        "No additional description has been provided for this event."}
                                </p>

                            </div>

                        </section>


                        {/* EVENT INFORMATION */}

                        <section>

                            <SectionHeading
                                icon={
                                    <CalendarDays
                                        size={18}
                                    />
                                }
                                title="Event Information"
                            />

                            <div className="grid gap-4 sm:grid-cols-2">

                                <InfoCard
                                    icon={
                                        <CalendarDays
                                            size={18}
                                        />
                                    }
                                    title="Date"
                                    value={
                                        formattedDate
                                    }
                                />

                                <InfoCard
                                    icon={
                                        <Clock3
                                            size={18}
                                        />
                                    }
                                    title="Time"
                                    value={
                                        formattedTime
                                    }
                                />

                                <InfoCard
                                    icon={
                                        event.isVirtual
                                            ? <Video
                                                size={
                                                    18
                                                }
                                            />
                                            : <MapPin
                                                size={
                                                    18
                                                }
                                            />
                                    }
                                    title={
                                        event.isVirtual
                                            ? "Event Type"
                                            : "Location"
                                    }
                                    value={
                                        event.isVirtual
                                            ? "Virtual Event"
                                            : event.location ||
                                            "Location TBD"
                                    }
                                />

                                <InfoCard
                                    icon={
                                        <Users
                                            size={18}
                                        />
                                    }
                                    title="Hosted By"
                                    value={
                                        organizerName
                                    }
                                />

                            </div>

                        </section>


                        {/* HOST */}

                        <section>

                            <SectionHeading
                                icon={<UserRound size={18} />}
                                title="Event Host"
                            />

                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                                {hostLoading ? (

                                    <div className="flex items-center gap-4 animate-pulse">

                                        <div className="h-20 w-20 shrink-0 rounded-full bg-gray-200" />

                                        <div className="flex-1">

                                            <div className="h-4 w-40 rounded bg-gray-200" />

                                            <div className="mt-2 h-3 w-28 rounded bg-gray-100" />

                                            <div className="mt-3 h-3 w-64 max-w-full rounded bg-gray-100" />

                                        </div>

                                    </div>

                                ) : (

                                    <div className="flex flex-col gap-5 sm:flex-row">

                                        {/* =================================================
                    PROFILE IMAGE
                ================================================= */}

                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-blue-50 bg-blue-100 text-xl font-bold text-[#004AC6]">

                                            {hostProfilePicture ? (

                                                <img
                                                    src={hostProfilePicture}
                                                    alt={organizerName}
                                                    className="h-full w-full object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />

                                            ) : (

                                                <span>
                                                    {hostInitials}
                                                </span>

                                            )}

                                        </div>


                                        {/* =================================================
                    HOST DETAILS
                ================================================= */}

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-start justify-between gap-3">

                                                <div>

                                                    <h3 className="text-base font-bold text-gray-900">
                                                        {organizerName}
                                                    </h3>

                                                    <p className="mt-1 text-xs font-semibold text-[#004AC6]">
                                                        {hostHeadline}
                                                    </p>

                                                </div>


                                                <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#004AC6]">

                                                    <CheckCircle2
                                                        size={11}
                                                    />

                                                    Alumni

                                                </span>

                                            </div>


                                            {/* LOCATION */}

                                            {hostLocation?.city && (

                                                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">

                                                    <MapPin
                                                        size={13}
                                                        className="text-[#004AC6]"
                                                    />

                                                    {hostLocation.city}

                                                    {hostLocation.state &&
                                                        `, ${hostLocation.state}`}

                                                </div>

                                            )}


                                            <p className="mt-3 text-sm leading-6 text-gray-500">

                                                {organizerName} is hosting this event
                                                for the AlumniConnect community.

                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ATTENDEES */}

                        {attendees.length >
                            0 && (

                                <section>

                                    <div className="flex items-center justify-between">

                                        <SectionHeading
                                            icon={
                                                <Users
                                                    size={
                                                        18
                                                    }
                                                />
                                            }
                                            title="Attendees"
                                        />

                                        <span className="text-xs font-bold text-[#004AC6]">
                                            {
                                                attendees.length
                                            }{" "}
                                            Registered
                                        </span>

                                    </div>


                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                                        <div className="flex flex-wrap gap-2">

                                            {attendees.map(
                                                (
                                                    attendee
                                                ) => (

                                                    <div
                                                        key={
                                                            attendee._id
                                                        }
                                                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2"
                                                    >

                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#004AC6]">

                                                            {(
                                                                attendee
                                                                    .userId
                                                                    ?.firstName ||
                                                                "G"
                                                            ).charAt(
                                                                0
                                                            )}

                                                        </div>

                                                        <span className="text-xs font-semibold text-gray-600">
                                                            {
                                                                attendee
                                                                    .userId
                                                                    ?.firstName
                                                            }{" "}
                                                            {
                                                                attendee
                                                                    .userId
                                                                    ?.lastName
                                                            }
                                                        </span>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                </section>

                            )}


                        {/* OPTIONAL AGENDA */}

                        {Array.isArray(
                            event.agenda
                        ) &&
                            event.agenda.length >
                            0 && (

                                <section>

                                    <SectionHeading
                                        title="Event Agenda"
                                    />

                                    <div className="relative space-y-3">

                                        {event.agenda.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item._id ||
                                                        index
                                                    }
                                                    className="relative flex gap-4"
                                                >

                                                    <div className="relative flex w-20 shrink-0 justify-end pt-4">

                                                        <span className="text-right text-[10px] font-bold text-[#004AC6]">
                                                            {
                                                                item.time
                                                            }
                                                        </span>

                                                    </div>

                                                    <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                                                        <h4 className="text-sm font-bold text-gray-900">
                                                            {
                                                                item.title
                                                            }
                                                        </h4>

                                                        {item.description && (
                                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </section>

                            )}


                        {/* OPTIONAL SPEAKERS */}

                        {Array.isArray(
                            event.speakers
                        ) &&
                            event.speakers.length >
                            0 && (

                                <section>

                                    <SectionHeading
                                        title="Featured Speakers"
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">

                                        {event.speakers.map(
                                            (
                                                speaker,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        speaker._id ||
                                                        index
                                                    }
                                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                                >

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#004AC6]">

                                                            <UserRound
                                                                size={
                                                                    22
                                                                }
                                                            />

                                                        </div>

                                                        <div>

                                                            <h4 className="text-sm font-bold text-gray-900">
                                                                {
                                                                    speaker.name
                                                                }
                                                            </h4>

                                                            <p className="mt-1 text-[10px] font-semibold text-[#004AC6]">
                                                                {
                                                                    speaker.role
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </section>

                            )}

                    </main>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside>

                        <div className="lg:sticky lg:top-24">

                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">

                                {/* STATUS */}

                                <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold ${isRSVPed
                                        ? "border-green-200 bg-green-50 text-green-600"
                                        : "border-blue-100 bg-blue-50 text-[#004AC6]"
                                        }`}
                                >
                                    {isRSVPed
                                        ? "Registered"
                                        : "Open For Registration"}
                                </span>


                                {/* EVENT SUMMARY */}

                                <div className="mt-5 space-y-3">

                                    <SummaryRow
                                        icon={
                                            <CalendarDays
                                                size={
                                                    16
                                                }
                                            />
                                        }
                                        text={
                                            formattedDate
                                        }
                                    />

                                    <SummaryRow
                                        icon={
                                            <Clock3
                                                size={
                                                    16
                                                }
                                            />
                                        }
                                        text={
                                            formattedTime
                                        }
                                    />

                                    <SummaryRow
                                        icon={
                                            <MapPin
                                                size={
                                                    16
                                                }
                                            />
                                        }
                                        text={
                                            event.location ||
                                            "Location TBD"
                                        }
                                    />

                                </div>


                                {/* RSVP */}

                                <button
                                    type="button"
                                    disabled={
                                        isRSVPed ||
                                        rsvpLoading
                                    }
                                    onClick={
                                        handleRsvp
                                    }
                                    className={`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-lg transition ${isRSVPed
                                        ? "cursor-default bg-green-50 text-green-600 shadow-none"
                                        : "bg-[#004AC6] text-white shadow-blue-200 hover:bg-[#003da8] hover:shadow-xl"
                                        }`}
                                >

                                    {isRSVPed ? (
                                        <>
                                            <CheckCircle2
                                                size={
                                                    17
                                                }
                                            />

                                            Already Registered

                                        </>
                                    ) : rsvpLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                            Registering...

                                        </>
                                    ) : (
                                        <>
                                            Register Now

                                            <ChevronRight
                                                size={
                                                    16
                                                }
                                            />

                                        </>
                                    )}

                                </button>


                                {/* ACTIONS */}

                                <div className="mt-5 border-t border-gray-100 pt-5">

                                    <div className="grid grid-cols-2 gap-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    navigator.share
                                                ) {
                                                    navigator.share(
                                                        {
                                                            title:
                                                                event.title,
                                                            text:
                                                                event.description,
                                                            url:
                                                                window.location.href,
                                                        }
                                                    );
                                                } else {
                                                    navigator.clipboard.writeText(
                                                        window.location.href
                                                    );

                                                    toast.success(
                                                        "Event link copied."
                                                    );
                                                }
                                            }}
                                            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                        >

                                            <Share2
                                                size={
                                                    14
                                                }
                                            />

                                            Share

                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                toast.success(
                                                    "Event saved to your list."
                                                )
                                            }
                                            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                        >

                                            <Bookmark
                                                size={
                                                    14
                                                }
                                            />

                                            Save

                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* COMMUNITY CARD */}

                            <div className="mt-4 rounded-2xl bg-[#004AC6] p-6 text-white">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">

                                    <Sparkles
                                        size={19}
                                    />

                                </div>

                                <h3 className="mt-4 text-base font-bold">
                                    Connect with your alumni network
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-blue-100">
                                    Meet students, alumni, and professionals who share your academic and career journey.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>


                {/* =================================================
                    SIMILAR EVENTS
                ================================================= */}

                {similarEvents.length >
                    0 && (

                        <section className="border-t border-gray-200 py-10">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Similar Upcoming Events
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Explore more events from your community.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/events"
                                        )
                                    }
                                    className="hidden items-center gap-1 text-xs font-bold text-[#004AC6] hover:underline sm:flex"
                                >
                                    Explore all

                                    <ChevronRight
                                        size={14}
                                    />

                                </button>

                            </div>


                            <div className="mt-5 grid gap-5 md:grid-cols-3">

                                {similarEvents.map(
                                    (item) => (

                                        <button
                                            type="button"
                                            key={
                                                item._id
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/events/${item._id}`
                                                )
                                            }
                                            className="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                        >

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-11 w-11 shrink-0 flex-col overflow-hidden rounded-lg border border-blue-100 bg-blue-50 text-center">

                                                    <span className="bg-[#004AC6] py-0.5 text-[8px] font-bold uppercase text-white">
                                                        {new Date(
                                                            item.eventDate
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                            }
                                                        )}
                                                    </span>

                                                    <span className="flex flex-1 items-center justify-center text-sm font-bold text-[#004AC6]">
                                                        {new Date(
                                                            item.eventDate
                                                        ).getDate()}
                                                    </span>

                                                </div>


                                                <div className="min-w-0">

                                                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-[#004AC6]">
                                                        {
                                                            item.title
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {item.isVirtual
                                                            ? "Virtual Event"
                                                            : item.location}
                                                    </p>

                                                </div>

                                            </div>

                                        </button>

                                    )
                                )}

                            </div>

                        </section>

                    )}

            </div>

        </div>
    );
};


/* =========================================================
   COMPONENTS
========================================================= */

const HeroMeta = ({
    icon,
    label,
}) => (
    <div className="flex items-center gap-2 text-sm font-semibold text-white">

        <span className="text-blue-200">
            {icon}
        </span>

        {label}

    </div>
);


const SectionHeading = ({
    icon,
    title,
}) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">

        {icon && (
            <span className="text-[#004AC6]">
                {icon}
            </span>
        )}

        {title}

    </h2>
);


const InfoCard = ({
    icon,
    title,
    value,
}) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">
            {icon}
        </div>

        <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {title}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-800">
            {value}
        </p>

    </div>
);


const SummaryRow = ({
    icon,
    text,
}) => (
    <div className="flex items-center gap-3">

        <span className="text-[#004AC6]">
            {icon}
        </span>

        <span className="text-xs font-semibold text-gray-600">
            {text}
        </span>

    </div>
);


export default EventDetailsPage;