import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    Award,
    Check,
    CheckCircle2,
    Clock3,
    Handshake,
    MapPin,
    MessageSquare,
    Search,
    Send,
    UserRound,
    X,
    XCircle,
} from "lucide-react";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";


const Mentorship = () => {

    /* =====================================================
       STATE
    ===================================================== */

    const [receivedRequests, setReceivedRequests] =
        useState([]);

    const [sentRequests, setSentRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [activeTab, setActiveTab] =
        useState("received");

    const [search, setSearch] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState(null);


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
       FETCH PROFILE
       
       GET:
       /api/profile/get-profile/:userId
    ===================================================== */

    const fetchUserProfile = async (
        userId
    ) => {

        if (!userId) {
            return null;
        }

        try {

            const response =
                await axios.get(
                    `${API_URL}/api/profile/get-profile/${userId}`,
                    getConfig()
                );


            console.log(
                "User profile:",
                response.data
            );


            return (
                response.data?.profile ||
                response.data ||
                null
            );

        } catch (error) {

            console.error(
                `Profile fetch failed for ${userId}:`,
                error
            );

            return null;

        }

    };


    /* =====================================================
       FETCH RECEIVED REQUESTS
       
       ACTUAL RESPONSE:
       
       {
           message: "...",
           requests: [...]
       }

       Each request:
       
       {
           _id,
           menteeId: {
               _id,
               email,
               role
           },
           mentorId,
           message,
           status,
           createdAt,
           updatedAt
       }
    ===================================================== */

    const fetchReceivedRequests =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/mentorship/recieved`,
                        getConfig()
                    );


                console.log(
                    "Received mentorship requests:",
                    response.data
                );


                const requests =
                    Array.isArray(
                        response.data?.requests
                    )
                        ? response.data.requests
                        : [];


                /*
                 * Fetch profile for each mentee.
                 */

                const enrichedRequests =
                    await Promise.all(
                        requests.map(
                            async (
                                request
                            ) => {

                                const menteeId =
                                    request?.menteeId?._id ||
                                    request?.menteeId;


                                const profile =
                                    await fetchUserProfile(
                                        menteeId
                                    );


                                return {
                                    ...request,

                                    menteeProfile:
                                        profile,
                                };

                            }
                        )
                    );


                return enrichedRequests;

            } catch (error) {

                console.error(
                    "Received mentorship error:",
                    error
                );

                throw error;

            }

        };


    /* =====================================================
       FETCH SENT REQUESTS
       
       We keep this backend unchanged.
    ===================================================== */

    const fetchSentRequests =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/mentorship/sent`,
                        getConfig()
                    );


                console.log(
                    "Sent mentorship requests:",
                    response.data
                );


                const requests =
                    Array.isArray(
                        response.data?.requests
                    )
                        ? response.data.requests
                        : [];


                /*
                 * For sent requests the backend
                 * structure may contain mentorId.
                 *
                 * We attempt to fetch its profile
                 * when an ID is available.
                 */

                const enrichedRequests =
                    await Promise.all(
                        requests.map(
                            async (
                                request
                            ) => {

                                const mentorId =
                                    request?.mentorId?._id ||
                                    request?.mentorId;


                                const profile =
                                    await fetchUserProfile(
                                        mentorId
                                    );


                                return {
                                    ...request,

                                    mentorProfile:
                                        profile,
                                };

                            }
                        )
                    );


                return enrichedRequests;

            } catch (error) {

                console.error(
                    "Sent mentorship error:",
                    error
                );


                /*
                 * Don't break the whole page
                 * if sent requests fail.
                 */

                return [];

            }

        };


    /* =====================================================
       LOAD ALL MENTORSHIP DATA
    ===================================================== */

    const loadMentorship =
        async () => {

            try {

                setLoading(true);
                setError("");


                const received =
                    await fetchReceivedRequests();


                setReceivedRequests(
                    received
                );


                /*
                 * Load sent requests separately.
                 * This prevents a failure in one
                 * endpoint from hiding received
                 * requests.
                 */

                const sent =
                    await fetchSentRequests();


                setSentRequests(
                    sent
                );


            } catch (error) {

                console.error(
                    "Mentorship loading error:",
                    error
                );


                setError(
                    error?.response?.data?.message ||
                    "Unable to load mentorship requests."
                );

            } finally {

                setLoading(false);

            }

        };


    useEffect(() => {

        loadMentorship();

    }, []);


    /* =====================================================
       UPDATE REQUEST STATUS
       
       PUT:
       /api/mentorship/status/:requestId
    ===================================================== */

    const updateRequestStatus =
        async (
            requestId,
            status
        ) => {

            if (!requestId) {
                return;
            }


            try {

                setUpdatingId(
                    requestId
                );

                setError("");


                console.log(
                    "Updating mentorship request:",
                    {
                        requestId,
                        status,
                    }
                );


                const response =
                    await axios.put(
                        `${API_URL}/api/mentorship/status/${requestId}`,
                        {
                            status,
                        },
                        getConfig()
                    );


                console.log(
                    "Status update response:",
                    response.data
                );


                /*
                 * Update UI immediately.
                 */

                setReceivedRequests(
                    (previous) =>
                        previous.map(
                            (
                                request
                            ) =>
                                getRequestId(
                                    request
                                ) ===
                                    requestId
                                    ? {
                                        ...request,
                                        status,
                                    }
                                    : request
                        )
                );


            } catch (error) {

                console.error(
                    "Update mentorship status error:",
                    error
                );


                setError(
                    error?.response?.data?.message ||
                    "Unable to update the request."
                );

            } finally {

                setUpdatingId(
                    null
                );

            }

        };


    /* =====================================================
       CURRENT REQUESTS
    ===================================================== */

    const currentRequests =
        activeTab === "received"
            ? receivedRequests
            : sentRequests;


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredRequests =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            if (!keyword) {
                return currentRequests;
            }


            return currentRequests.filter(
                (
                    request
                ) => {

                    const person =
                        activeTab ===
                            "received"
                            ? request?.menteeProfile
                            : request?.mentorProfile;


                    const name =
                        getPersonName(
                            person
                        );


                    const text = [
                        name,
                        person?.email,
                        person?.professionalHeadline,
                        person?.location?.city,
                        person?.location?.state,
                        request?.message,
                        request?.status,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        keyword
                    );

                }
            );

        }, [
            currentRequests,
            search,
            activeTab,
        ]);


    /* =====================================================
       COUNTS
    ===================================================== */

    const pendingReceived =
        receivedRequests.filter(
            (
                request
            ) =>
                normalizeStatus(
                    request?.status
                ) === "pending"
        ).length;


    const acceptedReceived =
        receivedRequests.filter(
            (
                request
            ) =>
                normalizeStatus(
                    request?.status
                ) === "accepted"
        ).length;


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="space-y-6">

                <div className="space-y-2">

                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />

                    <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />

                </div>


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {[1, 2, 3].map(
                        (
                            item
                        ) => (

                            <div
                                key={
                                    item
                                }
                                className="h-28 animate-pulse rounded-2xl bg-gray-200"
                            />

                        )
                    )}

                </div>


                <div className="h-[500px] animate-pulse rounded-2xl bg-gray-200" />

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

                <p className="mb-1 text-[9px] font-black uppercase tracking-[2px] text-[#004AC6]">
                    Alumni Community
                </p>


                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    Mentorship
                </h1>


                <p className="mt-2 max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm">

                    Guide students, share your experience,
                    and help the next generation grow
                    professionally.

                </p>

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
               STATS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <StatCard
                    icon={
                        <Clock3
                            size={17}
                        />
                    }
                    label="Pending Requests"
                    value={
                        pendingReceived
                    }
                />


                <StatCard
                    icon={
                        <CheckCircle2
                            size={17}
                        />
                    }
                    label="Accepted"
                    value={
                        acceptedReceived
                    }
                />


                <StatCard
                    icon={
                        <Send
                            size={17}
                        />
                    }
                    label="Sent Requests"
                    value={
                        sentRequests.length
                    }
                />

            </div>


            {/* =================================================
               INFO BANNER
            ================================================= */}

            <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#004AC6] shadow-sm">

                        <Handshake
                            size={19}
                        />

                    </div>


                    <div>

                        <h2 className="text-xs font-bold text-blue-900">
                            Make an impact through mentorship
                        </h2>


                        <p className="mt-1 max-w-xl text-[10px] leading-4 text-blue-800/60">

                            Students can reach out to you
                            for guidance based on your
                            professional experience.

                        </p>

                    </div>

                </div>


                <div className="flex w-fit items-center gap-2 rounded-xl bg-white px-3 py-2 text-[9px] font-bold text-[#004AC6] shadow-sm">

                    <Award
                        size={13}
                    />

                    Alumni Mentor

                </div>

            </div>


            {/* =================================================
               MAIN CARD
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


                {/* =================================================
                   TABS
                ================================================= */}

                <div className="flex flex-col border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex">

                        <TabButton
                            active={
                                activeTab ===
                                "received"
                            }
                            onClick={() => {

                                setActiveTab(
                                    "received"
                                );

                                setSearch(
                                    ""
                                );

                            }}
                            icon={
                                <UserRound
                                    size={14}
                                />
                            }
                            label="Received"
                            count={
                                receivedRequests.length
                            }
                        />


                        <TabButton
                            active={
                                activeTab ===
                                "sent"
                            }
                            onClick={() => {

                                setActiveTab(
                                    "sent"
                                );

                                setSearch(
                                    ""
                                );

                            }}
                            icon={
                                <Send
                                    size={14}
                                />
                            }
                            label="Sent"
                            count={
                                sentRequests.length
                            }
                        />

                    </div>


                    {/* SEARCH */}

                    <div className="border-t border-gray-100 p-3 sm:border-t-0">

                        <div className="relative w-full sm:w-64">

                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                                placeholder={
                                    activeTab ===
                                        "received"
                                        ? "Search students..."
                                        : "Search requests..."
                                }
                                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-[10px] font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-50"
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                   REQUEST LIST
                ================================================= */}

                <div className="p-5">

                    {filteredRequests.length ===
                        0 ? (

                        <EmptyMentorship
                            type={
                                activeTab
                            }
                            searching={
                                Boolean(
                                    search
                                )
                            }
                        />

                    ) : (

                        <div className="space-y-3">

                            {filteredRequests.map(
                                (
                                    request,
                                    index
                                ) => (

                                    <RequestCard
                                        key={
                                            getRequestId(
                                                request
                                            ) ||
                                            index
                                        }
                                        request={
                                            request
                                        }
                                        type={
                                            activeTab
                                        }
                                        updatingId={
                                            updatingId
                                        }
                                        onStatusUpdate={
                                            updateRequestStatus
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>

            </section>

        </div>

    );

};


/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
    icon,
    label,
    value,
}) => {

    return (

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#004AC6]">

                    {icon}

                </div>


                <span className="text-2xl font-extrabold text-gray-900">
                    {value}
                </span>

            </div>


            <p className="mt-4 text-[9px] font-black uppercase tracking-[1.5px] text-gray-400">
                {label}
            </p>

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
            onClick={
                onClick
            }
            className={`
                relative flex items-center gap-2
                px-5 py-4 text-[10px] font-bold
                transition
                ${active
                    ? "text-[#004AC6]"
                    : "text-gray-400 hover:text-gray-700"
                }
            `}
        >

            {icon}

            {label}


            <span
                className={`
                    rounded-full px-1.5 py-0.5
                    text-[8px] font-black
                    ${active
                        ? "bg-blue-50 text-[#004AC6]"
                        : "bg-gray-100 text-gray-400"
                    }
                `}
            >
                {count}
            </span>


            {active && (

                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#004AC6]" />

            )}

        </button>

    );

};


/* =========================================================
   REQUEST CARD
========================================================= */

const RequestCard = ({
    request,
    type,
    updatingId,
    onStatusUpdate,
}) => {

    /*
     * RECEIVED:
     * request.menteeId = User
     * request.menteeProfile = Profile API result
     *
     * SENT:
     * request.mentorId = User ID
     * request.mentorProfile = Profile API result
     */

    const person =
        type === "received"
            ? request?.menteeProfile
            : request?.mentorProfile;


    const name =
        getPersonName(
            person,
            type
        );


    const email =
        person?.userId?.email ||
        person?.email ||
        request?.menteeId?.email ||
        "";


    const image =
        person?.profilePicture ||
        null;


    const headline =
        person?.professionalHeadline ||
        "";


    const location =
        person?.location;


    const topic =
        request?.topic ||
        request?.subject ||
        "Mentorship";


    const message =
        request?.message ||
        "This student would like to connect with you for mentorship.";


    const status =
        normalizeStatus(
            request?.status
        );


    const requestId =
        getRequestId(
            request
        );


    const isUpdating =
        updatingId ===
        requestId;


    return (

        <div className="rounded-2xl border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-sm">


            <div className="flex flex-col gap-4 sm:flex-row">


                {/* =================================================
                   AVATAR
                ================================================= */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xs font-extrabold text-[#004AC6]">

                    {image ? (

                        <img
                            src={
                                image
                            }
                            alt={
                                name
                            }
                            className="h-full w-full object-cover"
                            onError={(
                                e
                            ) => {

                                e.currentTarget.style.display =
                                    "none";

                            }}
                        />

                    ) : (

                        getInitials(
                            name
                        )

                    )}

                </div>


                {/* =================================================
                   CONTENT
                ================================================= */}

                <div className="min-w-0 flex-1">


                    {/* NAME */}

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                            <h3 className="text-sm font-bold text-gray-900">
                                {name}
                            </h3>


                            {headline && (

                                <p className="mt-1 text-[10px] font-medium text-gray-500">
                                    {headline}
                                </p>

                            )}


                            {location?.city && (

                                <p className="mt-1 flex items-center gap-1 text-[9px] text-gray-400">

                                    <MapPin
                                        size={10}
                                    />

                                    {location.city}

                                    {location.state
                                        ? `, ${location.state}`
                                        : ""}

                                </p>

                            )}


                            {email && (

                                <p className="mt-1 text-[9px] text-gray-400">
                                    {email}
                                </p>

                            )}

                        </div>


                        <StatusBadge
                            status={
                                status
                            }
                        />

                    </div>


                    {/* MESSAGE */}

                    <div className="mt-4 rounded-xl bg-gray-50 p-3.5">

                        <p className="text-[9px] font-black uppercase tracking-[1.3px] text-gray-400">
                            Message
                        </p>


                        <p className="mt-2 text-xs leading-5 text-gray-600">

                            "{message}"

                        </p>

                    </div>


                    {/* DATE */}

                    {request?.createdAt && (

                        <p className="mt-3 flex items-center gap-1.5 text-[9px] font-medium text-gray-400">

                            <Clock3
                                size={11}
                            />

                            Requested{" "}
                            {formatDate(
                                request.createdAt
                            )}

                        </p>

                    )}


                    {/* =================================================
                       ACTIONS
                    ================================================= */}

                    {type ===
                        "received" &&
                        status ===
                        "pending" && (

                            <div className="mt-4 flex flex-wrap gap-2">

                                <button
                                    type="button"
                                    disabled={
                                        isUpdating
                                    }
                                    onClick={() =>
                                        onStatusUpdate(
                                            requestId,
                                            "accepted"
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#004AC6] px-4 py-2 text-[10px] font-bold text-white transition hover:bg-[#0038A8] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <Check
                                        size={13}
                                    />

                                    {isUpdating
                                        ? "Updating..."
                                        : "Accept"}

                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        isUpdating
                                    }
                                    onClick={() =>
                                        onStatusUpdate(
                                            requestId,
                                            "declined"
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-[10px] font-bold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <X
                                        size={13}
                                    />

                                    Decline

                                </button>

                            </div>

                        )}


                    {type ===
                        "received" &&
                        status ===
                        "accepted" && (

                            <div className="mt-4">

                                <a
                                    href="/alumni/messages"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#004AC6] px-4 py-2 text-[10px] font-bold text-white transition hover:bg-[#0038A8]"
                                >

                                    <MessageSquare
                                        size={13}
                                    />

                                    Message Student

                                </a>

                            </div>

                        )}

                </div>

            </div>

        </div>

    );

};


/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
    status,
}) => {

    const config = {

        pending: {
            label: "Pending",
            className:
                "bg-amber-50 text-amber-600",
            icon: (
                <Clock3
                    size={10}
                />
            ),
        },

        accepted: {
            label: "Accepted",
            className:
                "bg-green-50 text-green-600",
            icon: (
                <CheckCircle2
                    size={10}
                />
            ),
        },

        declined: {
            label: "Declined",
            className:
                "bg-red-50 text-red-500",
            icon: (
                <XCircle
                    size={10}
                />
            ),
        },

    };


    const current =
        config[
        status
        ] || {
            label:
                status ||
                "Unknown",
            className:
                "bg-gray-100 text-gray-500",
            icon: (
                <Clock3
                    size={10}
                />
            ),
        };


    return (

        <span
            className={`
                flex w-fit items-center gap-1
                rounded-lg px-2.5 py-1.5
                text-[9px] font-bold
                ${current.className}
            `}
        >

            {current.icon}

            {current.label}

        </span>

    );

};


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyMentorship = ({
    type,
    searching,
}) => {

    return (

        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-5 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#004AC6] shadow-sm">

                {searching ? (

                    <Search
                        size={22}
                    />

                ) : type ===
                    "received" ? (

                    <Handshake
                        size={22}
                    />

                ) : (

                    <Send
                        size={22}
                    />

                )}

            </div>


            <h3 className="text-sm font-bold text-gray-700">

                {searching
                    ? "No requests found"
                    : type ===
                        "received"
                        ? "No mentorship requests yet"
                        : "No sent requests"}

            </h3>


            <p className="mt-2 max-w-sm text-[10px] leading-5 text-gray-400">

                {searching
                    ? "Try searching with a different name or keyword."
                    : type ===
                        "received"
                        ? "When students request mentorship from you, their requests will appear here."
                        : "Requests you send to other mentors will appear here."}

            </p>

        </div>

    );

};


/* =========================================================
   HELPERS
========================================================= */

const getRequestId = (
    request
) => {

    return (
        request?._id ||
        request?.id
    );

};


const getPersonName = (
    person,
    type
) => {

    if (
        person?.firstName
    ) {

        return `${person.firstName} ${person.lastName || ""
            }`.trim();

    }


    if (
        person?.name
    ) {

        return person.name;

    }


    if (
        person?.fullName
    ) {

        return person.fullName;

    }


    return type ===
        "received"
        ? "Student"
        : "Alumni Member";

};


const getInitials = (
    name = ""
) => {

    if (
        !name ||
        name === "Student"
    ) {

        return "ST";

    }


    if (
        name ===
        "Alumni Member"
    ) {

        return "AM";

    }


    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (word) =>
                word[0]
                    ?.toUpperCase()
        )
        .join("") || "U";

};


const normalizeStatus = (
    status
) => {

    if (!status) {
        return "pending";
    }


    return String(
        status
    )
        .trim()
        .toLowerCase();

};


const formatDate = (
    value
) => {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "recently";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

};


export default Mentorship;