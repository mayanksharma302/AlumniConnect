import React, {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    ExternalLink,
    MapPin,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000";


const Jobs = () => {

    /* =====================================================
       STATE
    ===================================================== */

    const [jobs, setJobs] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [deletingId, setDeletingId] =
        useState(null);

    const [creating, setCreating] =
        useState(false);


    /* =====================================================
       FORM
    ===================================================== */

    const initialForm = {
        title: "",
        company: "",
        location: "",
        jobType: "Full-time",
        workMode: "On-site",
        description: "",
        requirements: "",
        salary: "",
        applicationLink: "",
        validityDays: 30,
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
       FETCH MY JOBS
       
       GET /api/jobs/my-jobs
    ===================================================== */

    const fetchMyJobs = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/api/jobs/my-jobs`,
                    getConfig()
                );

            const data =
                response.data;


            if (
                Array.isArray(data)
            ) {

                setJobs(data);

            } else if (
                Array.isArray(
                    data?.jobs
                )
            ) {

                setJobs(
                    data.jobs
                );

            } else if (
                Array.isArray(
                    data?.data
                )
            ) {

                setJobs(
                    data.data
                );

            } else {

                setJobs([]);

            }

        } catch (err) {

            console.error(
                "Fetch my jobs error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load your jobs."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchMyJobs();

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
        } = e.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

    };


    /* =====================================================
       CREATE JOB
       
       POST /api/jobs/create
    ===================================================== */

    const handleCreateJob = async (e) => {
        e.preventDefault();

        setCreating(true);
        setError("");

        try {
            const payload = {
                company: form.company.trim(),
                jobTitle: form.title.trim(),
                jobDescription: form.description.trim(),
                requirements: form.requirements.trim(),
                applyLink: form.applicationLink.trim(),
                validityDays: Number(form.validityDays) || 30,
            };

            console.log("Creating job with:", payload);

            const response = await axios.post(
                `${API_URL}/api/jobs/create`,
                payload,
                getConfig()
            );

            console.log("Job created:", response.data);

            setForm(initialForm);
            setShowCreateModal(false);

            await fetchMyJobs();

        } catch (err) {
            console.error(
                "Create job error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to create the job."
            );
        } finally {
            setCreating(false);
        }
    };


    /* =====================================================
       DELETE JOB
       
       DELETE /api/jobs/:jobId
    ===================================================== */

    const handleDelete = async (
        jobId
    ) => {

        if (!jobId) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this job?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(
                jobId
            );


            await axios.delete(
                `${API_URL}/api/jobs/${jobId}`,
                getConfig()
            );


            setJobs(
                (previous) =>
                    previous.filter(
                        (job) =>
                            getJobId(
                                job
                            ) !== jobId
                    )
            );

        } catch (err) {

            console.error(
                "Delete job error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to delete the job."
            );

        } finally {

            setDeletingId(
                null
            );

        }

    };


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredJobs =
        jobs.filter(
            (job) => {

                const text = [
                    job?.title,
                    job?.jobTitle,
                    job?.company,
                    job?.companyName,
                    job?.location,
                    job?.jobType,
                    job?.workMode,
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

                        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />

                        <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />

                    </div>

                    <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200" />

                </div>


                <div className="h-16 animate-pulse rounded-2xl bg-gray-200" />


                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                    {[1, 2, 3, 4].map(
                        (item) => (

                            <div
                                key={item}
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
                            Career Opportunities
                        </p>


                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                            Jobs
                        </h1>


                        <p className="mt-2 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm">

                            Share opportunities with students
                            and manage the jobs you've posted.

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

                        Post a Job

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
               INFO BANNER
            ================================================= */}

            <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#004AC6] shadow-sm">

                        <BriefcaseBusiness
                            size={17}
                        />

                    </div>


                    <div>

                        <p className="text-xs font-bold text-blue-900">
                            Your professional network can make a difference.
                        </p>

                        <p className="mt-0.5 text-[10px] text-blue-700/70">
                            Post relevant opportunities for students and fellow alumni.
                        </p>

                    </div>

                </div>


                <div className="text-[10px] font-bold text-[#004AC6]">

                    {jobs.length}{" "}
                    {jobs.length === 1
                        ? "job"
                        : "jobs"}{" "}
                    posted

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
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search your jobs..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-xs font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                    />

                </div>


                <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[10px] font-semibold text-gray-500">

                    <BriefcaseBusiness
                        size={14}
                        className="text-[#004AC6]"
                    />

                    {filteredJobs.length}{" "}
                    Results

                </div>

            </div>


            {/* =================================================
               JOB LIST
            ================================================= */}

            {filteredJobs.length ===
                0 ? (

                <EmptyJobs
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

                    {filteredJobs.map(
                        (
                            job
                        ) => (

                            <JobCard
                                key={
                                    getJobId(
                                        job
                                    )
                                }
                                job={
                                    job
                                }
                                deleting={
                                    deletingId ===
                                    getJobId(
                                        job
                                    )
                                }
                                onDelete={
                                    handleDelete
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

                <CreateJobModal
                    form={form}
                    creating={creating}
                    onChange={
                        handleChange
                    }
                    onClose={() =>
                        setShowCreateModal(
                            false
                        )
                    }
                    onSubmit={
                        handleCreateJob
                    }
                />

            )}

        </div>

    );

};


/* =========================================================
   JOB CARD
========================================================= */

const JobCard = ({
    job,
    deleting,
    onDelete,
}) => {

    const title =
        job?.title ||
        job?.jobTitle ||
        "Untitled Job";


    const company =
        job?.company ||
        job?.companyName ||
        "Company";


    const location =
        job?.location ||
        "Location not specified";


    const jobType =
        job?.jobType ||
        job?.employmentType ||
        "Job";


    const workMode =
        job?.workMode ||
        job?.remoteType ||
        "";


    const description =
        job?.description ||
        "No job description provided.";


    const requirements =
        Array.isArray(
            job?.requirements
        )
            ? job.requirements
            : [];


    const applicationLink =
        job?.applicationLink ||
        job?.applyLink ||
        job?.applicationUrl ||
        job?.url ||
        "";


    const createdAt =
        job?.createdAt ||
        job?.postedAt;


    return (

        <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">

            {/* TOP */}

            <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004AC6]">

                            <BriefcaseBusiness
                                size={19}
                            />

                        </div>


                        <div className="min-w-0">

                            <h2 className="truncate text-sm font-bold text-gray-900">
                                {title}
                            </h2>


                            <div className="mt-1 flex items-center gap-1.5">

                                <Building2
                                    size={12}
                                    className="shrink-0 text-gray-400"
                                />

                                <span className="truncate text-[10px] font-semibold text-gray-500">
                                    {company}
                                </span>

                            </div>

                        </div>

                    </div>


                    <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[9px] font-bold text-[#004AC6]">
                        Your Post
                    </span>

                </div>


                {/* TAGS */}

                <div className="mt-4 flex flex-wrap gap-2">

                    <Tag
                        icon={
                            <BriefcaseBusiness
                                size={11}
                            />
                        }
                        text={
                            jobType
                        }
                    />


                    {workMode && (

                        <Tag
                            text={
                                workMode
                            }
                        />

                    )}


                    <Tag
                        icon={
                            <MapPin
                                size={11}
                            />
                        }
                        text={
                            location
                        }
                    />

                </div>


                {/* DESCRIPTION */}

                <p className="mt-4 line-clamp-3 text-[11px] leading-5 text-gray-500">

                    {description}

                </p>


                {/* REQUIREMENTS */}

                {requirements.length >
                    0 && (

                        <div className="mt-4">

                            <p className="mb-2 text-[9px] font-black uppercase tracking-[1.5px] text-gray-400">
                                Requirements
                            </p>


                            <div className="flex flex-wrap gap-1.5">

                                {requirements
                                    .slice(
                                        0,
                                        5
                                    )
                                    .map(
                                        (
                                            requirement,
                                            index
                                        ) => (

                                            <span
                                                key={
                                                    index
                                                }
                                                className="rounded-md bg-gray-50 px-2 py-1 text-[9px] font-medium text-gray-500"
                                            >
                                                {
                                                    requirement
                                                }
                                            </span>

                                        )
                                    )}

                            </div>

                        </div>

                    )}

            </div>


            {/* FOOTER */}

            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex flex-wrap items-center gap-3">

                    {createdAt && (

                        <span className="flex items-center gap-1 text-[9px] font-medium text-gray-400">

                            <Clock3
                                size={11}
                            />

                            {formatDate(
                                createdAt
                            )}

                        </span>

                    )}


                    {job?.salary && (

                        <span className="font-semibold text-[9px] text-gray-500">

                            ₹{" "}
                            {job.salary}

                        </span>

                    )}

                </div>


                <div className="flex items-center gap-2">

                    {applicationLink && (

                        <a
                            href={
                                applicationLink
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[9px] font-bold text-gray-600 transition hover:border-blue-200 hover:text-[#004AC6]"
                        >

                            View Link

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
                                getJobId(
                                    job
                                )
                            )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
   TAG
========================================================= */

const Tag = ({
    icon,
    text,
}) => {

    return (

        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[9px] font-semibold text-gray-500">

            {icon}

            {text}

        </span>

    );

};


/* =========================================================
   EMPTY
========================================================= */

const EmptyJobs = ({
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
                    <BriefcaseBusiness
                        size={23}
                    />
                )}

            </div>


            <h2 className="text-sm font-bold text-gray-800">

                {search
                    ? "No jobs found"
                    : "No jobs posted yet"}

            </h2>


            <p className="mt-2 max-w-sm text-[10px] leading-5 text-gray-400">

                {search
                    ? "Try a different search term."
                    : "Share a career opportunity with students and the alumni community."}

            </p>


            {!search && (

                <button
                    type="button"
                    onClick={onCreate}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#004AC6] px-4 py-2.5 text-[10px] font-bold text-white"
                >

                    <Plus
                        size={13}
                    />

                    Post Your First Job

                </button>

            )}

        </div>

    );

};


/* =========================================================
   CREATE JOB MODAL
========================================================= */

const CreateJobModal = ({
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
                            Post a Job
                        </h2>

                        <p className="mt-1 text-[9px] text-gray-400">
                            Share a professional opportunity with the community.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                        <FormInput
                            label="Job Title"
                            name="title"
                            value={
                                form.title
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. Frontend Developer"
                            required
                        />


                        <FormInput
                            label="Company"
                            name="company"
                            value={
                                form.company
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. Google"
                            required
                        />


                        <FormInput
                            label="Location"
                            name="location"
                            value={
                                form.location
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. Ahmedabad, Gujarat"
                        />


                        <SelectInput
                            label="Job Type"
                            name="jobType"
                            value={
                                form.jobType
                            }
                            onChange={
                                onChange
                            }
                            options={[
                                "Full-time",
                                "Part-time",
                                "Internship",
                                "Contract",
                                "Freelance",
                            ]}
                        />


                        <SelectInput
                            label="Work Mode"
                            name="workMode"
                            value={
                                form.workMode
                            }
                            onChange={
                                onChange
                            }
                            options={[
                                "On-site",
                                "Hybrid",
                                "Remote",
                            ]}
                        />


                        <FormInput
                            label="Salary"
                            name="salary"
                            value={
                                form.salary
                            }
                            onChange={
                                onChange
                            }
                            placeholder="e.g. ₹6-10 LPA"
                        />

                        <FormInput
                            label="Validity"
                            name="validityDays"
                            value={form.validityDays}
                            onChange={onChange}
                            placeholder="e.g. 30"
                        />


                        <div className="sm:col-span-2">

                            <FormInput
                                label="Application Link"
                                name="applicationLink"
                                value={
                                    form.applicationLink
                                }
                                onChange={
                                    onChange
                                }
                                placeholder="https://..."
                            />

                        </div>


                        <div className="sm:col-span-2">

                            <label className="mb-1.5 block text-[10px] font-bold text-gray-600">
                                Description
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
                                placeholder="Describe the role, responsibilities and opportunity..."
                                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                            />

                        </div>


                        <div className="sm:col-span-2">

                            <label className="mb-1.5 block text-[10px] font-bold text-gray-600">

                                Requirements

                                <span className="ml-1 font-normal text-gray-400">
                                    (one per line)
                                </span>

                            </label>


                            <textarea
                                name="requirements"
                                value={
                                    form.requirements
                                }
                                onChange={
                                    onChange
                                }
                                rows={4}
                                placeholder={"React\nJavaScript\nREST APIs"}
                                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                            />

                        </div>

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
                                    Posting...
                                </>

                            ) : (

                                <>
                                    <CheckCircle2
                                        size={13}
                                    />
                                    Post Job
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
                value={value}
                onChange={onChange}
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
   SELECT
========================================================= */

const SelectInput = ({
    label,
    name,
    value,
    onChange,
    options,
}) => {

    return (

        <div>

            <label className="mb-1.5 block text-[10px] font-bold text-gray-600">
                {label}
            </label>


            <div className="relative">

                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 pr-9 text-xs text-gray-700 outline-none transition focus:border-[#004AC6] focus:ring-2 focus:ring-blue-50"
                >

                    {options.map(
                        (
                            option
                        ) => (

                            <option
                                key={
                                    option
                                }
                                value={
                                    option
                                }
                            >
                                {option}
                            </option>

                        )
                    )}

                </select>


                <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

            </div>

        </div>

    );

};


/* =========================================================
   HELPERS
========================================================= */

const getJobId = (
    job
) => {

    return (
        job?._id ||
        job?.id
    );

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
        return "Recently";
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


export default Jobs;