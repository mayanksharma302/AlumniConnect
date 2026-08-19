import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Briefcase,
    Clock3,
    Building2,
    ChevronDown,
    ExternalLink,
    UserRound,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:8000";

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("All Locations");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [experienceFilter, setExperienceFilter] = useState("All Experience");

    const [showFilters, setShowFilters] = useState(false);

    const user = JSON.parse(
        sessionStorage.getItem("user") || "{}"
    );

    const token = sessionStorage.getItem("accessToken");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    /* =====================================================
       FETCH JOBS
    ===================================================== */

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `${API_URL}/api/jobs/`,
                    authConfig
                );

                console.log("Jobs response:", response.data);

                if (response.data?.success) {
                    setJobs(response.data.data || []);
                } else {
                    setJobs([]);
                }

            } catch (error) {
                console.error("Fetch jobs error:", error);

                toast.error(
                    error.response?.data?.message ||
                    "Unable to load jobs."
                );

                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const locations = useMemo(() => {
        const values = jobs
            .map((job) => job.location)
            .filter(Boolean);

        return [
            "All Locations",
            ...new Set(values),
        ];
    }, [jobs]);

    const jobTypes = useMemo(() => {
        const values = jobs
            .map((job) => job.jobType)
            .filter(Boolean);

        return [
            "All Types",
            ...new Set(values),
        ];
    }, [jobs]);

    const experiences = useMemo(() => {
        const values = jobs
            .map((job) => job.experience)
            .filter(Boolean);

        return [
            "All Experience",
            ...new Set(values),
        ];
    }, [jobs]);

    /* =====================================================
       FILTER JOBS
    ===================================================== */

    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return jobs.filter((job) => {

            const searchableText = [
                job.title,
                job.company,
                job.description,
                job.location,
                job.jobType,
                job.experience,
                job.industry,
                ...(job.requiredSkills || []),
                ...(job.preferredSkills || []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query ||
                searchableText.includes(query);

            const matchesLocation =
                locationFilter === "All Locations" ||
                job.location === locationFilter;

            const matchesType =
                typeFilter === "All Types" ||
                job.jobType === typeFilter;

            const matchesExperience =
                experienceFilter === "All Experience" ||
                job.experience === experienceFilter;

            return (
                matchesSearch &&
                matchesLocation &&
                matchesType &&
                matchesExperience
            );
        });
    }, [
        jobs,
        search,
        locationFilter,
        typeFilter,
        experienceFilter,
    ]);

    const clearFilters = () => {
        setSearch("");
        setLocationFilter("All Locations");
        setTypeFilter("All Types");
        setExperienceFilter("All Experience");
    };

    const hasFilters =
        search ||
        locationFilter !== "All Locations" ||
        typeFilter !== "All Types" ||
        experienceFilter !== "All Experience";

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-full bg-[#F8F9FF] p-4 sm:p-6">

                <div className="mx-auto max-w-7xl">

                    <div className="animate-pulse">

                        <div className="h-7 w-48 rounded bg-gray-200" />

                        <div className="mt-2 h-4 w-80 rounded bg-gray-100" />

                        <div className="mt-6 h-12 rounded-xl bg-white shadow-sm" />

                        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div
                                    key={item}
                                    className="h-72 rounded-xl border border-gray-200 bg-white p-5"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-gray-200" />

                                    <div className="mt-5 h-5 w-3/4 rounded bg-gray-200" />

                                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />

                                    <div className="mt-6 h-20 rounded-lg bg-gray-100" />

                                    <div className="mt-6 h-9 rounded-lg bg-gray-200" />
                                </div>
                            ))}

                        </div>

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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#004AC6]">
                            Career Opportunities
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Jobs & Referrals
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Explore opportunities shared by alumni and discover your next career move.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">

                        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                            {filteredJobs.length} Opportunities
                        </div>

                    </div>

                </div>


                {/* =================================================
                    SEARCH / FILTER BAR
                ================================================= */}

                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        {/* SEARCH */}

                        <div className="relative flex-1">

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
                                placeholder="Search jobs, companies, skills..."
                                className="h-11 w-full rounded-lg border border-gray-200 bg-[#FAFBFF] pl-10 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                >
                                    <X size={16} />
                                </button>
                            )}

                        </div>


                        {/* FILTER BUTTON */}

                        <button
                            onClick={() =>
                                setShowFilters((value) => !value)
                            }
                            className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition ${showFilters
                                ? "border-[#004AC6] bg-blue-50 text-[#004AC6]"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                        </button>

                    </div>


                    {/* FILTERS */}

                    {showFilters && (
                        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-3">

                            <FilterSelect
                                label="Location"
                                value={locationFilter}
                                options={locations}
                                onChange={setLocationFilter}
                            />

                            <FilterSelect
                                label="Job Type"
                                value={typeFilter}
                                options={jobTypes}
                                onChange={setTypeFilter}
                            />

                            <FilterSelect
                                label="Experience"
                                value={experienceFilter}
                                options={experiences}
                                onChange={setExperienceFilter}
                            />

                        </div>
                    )}


                    {/* ACTIVE FILTERS */}

                    {hasFilters && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">

                            <span className="text-xs font-medium text-gray-400">
                                Active filters:
                            </span>

                            {search && (
                                <FilterTag
                                    text={`"${search}"`}
                                    onRemove={() => setSearch("")}
                                />
                            )}

                            {locationFilter !== "All Locations" && (
                                <FilterTag
                                    text={locationFilter}
                                    onRemove={() =>
                                        setLocationFilter("All Locations")
                                    }
                                />
                            )}

                            {typeFilter !== "All Types" && (
                                <FilterTag
                                    text={typeFilter}
                                    onRemove={() =>
                                        setTypeFilter("All Types")
                                    }
                                />
                            )}

                            {experienceFilter !== "All Experience" && (
                                <FilterTag
                                    text={experienceFilter}
                                    onRemove={() =>
                                        setExperienceFilter("All Experience")
                                    }
                                />
                            )}

                            <button
                                onClick={clearFilters}
                                className="ml-1 text-xs font-semibold text-[#004AC6] hover:underline"
                            >
                                Clear all
                            </button>

                        </div>
                    )}

                </div>


                {/* =================================================
                    RESULTS HEADER
                ================================================= */}

                <div className="mt-6 flex items-center justify-between">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Recommended Opportunities
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {filteredJobs.length} jobs available
                        </p>

                    </div>

                </div>


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {filteredJobs.length === 0 ? (

                    <div className="mt-5 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#004AC6]">
                            <Briefcase size={24} />
                        </div>

                        <h3 className="mt-4 text-base font-bold text-gray-800">
                            No opportunities found
                        </h3>

                        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                            Try changing your search or filters to find more job opportunities.
                        </p>

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-5 rounded-lg border border-[#004AC6] bg-[#004AC6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md"
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>

                ) : (

                    /* =================================================
                       JOB GRID
                    ================================================= */

                    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {filteredJobs.map((job) => (
                            <JobCard
                                key={job._id}
                                job={job}
                            />
                        ))}

                    </div>

                )}

            </div>

        </div>
    );
};


/* =========================================================
   JOB CARD
========================================================= */

const JobCard = ({ job }) => {

    const title =
        job.title ||
        job.jobTitle ||
        "Untitled Position";

    const company =
        job.company ||
        job.companyName ||
        "Company not specified";

    const location =
        job.location ||
        "Location not specified";

    const jobType =
        job.jobType ||
        job.type ||
        "Not specified";

    const experience =
        job.experience ||
        "Not specified";

    const industry =
        job.industry ||
        "Technology";

    const requiredSkills =
        job.requiredSkills ||
        job.skills ||
        [];

    const preferredSkills =
        job.preferredSkills ||
        [];

    const skills = [
        ...requiredSkills,
        ...preferredSkills,
    ].slice(0, 5);

    const postedBy =
        job.postedBy ||
        job.createdBy ||
        job.userId;

    const postedName =
        postedBy?.firstName
            ? `${postedBy.firstName} ${postedBy.lastName || ""}`.trim()
            : postedBy?.username ||
            "Alumni Member";

    const companyInitial =
        company
            .charAt(0)
            .toUpperCase();

    return (
        <article className="group flex min-h-[365px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

            {/* CARD TOP */}

            <div className="border-b border-gray-100 p-5">

                <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        {/* COMPANY LOGO */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-[#004AC6]">

                            {job.companyLogo ||
                                job.logo ? (
                                <img
                                    src={
                                        job.companyLogo ||
                                        job.logo
                                    }
                                    alt={company}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                companyInitial
                            )}

                        </div>


                        <div className="min-w-0">

                            <h3 className="truncate text-base font-bold text-gray-900">
                                {title}
                            </h3>

                            <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
                                {company}
                            </p>

                        </div>

                    </div>


                    {/* JOB TYPE */}

                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#004AC6]">
                        {jobType}
                    </span>

                </div>


                {/* META */}

                <div className="mt-5 grid grid-cols-2 gap-2">

                    <MetaItem
                        icon={<MapPin size={13} />}
                        value={location}
                    />

                    <MetaItem
                        icon={<Clock3 size={13} />}
                        value={experience}
                    />

                    <MetaItem
                        icon={<Building2 size={13} />}
                        value={industry}
                    />

                    <MetaItem
                        icon={<Briefcase size={13} />}
                        value="Referral Available"
                    />

                </div>

            </div>


            {/* CARD BODY */}

            <div className="flex flex-1 flex-col p-5">

                {/* DESCRIPTION */}

                {job.description && (
                    <p className="line-clamp-3 text-xs leading-5 text-gray-500">
                        {job.description}
                    </p>
                )}


                {/* SKILLS */}

                {skills.length > 0 && (
                    <div className="mt-4">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Skills
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                            {skills.map((skill, index) => (
                                <span
                                    key={`${skill}-${index}`}
                                    className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600"
                                >
                                    {skill}
                                </span>
                            ))}

                        </div>

                    </div>
                )}


                {/* POSTED BY */}

                <div className="mt-auto border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2">

                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[#004AC6]">
                            <UserRound size={13} />
                        </div>

                        <div className="min-w-0">

                            <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                                Posted by
                            </p>

                            <p className="truncate text-xs font-semibold text-gray-700">
                                {postedName}
                            </p>

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="mt-4 flex gap-2">

                        <Link
                            to={`/student/jobs/${job._id}`}
                            state={{ job }}
                            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#004AC6] bg-white text-xs font-semibold text-[#004AC6] shadow-sm transition hover:bg-blue-50 hover:shadow-md"
                        >
                            View Details
                        </Link>


                        {job.applyLink ? (
                            <a
                                href={job.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#003da8] bg-[#004AC6] text-xs font-semibold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md"
                            >
                                Apply
                                <ExternalLink size={13} />
                            </a>
                        ) : (
                            <Link
                                to={`/student/jobs/${job._id}`}
                                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#003da8] bg-[#004AC6] text-xs font-semibold text-white shadow-sm transition hover:bg-[#003da8] hover:shadow-md"
                            >
                                Request Referral
                            </Link>
                        )}

                    </div>

                </div>

            </div>

        </article>
    );
};


/* =========================================================
   META ITEM
========================================================= */

const MetaItem = ({ icon, value }) => {
    return (
        <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2">

            <span className="shrink-0 text-[#004AC6]">
                {icon}
            </span>

            <span className="truncate text-[10px] font-medium text-gray-600">
                {value}
            </span>

        </div>
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
        <label className="relative block">

            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {label}
            </span>

            <div className="relative">

                <select
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6] focus:ring-2 focus:ring-blue-100"
                >
                    {options.map((option) => (
                        <option
                            key={option}
                            value={option}
                        >
                            {option}
                        </option>
                    ))}
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

const FilterTag = ({ text, onRemove }) => {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-[#004AC6]">

            {text}

            <button
                onClick={onRemove}
                className="rounded-full hover:bg-blue-100"
            >
                <X size={11} />
            </button>

        </span>
    );
};

export default JobBoard;