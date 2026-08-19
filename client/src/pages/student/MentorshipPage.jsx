import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    Handshake,
    Search,
    MapPin,
    Briefcase,
    Send,
    MessageSquare,
    CheckCircle2,
    Clock3,
    XCircle,
    ChevronRight,
    X,
    Eye,
    UserRound,
    Loader2,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const MentorshipPage = () => {
    const token = sessionStorage.getItem("accessToken");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    /* =====================================================
       STATE
    ===================================================== */

    const [profiles, setProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    const [outgoing, setOutgoing] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const [search, setSearch] = useState("");

    const [selectedMentor, setSelectedMentor] = useState(null);
    const [requestMessage, setRequestMessage] = useState("");
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [requestFilter, setRequestFilter] = useState("all");

    /* =====================================================
       FETCH ALUMNI
    ===================================================== */

    const fetchAlumni = async () => {
        if (!token) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            setLoadingProfiles(true);

            const response = await axios.get(
                `${API_URL}/api/profile/alumni-directory`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        page: 1,
                        limit: 100,
                    },
                }
            );

            console.log("Mentorship alumni:", response.data);

            const alumniOnly = (
                response.data?.profiles || []
            ).filter(
                (profile) =>
                    profile.userId?.role === "alumni" ||
                    profile.role === "alumni"
            );

            setProfiles(alumniOnly);
        } catch (error) {
            console.error(
                "Mentorship alumni error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load alumni."
            );
        } finally {
            setLoadingProfiles(false);
        }
    };

    /* =====================================================
       FETCH MENTORSHIP REQUESTS
    ===================================================== */

    const fetchRequests = async () => {
        if (!token) return;

        try {
            setLoadingRequests(true);

            const [
                sentResponse,
                receivedResponse,
            ] = await Promise.all([
                axios.get(
                    `${API_URL}/api/mentorship/sent`,
                    authConfig
                ),

                axios.get(
                    `${API_URL}/api/mentorship/recieved`,
                    authConfig
                ),
            ]);

            console.log(
                "Sent mentorship requests:",
                sentResponse.data
            );

            console.log(
                "Received mentorship requests:",
                receivedResponse.data
            );

            setOutgoing(
                sentResponse.data?.requests || []
            );

            setIncoming(
                receivedResponse.data?.requests || []
            );
        } catch (error) {
            console.error(
                "Mentorship request error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load mentorship requests."
            );
        } finally {
            setLoadingRequests(false);
        }
    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        fetchAlumni();
        fetchRequests();
    }, []);

    /* =====================================================
       HELPERS
    ===================================================== */

    const getUserId = (profile) => {
        return profile?.userId?._id || profile?.userId;
    };

    const getName = (profile) => {
        if (!profile) return "Alumni Member";

        const name =
            `${profile.firstName || ""} ${profile.lastName || ""
                }`.trim();

        return name || "Alumni Member";
    };

    const getInitials = (profile) => {
        const name = getName(profile);

        return name
            .split(" ")
            .filter(Boolean)
            .map((item) => item[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const getLocation = (profile) => {
        const city = profile?.location?.city;
        const state = profile?.location?.state;

        if (city && state) {
            return `${city}, ${state}`;
        }

        return city || state || "Location not available";
    };

    const getHeadline = (profile) => {
        return (
            profile?.professionalHeadline ||
            profile?.proffesionalHeadLine ||
            profile?.experience?.find(
                (item) => item?.isCurrent
            )?.position ||
            profile?.experience?.[0]?.position ||
            "Professional"
        );
    };

    const getCompany = (profile) => {
        return (
            profile?.experience?.find(
                (item) => item?.isCurrent
            )?.company ||
            profile?.experience?.[0]?.company ||
            profile?.company ||
            ""
        );
    };

    const formatDate = (date) => {
        if (!date) return "--";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "--";
        }

        return parsed.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    /* =====================================================
       REQUEST STATUS MAP
    ===================================================== */

    const requestStatusMap = useMemo(() => {
        const map = {};

        outgoing.forEach((request) => {
            const mentorId =
                request?.mentorId?._id ||
                request?.mentorId;

            if (mentorId) {
                map[String(mentorId)] =
                    request.status;
            }
        });

        return map;
    }, [outgoing]);

    /* =====================================================
       FILTER ALUMNI
    ===================================================== */

    const filteredProfiles = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return profiles;
        }

        return profiles.filter((profile) => {
            const skills = Array.isArray(
                profile.skills
            )
                ? profile.skills.join(" ")
                : "";

            const experience =
                profile.experience
                    ?.map(
                        (item) =>
                            `${item?.company || ""} ${item?.position || ""
                            }`
                    )
                    .join(" ") || "";

            const education =
                profile.education
                    ?.map(
                        (item) =>
                            `${item?.institution || ""} ${item?.degree || ""
                            } ${item?.fieldOfStudy || ""
                            }`
                    )
                    .join(" ") || "";

            const searchable = [
                profile.firstName,
                profile.lastName,
                profile.professionalHeadline,
                profile.proffesionalHeadLine,
                profile.location?.city,
                profile.location?.state,
                skills,
                experience,
                education,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(query);
        });
    }, [profiles, search]);

    /* =====================================================
       SUMMARY
    ===================================================== */

    const pendingCount = outgoing.filter(
        (item) => item.status === "pending"
    ).length;

    const acceptedCount = outgoing.filter(
        (item) =>
            item.status === "accepted" ||
            item.status === "active"
    ).length;

    const rejectedCount = outgoing.filter(
        (item) => item.status === "rejected"
    ).length;

    /* =====================================================
       REQUEST MODAL
    ===================================================== */

    const openRequestModal = (mentor) => {
        setSelectedMentor(mentor);
        setRequestMessage("");
        setRequestModalOpen(true);
    };

    const closeRequestModal = () => {
        if (sendingRequest) return;

        setRequestModalOpen(false);
        setSelectedMentor(null);
        setRequestMessage("");
    };

    /* =====================================================
       SEND MENTORSHIP REQUEST
    ===================================================== */

    const handleSendRequest = async (event) => {
        event.preventDefault();

        if (!selectedMentor) return;

        if (!requestMessage.trim()) {
            toast.error(
                "Please write a message before sending."
            );
            return;
        }

        const mentorId =
            getUserId(selectedMentor);

        if (!mentorId) {
            toast.error(
                "Unable to identify this alumni."
            );
            return;
        }

        try {
            setSendingRequest(true);

            await axios.post(
                `${API_URL}/api/mentorship/send`,
                {
                    mentorId,
                    message: requestMessage.trim(),
                },
                authConfig
            );

            toast.success(
                `Mentorship request sent to ${getName(
                    selectedMentor
                )}.`
            );

            closeRequestModal();

            await fetchRequests();
        } catch (error) {
            console.error(
                "Send mentorship request error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to send mentorship request."
            );
        } finally {
            setSendingRequest(false);
        }
    };

    /* =====================================================
       REQUEST DETAILS
    ===================================================== */

    const openRequestDetails = (request) => {
        setSelectedRequest(request);
        setDetailsOpen(true);
    };

    const closeRequestDetails = () => {
        setDetailsOpen(false);

        setTimeout(() => {
            setSelectedRequest(null);
        }, 200);
    };

    /* =====================================================
       STATUS UPDATE
       Used for incoming requests.
    ===================================================== */

    const handleStatusUpdate = async (
        requestId,
        status
    ) => {
        try {
            await axios.put(
                `${API_URL}/api/mentorship/status/${requestId}`,
                {
                    status,
                },
                authConfig
            );

            toast.success(
                status === "accepted"
                    ? "Mentorship request accepted."
                    : "Mentorship request declined."
            );

            await fetchRequests();
        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to update request."
            );
        }
    };

    /* =====================================================
       REQUEST FILTER
    ===================================================== */

    const filteredRequests =
        outgoing.filter((request) => {
            if (
                requestFilter === "all"
            ) {
                return true;
            }

            return (
                request.status ===
                requestFilter
            );
        });

    /* =====================================================
       ALUMNI CARD
    ===================================================== */

    const AlumniCard = ({ profile }) => {
        const userId = getUserId(profile);

        const status =
            requestStatusMap[
            String(userId)
            ];

        const name = getName(profile);
        const image =
            profile.profilePicture;

        return (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">

                {/* PROFILE */}

                <div className="flex gap-3">

                    {image ? (
                        <img
                            src={image}
                            alt={name}
                            className="h-14 w-14 shrink-0 rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-bold text-[#004AC6]">
                            {getInitials(
                                profile
                            )}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                                <h3 className="truncate text-sm font-bold text-gray-900">
                                    {name}
                                </h3>

                                <p className="mt-1 line-clamp-2 text-[11px] font-medium text-gray-600">
                                    {getHeadline(
                                        profile
                                    )}
                                </p>

                            </div>

                            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-[#004AC6]">
                                Alumni
                            </span>

                        </div>

                        <div className="mt-2 flex items-center gap-1 text-[9px] text-gray-400">

                            <MapPin
                                size={11}
                            />

                            {getLocation(
                                profile
                            )}

                        </div>

                        {getCompany(
                            profile
                        ) && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-400">

                                    <Briefcase
                                        size={11}
                                    />

                                    <span className="truncate">
                                        {getCompany(
                                            profile
                                        )}
                                    </span>

                                </div>
                            )}

                    </div>

                </div>

                {/* SKILLS */}

                {profile.skills?.length >
                    0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">

                            {profile.skills
                                .slice(0, 3)
                                .map(
                                    (
                                        skill,
                                        index
                                    ) => (
                                        <span
                                            key={
                                                index
                                            }
                                            className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-semibold text-gray-500"
                                        >
                                            {
                                                skill
                                            }
                                        </span>
                                    )
                                )}

                            {profile.skills.length >
                                3 && (
                                    <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-semibold text-gray-400">
                                        +
                                        {profile.skills
                                            .length -
                                            3}
                                    </span>
                                )}

                        </div>
                    )}

                {/* ACTIONS */}

                <div className="mt-4 grid grid-cols-2 gap-2">

                    <Link
                        to={`/student/directory/${userId}`}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#004AC6] bg-white text-[10px] font-semibold text-[#004AC6] transition hover:bg-blue-50"
                    >
                        <Eye
                            size={13}
                        />
                        View Profile
                    </Link>

                    {status ===
                        "accepted" ||
                        status ===
                        "active" ? (
                        <Link
                            to={{
                                pathname:
                                    "/student/messages",
                                search: `?chat=${userId}`,
                                state: {
                                    chatTarget: {
                                        _id: userId,
                                        firstName:
                                            profile.firstName,
                                        lastName:
                                            profile.lastName,
                                        profilePicture:
                                            profile.profilePicture,
                                    },
                                },
                            }}
                            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#004AC6] text-[10px] font-semibold text-white transition hover:bg-[#0038A8]"
                        >
                            <MessageSquare
                                size={13}
                            />
                            Message
                        </Link>
                    ) : status ===
                        "pending" ? (
                        <button
                            type="button"
                            disabled
                            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-700"
                        >
                            <Clock3
                                size={13}
                            />
                            Pending
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                openRequestModal(
                                    profile
                                )
                            }
                            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#004AC6] text-[10px] font-semibold text-white transition hover:bg-[#0038A8]"
                        >
                            <Send
                                size={13}
                            />
                            Request Mentor
                        </button>
                    )}

                </div>

            </div>
        );
    };

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="min-h-full bg-[#F8F9FF] px-4 py-5 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* =================================================
                   HEADER
                ================================================= */}

                <div className="mb-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#004AC6]">
                            <Handshake
                                size={20}
                            />
                        </div>

                        <div>

                            <h1 className="text-xl font-bold text-gray-900">
                                Mentorship
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Connect with alumni
                                mentors and get
                                guidance for your
                                career.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   SUMMARY
                ================================================= */}

                <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                    <SummaryCard
                        title="Available Alumni"
                        value={
                            profiles.length
                        }
                        icon={
                            <UserRound
                                size={17}
                            />
                        }
                    />

                    <SummaryCard
                        title="Total Requests"
                        value={
                            outgoing.length
                        }
                        icon={
                            <Send
                                size={17}
                            />
                        }
                    />

                    <SummaryCard
                        title="Pending"
                        value={
                            pendingCount
                        }
                        color="amber"
                        icon={
                            <Clock3
                                size={17}
                            />
                        }
                    />

                    <SummaryCard
                        title="Active Mentors"
                        value={
                            acceptedCount
                        }
                        color="green"
                        icon={
                            <CheckCircle2
                                size={17}
                            />
                        }
                    />

                </div>


                {/* =================================================
                   FIND MENTOR
                ================================================= */}

                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <h2 className="text-sm font-bold text-gray-900">
                                Find a Mentor
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Search alumni by name,
                                company, skills, or
                                professional role.
                            </p>

                        </div>

                        <div className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-[#004AC6]">
                            {filteredProfiles.length}{" "}
                            mentors found
                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="relative">

                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={
                                search
                            }
                            onChange={(e) =>
                                setSearch(
                                    e.target
                                        .value
                                )
                            }
                            placeholder="Search by name, company, skill, or industry..."
                            className="h-10 w-full rounded-lg border border-gray-200 bg-[#F8F9FF] pl-9 pr-3 text-xs text-gray-700 outline-none transition focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                <X
                                    size={
                                        14
                                    }
                                />
                            </button>
                        )}

                    </div>

                </section>


                {/* =================================================
                   ALUMNI
                ================================================= */}

                <section className="mt-6">

                    <div className="mb-3 flex items-center justify-between">

                        <div>

                            <h2 className="text-sm font-bold text-gray-900">
                                Alumni Mentors
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-500">
                                Choose an alumni member
                                whose experience matches
                                your goals.
                            </p>

                        </div>

                    </div>


                    {loadingProfiles ? (

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {Array.from({
                                length: 6,
                            }).map(
                                (_, index) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="animate-pulse rounded-xl border border-gray-200 bg-white p-4"
                                    >
                                        <div className="flex gap-3">

                                            <div className="h-14 w-14 rounded-lg bg-gray-200" />

                                            <div className="flex-1 space-y-2">

                                                <div className="h-3 w-28 rounded bg-gray-200" />

                                                <div className="h-2.5 w-40 rounded bg-gray-100" />

                                                <div className="h-2.5 w-24 rounded bg-gray-100" />

                                            </div>

                                        </div>

                                        <div className="mt-4 h-8 rounded bg-gray-100" />

                                    </div>
                                )
                            )}

                        </div>

                    ) : filteredProfiles.length ===
                        0 ? (

                        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#004AC6]">

                                <Search
                                    size={
                                        21
                                    }
                                />

                            </div>

                            <h3 className="mt-3 text-sm font-bold text-gray-800">
                                No alumni found
                            </h3>

                            <p className="mt-1 text-xs text-gray-400">
                                Try another name,
                                skill, company, or
                                role.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {filteredProfiles.map(
                                (
                                    profile
                                ) => (
                                    <AlumniCard
                                        key={
                                            profile._id
                                        }
                                        profile={
                                            profile
                                        }
                                    />
                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                   MY REQUESTS
                ================================================= */}

                <section className="mt-8 border-t border-gray-200 pt-6">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="text-sm font-bold text-gray-900">
                                My Mentorship Requests
                            </h2>

                            <p className="mt-1 text-[10px] text-gray-500">
                                Track requests you have
                                sent to alumni.
                            </p>

                        </div>


                        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">

                            {[
                                [
                                    "all",
                                    "All",
                                ],
                                [
                                    "pending",
                                    "Pending",
                                ],
                                [
                                    "accepted",
                                    "Accepted",
                                ],
                                [
                                    "rejected",
                                    "Rejected",
                                ],
                            ].map(
                                ([
                                    value,
                                    label,
                                ]) => (
                                    <button
                                        key={
                                            value
                                        }
                                        type="button"
                                        onClick={() =>
                                            setRequestFilter(
                                                value
                                            )
                                        }
                                        className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${requestFilter ===
                                                value
                                                ? "bg-white text-[#004AC6] shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                            }`}
                                    >
                                        {
                                            label
                                        }
                                    </button>
                                )
                            )}

                        </div>

                    </div>


                    {loadingRequests ? (

                        <div className="rounded-xl border border-gray-200 bg-white py-10 text-center">

                            <Loader2
                                size={22}
                                className="mx-auto animate-spin text-[#004AC6]"
                            />

                        </div>

                    ) : filteredRequests.length ===
                        0 ? (

                        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center">

                            <Handshake
                                size={24}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-2 text-xs font-semibold text-gray-500">
                                No mentorship requests
                                found.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-2">

                            {filteredRequests.map(
                                (request) => {

                                    const mentor =
                                        request.mentorId ||
                                        {};

                                    return (
                                        <div
                                            key={
                                                request._id
                                            }
                                            onClick={() =>
                                                openRequestDetails(
                                                    request
                                                )
                                            }
                                            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                                        >

                                            <div className="flex items-center gap-4">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-[#004AC6]">

                                                    {mentor.profilePicture ? (
                                                        <img
                                                            src={
                                                                mentor.profilePicture
                                                            }
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        mentor.email
                                                            ?.charAt(
                                                                0
                                                            )
                                                            .toUpperCase() ||
                                                        "A"
                                                    )}

                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <h3 className="truncate text-xs font-bold text-gray-900">

                                                        {mentor.email ||
                                                            "Alumni Member"}

                                                    </h3>

                                                    <p className="mt-1 line-clamp-1 text-[10px] text-gray-500">

                                                        {request.message}

                                                    </p>

                                                </div>


                                                <div className="hidden shrink-0 sm:block">

                                                    <p className="text-[9px] text-gray-400">
                                                        Requested
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] font-semibold text-gray-600">
                                                        {formatDate(
                                                            request.createdAt
                                                        )}
                                                    </p>

                                                </div>


                                                <StatusBadge
                                                    status={
                                                        request.status
                                                    }
                                                />

                                                <ChevronRight
                                                    size={
                                                        16
                                                    }
                                                    className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#004AC6]"
                                                />

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                   INCOMING REQUESTS
                ================================================= */}

                {incoming.length >
                    0 && (
                        <section className="mt-8 border-t border-gray-200 pt-6">

                            <div className="mb-4">

                                <h2 className="text-sm font-bold text-gray-900">
                                    Incoming Mentorship Requests
                                </h2>

                                <p className="mt-1 text-[10px] text-gray-500">
                                    Requests received on your
                                    account.
                                </p>

                            </div>


                            <div className="space-y-2">

                                {incoming.map(
                                    (request) => (
                                        <div
                                            key={
                                                request._id
                                            }
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                        >

                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div className="min-w-0">

                                                    <h3 className="text-xs font-bold text-gray-900">
                                                        {request.menteeId
                                                            ?.email ||
                                                            "Student"}
                                                    </h3>

                                                    <p className="mt-1 text-[10px] text-gray-500">
                                                        {
                                                            request.message
                                                        }
                                                    </p>

                                                </div>


                                                {request.status ===
                                                    "pending" && (
                                                        <div className="flex gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusUpdate(
                                                                        request._id,
                                                                        "accepted"
                                                                    )
                                                                }
                                                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                                            >
                                                                Accept
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusUpdate(
                                                                        request._id,
                                                                        "rejected"
                                                                    )
                                                                }
                                                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                                                            >
                                                                Decline
                                                            </button>

                                                        </div>
                                                    )}

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        </section>
                    )}

            </div>


            {/* =====================================================
               REQUEST MENTOR MODAL
            ===================================================== */}

            {requestModalOpen &&
                selectedMentor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">

                        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                                <div>

                                    <h2 className="text-base font-bold text-gray-900">
                                        Request Mentorship
                                    </h2>

                                    <p className="mt-1 text-[10px] text-gray-500">
                                        Send a request to{" "}
                                        <span className="font-semibold text-gray-700">
                                            {getName(
                                                selectedMentor
                                            )}
                                        </span>
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeRequestModal
                                    }
                                    disabled={
                                        sendingRequest
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                                >
                                    <X
                                        size={
                                            16
                                        }
                                    />
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleSendRequest
                                }
                                className="p-5"
                            >

                                {/* MENTOR */}

                                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">

                                    {selectedMentor.profilePicture ? (
                                        <img
                                            src={
                                                selectedMentor.profilePicture
                                            }
                                            alt={getName(
                                                selectedMentor
                                            )}
                                            className="h-12 w-12 rounded-lg border object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-bold text-[#004AC6]">
                                            {getInitials(
                                                selectedMentor
                                            )}
                                        </div>
                                    )}

                                    <div className="min-w-0">

                                        <p className="truncate text-sm font-bold text-gray-900">
                                            {getName(
                                                selectedMentor
                                            )}
                                        </p>

                                        <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                            {getHeadline(
                                                selectedMentor
                                            )}
                                        </p>

                                    </div>

                                </div>


                                {/* MESSAGE */}

                                <div className="mt-4">

                                    <label className="mb-2 block text-xs font-bold text-gray-700">
                                        Message
                                    </label>

                                    <textarea
                                        value={
                                            requestMessage
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setRequestMessage(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={
                                            5
                                        }
                                        maxLength={
                                            500
                                        }
                                        placeholder="Introduce yourself and explain what you would like guidance with..."
                                        className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-xs leading-5 text-gray-700 outline-none focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100"
                                    />

                                    <div className="mt-1 text-right text-[9px] text-gray-400">
                                        {
                                            requestMessage.length
                                        }
                                        /500
                                    </div>

                                </div>


                                {/* BUTTONS */}

                                <div className="mt-5 flex gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeRequestModal
                                        }
                                        disabled={
                                            sendingRequest
                                        }
                                        className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            sendingRequest
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#004AC6] py-2.5 text-xs font-semibold text-white hover:bg-[#0038A8] disabled:opacity-60"
                                    >
                                        {sendingRequest ? (
                                            <Loader2
                                                size={
                                                    14
                                                }
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Send
                                                size={
                                                    14
                                                }
                                            />
                                        )}

                                        Send Request
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}


            {/* =====================================================
               REQUEST DETAILS
            ===================================================== */}

            {detailsOpen &&
                selectedRequest && (
                    <div className="fixed inset-0 z-[90]">

                        <div
                            onClick={
                                closeRequestDetails
                            }
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />

                        <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white shadow-2xl">

                            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">

                                <div>

                                    <h2 className="text-base font-bold text-gray-900">
                                        Request Details
                                    </h2>

                                    <p className="mt-1 text-[10px] text-gray-500">
                                        Mentorship request
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeRequestDetails
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                                >
                                    <X
                                        size={
                                            16
                                        }
                                    />
                                </button>

                            </div>


                            <div className="p-5">

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">

                                    <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-lg font-bold text-[#004AC6]">

                                        {selectedRequest
                                            .mentorId
                                            ?.profilePicture ? (
                                            <img
                                                src={
                                                    selectedRequest
                                                        .mentorId
                                                        .profilePicture
                                                }
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            selectedRequest
                                                .mentorId
                                                ?.email
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase() ||
                                            "A"
                                        )}

                                    </div>


                                    <h3 className="mt-3 text-sm font-bold text-gray-900">
                                        {selectedRequest
                                            .mentorId
                                            ?.email ||
                                            "Alumni Member"}
                                    </h3>

                                    <p className="mt-1 text-[10px] text-gray-500">
                                        Alumni Mentor
                                    </p>

                                    <StatusBadge
                                        status={
                                            selectedRequest.status
                                        }
                                    />

                                </div>


                                <div className="mt-5">

                                    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                        Your Message
                                    </p>

                                    <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4">

                                        <p className="text-xs leading-5 text-gray-600">
                                            {
                                                selectedRequest.message
                                            }
                                        </p>

                                    </div>

                                </div>


                                <div className="mt-4 grid grid-cols-2 gap-2">

                                    <div className="rounded-lg border border-gray-200 p-3">

                                        <p className="text-[9px] text-gray-400">
                                            Requested
                                        </p>

                                        <p className="mt-1 text-[10px] font-semibold text-gray-700">
                                            {formatDate(
                                                selectedRequest.createdAt
                                            )}
                                        </p>

                                    </div>

                                    <div className="rounded-lg border border-gray-200 p-3">

                                        <p className="text-[9px] text-gray-400">
                                            Updated
                                        </p>

                                        <p className="mt-1 text-[10px] font-semibold text-gray-700">
                                            {formatDate(
                                                selectedRequest.updatedAt
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </aside>

                    </div>
                )}

        </div>
    );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
    title,
    value,
    icon,
    color = "blue",
}) => {

    const styles = {
        blue: {
            wrapper:
                "border-blue-100 bg-blue-50/40",
            icon:
                "bg-blue-50 text-[#004AC6]",
            value:
                "text-gray-900",
        },

        amber: {
            wrapper:
                "border-amber-100 bg-amber-50/40",
            icon:
                "bg-amber-50 text-amber-600",
            value:
                "text-amber-600",
        },

        green: {
            wrapper:
                "border-emerald-100 bg-emerald-50/40",
            icon:
                "bg-emerald-50 text-emerald-600",
            value:
                "text-emerald-600",
        },

        red: {
            wrapper:
                "border-rose-100 bg-rose-50/40",
            icon:
                "bg-rose-50 text-rose-600",
            value:
                "text-rose-600",
        },
    };

    const style =
        styles[color] || styles.blue;

    return (
        <div
            className={`rounded-xl border p-4 shadow-sm ${style.wrapper}`}
        >

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-[10px] font-semibold text-gray-500">
                        {title}
                    </p>

                    <p
                        className={`mt-1 text-2xl font-bold ${style.value}`}
                    >
                        {value}
                    </p>

                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.icon}`}
                >
                    {icon}
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

    const normalized =
        status || "pending";

    let className =
        "border-amber-200 bg-amber-50 text-amber-700";

    let icon = (
        <Clock3 size={12} />
    );

    if (
        normalized ===
        "accepted" ||
        normalized === "active"
    ) {
        className =
            "border-emerald-200 bg-emerald-50 text-emerald-700";

        icon = (
            <CheckCircle2
                size={12}
            />
        );
    }

    if (
        normalized ===
        "rejected"
    ) {
        className =
            "border-rose-200 bg-rose-50 text-rose-700";

        icon = (
            <XCircle
                size={12}
            />
        );
    }

    return (
        <span
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize ${className}`}
        >
            {icon}
            {normalized}
        </span>
    );
};

export default MentorshipPage;