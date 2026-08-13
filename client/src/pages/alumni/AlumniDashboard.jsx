import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Handshake,
    MessageSquare,
    Plus,
    ShieldCheck,
    Users,
} from "lucide-react";

import axios from "axios";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";


const AlumniDashboard = () => {

    /* =====================================================
       STATE
    ===================================================== */

    const [profile, setProfile] =
        useState(null);

    const [mentorshipRequests, setMentorshipRequests] =
        useState([]);

    const [myJobs, setMyJobs] =
        useState([]);

    const [myEvents, setMyEvents] =
        useState([]);

    const [conversations, setConversations] =
        useState([]);

    const [availability, setAvailability] =
        useState("available");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* =====================================================
       AUTH
    ===================================================== */

    const token = useMemo(() => {

        return (
            sessionStorage.getItem(
                "accessToken"
            ) ||
            localStorage.getItem(
                "accessToken"
            )
        );

    }, []);


    const authConfig = useMemo(() => {

        return {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        };

    }, [token]);


    /* =====================================================
       STORED USER
    ===================================================== */

    const storedUser = useMemo(() => {

        try {

            return JSON.parse(
                sessionStorage.getItem(
                    "user"
                ) ||
                localStorage.getItem(
                    "user"
                ) ||
                "{}"
            );

        } catch {

            return {};

        }

    }, []);


    /* =====================================================
       FETCH MY PROFILE
       
       GET:
       /api/profile/get-profile
    ===================================================== */

    const fetchProfile =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/profile/get-profile`,
                        authConfig
                    );


                console.log(
                    "Alumni profile:",
                    response.data
                );


                return (
                    response.data?.profile ||
                    response.data ||
                    null
                );

            } catch (err) {

                console.error(
                    "Profile error:",
                    err
                );

                return null;

            }

        };


    /* =====================================================
       FETCH PROFILE BY USER ID
       
       Used for mentorship requester.
       
       GET:
       /api/profile/get-profile/:userId
    ===================================================== */

    const fetchUserProfile =
        async (
            userId
        ) => {

            if (!userId) {
                return null;
            }


            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/profile/get-profile/${userId}`,
                        authConfig
                    );


                console.log(
                    `Profile ${userId}:`,
                    response.data
                );


                return (
                    response.data?.profile ||
                    response.data ||
                    null
                );

            } catch (err) {

                console.error(
                    `Profile fetch error for ${userId}:`,
                    err
                );

                return null;

            }

        };


    /* =====================================================
       FETCH MENTORSHIP REQUESTS
       
       IMPORTANT:
       
       Backend:
       app.use("/api/mentorship", mentorshipRouter)

       Router:
       GET /recieved

       Therefore:
       /api/mentorship/recieved

       Actual response:
       
       {
           message: "...",
           requests: [
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
                   createdAt
               }
           ]
       }
    ===================================================== */

    const fetchMentorshipRequests =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/mentorship/recieved`,
                        authConfig
                    );


                console.log(
                    "Mentorship response:",
                    response.data
                );


                const requests =
                    Array.isArray(
                        response.data?.requests
                    )
                        ? response.data.requests
                        : [];


                /*
                 * Fetch actual Profile for
                 * every mentee.
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


                                const menteeProfile =
                                    await fetchUserProfile(
                                        menteeId
                                    );


                                return {
                                    ...request,

                                    menteeProfile,
                                };

                            }
                        )
                    );


                return enrichedRequests;

            } catch (err) {

                console.error(
                    "Mentorship requests error:",
                    err
                );

                return [];

            }

        };


    /* =====================================================
       FETCH MY JOBS
       
       CORRECT ROUTE:
       /api/jobs/my-jobs
       
       NOT:
       /api/job/my-jobs
    ===================================================== */

    const fetchMyJobs =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/jobs/my-jobs`,
                        authConfig
                    );


                console.log(
                    "My jobs:",
                    response.data
                );


                const data =
                    response.data;


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    return data;

                }


                if (
                    Array.isArray(
                        data?.jobs
                    )
                ) {

                    return data.jobs;

                }


                if (
                    Array.isArray(
                        data?.data
                    )
                ) {

                    return data.data;

                }


                return [];

            } catch (err) {

                console.error(
                    "My jobs error:",
                    err
                );

                return [];

            }

        };


    /* =====================================================
       FETCH MY EVENTS
       
       CORRECT ROUTE:
       /api/events/my-events
       
       NOT:
       /api/event/my-events
    ===================================================== */

    const fetchMyEvents =
        async () => {

            try {

                const response =
                    await axios.get(
                        `${API_URL}/api/events/my-events`,
                        authConfig
                    );


                console.log(
                    "My events:",
                    response.data
                );


                const data =
                    response.data;


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    return data;

                }


                if (
                    Array.isArray(
                        data?.events
                    )
                ) {

                    return data.events;

                }


                if (
                    Array.isArray(
                        data?.data
                    )
                ) {

                    return data.data;

                }


                return [];

            } catch (err) {

                console.error(
                    "My events error:",
                    err
                );

                return [];

            }

        };


    /* =====================================================
       FETCH CONVERSATIONS
       
       GET:
       /api/message/conversations
    ===================================================== */

    const fetchConversations = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/message/conversations`,
                authConfig
            );

            console.log(
                "Conversations:",
                response.data
            );

            const conversations =
                Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

            /*
             * Find the logged-in user's ID.
             *
             * Try the stored user first.
             * If your auth object has another structure,
             * we also support a few common possibilities.
             */

            const currentUserId =
                storedUser?._id ||
                storedUser?.id ||
                storedUser?.userId;


            const enriched =
                await Promise.all(
                    conversations.map(
                        async (conversation) => {

                            const participants =
                                Array.isArray(
                                    conversation?.participants
                                )
                                    ? conversation.participants
                                    : [];


                            /*
                             * Find the participant who is NOT
                             * the currently logged-in alumni.
                             */

                            let otherParticipant =
                                participants.find(
                                    (participant) => {

                                        const participantId =
                                            participant?._id ||
                                            participant?.id ||
                                            participant?.userId;


                                        return (
                                            String(
                                                participantId
                                            ) !==
                                            String(
                                                currentUserId
                                            )
                                        );

                                    }
                                );


                            /*
                             * If current user ID wasn't available,
                             * use the first participant as fallback.
                             */

                            if (
                                !otherParticipant
                            ) {

                                otherParticipant =
                                    participants[0];

                            }


                            const otherUserId =
                                otherParticipant?._id ||
                                otherParticipant?.id ||
                                otherParticipant?.userId;


                            console.log(
                                "Conversation participant:",
                                {
                                    conversationId:
                                        conversation?._id,
                                    currentUserId,
                                    participants,
                                    otherParticipant,
                                    otherUserId,
                                }
                            );


                            /*
                             * Fetch complete profile.
                             */

                            const otherProfile =
                                await fetchUserProfile(
                                    otherUserId
                                );


                            return {
                                ...conversation,

                                otherParticipant,

                                otherProfile,
                            };

                        }
                    )
                );


            return enriched;

        } catch (error) {

            console.error(
                "Conversations error:",
                error
            );

            return [];

        }
    };

    const getOtherUserId = (
        conversation
    ) => {

        /*
         * Try populated participant first.
         */

        const populatedUser =
            conversation?.otherUser ||
            conversation?.receiver ||
            conversation?.participant ||
            conversation?.user;


        if (
            populatedUser &&
            typeof populatedUser === "object"
        ) {

            return (
                populatedUser?._id ||
                populatedUser?.id
            );

        }


        /*
         * Try direct IDs.
         */

        return (
            conversation?.otherUserId ||
            conversation?.receiverId ||
            conversation?.participantId ||
            conversation?.userId
        );

    };


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    useEffect(() => {

        let mounted =
            true;


        const loadDashboard =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    /*
                     * Don't allow one API failure
                     * to destroy the complete dashboard.
                     */

                    const [
                        profileData,
                        mentorshipData,
                        jobsData,
                        eventsData,
                        conversationsData,
                    ] =
                        await Promise.all([
                            fetchProfile(),
                            fetchMentorshipRequests(),
                            fetchMyJobs(),
                            fetchMyEvents(),
                            fetchConversations(),
                        ]);


                    if (!mounted) {
                        return;
                    }


                    setProfile(
                        profileData
                    );


                    setMentorshipRequests(
                        mentorshipData
                    );


                    setMyJobs(
                        jobsData
                    );


                    setMyEvents(
                        eventsData
                    );


                    setConversations(
                        conversationsData
                    );


                } catch (err) {

                    console.error(
                        "Dashboard error:",
                        err
                    );


                    if (
                        mounted
                    ) {

                        setError(
                            "Some dashboard information could not be loaded."
                        );

                    }

                } finally {

                    if (
                        mounted
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            };


        loadDashboard();


        return () => {

            mounted = false;

        };

    }, []);


    /* =====================================================
       PROFILE NAME
    ===================================================== */

    const firstName =
        profile?.firstName ||
        storedUser?.firstName ||
        storedUser?.name?.split(
            " "
        )?.[0] ||
        "Alumni";


    const lastName =
        profile?.lastName ||
        storedUser?.lastName ||
        "";


    const fullName =
        `${firstName} ${lastName}`.trim();


    /* =====================================================
       PROFILE IMAGE
    ===================================================== */

    const profileImage =
        profile?.profilePicture ||
        storedUser?.profilePicture ||
        null;


    /* =====================================================
       METRICS
    ===================================================== */

    const mentorshipCount =
        mentorshipRequests.length;


    const pendingMentorshipCount =
        mentorshipRequests.filter(
            (
                request
            ) =>
                normalizeStatus(
                    request?.status
                ) ===
                "pending"
        ).length;


    const jobsCount =
        myJobs.length;


    const eventsCount =
        myEvents.length;


    const messageCount =
        conversations.length;


    /* =====================================================
       UPCOMING EVENT
    ===================================================== */

    const upcomingEvent =
        getUpcomingEvent(
            myEvents
        );


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="space-y-6">

                <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[
                        1,
                        2,
                        3,
                        4,
                    ].map(
                        (
                            item
                        ) => (

                            <div
                                key={
                                    item
                                }
                                className="h-32 animate-pulse rounded-2xl bg-gray-200"
                            />

                        )
                    )}

                </div>


                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

                    <div className="h-[500px] animate-pulse rounded-2xl bg-gray-200 xl:col-span-8" />

                    <div className="h-[500px] animate-pulse rounded-2xl bg-gray-200 xl:col-span-4" />

                </div>

            </div>

        );

    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="space-y-6">


            {/* =================================================
               ERROR
            ================================================= */}

            {error && (

                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">

                    <p className="text-[10px] font-semibold text-amber-700">
                        {error}
                    </p>

                </div>

            )}


            {/* =================================================
               WELCOME
            ================================================= */}

            <section>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

                    <div>

                        <p className="mb-1 text-[9px] font-black uppercase tracking-[2px] text-[#004AC6]">
                            Alumni Dashboard
                        </p>


                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">

                            Welcome Back,{" "}
                            {fullName} 👋

                        </h1>


                        <p className="mt-2 text-xs font-medium text-gray-500 sm:text-sm">

                            Manage your alumni activity,
                            mentorship and professional
                            contributions.

                        </p>

                    </div>


                    {/* =================================================
                       AVAILABILITY
                    ================================================= */}

                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm sm:w-fit">

                        <span className="px-2 text-[10px] font-bold text-gray-500">
                            Mentorship Availability
                        </span>


                        <div className="flex rounded-xl bg-gray-100 p-1">

                            <button
                                type="button"
                                onClick={() =>
                                    setAvailability(
                                        "available"
                                    )
                                }
                                className={`
                                    rounded-lg px-4 py-2
                                    text-[10px] font-bold
                                    ${availability ===
                                        "available"
                                        ? "bg-[#004AC6] text-white shadow-sm"
                                        : "text-gray-500"
                                    }
                                `}
                            >
                                Available
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    setAvailability(
                                        "busy"
                                    )
                                }
                                className={`
                                    rounded-lg px-4 py-2
                                    text-[10px] font-bold
                                    ${availability ===
                                        "busy"
                                        ? "bg-[#004AC6] text-white shadow-sm"
                                        : "text-gray-500"
                                    }
                                `}
                            >
                                Busy
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
               PROFILE INFORMATION
            ================================================= */}

            <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white text-[#004AC6] shadow-sm">

                        {profileImage ? (

                            <img
                                src={
                                    profileImage
                                }
                                alt={
                                    fullName
                                }
                                className="h-full w-full object-cover"
                            />

                        ) : (

                            <Users
                                size={17}
                            />

                        )}

                    </div>


                    <div>

                        <span className="text-xs font-semibold text-blue-900">

                            {fullName}

                        </span>


                        <p className="mt-0.5 text-[9px] text-blue-800/60">

                            Keep your professional profile
                            and alumni information updated.

                        </p>

                    </div>

                </div>


                <Link
                    to="/alumni/profile"
                    className="text-[10px] font-bold text-[#004AC6] hover:underline"
                >
                    View Profile
                </Link>

            </div>


            {/* =================================================
               METRICS
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    label="Mentorship Requests"
                    value={
                        mentorshipCount
                    }
                    change={
                        pendingMentorshipCount >
                            0
                            ? `${pendingMentorshipCount} Pending`
                            : "No Pending"
                    }
                    icon={
                        Handshake
                    }
                />


                <MetricCard
                    label="Jobs Posted"
                    value={
                        jobsCount
                    }
                    change={
                        jobsCount >
                            0
                            ? "Your Jobs"
                            : "None"
                    }
                    icon={
                        BriefcaseBusiness
                    }
                />


                <MetricCard
                    label="Events Hosted"
                    value={
                        eventsCount
                    }
                    change={
                        eventsCount >
                            0
                            ? "Active"
                            : "None"
                    }
                    icon={
                        CalendarDays
                    }
                    gray
                />


                <MetricCard
                    label="Conversations"
                    value={
                        messageCount
                    }
                    change={
                        messageCount >
                            0
                            ? "Active"
                            : "None"
                    }
                    icon={
                        MessageSquare
                    }
                />

            </section>


            {/* =================================================
               MAIN GRID
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">


                {/* =================================================
                   LEFT
                ================================================= */}

                <div className="space-y-6 xl:col-span-8">


                    {/* =================================================
                       ACTION REQUIRED
                    ================================================= */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">

                                <span className="font-black">
                                    !
                                </span>

                            </div>


                            <div>

                                <h2 className="text-sm font-bold text-gray-900">
                                    Action Required
                                </h2>

                                <p className="mt-0.5 text-[9px] text-gray-400">
                                    Manage your alumni activities
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                            <ActionCard
                                label="Mentorship"
                                value={
                                    pendingMentorshipCount >
                                        0
                                        ? `${pendingMentorshipCount} Pending`
                                        : "No Pending"
                                }
                                button="Review Requests"
                                icon={
                                    <Handshake
                                        size={17}
                                    />
                                }
                                to="/alumni/mentorship"
                            />


                            <ActionCard
                                label="Jobs"
                                value={
                                    `${jobsCount} Posted`
                                }
                                button="Manage Jobs"
                                icon={
                                    <BriefcaseBusiness
                                        size={17}
                                    />
                                }
                                to="/alumni/jobs"
                            />


                            <ActionCard
                                label="Events"
                                value={
                                    `${eventsCount} Hosted`
                                }
                                button="Manage Events"
                                icon={
                                    <CalendarDays
                                        size={17}
                                    />
                                }
                                outlined
                                to="/alumni/events"
                            />

                        </div>

                    </section>


                    {/* =================================================
                       MENTORSHIP REQUESTS
                    ================================================= */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <h2 className="text-sm font-bold text-gray-900">
                                    Mentorship Requests
                                </h2>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    Requests received from students
                                </p>

                            </div>


                            <Link
                                to="/alumni/mentorship"
                                className="flex items-center gap-1 text-[10px] font-bold text-[#004AC6]"
                            >
                                View All

                                <ChevronRight
                                    size={12}
                                />

                            </Link>

                        </div>


                        {mentorshipRequests.length ===
                            0 ? (

                            <EmptyState
                                icon={
                                    <Handshake
                                        size={20}
                                    />
                                }
                                title="No mentorship requests"
                                text="You currently have no incoming mentorship requests."
                            />

                        ) : (

                            <div className="space-y-3">

                                {mentorshipRequests
                                    .slice(
                                        0,
                                        3
                                    )
                                    .map(
                                        (
                                            request,
                                            index
                                        ) => (

                                            <MentorshipRequestCard
                                                key={
                                                    request?._id ||
                                                    index
                                                }
                                                request={
                                                    request
                                                }
                                            />

                                        )
                                    )}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                       JOBS
                    ================================================= */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <h2 className="text-sm font-bold text-gray-900">
                                    Your Job Posts
                                </h2>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    Jobs posted by your account
                                </p>

                            </div>


                            <Link
                                to="/alumni/jobs"
                                className="flex items-center gap-1 text-[10px] font-bold text-[#004AC6]"
                            >
                                Manage Jobs

                                <ChevronRight
                                    size={12}
                                />

                            </Link>

                        </div>


                        {myJobs.length ===
                            0 ? (

                            <EmptyState
                                icon={
                                    <BriefcaseBusiness
                                        size={20}
                                    />
                                }
                                title="No jobs posted"
                                text="Post an opportunity to help students discover career opportunities."
                                action={
                                    <Link
                                        to="/alumni/jobs"
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#004AC6] px-4 py-2 text-[10px] font-bold text-white"
                                    >

                                        <Plus
                                            size={13}
                                        />

                                        Post a Job

                                    </Link>
                                }
                            />

                        ) : (

                            <div className="space-y-3">

                                {myJobs
                                    .slice(
                                        0,
                                        3
                                    )
                                    .map(
                                        (
                                            job,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    job?._id ||
                                                    index
                                                }
                                                className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-200"
                                            >

                                                <div className="flex items-center justify-between gap-3">

                                                    <div className="flex min-w-0 items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004AC6]">

                                                            <BriefcaseBusiness
                                                                size={17}
                                                            />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <h3 className="truncate text-xs font-bold text-gray-900">

                                                                {
                                                                    job?.title ||
                                                                    job?.jobTitle ||
                                                                    "Job Opportunity"
                                                                }

                                                            </h3>


                                                            <p className="mt-1 truncate text-[10px] text-gray-400">

                                                                {
                                                                    job?.company ||
                                                                    job?.companyName ||
                                                                    "Company"
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-[#004AC6]">

                                                        Posted

                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )}

                            </div>

                        )}

                    </section>

                </div>


                {/* =================================================
                   RIGHT
                ================================================= */}

                <div className="space-y-6 xl:col-span-4">


                    {/* =================================================
                       QUICK ACTIONS
                    ================================================= */}

                    <section className="grid grid-cols-2 gap-3">

                        <QuickAction
                            icon={
                                <Handshake />
                            }
                            label="Mentorship"
                            to="/alumni/mentorship"
                        />


                        <QuickAction
                            icon={
                                <BriefcaseBusiness />
                            }
                            label="Post Job"
                            to="/alumni/jobs"
                        />


                        <QuickAction
                            icon={
                                <Plus />
                            }
                            label="Create Event"
                            to="/alumni/events"
                        />


                        <QuickAction
                            icon={
                                <MessageSquare />
                            }
                            label="Messages"
                            to="/alumni/messages"
                        />

                    </section>


                    {/* =================================================
                       UPCOMING EVENT
                    ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#003A9B] via-[#004AC6] to-[#527DFF]">

                            <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10" />


                            <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-white/10" />


                            <span className="absolute bottom-3 left-4 rounded-md bg-orange-500 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                                Upcoming
                            </span>

                        </div>


                        <div className="p-5">

                            {upcomingEvent ? (

                                <>

                                    <h3 className="text-sm font-bold text-gray-900">

                                        {
                                            upcomingEvent?.title ||
                                            upcomingEvent?.name ||
                                            "Upcoming Event"
                                        }

                                    </h3>


                                    <p className="mt-1 text-[10px] text-gray-400">

                                        {formatEventDate(
                                            upcomingEvent
                                        )}

                                    </p>


                                    {(
                                        upcomingEvent?.location ||
                                        upcomingEvent?.platform
                                    ) && (

                                            <p className="mt-2 text-[9px] text-gray-400">

                                                {
                                                    upcomingEvent?.location ||
                                                    upcomingEvent?.platform
                                                }

                                            </p>

                                        )}


                                    <Link
                                        to="/alumni/events"
                                        className="mt-5 flex h-9 w-full items-center justify-center rounded-lg bg-[#004AC6] text-[10px] font-bold text-white"
                                    >
                                        Manage Events
                                    </Link>

                                </>

                            ) : (

                                <>

                                    <h3 className="text-sm font-bold text-gray-900">
                                        No Upcoming Events
                                    </h3>


                                    <p className="mt-1 text-[10px] leading-4 text-gray-400">
                                        You haven't created any events yet.
                                    </p>


                                    <Link
                                        to="/alumni/events"
                                        className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#004AC6] text-[10px] font-bold text-white"
                                    >

                                        <Plus
                                            size={13}
                                        />

                                        Create Event

                                    </Link>

                                </>

                            )}

                        </div>

                    </section>


                    {/* =================================================
                       MESSAGES
                    ================================================= */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">

                            <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#004AC6]">

                                    <MessageSquare
                                        size={15}
                                    />

                                </div>


                                <h2 className="text-sm font-bold text-gray-900">
                                    Conversations
                                </h2>

                            </div>


                            <Link
                                to="/alumni/messages"
                                className="text-[10px] font-bold text-[#004AC6]"
                            >
                                View All
                            </Link>

                        </div>


                        {conversations.length ===
                            0 ? (

                            <p className="py-4 text-center text-[10px] text-gray-400">
                                No conversations yet.
                            </p>

                        ) : (

                            <div className="space-y-3">

                                {conversations
                                    .slice(
                                        0,
                                        3
                                    )
                                    .map(
                                        (
                                            conversation,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    conversation?._id ||
                                                    index
                                                }
                                                className="flex items-center gap-3"
                                            >

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-[#004AC6]">

                                                    {getConversationInitials(
                                                        conversation
                                                    )}

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="truncate text-[10px] font-bold text-gray-800">

                                                        {
                                                            getConversationName(
                                                                conversation
                                                            )
                                                        }

                                                    </p>


                                                    <p className="truncate text-[9px] text-gray-400">

                                                        {
                                                            getConversationPreview(
                                                                conversation
                                                            )
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        )
                                    )}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                       PROFILE
                    ================================================= */}

                    <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-[#004AC6] shadow-sm">

                                {profileImage ? (

                                    <img
                                        src={
                                            profileImage
                                        }
                                        alt={
                                            fullName
                                        }
                                        className="h-full w-full object-cover"
                                    />

                                ) : (

                                    <Users
                                        size={17}
                                    />

                                )}

                            </div>


                            <div>

                                <p className="text-xs font-bold text-gray-800">
                                    {fullName}
                                </p>


                                {profile?.professionalHeadline && (

                                    <p className="mt-1 text-[9px] leading-4 text-gray-500">

                                        {
                                            profile.professionalHeadline
                                        }

                                    </p>

                                )}


                                <p className="mt-1 text-[10px] leading-4 text-gray-500">

                                    Keep your professional
                                    profile updated.

                                </p>


                                <Link
                                    to="/alumni/profile"
                                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#004AC6]"
                                >

                                    Update Profile

                                    <ChevronRight
                                        size={11}
                                    />

                                </Link>

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </div>

    );

};


/* =========================================================
   METRIC CARD
========================================================= */

const MetricCard = ({
    label,
    value,
    change,
    icon: Icon,
    gray = false,
}) => {

    return (

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

            <div className="mb-4 flex items-center justify-between">

                <div
                    className={`
                        flex h-9 w-9 items-center
                        justify-center rounded-xl
                        ${gray
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-50 text-[#004AC6]"
                        }
                    `}
                >

                    <Icon
                        size={17}
                    />

                </div>


                <span
                    className={`
                        rounded-full px-2 py-1
                        text-[9px] font-bold
                        ${gray
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-50 text-[#004AC6]"
                        }
                    `}
                >
                    {change}
                </span>

            </div>


            <div className="text-3xl font-extrabold tracking-tight text-gray-900">
                {value}
            </div>


            <div className="mt-1 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
                {label}
            </div>

        </div>

    );

};


/* =========================================================
   ACTION CARD
========================================================= */

const ActionCard = ({
    label,
    value,
    button,
    icon,
    outlined = false,
    to,
}) => {

    return (

        <div className="flex flex-col justify-between rounded-xl bg-gray-50 p-4">

            <div>

                <div className="mb-3 flex items-center justify-between">

                    <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
                        {label}
                    </span>


                    <span className="text-[#004AC6]">
                        {icon}
                    </span>

                </div>


                <div className="text-sm font-extrabold text-gray-900">
                    {value}
                </div>

            </div>


            <Link
                to={to}
                className={`
                    mt-4 flex w-full items-center
                    justify-center rounded-lg py-2
                    text-[10px] font-bold transition
                    ${outlined
                        ? "border-2 border-[#004AC6] text-[#004AC6] hover:bg-blue-50"
                        : "bg-[#004AC6] text-white hover:bg-[#0038A8]"
                    }
                `}
            >
                {button}
            </Link>

        </div>

    );

};


/* =========================================================
   QUICK ACTION
========================================================= */

const QuickAction = ({
    icon,
    label,
    to,
}) => {

    return (

        <Link
            to={to}
            className="group flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >

            <span className="text-[#004AC6] transition group-hover:scale-110">

                {React.cloneElement(
                    icon,
                    {
                        size: 25,
                        strokeWidth: 1.8,
                    }
                )}

            </span>


            <span className="text-[10px] font-bold text-gray-600">
                {label}
            </span>

        </Link>

    );

};


/* =========================================================
   MENTORSHIP REQUEST CARD
========================================================= */

const MentorshipRequestCard = ({
    request,
}) => {

    /*
     * ACTUAL BACKEND STRUCTURE:
     *
     * request.menteeId = {
     *     _id,
     *     email,
     *     role
     * }
     *
     * request.menteeProfile = fetched
     * from /api/profile/get-profile/:id
     */


    const requester =
        request?.menteeProfile ||
        {};


    const name =
        getPersonName(
            requester
        );


    const email =
        requester?.userId?.email ||
        requester?.email ||
        request?.menteeId?.email ||
        "";


    const profileImage =
        requester?.profilePicture ||
        null;


    const headline =
        requester?.professionalHeadline ||
        "";


    const location =
        requester?.location;


    const message =
        request?.message ||
        "This student is requesting mentorship from you.";


    const status =
        normalizeStatus(
            request?.status
        );


    return (

        <div className="rounded-2xl border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row">


                {/* AVATAR */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xs font-extrabold text-[#004AC6]">

                    {profileImage ? (

                        <img
                            src={
                                profileImage
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


                {/* CONTENT */}

                <div className="min-w-0 flex-1">

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

                                <p className="mt-1 text-[9px] text-gray-400">

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


                    <div className="mt-3 rounded-xl bg-gray-50 p-3">

                        <p className="text-xs leading-5 text-gray-500">

                            "{message}"

                        </p>

                    </div>


                    <div className="mt-4 flex flex-wrap gap-2">

                        <Link
                            to="/alumni/mentorship"
                            className="rounded-lg bg-[#004AC6] px-5 py-2 text-[10px] font-bold text-white"
                        >
                            Review
                        </Link>


                        {status ===
                            "accepted" && (

                                <Link
                                    to="/alumni/messages"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-[10px] font-bold text-gray-600"
                                >

                                    <MessageSquare
                                        size={12}
                                    />

                                    Message

                                </Link>

                            )}

                    </div>

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
                <span className="text-[9px]">
                    ×
                </span>
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

const EmptyState = ({
    icon,
    title,
    text,
    action,
}) => {

    return (

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center">

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">

                {icon}

            </div>


            <h3 className="text-xs font-bold text-gray-700">
                {title}
            </h3>


            <p className="mt-1 max-w-sm text-[10px] leading-4 text-gray-400">
                {text}
            </p>


            {action}

        </div>

    );

};


/* =========================================================
   HELPERS
========================================================= */

const getPersonName = (
    person
) => {

    if (
        person?.firstName
    ) {

        return `${person.firstName} ${person.lastName ||
            ""
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


    return "Student";

};


const getInitials = (
    name = ""
) => {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (
                word
            ) =>
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


/* =========================================================
   EVENT DATE
========================================================= */

const getUpcomingEvent = (
    events = []
) => {

    if (
        !Array.isArray(
            events
        ) ||
        events.length === 0
    ) {

        return null;

    }


    const now =
        new Date();


    const upcoming =
        events
            .map(
                (
                    event
                ) => {

                    const date =
                        getEventDate(
                            event
                        );

                    return {
                        event,
                        date,
                    };

                }
            )
            .filter(
                ({
                    date,
                }) =>
                    date &&
                    date >= now
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.date -
                    b.date
            );


    return (
        upcoming[0]?.event ||
        events[0]
    );

};


const getEventDate = (
    event
) => {

    const value =
        event?.date ||
        event?.startDate ||
        event?.eventDate;


    if (!value) {
        return null;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

};


const formatEventDate = (
    event
) => {

    const date =
        getEventDate(
            event
        );


    if (!date) {
        return "Upcoming";
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


/* =========================================================
   CONVERSATION HELPERS
========================================================= */

const getConversationUser = (
    conversation
) => {

    return (
        conversation?.otherUser ||
        conversation?.receiver ||
        conversation?.sender ||
        conversation?.user ||
        conversation?.participant ||
        {}
    );

};


const getConversationName = (
    conversation
) => {

    /*
     * First use the profile fetched from
     * /api/profile/get-profile/:userId
     */

    const profile =
        conversation?.otherProfile;


    if (
        profile?.firstName
    ) {

        return `${profile.firstName} ${profile.lastName || ""
            }`.trim();

    }


    if (
        typeof profile?.name ===
        "string"
    ) {

        return profile.name;

    }


    if (
        typeof profile?.fullName ===
        "string"
    ) {

        return profile.fullName;

    }


    /*
     * Fallback to populated user.
     */

    const user =
        conversation?.otherUser ||
        conversation?.receiver ||
        conversation?.participant ||
        conversation?.user;


    if (
        user &&
        typeof user === "object"
    ) {

        if (
            user?.firstName
        ) {

            return `${user.firstName} ${user.lastName || ""
                }`.trim();

        }


        if (
            typeof user?.name ===
            "string"
        ) {

            return user.name;

        }


        if (
            typeof user?.fullName ===
            "string"
        ) {

            return user.fullName;

        }


        if (
            typeof user?.email ===
            "string"
        ) {

            return user.email;

        }

    }


    return "User";

};


const getConversationPreview = (
    conversation
) => {

    const lastMessage =
        conversation?.lastMessage;


    // If lastMessage is an object
    if (
        lastMessage &&
        typeof lastMessage === "object"
    ) {

        return (
            lastMessage?.text ||
            lastMessage?.message ||
            "No messages yet"
        );

    }


    // If lastMessage is already a string
    if (
        typeof lastMessage === "string"
    ) {

        return lastMessage;

    }


    // Other possible response shapes
    const latestMessage =
        conversation?.latestMessage;


    if (
        latestMessage &&
        typeof latestMessage === "object"
    ) {

        return (
            latestMessage?.text ||
            latestMessage?.message ||
            "No messages yet"
        );

    }


    if (
        typeof latestMessage === "string"
    ) {

        return latestMessage;

    }


    if (
        typeof conversation?.message ===
        "string"
    ) {

        return conversation.message;

    }


    return "No messages yet";

};


const getConversationInitials = (
    conversation
) => {

    const name =
        getConversationName(
            conversation
        );


    return getInitials(
        name
    );

};


export default AlumniDashboard;