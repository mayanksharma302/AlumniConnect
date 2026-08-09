import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Briefcase,
    Plus,
    Search,
    MapPin,
    Calendar,
    Link as LinkIcon,
    Trash2,
    ExternalLink,
    Clock,
    UserCheck,
    Lock
} from 'lucide-react';

const JobBoard = () => {
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'post' | 'manage'
    const [jobs, setJobs] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Post Job Form States
    const [company, setCompany] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [applyLink, setApplyLink] = useState('');
    const [validityDays, setValidityDays] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('accessToken');
    const isAlumni = user.role === 'alumni';

    const fetchJobs = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/jobs/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setJobs(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching jobs', err);
            toast.error('Unable to fetch job postings.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        if (!token || !isAlumni) return;
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/jobs/my-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.success) {
                setMyJobs(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching my jobs', err);
            toast.error('Unable to fetch your job postings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'feed') {
            fetchJobs();
        } else if (activeTab === 'manage') {
            fetchMyJobs();
        }
    }, [activeTab]);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        if (!company || !jobTitle || !jobDescription || !requirements || !applyLink) {
            toast.error('All fields are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:8000/api/jobs/create', {
                company,
                jobTitle,
                jobDescription,
                requirements,
                applyLink,
                validityDays: parseInt(validityDays) || 30
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Job posting created successfully!');
            // Reset form
            setCompany('');
            setJobTitle('');
            setJobDescription('');
            setRequirements('');
            setApplyLink('');
            setValidityDays(30);

            // Switch to manage tab
            setActiveTab('manage');
        } catch (err) {
            console.error('Error creating job', err);
            toast.error(err.response?.data?.message || 'Failed to create job posting.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Job posting deleted.');
            fetchMyJobs();
        } catch (err) {
            console.error('Error deleting job', err);
            toast.error('Failed to delete job posting.');
        }
    };

    // Filter jobs locally based on search term
    const filteredJobs = jobs.filter(job => {
        const term = searchTerm.toLowerCase();
        return (
            job.jobTitle?.toLowerCase().includes(term) ||
            job.company?.toLowerCase().includes(term) ||
            job.jobDescription?.toLowerCase().includes(term) ||
            job.requirements?.toLowerCase().includes(term)
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Board & Referrals</h1>
                    <p className="text-sm text-gray-500 mt-1">Explore job postings shared directly by alumni, or request referrals.</p>
                </div>
            </div>

            {/* Stepper / Tab Headers */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`pb-3.5 px-6 text-sm font-bold border-b-2 transition ${activeTab === 'feed'
                        ? 'border-[#004AC6] text-[#004AC6]'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    All Jobs Feed
                </button>

                {isAlumni && (
                    <>
                        <button
                            onClick={() => setActiveTab('post')}
                            className={`pb-3.5 px-6 text-sm font-bold border-b-2 transition ${activeTab === 'post'
                                ? 'border-[#004AC6] text-[#004AC6]'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Post a Job
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`pb-3.5 px-6 text-sm font-bold border-b-2 transition ${activeTab === 'manage'
                                ? 'border-[#004AC6] text-[#004AC6]'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            My Posted Jobs
                        </button>
                    </>
                )}
            </div>

            {/* Tab Contents */}
            {activeTab === 'feed' && (
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 border pl-11 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#004AC6] transition text-sm bg-white shadow-sm"
                            placeholder="Search by job title, company, skills..."
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 page-card rounded-3xl shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#004AC6] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400 font-semibold mt-3">Fetching postings...</p>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredJobs.map((job) => (
                                <div key={job._id} className="page-card rounded-3xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{job.jobTitle}</h3>
                                                <p className="text-sm font-semibold text-[#004AC6] mt-0.5">{job.company}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-1">
                                                <Clock size={10} /> Active
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{job.jobDescription}</p>

                                        {/* Requirements chips */}
                                        {job.requirements && (
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Requirements</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job.requirements.split(',').map((req, rIdx) => (
                                                        <span key={rIdx} className="text-[10px] bg-gray-50 border px-2.5 py-0.5 rounded-md font-medium text-gray-600">
                                                            {req.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 mt-6 border-t pt-4 text-[10px] text-gray-400 font-semibold">
                                        <div className="flex items-center gap-2">
                                            {job.postedBy?.profilePicture ? (
                                                <img src={job.postedBy.profilePicture} alt="User" className="w-5 h-5 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-[#004AC6] text-white flex items-center justify-center text-[8px] font-bold">
                                                    {job.postedBy?.firstName?.[0] || 'A'}
                                                </div>
                                            )}
                                            <span>Posted by {job.postedBy ? `${job.postedBy.firstName} ${job.postedBy.lastName || ''}` : 'Alumni'}</span>
                                        </div>

                                        <a
                                            href={job.applyLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-8 px-4 bg-[#004AC6] hover:bg-[#0038A8] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                                        >
                                            Apply <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 page-card rounded-3xl shadow-sm">
                            <Briefcase size={40} className="mx-auto text-gray-400 animate-pulse" />
                            <p className="text-sm font-semibold text-gray-600 mt-3">No jobs found matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'post' && isAlumni && (
                <div className="page-card rounded-3xl p-8 max-w-2xl mx-auto space-y-6">
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Plus size={20} className="text-[#004AC6]" /> Post a New Referral Job
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Fill out the job details to share with the students and alumni community.</p>
                    </div>

                    <form onSubmit={handleCreateJob} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Company Name *</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="e.g. Stripe"
                                    className="mt-1.5 w-full border rounded-xl h-11 px-4 text-xs outline-none focus:border-[#004AC6] focus:ring-1 focus:ring-[#004AC6]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Job Title *</label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Frontend Engineer Intern"
                                    className="mt-1.5 w-full border rounded-xl h-11 px-4 text-xs outline-none focus:border-[#004AC6] focus:ring-1 focus:ring-[#004AC6]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Job Description *</label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Describe the role, day-to-day work, and candidate expectations..."
                                className="mt-1.5 w-full border rounded-xl p-4 text-xs outline-none focus:border-[#004AC6] focus:ring-1 focus:ring-[#004AC6] h-32 resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Key Requirements *</label>
                            <input
                                type="text"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="e.g. React, Node.js, 1+ year experience (comma separated)"
                                className="mt-1.5 w-full border rounded-xl h-11 px-4 text-xs outline-none focus:border-[#004AC6] focus:ring-1 focus:ring-[#004AC6]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Application Link / URL *</label>
                                <input
                                    type="url"
                                    value={applyLink}
                                    onChange={(e) => setApplyLink(e.target.value)}
                                    placeholder="e.g. https://company.com/careers/job"
                                    className="mt-1.5 w-full border rounded-xl h-11 px-4 text-xs outline-none focus:border-[#004AC6] focus:ring-1 focus:ring-[#004AC6]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Validity (Days) *</label>
                                <input
                                    type="number"
                                    value={validityDays}
                                    onChange={(e) => setValidityDays(e.target.value)}
                                    placeholder="30"
                                    className="mt-1.5 w-full border rounded-xl h-11 px-4 text-xs outline-none focus:border-[#004AC6] focus:ring-1 focus:ring-[#004AC6]"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-75"
                        >
                            {isSubmitting ? 'Posting Referral...' : 'Post Job Referral'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'manage' && isAlumni && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 px-1">Manage Posted Referrals</h3>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 page-card rounded-3xl shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#004AC6] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400 font-semibold mt-3">Loading posted jobs...</p>
                        </div>
                    ) : myJobs.length > 0 ? (
                        <div className="divide-y page-card rounded-3xl overflow-hidden">
                            {myJobs.map((job) => (
                                <div key={job._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-gray-50/50 transition">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{job.jobTitle}</h4>
                                        <p className="text-xs font-semibold text-gray-500 mt-0.5">{job.company}</p>
                                        <span className="text-[10px] text-gray-400 block font-semibold mt-1">Expiry Date: {formatDate(job.expiresAt)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={job.applyLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-8 px-3 border rounded-lg hover:bg-gray-50 text-xs font-semibold flex items-center justify-center gap-1.5"
                                        >
                                            View Link <ExternalLink size={12} />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteJob(job._id)}
                                            className="h-8 px-3 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 page-card rounded-3xl">
                            <Briefcase size={36} className="mx-auto text-gray-300" />
                            <p className="text-xs text-gray-400 mt-2 font-semibold">You have not posted any job referrals yet.</p>
                            <button onClick={() => setActiveTab('post')} className="mt-3 text-xs bg-[#004AC6] text-white px-4 py-2 font-bold rounded-lg hover:bg-[#0038A8] transition shadow-sm">
                                Post a Job
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobBoard;
