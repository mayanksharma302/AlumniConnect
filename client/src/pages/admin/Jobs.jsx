import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Search,
    RefreshCw,
    BriefcaseBusiness,
    MapPin,
    Building2,
    CalendarDays,
    Trash2,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    ExternalLink,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] =
        useState("all");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [selectedJob, setSelectedJob] =
        useState(null);

    const [deleteJob, setDeleteJob] =
        useState(null);

    const [page, setPage] = useState(1);

    const ITEMS_PER_PAGE = 8;

    // =====================================================
    // AUTH
    // =====================================================

    const getToken = () => {
        return (
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("accessToken")
        );
    };

    const getConfig = () => {
        const token = getToken();

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
    // GET ALL JOBS
    // =====================================================

    const fetchJobs = async (
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
                    `${API_URL}/api/jobs/`,
                    getConfig()
                );

            const body = response?.data;

            let data = [];

            if (Array.isArray(body)) {
                data = body;
            } else if (
                Array.isArray(body?.data)
            ) {
                data = body.data;
            } else if (
                Array.isArray(body?.jobs)
            ) {
                data = body.jobs;
            }

            setJobs(data);
        } catch (error) {
            console.error(
                "Jobs loading error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to load jobs."
            );

            setJobs([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // =====================================================
    // HELPERS
    // =====================================================

    const getJobTitle = (job) => {
        return (
            job?.title ||
            job?.jobTitle ||
            job?.position ||
            "Untitled Job"
        );
    };

    const getCompany = (job) => {
        return (
            job?.company ||
            job?.companyName ||
            job?.organization ||
            job?.companyDetails?.name ||
            "Company"
        );
    };

    const getLocation = (job) => {
        if (typeof job?.location === "string") {
            return job.location;
        }

        if (job?.location) {
            return [
                job.location.city,
                job.location.state,
                job.location.country,
            ]
                .filter(Boolean)
                .join(", ");
        }

        return (
            job?.city ||
            job?.jobLocation ||
            "Not specified"
        );
    };

    const getDescription = (job) => {
        return (
            job?.description ||
            job?.jobDescription ||
            job?.details ||
            "No description available."
        );
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
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
    // LOCATION OPTIONS
    // =====================================================

    const locations = useMemo(() => {
        const values = jobs
            .map((job) =>
                getLocation(job)
            )
            .filter(
                (location) =>
                    location &&
                    location !==
                    "Not specified"
            );

        return [
            ...new Set(values),
        ].sort();
    }, [jobs]);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredJobs = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return jobs.filter((job) => {
            const title =
                getJobTitle(job).toLowerCase();

            const company =
                getCompany(job).toLowerCase();

            const location =
                getLocation(job).toLowerCase();

            const matchesSearch =
                !query ||
                title.includes(query) ||
                company.includes(query) ||
                location.includes(query);

            const matchesLocation =
                locationFilter === "all" ||
                getLocation(job) ===
                locationFilter;

            return (
                matchesSearch &&
                matchesLocation
            );
        });
    }, [
        jobs,
        search,
        locationFilter,
    ]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        Math.ceil(
            filteredJobs.length /
            ITEMS_PER_PAGE
        ),
        1
    );

    const safePage = Math.min(
        page,
        totalPages
    );

    const paginatedJobs =
        filteredJobs.slice(
            (safePage - 1) *
            ITEMS_PER_PAGE,
            safePage *
            ITEMS_PER_PAGE
        );

    useEffect(() => {
        setPage(1);
    }, [
        search,
        locationFilter,
    ]);

    // =====================================================
    // DELETE JOB
    // =====================================================

    const handleDelete = async () => {
        if (!deleteJob?._id) return;

        try {
            await axios.delete(
                `${API_URL}/api/jobs/${deleteJob._id}`,
                getConfig()
            );

            setJobs((current) =>
                current.filter(
                    (job) =>
                        job._id !==
                        deleteJob._id
                )
            );

            setDeleteJob(null);
        } catch (error) {
            console.error(
                "Delete job error:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Unable to delete job."
            );
        }
    };

    // =====================================================
    // CREATE SUCCESS
    // =====================================================

    const handleJobCreated = (newJob) => {
        if (newJob) {
            setJobs((current) => [
                newJob,
                ...current,
            ]);
        } else {
            fetchJobs(true);
        }

        setShowCreateModal(false);
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    onRefresh={() =>
                        fetchJobs(true)
                    }
                    refreshing={refreshing}
                    onCreate={() =>
                        setShowCreateModal(
                            true
                        )
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map(
                        (item) => (
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
                    fetchJobs(true)
                }
                refreshing={refreshing}
                onCreate={() =>
                    setShowCreateModal(true)
                }
            />

            {/* ERROR */}

            {error && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">

                    <div className="flex items-center gap-2">
                        <AlertCircle
                            size={16}
                        />

                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchJobs(true)
                        }
                        className="font-bold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* STATS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <StatCard
                    title="Total Jobs"
                    value={jobs.length}
                    icon={
                        BriefcaseBusiness
                    }
                    iconClass="bg-orange-50 text-orange-600"
                />

                <StatCard
                    title="Showing"
                    value={
                        filteredJobs.length
                    }
                    icon={Search}
                    iconClass="bg-blue-50 text-[#004AC6]"
                />

                <StatCard
                    title="Locations"
                    value={locations.length}
                    icon={MapPin}
                    iconClass="bg-emerald-50 text-emerald-600"
                />

            </div>

            {/* JOB TABLE */}

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
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search jobs, companies or locations..."
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                            />
                        </div>

                        <select
                            value={
                                locationFilter
                            }
                            onChange={(e) =>
                                setLocationFilter(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none focus:border-[#004AC6]"
                        >

                            <option value="all">
                                All Locations
                            </option>

                            {locations.map(
                                (location) => (
                                    <option
                                        key={
                                            location
                                        }
                                        value={
                                            location
                                        }
                                    >
                                        {location}
                                    </option>
                                )
                            )}

                        </select>

                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px]">

                        <thead>

                            <tr className="border-b border-gray-100 bg-gray-50/70">

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Job
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Company
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Location
                                </th>

                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Posted
                                </th>

                                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {paginatedJobs.length >
                                0 ? (

                                paginatedJobs.map(
                                    (
                                        job,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                job._id ||
                                                index
                                            }
                                            className="transition hover:bg-gray-50/70"
                                        >

                                            {/* JOB */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                                                        <BriefcaseBusiness
                                                            size={
                                                                17
                                                            }
                                                        />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="max-w-[260px] truncate text-xs font-bold text-gray-800">

                                                            {
                                                                getJobTitle(
                                                                    job
                                                                )
                                                            }

                                                        </p>

                                                        <p className="mt-1 max-w-[280px] truncate text-[10px] text-gray-400">

                                                            {
                                                                getDescription(
                                                                    job
                                                                )
                                                            }

                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* COMPANY */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-600">

                                                    <Building2
                                                        size={
                                                            13
                                                        }
                                                        className="text-gray-400"
                                                    />

                                                    {
                                                        getCompany(
                                                            job
                                                        )
                                                    }

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

                                                        {
                                                            getLocation(
                                                                job
                                                            )
                                                        }

                                                    </span>

                                                </div>

                                            </td>

                                            {/* DATE */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">

                                                    <CalendarDays
                                                        size={
                                                            11
                                                        }
                                                        className="text-gray-400"
                                                    />

                                                    {
                                                        formatDate(
                                                            job.createdAt ||
                                                            job.postedAt
                                                        )
                                                    }

                                                </div>

                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedJob(
                                                                job
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 transition hover:border-[#004AC6] hover:text-[#004AC6]"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteJob(
                                                                job
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center rounded-lg border border-red-100 p-1.5 text-red-500 transition hover:bg-red-50"
                                                        title="Delete job"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>

                                                </div>

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

                                            <BriefcaseBusiness
                                                size={
                                                    22
                                                }
                                            />

                                        </div>

                                        <p className="mt-3 text-sm font-bold text-gray-600">
                                            No jobs found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Try changing your search or create a new job.
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

                        <span className="font-bold text-gray-600">

                            {filteredJobs.length ===
                                0
                                ? 0
                                : (safePage -
                                    1) *
                                ITEMS_PER_PAGE +
                                1}

                        </span>

                        {" "}–{" "}

                        <span className="font-bold text-gray-600">

                            {Math.min(
                                safePage *
                                ITEMS_PER_PAGE,
                                filteredJobs.length
                            )}

                        </span>

                        {" "}of{" "}

                        <span className="font-bold text-gray-600">

                            {
                                filteredJobs.length
                            }

                        </span>

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
                                    (current) =>
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
                                size={
                                    15
                                }
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
                                    (current) =>
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
                                size={
                                    15
                                }
                            />

                        </button>

                    </div>

                </div>

            </section>

            {/* VIEW MODAL */}

            {selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    onClose={() =>
                        setSelectedJob(
                            null
                        )
                    }
                />
            )}

            {/* DELETE MODAL */}

            {deleteJob && (
                <DeleteModal
                    job={deleteJob}
                    onClose={() =>
                        setDeleteJob(
                            null
                        )
                    }
                    onConfirm={
                        handleDelete
                    }
                />
            )}

            {/* CREATE MODAL */}

            {showCreateModal && (
                <CreateJobModal
                    onClose={() =>
                        setShowCreateModal(
                            false
                        )
                    }
                    onCreated={
                        handleJobCreated
                    }
                />
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
    onCreate,
}) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#004AC6]">
                Administration
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                Jobs
            </h1>

            <p className="mt-1 text-xs text-gray-400">
                Manage job opportunities posted on AlumniConnect.
            </p>

        </div>

        <div className="flex gap-2">

            <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 shadow-sm transition hover:border-[#004AC6] hover:text-[#004AC6] disabled:opacity-60"
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

            <button
                type="button"
                onClick={onCreate}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#004AC6] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#003da3]"
            >

                <Plus size={15} />

                Create Job

            </button>

        </div>

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
// CREATE JOB MODAL
// =========================================================

const CreateJobModal = ({
    onClose,
    onCreated,
}) => {

    const [form, setForm] = useState({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        salary: "",
        applicationLink: "",
    });

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const getToken = () =>
        sessionStorage.getItem(
            "accessToken"
        ) ||
        localStorage.getItem(
            "accessToken"
        );

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

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

    };

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setSubmitting(true);
        setError("");

        try {

            /*
             * Send only fields that have been
             * entered. This avoids sending
             * unnecessary undefined values.
             */

            const payload = {
                ...form,

                requirements:
                    form.requirements
                        ? form.requirements
                            .split("\n")
                            .map(
                                (item) =>
                                    item.trim()
                            )
                            .filter(Boolean)
                        : [],
            };

            const response =
                await axios.post(
                    `${API_URL}/api/jobs/create`,
                    payload,
                    getConfig()
                );

            const body =
                response?.data;

            const createdJob =
                body?.data ||
                body?.job ||
                body;

            onCreated(
                createdJob
            );

        } catch (error) {

            console.error(
                "Create job error:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to create job."
            );

        } finally {

            setSubmitting(false);

        }

    };

    return (

        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Create Job
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Publish a new opportunity.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    >

                        <X size={18} />

                    </button>

                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="max-h-[70vh] overflow-y-auto p-5"
                >

                    {error && (

                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-medium text-red-600">
                            {error}
                        </div>

                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Input
                            label="Job Title"
                            name="title"
                            value={
                                form.title
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. React Developer"
                            required
                        />

                        <Input
                            label="Company"
                            name="company"
                            value={
                                form.company
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Google"
                            required
                        />

                        <Input
                            label="Location"
                            name="location"
                            value={
                                form.location
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. Ahmedabad / Remote"
                        />

                        <Input
                            label="Salary"
                            name="salary"
                            value={
                                form.salary
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. ₹6–10 LPA"
                        />

                        <Input
                            label="Application Link"
                            name="applicationLink"
                            value={
                                form.applicationLink
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="https://..."
                        />

                    </div>

                    <div className="mt-4">

                        <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            rows={5}
                            placeholder="Describe the role..."
                            required
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                        />

                    </div>

                    <div className="mt-4">

                        <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
                            Requirements
                        </label>

                        <textarea
                            name="requirements"
                            value={
                                form.requirements
                            }
                            onChange={
                                handleChange
                            }
                            rows={4}
                            placeholder={"React\nJavaScript\nREST APIs"}
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
                        />

                        <p className="mt-1 text-[9px] text-gray-400">
                            Put each requirement on a new line.
                        </p>

                    </div>

                    <div className="mt-6 flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="rounded-xl bg-[#004AC6] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#003da3] disabled:opacity-60"
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Job"}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
};


// =========================================================
// INPUT
// =========================================================

const Input = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
}) => (
    <div>

        <label className="mb-1.5 block text-[10px] font-bold text-gray-500">
            {label}
        </label>

        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:bg-white"
        />

    </div>
);


// =========================================================
// JOB DETAILS MODAL
// =========================================================

const JobDetailsModal = ({
    job,
    onClose,
}) => {

    const title =
        job?.title ||
        job?.jobTitle ||
        job?.position ||
        "Untitled Job";

    const company =
        job?.company ||
        job?.companyName ||
        job?.organization ||
        "Company";

    const location =
        typeof job?.location ===
            "string"
            ? job.location
            : [
                job?.location?.city,
                job?.location?.state,
                job?.location?.country,
            ]
                .filter(Boolean)
                .join(", ") ||
            "Not specified";

    const description =
        job?.description ||
        job?.jobDescription ||
        "No description available.";

    const requirements =
        Array.isArray(
            job?.requirements
        )
            ? job.requirements
            : [];

    return (

        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div>

                        <h2 className="text-sm font-bold text-gray-900">
                            Job Details
                        </h2>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                            Review published job information.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="max-h-[70vh] overflow-y-auto p-5">

                    <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">

                            <BriefcaseBusiness
                                size={23}
                            />

                        </div>

                        <div className="min-w-0">

                            <h3 className="text-xl font-bold text-gray-900">
                                {title}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">

                                <span className="flex items-center gap-1 text-[10px] text-gray-500">

                                    <Building2
                                        size={12}
                                    />

                                    {company}

                                </span>

                                <span className="flex items-center gap-1 text-[10px] text-gray-500">

                                    <MapPin
                                        size={12}
                                    />

                                    {location}

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="mt-6">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Description
                        </p>

                        <p className="whitespace-pre-wrap text-xs leading-5 text-gray-600">
                            {description}
                        </p>

                    </div>

                    {requirements.length >
                        0 && (

                            <div className="mt-6">

                                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Requirements
                                </p>

                                <div className="space-y-2">

                                    {requirements.map(
                                        (
                                            requirement,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    index
                                                }
                                                className="flex gap-2 rounded-lg bg-gray-50 px-3 py-2"
                                            >

                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004AC6]" />

                                                <span className="text-xs text-gray-600">
                                                    {
                                                        typeof requirement ===
                                                            "string"
                                                            ? requirement
                                                            : JSON.stringify(
                                                                requirement
                                                            )
                                                    }
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-4">

                    <span className="text-[10px] text-gray-400">

                        Posted{" "}

                        {new Date(
                            job?.createdAt ||
                            job?.postedAt ||
                            Date.now()
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        )}

                    </span>

                    {job?.applicationLink && (

                        <a
                            href={
                                job.applicationLink
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-[#004AC6] px-4 py-2 text-[10px] font-bold text-white"
                        >

                            Application Link

                            <ExternalLink
                                size={12}
                            />

                        </a>

                    )}

                </div>

            </div>

        </div>
    );
};


// =========================================================
// DELETE MODAL
// =========================================================

const DeleteModal = ({
    job,
    onClose,
    onConfirm,
}) => {

    return (

        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >

            <div
                className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">

                    <Trash2
                        size={20}
                    />

                </div>

                <h2 className="mt-4 text-sm font-bold text-gray-900">
                    Delete this job?
                </h2>

                <p className="mt-2 text-xs leading-5 text-gray-400">

                    This will permanently remove{" "}

                    <span className="font-bold text-gray-600">
                        {job?.title ||
                            job?.jobTitle ||
                            "this job"}
                    </span>

                    {" "}from the job board.

                </p>

                <div className="mt-5 flex justify-end gap-2">

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Jobs;