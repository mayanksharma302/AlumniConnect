import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Search,
    MapPin,
    GraduationCap,
    Briefcase,
    SlidersHorizontal,
    User,
    MessageSquare,
    Eye,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

const AlumniDirectory = () => {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Search and filter inputs
    const [search, setSearch] = useState('');
    const [skills, setSkills] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [company, setCompany] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const token = sessionStorage.getItem('accessToken');

    const fetchDirectory = async (pageNum = 1) => {
        if (!token) return;
        setLoading(true);

        const params = {
            page: pageNum,
            limit: 8
        };

        if (search.trim()) params.search = search.trim();
        if (skills.trim()) params.skills = skills.trim();
        if (locationInput.trim()) params.location = locationInput.trim();
        if (graduationYear.trim()) params.graduationYear = graduationYear.trim();
        if (company.trim()) params.company = company.trim();

        try {
            const response = await axios.get('http://localhost:8000/api/profile/alumni-directory', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data?.success) {
                setProfiles(response.data.profiles || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalResults(response.data.total || 0);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('Error fetching directory', err);
            toast.error('Unable to fetch directory data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectory(1);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchDirectory(1);
    };

    const handleClearFilters = () => {
        setSearch('');
        setSkills('');
        setLocationInput('');
        setGraduationYear('');
        setCompany('');
        setTimeout(() => {
            fetchDirectory(1);
        }, 50);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Alumni & Student Directory</h1>
                <p className="text-sm text-gray-500 mt-1">Discover, filter, and connect with other members of the campus network.</p>
            </div>

            {/* Search and Filters Bar */}
            <div className="page-card rounded-3xl p-5 space-y-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-12 border pl-11 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#004AC6] transition text-sm"
                            placeholder="Search by name, headline..."
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-12 px-4 border rounded-xl font-semibold text-sm transition flex items-center gap-2 ${showFilters ? 'bg-blue-50 text-[#004AC6] border-blue-200' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-6 bg-[#004AC6] hover:bg-[#0038A8] text-white font-semibold rounded-xl text-sm transition shadow-sm"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {/* Extended Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Skills</label>
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full h-10 border px-3 rounded-lg outline-none text-xs focus:border-[#004AC6]"
                                placeholder="React, Node.js, Python..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                className="w-full h-10 border px-3 rounded-lg outline-none text-xs focus:border-[#004AC6]"
                                placeholder="City or State..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Company</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="w-full h-10 border px-3 rounded-lg outline-none text-xs focus:border-[#004AC6]"
                                placeholder="Google, Microsoft..."
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Graduation Year</label>
                            <input
                                type="number"
                                value={graduationYear}
                                onChange={(e) => setGraduationYear(e.target.value)}
                                className="w-full h-10 border px-3 rounded-lg outline-none text-xs focus:border-[#004AC6]"
                                placeholder="2025..."
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={() => fetchDirectory(1)}
                                className="px-4 py-2 bg-[#004AC6] hover:bg-[#0038A8] text-white text-xs font-semibold rounded-lg transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold px-2">
                <span>Showing {profiles.length} of {totalResults} connections</span>
            </div>

            {/* Profiles Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 page-card rounded-3xl shadow-sm">
                    <div className="w-10 h-10 border-4 border-[#004AC6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 font-semibold mt-3">Searching members...</p>
                </div>
            ) : profiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {profiles.map((profile) => {
                        const name = `${profile.firstName} ${profile.lastName}`;
                        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const isAlumni = profile.userId?.role === 'alumni';

                        return (
                            <div key={profile._id} className="page-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition duration-200">
                                <div className="flex gap-4">
                                    {/* Profile Pic / Initials */}
                                    {profile.profilePicture ? (
                                        <img
                                            src={profile.profilePicture}
                                            alt={name}
                                            className="w-14 h-14 rounded-full object-cover border shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-blue-50 text-[#004AC6] flex items-center justify-center font-bold text-lg shrink-0 border">
                                            {initials}
                                        </div>
                                    )}

                                    {/* Profile Details */}
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-base truncate">{name}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${isAlumni ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {profile.userId?.role || 'Member'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{profile.proffesionalHeadLine || 'No headline set'}</p>
                                        <div className="flex items-center gap-1 text-gray-400 text-[10px] font-semibold">
                                            <MapPin size={12} /> {profile.location?.city}, {profile.location?.state}
                                        </div>
                                    </div>
                                </div>

                                {/* Skills chips */}
                                {profile.skills && profile.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {profile.skills.slice(0, 3).map((skill, sIdx) => (
                                            <span key={sIdx} className="text-[10px] font-semibold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border">
                                                {skill}
                                            </span>
                                        ))}
                                        {profile.skills.length > 3 && (
                                            <span className="text-[9px] font-bold text-gray-400 px-2 py-1">
                                                +{profile.skills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-5 border-t pt-4">
                                    <Link
                                        to={`/profile/${profile.userId?._id || profile.userId}`}
                                        className="flex-1 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                    >
                                        <Eye size={14} /> View Profile
                                    </Link>
                                    <Link
                                        to={{
                                            pathname: '/messages',
                                            search: `?chat=${profile.userId?._id || profile.userId}`,
                                            state: {
                                                chatTarget: {
                                                    _id: profile.userId?._id || profile.userId,
                                                    firstName: profile.firstName,
                                                    lastName: profile.lastName,
                                                    profilePicture: profile.profilePicture
                                                }
                                            }
                                        }}
                                        className="h-9 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004AC6] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                    >
                                        <MessageSquare size={14} /> Message
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 page-card rounded-3xl">
                    <User size={40} className="mx-auto text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500 mt-3">No members found matching filters.</p>
                    <button onClick={handleClearFilters} className="mt-2 text-xs font-bold text-[#004AC6] hover:underline">
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-5 px-2">
                    <button
                        onClick={() => fetchDirectory(page - 1)}
                        disabled={page === 1}
                        className="h-10 px-4 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <span className="text-xs font-bold text-gray-500">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => fetchDirectory(page + 1)}
                        disabled={page === totalPages}
                        className="h-10 px-4 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
