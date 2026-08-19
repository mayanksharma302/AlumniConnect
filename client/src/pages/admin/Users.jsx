import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    RefreshCw,
    Users as UsersIcon,
    UserCheck,
    UserX,
    GraduationCap,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Mail,
    MapPin,
    X,
} from "lucide-react";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";


const Users = () => {

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [page, setPage] =
        useState(1);

    const ITEMS_PER_PAGE = 8;


    // =====================================================
    // AUTH CONFIG
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


    // =====================================================
    // FETCH USERS
    // =====================================================

    const fetchUsers =
        async (
            isRefresh = false
        ) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");


                const response =
                    await axios.get(
                        `${API_URL}/api/profile/alumni-directory`,
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
                        body?.data
                    )
                ) {

                    data =
                        body.data;

                } else if (
                    Array.isArray(
                        body?.profiles
                    )
                ) {

                    data =
                        body.profiles;

                }


                setUsers(
                    data
                );


            } catch (error) {

                console.error(
                    "Users loading error:",
                    error
                );


                setError(
                    error?.response?.data?.message ||
                    "Unable to load users."
                );


                setUsers([]);

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        };


    useEffect(() => {

        fetchUsers();

    }, []);


    // =====================================================
    // NORMALIZE USER
    // =====================================================

    const normalizedUsers =
        useMemo(() => {

            return users.map(
                user => {

                    const linkedUser =
                        user?.userId &&
                            typeof user.userId ===
                            "object"
                            ? user.userId
                            : null;


                    const firstName =
                        user?.firstName ||
                        linkedUser?.firstName ||
                        "";


                    const lastName =
                        user?.lastName ||
                        linkedUser?.lastName ||
                        "";


                    const username =
                        linkedUser?.username ||
                        user?.username ||
                        "";


                    const email =
                        linkedUser?.email ||
                        user?.email ||
                        "";


                    const name =
                        `${firstName} ${lastName}`
                            .trim() ||
                        username ||
                        email ||
                        "Alumni Member";


                    const role =
                        linkedUser?.role ||
                        user?.role ||
                        "alumni";


                    const verified =
                        linkedUser?.emailVerified ??
                        user?.emailVerified ??
                        false;


                    const accountStatus =
                        linkedUser?.AccountStatus ||
                        user?.AccountStatus ||
                        "unverified";


                    return {
                        ...user,

                        linkedUser,

                        name,

                        email,

                        role,

                        verified,

                        accountStatus,

                    };

                }
            );

        }, [users]);


    // =====================================================
    // FILTER
    // =====================================================

    const filteredUsers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return normalizedUsers.filter(
                user => {

                    const matchesSearch =
                        !query ||
                        user.name
                            .toLowerCase()
                            .includes(query) ||
                        user.email
                            .toLowerCase()
                            .includes(query) ||
                        String(
                            user.professionalHeadline ||
                            ""
                        )
                            .toLowerCase()
                            .includes(query);


                    const matchesRole =
                        roleFilter ===
                        "all" ||
                        String(
                            user.role
                        ).toLowerCase() ===
                        roleFilter;


                    const isVerified =
                        user.verified ||
                        String(
                            user.accountStatus
                        ).toLowerCase() ===
                        "verified";


                    const matchesStatus =
                        statusFilter ===
                        "all" ||
                        (
                            statusFilter ===
                                "verified"
                                ? isVerified
                                : !isVerified
                        );


                    return (
                        matchesSearch &&
                        matchesRole &&
                        matchesStatus
                    );

                }
            );

        }, [
            normalizedUsers,
            search,
            roleFilter,
            statusFilter,
        ]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.max(
            Math.ceil(
                filteredUsers.length /
                ITEMS_PER_PAGE
            ),
            1
        );


    const safePage =
        Math.min(
            page,
            totalPages
        );


    const paginatedUsers =
        filteredUsers.slice(
            (safePage - 1) *
            ITEMS_PER_PAGE,
            safePage *
            ITEMS_PER_PAGE
        );


    useEffect(() => {

        setPage(1);

    }, [
        search,
        roleFilter,
        statusFilter,
    ]);


    // =====================================================
    // COUNTS
    // =====================================================

    const counts =
        useMemo(() => {

            const alumni =
                normalizedUsers.filter(
                    user =>
                        String(
                            user.role
                        ).toLowerCase() ===
                        "alumni"
                );


            const verified =
                normalizedUsers.filter(
                    user =>
                        user.verified ||
                        String(
                            user.accountStatus
                        ).toLowerCase() ===
                        "verified"
                );


            return {
                total:
                    normalizedUsers.length,

                alumni:
                    alumni.length,

                verified:
                    verified.length,

                unverified:
                    Math.max(
                        alumni.length -
                        verified.length,
                        0
                    ),
            };

        }, [normalizedUsers]);


    // =====================================================
    // DATE
    // =====================================================

    const formatDate =
        date => {

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
    // INITIALS
    // =====================================================

    const getInitials =
        name => {

            return String(
                name || "User"
            )
                .split(" ")
                .filter(Boolean)
                .map(
                    part =>
                        part[0]
                )
                .join("")
                .slice(0, 2)
                .toUpperCase();

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="space-y-6">

                <PageHeader
                    onRefresh={() =>
                        fetchUsers(
                            true
                        )
                    }
                    refreshing={
                        refreshing
                    }
                />


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[
                        1,
                        2,
                        3,
                        4,
                    ].map(
                        item => (

                            <div
                                key={item}
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
                    fetchUsers(
                        true
                    )
                }
                refreshing={
                    refreshing
                }
            />


            {/* ERROR */}

            {error && (

                <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">

                    <div className="flex items-center gap-2">

                        <UserX
                            size={16}
                        />

                        {error}

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchUsers(
                                true
                            )
                        }
                        className="font-bold underline"
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                STATS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Alumni"
                    value={
                        counts.alumni
                    }
                    icon={
                        GraduationCap
                    }
                    iconClass="bg-violet-50 text-violet-600"
                />


                <StatCard
                    title="Verified"
                    value={
                        counts.verified
                    }
                    icon={
                        UserCheck
                    }
                    iconClass="bg-emerald-50 text-emerald-600"
                />


                <StatCard
                    title="Unverified"
                    value={
                        counts.unverified
                    }
                    icon={
                        UserX
                    }
                    iconClass="bg-amber-50 text-amber-600"
                />


                <StatCard
                    title="Showing"
                    value={
                        filteredUsers.length
                    }
                    icon={
                        UsersIcon
                    }
                    iconClass="bg-blue-50 text-[#004AC6]"
                />

            </div>


            {/* =================================================
                TABLE CARD
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


                {/* TOOLBAR */}

                <div className="border-b border-gray-100 p-4 sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">


                        {/* SEARCH */}

                        <div className="relative w-full xl:max-w-md">

                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />


                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={e =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by name, email or headline..."
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                            />

                        </div>


                        {/* FILTERS */}

                        <div className="flex flex-wrap gap-2">


                            <select
                                value={
                                    roleFilter
                                }
                                onChange={e =>
                                    setRoleFilter(
                                        e.target.value
                                    )
                                }
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6]"
                            >

                                <option value="all">
                                    All Roles
                                </option>

                                <option value="alumni">
                                    Alumni
                                </option>

                                <option value="student">
                                    Student
                                </option>

                                <option value="admin">
                                    Admin
                                </option>

                            </select>


                            <select
                                value={
                                    statusFilter
                                }
                                onChange={e =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6]"
                            >

                                <option value="all">
                                    All Status
                                </option>

                                <option value="verified">
                                    Verified
                                </option>

                                <option value="unverified">
                                    Unverified
                                </option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px]">

                        <thead>

                            <tr className="border-b border-gray-100 bg-gray-50/70">

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Member
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Role
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Location
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Joined
                                </th>

                                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-gray-100">

                            {paginatedUsers.length >
                                0 ? (

                                paginatedUsers.map(
                                    (
                                        user,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                user._id ||
                                                index
                                            }
                                            className="transition hover:bg-gray-50/70"
                                        >

                                            {/* MEMBER */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-xs font-bold text-[#004AC6]">

                                                        {user.profilePicture ? (

                                                            <img
                                                                src={
                                                                    user.profilePicture
                                                                }
                                                                alt={
                                                                    user.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />

                                                        ) : (

                                                            getInitials(
                                                                user.name
                                                            )

                                                        )}

                                                    </div>


                                                    <div className="min-w-0">

                                                        <p className="truncate text-xs font-bold text-gray-800">

                                                            {
                                                                user.name
                                                            }

                                                        </p>


                                                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-gray-400">

                                                            <Mail
                                                                size={10}
                                                            />

                                                            {
                                                                user.email ||
                                                                "No email"
                                                            }

                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* ROLE */}

                                            <td className="px-5 py-4">

                                                <RoleBadge
                                                    role={
                                                        user.role
                                                    }
                                                />

                                            </td>


                                            {/* LOCATION */}

                                            <td className="px-5 py-4">

                                                <div className="flex max-w-[180px] items-center gap-1 text-[10px] text-gray-500">

                                                    <MapPin
                                                        size={11}
                                                        className="shrink-0 text-gray-400"
                                                    />

                                                    <span className="truncate">

                                                        {[
                                                            user.location?.city,
                                                            user.location?.state,
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
                                                    verified={
                                                        user.verified ||
                                                        String(
                                                            user.accountStatus
                                                        ).toLowerCase() ===
                                                        "verified"
                                                    }
                                                />

                                            </td>


                                            {/* JOINED */}

                                            <td className="px-5 py-4">

                                                <span className="text-[10px] font-medium text-gray-500">

                                                    {
                                                        formatDate(
                                                            user.createdAt
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td className="px-5 py-4 text-right">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedUser(
                                                            user
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 transition hover:border-[#004AC6] hover:text-[#004AC6]"
                                                >
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

                                            <UsersIcon
                                                size={22}
                                            />

                                        </div>


                                        <p className="mt-3 text-sm font-bold text-gray-600">
                                            No users found
                                        </p>


                                        <p className="mt-1 text-xs text-gray-400">
                                            Try changing your search or filters.
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

                        {filteredUsers.length ===
                            0
                            ? 0
                            : (safePage -
                                1) *
                            ITEMS_PER_PAGE +
                            1}

                        {" "}–{" "}

                        {Math.min(
                            safePage *
                            ITEMS_PER_PAGE,
                            filteredUsers.length
                        )}

                        {" "}of{" "}

                        {filteredUsers.length}

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
                                    current =>
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
                                size={15}
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
                                    current =>
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
                                size={15}
                            />

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                USER DETAIL MODAL
            ================================================= */}

            {selectedUser && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedUser(
                            null
                        )
                    }
                >

                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                            <div>

                                <h2 className="text-sm font-bold text-gray-900">
                                    Member Details
                                </h2>

                                <p className="mt-0.5 text-[10px] text-gray-400">
                                    Alumni profile information
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(
                                        null
                                    )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


                        {/* PROFILE */}

                        <div className="p-5">

                            <div className="flex items-center gap-4">

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-lg font-bold text-[#004AC6]">

                                    {selectedUser.profilePicture ? (

                                        <img
                                            src={
                                                selectedUser.profilePicture
                                            }
                                            alt={
                                                selectedUser.name
                                            }
                                            className="h-full w-full object-cover"
                                        />

                                    ) : (

                                        getInitials(
                                            selectedUser.name
                                        )

                                    )}

                                </div>


                                <div className="min-w-0">

                                    <h3 className="text-lg font-bold text-gray-900">

                                        {
                                            selectedUser.name
                                        }

                                    </h3>


                                    <p className="mt-1 text-xs text-gray-400">

                                        {
                                            selectedUser.professionalHeadline ||
                                            "Alumni Member"
                                        }

                                    </p>


                                    <div className="mt-2 flex flex-wrap gap-2">

                                        <RoleBadge
                                            role={
                                                selectedUser.role
                                            }
                                        />

                                        <StatusBadge
                                            verified={
                                                selectedUser.verified ||
                                                String(
                                                    selectedUser.accountStatus
                                                ).toLowerCase() ===
                                                "verified"
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                <DetailItem
                                    icon={
                                        Mail
                                    }
                                    label="Email"
                                    value={
                                        selectedUser.email ||
                                        "Not available"
                                    }
                                />


                                <DetailItem
                                    icon={
                                        MapPin
                                    }
                                    label="Location"
                                    value={
                                        [
                                            selectedUser.location?.city,
                                            selectedUser.location?.state,
                                            selectedUser.location?.country,
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
                                    icon={
                                        GraduationCap
                                    }
                                    label="Education"
                                    value={
                                        selectedUser.education?.[0]
                                            ?.institution ||
                                        "Not available"
                                    }
                                />


                                <DetailItem
                                    icon={
                                        ShieldCheck
                                    }
                                    label="Joined"
                                    value={
                                        formatDate(
                                            selectedUser.createdAt
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-5 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(
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
// PAGE HEADER
// =========================================================

const PageHeader = ({
    onRefresh,
    refreshing,
}) => {

    return (

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#004AC6]">
                    Community
                </p>


                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                    Users
                </h1>


                <p className="mt-1 text-xs text-gray-400">
                    View and manage AlumniConnect members.
                </p>

            </div>


            <button
                type="button"
                onClick={
                    onRefresh
                }
                disabled={
                    refreshing
                }
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

};


// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
    title,
    value,
    icon: Icon,
    iconClass,
}) => {

    return (

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

                    <Icon
                        size={20}
                    />

                </div>

            </div>

        </div>

    );

};


// =========================================================
// ROLE BADGE
// =========================================================

const RoleBadge = ({
    role,
}) => {

    const normalized =
        String(
            role || ""
        ).toLowerCase();


    const classes = {

        alumni:
            "bg-violet-50 text-violet-600",

        student:
            "bg-cyan-50 text-cyan-600",

        admin:
            "bg-blue-50 text-[#004AC6]",

    };


    return (

        <span
            className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${classes[
                normalized
                ] ||
                "bg-gray-50 text-gray-500"
                }`}
        >

            {
                role ||
                "Unknown"
            }

        </span>

    );

};


// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({
    verified,
}) => {

    return (

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
                : "Unverified"}

        </span>

    );

};


// =========================================================
// DETAIL ITEM
// =========================================================

const DetailItem = ({
    icon: Icon,
    label,
    value,
}) => {

    return (

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

};


export default Users;