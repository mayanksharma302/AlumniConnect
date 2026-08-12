import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Briefcase,
    GraduationCap,
    MessageSquare,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Grid3X3,
    List,
    UserRound,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const AlumniDirectory = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [company, setCompany] = useState("");
    const [graduationYear, setGraduationYear] = useState("");

    const [showFilters, setShowFilters] = useState(false);
    const [view, setView] = useState("grid");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const token = sessionStorage.getItem("accessToken");

    const fetchDirectory = async (pageNumber = 1) => {
        if (!token) {
            toast.error("Session expired. Please login again.");
            return;
        }

        setLoading(true);

        const params = {
            page: pageNumber,
            limit: 9,
        };

        if (search.trim()) params.search = search.trim();
        if (skills.trim()) params.skills = skills.trim();
        if (location.trim()) params.location = location.trim();
        if (company.trim()) params.company = company.trim();
        if (graduationYear.trim()) {
            params.graduationYear = graduationYear.trim();
        }

        try {
            const response = await axios.get(
                `${API_URL}/api/profile/alumni-directory`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params,
                }
            );

            if (response.data?.success) {

                const alumniOnly = (response.data.profiles || []).filter(
                    (profile) =>
                        profile.userId?.role === "alumni" ||
                        profile.role === "alumni"
                );

                setProfiles(alumniOnly);

                setTotalPages(response.data.totalPages || 1);

                setTotalResults(
                    response.data.total || alumniOnly.length
                );

                setPage(pageNumber);
            }
        } catch (error) {
            console.error("Directory error:", error);

            toast.error(
                error.response?.data?.message ||
                "Unable to load alumni directory."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectory(1);
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchDirectory(1);
    };

    const clearFilters = () => {
        setSearch("");
        setSkills("");
        setLocation("");
        setCompany("");
        setGraduationYear("");

        setTimeout(() => {
            fetchDirectory(1);
        }, 0);
    };

    const getUserId = (profile) =>
        profile.userId?._id || profile.userId;

    const getName = (profile) =>
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
        "Alumni Member";

    const getInitials = (name) =>
        name
            .split(" ")
            .filter(Boolean)
            .map((item) => item[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    const getLocation = (profile) => {
        const city = profile.location?.city;
        const state = profile.location?.state;

        if (city && state) return `${city}, ${state}`;
        return city || state || "Location not available";
    };

    const recommendations = useMemo(() => {
        return profiles.slice(0, 3);
    }, [profiles]);

    return (
        <div className="min-h-full bg-[#F8F9FF] px-4 py-5 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-5">
                    <h1 className="text-xl font-bold text-gray-900">
                        Alumni Directory
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Connect with alumni mentors, industry professionals,
                        and career guides.
                    </p>
                </div>

                {/* SEARCH + FILTERS */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                    <form onSubmit={handleSearch}>

                        <label className="mb-2 block text-xs font-medium text-gray-500">
                            Keywords
                        </label>

                        <div className="flex flex-col gap-3 lg:flex-row">

                            <div className="relative flex-1">

                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search by name, company, skill, or industry..."
                                    className="h-10 w-full rounded-lg border border-gray-200 bg-[#F8F9FF] pl-9 pr-3 text-xs text-gray-700 outline-none transition focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowFilters((value) => !value)
                                }
                                className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold shadow-sm transition ${showFilters
                                    ? "border-blue-200 bg-blue-50 text-[#004AC6]"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <SlidersHorizontal size={14} />
                                Filters
                            </button>

                            <button
                                type="submit"
                                className="h-10 rounded-lg border border-[#003da8] bg-[#004AC6] px-6 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0038A8] hover:shadow-md"
                            >
                                Search
                            </button>

                        </div>

                        {/* FILTERS */}
                        <div
                            className={`mt-4 overflow-hidden transition-all ${showFilters
                                ? "max-h-[500px] opacity-100"
                                : "max-h-0 opacity-0"
                                }`}
                        >

                            <div className="border-t border-gray-100 pt-4">

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                    <FilterInput
                                        label="Industry"
                                        value={skills}
                                        onChange={setSkills}
                                        placeholder="All Industries"
                                    />

                                    <FilterInput
                                        label="Company"
                                        value={company}
                                        onChange={setCompany}
                                        placeholder="e.g. Google"
                                    />

                                    <FilterInput
                                        label="Experience"
                                        value=""
                                        onChange={() => { }}
                                        placeholder="Any Years"
                                    />

                                    <FilterInput
                                        label="Availability"
                                        value=""
                                        onChange={() => { }}
                                        placeholder="Any Status"
                                    />

                                    <FilterInput
                                        label="Grad Year"
                                        value={graduationYear}
                                        onChange={setGraduationYear}
                                        placeholder="YYYY"
                                    />

                                    <FilterInput
                                        label="Location"
                                        value={location}
                                        onChange={setLocation}
                                        placeholder="City / State"
                                    />

                                </div>

                                <div className="mt-4 flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
                                    >
                                        <X size={13} />
                                        Clear All Filters
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => fetchDirectory(1)}
                                        className="h-9 rounded-lg bg-[#004AC6] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#0038A8]"
                                    >
                                        Apply Filters
                                    </button>

                                </div>

                            </div>

                        </div>

                    </form>

                    {/* POPULAR SKILLS */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">

                        <span className="text-[11px] font-medium text-gray-500">
                            Popular Skills:
                        </span>

                        {[
                            "Python",
                            "Product Management",
                            "UX Research",
                            "Data Analysis",
                        ].map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                    setSkills(skill);
                                    setTimeout(() => fetchDirectory(1), 0);
                                }}
                                className="rounded-full border border-gray-200 bg-[#F8F9FF] px-2.5 py-1 text-[10px] font-medium text-gray-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-[#004AC6]"
                            >
                                {skill}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="ml-auto text-[10px] font-bold text-[#004AC6] hover:underline"
                        >
                            Clear All Filters
                        </button>

                    </div>

                </div>

                {/* RECOMMENDED */}
                {!loading && recommendations.length > 0 && (
                    <section className="mt-5">

                        <div className="mb-3 flex items-center justify-between">

                            <h2 className="text-sm font-bold text-gray-900">
                                Recommended For You
                            </h2>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-[#004AC6]">
                                Based on your interests
                            </span>

                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                            {recommendations.map((profile) => (
                                <RecommendedCard
                                    key={profile._id}
                                    profile={profile}
                                    getName={getName}
                                    getInitials={getInitials}
                                />
                            ))}

                        </div>

                    </section>
                )}

                {/* RESULTS HEADER */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <p className="text-xs font-bold text-gray-900">
                            {totalResults} Alumni Found
                        </p>

                        <span className="text-[10px] text-gray-400">
                            Sort by:
                        </span>

                        <button className="text-[10px] font-semibold text-[#004AC6]">
                            Most Relevant
                        </button>

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() => setView("grid")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm ${view === "grid"
                                ? "border-blue-200 bg-blue-50 text-[#004AC6]"
                                : "border-gray-200 bg-white text-gray-400"
                                }`}
                        >
                            <Grid3X3 size={14} />
                        </button>

                        <button
                            onClick={() => setView("list")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm ${view === "list"
                                ? "border-blue-200 bg-blue-50 text-[#004AC6]"
                                : "border-gray-200 bg-white text-gray-400"
                                }`}
                        >
                            <List size={14} />
                        </button>

                    </div>

                </div>

                {/* RESULTS */}
                {loading ? (
                    <LoadingGrid />
                ) : profiles.length > 0 ? (
                    <div
                        className={
                            view === "grid"
                                ? "mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                                : "mt-4 space-y-3"
                        }
                    >
                        {profiles
                            .filter(
                                (profile) =>
                                    profile.userId?.role === "alumni" ||
                                    profile.role === "alumni"
                            )
                            .map((profile) => (
                                <ProfileCard
                                    key={profile._id}
                                    profile={profile}
                                    listView={view === "list"}
                                    getName={getName}
                                    getInitials={getInitials}
                                    getLocation={getLocation}
                                    getUserId={getUserId}
                                />
                            ))}
                    </div>
                ) : (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white py-20 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                            <UserRound size={27} />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-gray-700">
                            No alumni found
                        </h3>

                        <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filters.
                        </p>

                        <button
                            onClick={clearFilters}
                            className="mt-4 rounded-lg bg-[#004AC6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0038A8]"
                        >
                            Reset Filters
                        </button>

                    </div>
                )}

                {/* FOOTER / PAGINATION */}
                <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-[10px] text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-700">
                            {profiles.length}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-gray-700">
                            {profiles.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-700">
                            {totalResults}
                        </span>{" "}
                        results
                    </p>

                    <div className="flex items-center gap-1">

                        <button
                            disabled={page === 1}
                            onClick={() => fetchDirectory(page - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, index) => index + 1
                        ).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => fetchDirectory(pageNumber)}
                                className={`h-8 min-w-8 rounded-lg border px-2 text-[10px] font-semibold shadow-sm ${page === pageNumber
                                    ? "border-[#004AC6] bg-[#004AC6] text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        {totalPages > 5 && (
                            <>
                                <span className="px-1 text-xs text-gray-400">
                                    ...
                                </span>

                                <button
                                    onClick={() => fetchDirectory(totalPages)}
                                    className="h-8 min-w-8 rounded-lg border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchDirectory(page + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
                        >
                            <ChevronRight size={14} />
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
};

/* -------------------------------------------------- */
/* FILTER INPUT */
/* -------------------------------------------------- */

const FilterInput = ({
    label,
    value,
    onChange,
    placeholder,
}) => {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                {label}
            </label>

            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
};

/* -------------------------------------------------- */
/* RECOMMENDED CARD */
/* -------------------------------------------------- */

const RecommendedCard = ({
    profile,
    getName,
    getInitials,
}) => {
    const name = getName(profile);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex gap-3">

                {profile.profilePicture ? (
                    <img
                        src={profile.profilePicture}
                        alt={name}
                        className="h-12 w-12 rounded-lg border object-cover"
                    />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-xs font-bold text-[#004AC6]">
                        {getInitials(name)}
                    </div>
                )}

                <div className="min-w-0">

                    <h3 className="truncate text-xs font-bold text-gray-900">
                        {name}
                    </h3>

                    <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-gray-500">
                        {profile.proffesionalHeadLine || "Professional"}
                    </p>

                    <p className="mt-1 text-[9px] text-gray-400">
                        {profile.company || "Professional Network"}
                    </p>

                </div>

            </div>

            <div className="mt-3 flex gap-1.5">

                {(profile.skills || []).slice(0, 2).map((skill, index) => (
                    <span
                        key={index}
                        className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[8px] font-semibold text-gray-500"
                    >
                        {skill}
                    </span>
                ))}

            </div>

        </div>
    );
};

/* -------------------------------------------------- */
/* PROFILE CARD */
/* -------------------------------------------------- */

const ProfileCard = ({
    profile,
    listView,
    getName,
    getInitials,
    getLocation,
    getUserId,
}) => {
    const name = getName(profile);
    const userId = getUserId(profile);

    return (
        <div
            className={
                listView
                    ? "flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                    : "rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            }
        >

            {/* TOP */}
            <div className="flex min-w-0 flex-1 gap-3">

                {profile.profilePicture ? (
                    <img
                        src={profile.profilePicture}
                        alt={name}
                        className="h-14 w-14 shrink-0 rounded-lg border object-cover"
                    />
                ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-bold text-[#004AC6]">
                        {getInitials(name)}
                    </div>
                )}

                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-1.5">

                        <h3 className="truncate text-sm font-bold text-gray-900">
                            {name}
                        </h3>

                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[8px] font-bold text-green-600">
                            Available
                        </span>

                    </div>

                    <p className="mt-1 line-clamp-1 text-[11px] font-medium text-gray-600">
                        {profile.proffesionalHeadLine ||
                            "Professional headline not added"}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-400">

                        <MapPin size={11} />

                        {getLocation(profile)}

                    </div>

                </div>

            </div>

            {/* DETAILS */}
            <div
                className={
                    listView
                        ? "flex flex-1 flex-wrap gap-2"
                        : "mt-4 grid grid-cols-3 gap-2 border-y border-gray-100 py-3"
                }
            >

                <MiniStat
                    label="Mentorship"
                    value={profile.mentorshipCount ?? 0}
                />

                <MiniStat
                    label="Connections"
                    value={profile.connectionsCount ?? 0}
                />

                <MiniStat
                    label="Experience"
                    value={profile.workExperience?.length ?? 0}
                />

            </div>

            {/* SKILLS */}
            {!listView && (
                <div className="mt-3 flex flex-wrap gap-1.5">

                    {(profile.skills || []).slice(0, 3).map(
                        (skill, index) => (
                            <span
                                key={index}
                                className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-semibold text-gray-500"
                            >
                                {skill}
                            </span>
                        )
                    )}

                </div>
            )}

            {/* ACTIONS */}
            <div
                className={
                    listView
                        ? "flex gap-2 sm:w-[230px]"
                        : "mt-4 space-y-2"
                }
            >

                <Link
                    to={`/student/directory/${userId}`}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#004AC6] bg-white text-[10px] font-semibold text-[#004AC6] shadow-sm transition hover:bg-blue-50 hover:shadow-md"
                >
                    <Eye size={13} />
                    View Profile
                </Link>

                <Link
                    to={{
                        pathname: "/student/messages",
                        search: `?chat=${userId}`,
                        state: {
                            chatTarget: {
                                _id: userId,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                profilePicture: profile.profilePicture,
                            },
                        },
                    }}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#003da8] bg-[#004AC6] text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#0038A8] hover:shadow-md"
                >
                    <MessageSquare size={13} />
                    Message
                </Link>

            </div>

        </div>
    );
};

const MiniStat = ({ label, value }) => (
    <div className="text-center">
        <p className="text-sm font-bold text-gray-800">
            {value}
        </p>

        <p className="text-[8px] uppercase tracking-wide text-gray-400">
            {label}
        </p>
    </div>
);

const LoadingGrid = () => (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <div className="flex gap-3">
                    <div className="h-14 w-14 rounded-lg bg-gray-200" />

                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded bg-gray-200" />
                        <div className="h-2.5 w-40 rounded bg-gray-100" />
                        <div className="h-2.5 w-24 rounded bg-gray-100" />
                    </div>
                </div>

                <div className="mt-5 h-12 rounded bg-gray-100" />

                <div className="mt-4 h-9 rounded bg-gray-100" />
            </div>
        ))}

    </div>
);

export default AlumniDirectory;