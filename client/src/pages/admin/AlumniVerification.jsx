import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    RefreshCw,
    GraduationCap,
    UserCheck,
    UserX,
    Mail,
    MapPin,
    CalendarDays,
    Eye,
    X,
    CheckCircle2,
    Clock3,
    BriefcaseBusiness,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

const AlumniVerification = () => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedAlumni, setSelectedAlumni] =
        useState(null);

    // =====================================================
    // AUTH
    // =====================================================

    const getToken = () =>
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");

    const getConfig = () => {
        const token = getToken();

        return token
            ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            : {};
    };

    // =====================================================
    // FETCH ALUMNI
    // =====================================================

    const fetchAlumni = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axios.get(
                `${API_URL}/api/profile/alumni-directory`,
                getConfig()
            );

            const body = response?.data;

            let data = [];

            if (Array.isArray(body)) {
                data = body;
            } else if (Array.isArray(body?.data)) {
                data = body.data;
            } else if (Array.isArray(body?.profiles)) {
                data = body.profiles;
            }

            setAlumni(data);
        } catch (error) {
            console.error(
                "Alumni verification loading error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to load alumni."
            );

            setAlumni([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAlumni();
    }, []);

    // =====================================================
    // NORMALIZE
    // =====================================================

    const normalizedAlumni = useMemo(() => {
        return alumni.map((profile) => {
            const user =
                profile?.userId &&
                    typeof profile.userId === "object"
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

            const name =
                `${firstName} ${lastName}`.trim() ||
                username ||
                email ||
                "Alumni Member";

            const verified =
                user?.emailVerified ??
                profile?.emailVerified ??
                false;

            const accountStatus =
                user?.AccountStatus ||
                profile?.AccountStatus ||
                "unverified";

            return {
                ...profile,
                user,
                name,
                email,
                verified,
                accountStatus,
            };
        });
    }, [alumni]);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredAlumni = useMemo(() => {
        const query = search.trim().toLowerCase();

        return normalizedAlumni.filter((person) => {
            const matchesSearch =
                !query ||
                person.name
                    .toLowerCase()
                    .includes(query) ||
                person.email
                    .toLowerCase()
                    .includes(query) ||
                String(
                    person.professionalHeadline || ""
                )
                    .toLowerCase()
                    .includes(query);

            const isVerified =
                person.verified ||
                String(person.accountStatus).toLowerCase() ===
                "verified";

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "verified"
                    ? isVerified
                    : !isVerified);

            return matchesSearch && matchesStatus;
        });
    }, [
        normalizedAlumni,
        search,
        statusFilter,
    ]);

    // =====================================================
    // COUNTS
    // =====================================================

    const counts = useMemo(() => {
        const verified = normalizedAlumni.filter(
            (person) =>
                person.verified ||
                String(person.accountStatus).toLowerCase() ===
                "verified"
        );

        return {
            total: normalizedAlumni.length,
            verified: verified.length,
            pending:
                normalizedAlumni.length -
                verified.length,
        };
    }, [normalizedAlumni]);

    // =====================================================
    // HELPERS
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "—";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "—";
        }

        return value.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getInitials = (name) =>
        String(name || "User")
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    const isVerified = (person) =>
        person.verified ||
        String(person.accountStatus).toLowerCase() ===
        "verified";

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    onRefresh={() => fetchAlumni(true)}
                    refreshing={refreshing}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white"
                        />
                    ))}
                </div>

                <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}

            <PageHeader
                onRefresh={() => fetchAlumni(true)}
                refreshing={refreshing}
            />

            {/* ERROR */}

            {error && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                    <div className="flex items-center gap-2">
                        <UserX size={16} />
                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchAlumni(true)}
                        className="font-bold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* INFO */}

            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-[#004AC6]"
                />

                <div>
                    <p className="text-xs font-bold text-[#004AC6]">
                        Verification status
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-blue-700/70">
                        This page currently reads verification
                        status from the existing alumni directory
                        API. Approval/rejection actions require an
                        admin verification endpoint in the backend.
                    </p>
                </div>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    title="Total Alumni"
                    value={counts.total}
                    icon={GraduationCap}
                    iconClass="bg-violet-50 text-violet-600"
                />

                <StatCard
                    title="Verified"
                    value={counts.verified}
                    icon={UserCheck}
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                    title="Pending Verification"
                    value={counts.pending}
                    icon={Clock3}
                    iconClass="bg-amber-50 text-amber-600"
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
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search alumni..."
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6]"
                        >
                            <option value="all">
                                All Alumni
                            </option>

                            <option value="verified">
                                Verified
                            </option>

                            <option value="pending">
                                Pending
                            </option>
                        </select>
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Alumni
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Professional Info
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Location
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredAlumni.length > 0 ? (
                                filteredAlumni.map(
                                    (person, index) => (
                                        <tr
                                            key={
                                                person._id ||
                                                index
                                            }
                                            className="transition hover:bg-gray-50/70"
                                        >
                                            {/* ALUMNI */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-xs font-bold text-violet-600">
                                                        {person.profilePicture ? (
                                                            <img
                                                                src={
                                                                    person.profilePicture
                                                                }
                                                                alt={
                                                                    person.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            getInitials(
                                                                person.name
                                                            )
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-bold text-gray-800">
                                                            {
                                                                person.name
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-gray-400">
                                                            <Mail
                                                                size={
                                                                    10
                                                                }
                                                            />

                                                            {person.email ||
                                                                "No email"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* PROFESSIONAL */}

                                            <td className="px-5 py-4">
                                                <div className="max-w-[230px]">
                                                    <p className="truncate text-[10px] font-semibold text-gray-700">
                                                        {person.professionalHeadline ||
                                                            "Alumni Member"}
                                                    </p>

                                                    {person.experience?.[0] && (
                                                        <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-gray-400">
                                                            <BriefcaseBusiness
                                                                size={
                                                                    10
                                                                }
                                                            />

                                                            {
                                                                person
                                                                    .experience[0]
                                                                    .position
                                                            }

                                                            {person
                                                                .experience[0]
                                                                .company
                                                                ? ` at ${person.experience[0].company}`
                                                                : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* LOCATION */}

                                            <td className="px-5 py-4">
                                                <div className="flex max-w-[180px] items-center gap-1 text-[10px] text-gray-500">
                                                    <MapPin
                                                        size={
                                                            11
                                                        }
                                                        className="shrink-0 text-gray-400"
                                                    />

                                                    <span className="truncate">
                                                        {[
                                                            person
                                                                .location
                                                                ?.city,
                                                            person
                                                                .location
                                                                ?.state,
                                                        ]
                                                            .filter(
                                                                Boolean
                                                            )
                                                            .join(
                                                                ", "
                                                            ) ||
                                                            "Not specified"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    verified={isVerified(
                                                        person
                                                    )}
                                                />
                                            </td>

                                            {/* ACTION */}

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedAlumni(
                                                            person
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
                                        colSpan="5"
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
                                            <GraduationCap
                                                size={
                                                    22
                                                }
                                            />
                                        </div>

                                        <p className="mt-3 text-sm font-bold text-gray-600">
                                            No alumni found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Try changing your
                                            search or filter.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}

                <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-[10px] font-medium text-gray-400">
                        Showing{" "}
                        <span className="font-bold text-gray-600">
                            {filteredAlumni.length}
                        </span>{" "}
                        alumni
                    </p>
                </div>
            </section>

            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {selectedAlumni && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedAlumni(null)
                    }
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
                                    Alumni Details
                                </h2>

                                <p className="mt-0.5 text-[10px] text-gray-400">
                                    Review this alumni profile
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedAlumni(
                                        null
                                    )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* CONTENT */}

                        <div className="max-h-[70vh] overflow-y-auto p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-violet-50 text-xl font-bold text-violet-600">
                                    {selectedAlumni.profilePicture ? (
                                        <img
                                            src={
                                                selectedAlumni.profilePicture
                                            }
                                            alt={
                                                selectedAlumni.name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            selectedAlumni.name
                                        )
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {
                                            selectedAlumni.name
                                        }
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {selectedAlumni.professionalHeadline ||
                                            "Alumni Member"}
                                    </p>

                                    <div className="mt-3">
                                        <StatusBadge
                                            verified={isVerified(
                                                selectedAlumni
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DetailItem
                                    icon={Mail}
                                    label="Email"
                                    value={
                                        selectedAlumni.email ||
                                        "Not available"
                                    }
                                />

                                <DetailItem
                                    icon={MapPin}
                                    label="Location"
                                    value={
                                        [
                                            selectedAlumni
                                                .location
                                                ?.city,
                                            selectedAlumni
                                                .location
                                                ?.state,
                                            selectedAlumni
                                                .location
                                                ?.country,
                                        ]
                                            .filter(
                                                Boolean
                                            )
                                            .join(
                                                ", "
                                            ) ||
                                        "Not specified"
                                    }
                                />

                                <DetailItem
                                    icon={GraduationCap}
                                    label="Education"
                                    value={
                                        selectedAlumni
                                            .education?.[0]
                                            ?.institution ||
                                        "Not available"
                                    }
                                />

                                <DetailItem
                                    icon={CalendarDays}
                                    label="Joined"
                                    value={formatDate(
                                        selectedAlumni.createdAt
                                    )}
                                />
                            </div>

                            {/* EXPERIENCE */}

                            {selectedAlumni
                                .experience?.length >
                                0 && (
                                    <div className="mt-5">
                                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Experience
                                        </p>

                                        <div className="space-y-2">
                                            {selectedAlumni.experience
                                                .slice(
                                                    0,
                                                    3
                                                )
                                                .map(
                                                    (
                                                        experience,
                                                        index
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                                                        >
                                                            <p className="text-xs font-bold text-gray-700">
                                                                {
                                                                    experience.position
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-gray-400">
                                                                {
                                                                    experience.company
                                                                }
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                )}

                            {/* SKILLS */}

                            {selectedAlumni.skills
                                ?.length >
                                0 && (
                                    <div className="mt-5">
                                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Skills
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedAlumni.skills
                                                .slice(
                                                    0,
                                                    12
                                                )
                                                .map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => (
                                                        <span
                                                            key={
                                                                index
                                                            }
                                                            className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-semibold text-[#004AC6]"
                                                        >
                                                            {
                                                                skill
                                                            }
                                                        </span>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* FOOTER */}

                        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                {isVerified(
                                    selectedAlumni
                                ) ? (
                                    <>
                                        <CheckCircle2
                                            size={
                                                14
                                            }
                                            className="text-emerald-500"
                                        />

                                        Already verified
                                    </>
                                ) : (
                                    <>
                                        <Clock3
                                            size={
                                                14
                                            }
                                            className="text-amber-500"
                                        />

                                        Verification pending
                                    </>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedAlumni(
                                        null
                                    )
                                }
                                className="rounded-xl bg-[#004AC6] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#003da3]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
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
                Alumni Verification
            </h1>

            <p className="mt-1 text-xs text-gray-400">
                Review alumni profiles and their verification
                status.
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
// STATUS BADGE
// =========================================================

const StatusBadge = ({
    verified,
}) => (
    <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold ${verified
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
    >
        <span
            className={`h-1.5 w-1.5 rounded-full ${verified
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
        />

        {verified
            ? "Verified"
            : "Pending"}
    </span>
);

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

export default AlumniVerification;