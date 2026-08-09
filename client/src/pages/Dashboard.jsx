import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Users,
    Briefcase,
    Calendar,
    MessageSquare,
    Handshake,
    ArrowRight,
    TrendingUp,
    BookmarkCheck,
    BellRing,
    ChevronRight,
    Search,
    Sparkles
} from 'lucide-react';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        connections: 0,
        jobs: 0,
        events: 0,
        messages: 0
    });

    const [recentJobs, setRecentJobs] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [spotlightAlumni, setSpotlightAlumni] = useState([]);

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('accessToken');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            setLoading(true);

            // Set up axios headers config
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            try {
                // 1. Fetch own profile
                const profileRes = await axios.get('http://localhost:8000/api/profile/get-profile', config);
                setProfile(profileRes.data.profile);
            } catch (err) {
                console.error('Error fetching dashboard profile info', err);
            }

            try {
                // 2. Fetch alumni directory (stats and spotlight)
                const directoryRes = await axios.get('http://localhost:8000/api/profile/alumni-directory', config);
                if (directoryRes.data?.success) {
                    const totalProfiles = directoryRes.data.total || 0;
                    setStats(prev => ({ ...prev, connections: totalProfiles }));

                    // Filter or slice for spotlight (e.g. choose profiles other than current user who have a professional headline)
                    const profiles = directoryRes.data.profiles || [];
                    const spotlight = profiles
                        .filter(p => p.userId?._id !== user._id)
                        .slice(0, 3);
                    setSpotlightAlumni(spotlight);
                }
            } catch (err) {
                console.error('Error fetching alumni directory for stats', err);
            }

            try {
                // 3. Fetch jobs
                const jobsRes = await axios.get('http://localhost:8000/api/jobs/', config);
                if (jobsRes.data?.success) {
                    const jobsCount = jobsRes.data.count || 0;
                    setStats(prev => ({ ...prev, jobs: jobsCount }));
                    setRecentJobs((jobsRes.data.data || []).slice(0, 3));
                }
            } catch (err) {
                console.error('Error fetching jobs for stats', err);
            }

            try {
                // 4. Fetch upcoming events
                const eventsRes = await axios.get('http://localhost:8000/api/events/upcoming', config);
                if (eventsRes.data?.success) {
                    const eventsCount = eventsRes.data.count || 0;
                    setStats(prev => ({ ...prev, events: eventsCount }));
                    setRecentEvents((eventsRes.data.events || []).slice(0, 3));
                }
            } catch (err) {
                console.error('Error fetching events for stats', err);
            }

            try {
                // 5. Fetch conversations/messages count
                const msgRes = await axios.get('http://localhost:8000/api/messages/conversations', config);
                if (msgRes.data?.success) {
                    const msgCount = msgRes.data.count || 0;
                    setStats(prev => ({ ...prev, messages: msgCount }));
                }
            } catch (err) {
                console.error('Error fetching messages count', err);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, [token, user._id]);

    const username = profile ? `${profile.firstName} ${profile.lastName}` : user.username || 'User';
    const normalizedRole = (user.role || 'member').toLowerCase();
    const isAdmin = normalizedRole === 'admin';
    const isAlumni = normalizedRole === 'alumni';
    const isStudent = normalizedRole === 'student';

    const roleBadgeText = isAdmin ? 'Admin' : isAlumni ? 'Alumni' : isStudent ? 'Student' : 'Member';
    const bannerSubtitle = isAdmin
        ? 'Manage community activity, oversee opportunities, and keep the network healthy.'
        : isAlumni
            ? 'Reconnect with your community, share opportunities, and mentor the next generation.'
            : 'Discover mentors, jobs, events, and stay connected with your alumni network.';

    const quickActions = isAdmin
        ? [
            { label: 'View Directory', path: '/directory', icon: <Search size={18} />, bg: 'hover:bg-blue-50/50 hover:border-blue-200' },
            { label: 'Review Jobs', path: '/jobs', icon: <Briefcase size={18} />, bg: 'hover:bg-emerald-50/50 hover:border-emerald-200' },
            { label: 'Manage Events', path: '/events', icon: <Calendar size={18} />, bg: 'hover:bg-amber-50/50 hover:border-amber-200' },
            { label: 'Check Messages', path: '/messages', icon: <MessageSquare size={18} />, bg: 'hover:bg-indigo-50/50 hover:border-indigo-200' }
        ]
        : isAlumni
            ? [
                { label: 'Search Directory', path: '/directory', icon: <Search size={18} />, bg: 'hover:bg-blue-50/50 hover:border-blue-200' },
                { label: 'Browse Jobs Board', path: '/jobs', icon: <Briefcase size={18} />, bg: 'hover:bg-emerald-50/50 hover:border-emerald-200' },
                { label: 'Create Event', path: '/events', icon: <Calendar size={18} />, bg: 'hover:bg-amber-50/50 hover:border-amber-200' },
                { label: 'Mentorship Requests', path: '/mentorship', icon: <Handshake size={18} />, bg: 'hover:bg-indigo-50/50 hover:border-indigo-200' }
            ]
            : [
                { label: 'Search Directory', path: '/directory', icon: <Search size={18} />, bg: 'hover:bg-blue-50/50 hover:border-blue-200' },
                { label: 'Browse Jobs', path: '/jobs', icon: <Briefcase size={18} />, bg: 'hover:bg-emerald-50/50 hover:border-emerald-200' },
                { label: 'Explore Events', path: '/events', icon: <Calendar size={18} />, bg: 'hover:bg-amber-50/50 hover:border-amber-200' },
                { label: 'Find Mentors', path: '/mentorship', icon: <Handshake size={18} />, bg: 'hover:bg-indigo-50/50 hover:border-indigo-200' }
            ];

    const statCards = isAdmin
        ? [
            { label: 'Community Members', value: stats.connections, icon: <Users size={22} />, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Open Referrals', value: stats.jobs, icon: <Briefcase size={22} />, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Active Events', value: stats.events, icon: <Calendar size={22} />, color: 'bg-amber-50 text-amber-600' },
            { label: 'Unread Messages', value: stats.messages, icon: <MessageSquare size={22} />, color: 'bg-rose-50 text-rose-600' }
        ]
        : isAlumni
            ? [
                { label: 'Alumni Network', value: stats.connections, icon: <Users size={22} />, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Open Referrals', value: stats.jobs, icon: <Briefcase size={22} />, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Upcoming Webinars', value: stats.events, icon: <Calendar size={22} />, color: 'bg-amber-50 text-amber-600' },
                { label: 'Active Conversations', value: stats.messages, icon: <MessageSquare size={22} />, color: 'bg-rose-50 text-rose-600' }
            ]
            : [
                { label: 'Mentor Network', value: stats.connections, icon: <Users size={22} />, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Opportunities', value: stats.jobs, icon: <Briefcase size={22} />, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Upcoming Events', value: stats.events, icon: <Calendar size={22} />, color: 'bg-amber-50 text-amber-600' },
                { label: 'Messages', value: stats.messages, icon: <MessageSquare size={22} />, color: 'bg-rose-50 text-rose-600' }
            ];

    const spotlightHeading = isAdmin ? 'Community Highlights' : isAlumni ? 'Mentorship Spotlight' : 'Recommended Mentors';
    const spotlightDescription = isAdmin
        ? 'A quick view of active members shaping the community.'
        : isAlumni
            ? 'Need career guidance? Request a quick intro call with these alumni.'
            : 'Meet alumni who can help you with guidance and introductions.';

    const actionPrimaryLink = isAdmin ? '/directory' : isAlumni ? '/directory' : '/mentorship';
    const actionPrimaryLabel = isAdmin ? 'Review Community' : isAlumni ? 'Find Connections' : 'Find Mentors';

    // Helper for formatting date strings
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#004AC6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Welcome Banner */}
            <div className="page-card relative bg-linear-to-r from-[#004AC6] to-[#0038A8] rounded-[28px] p-8 shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="bg-white/15 text-[#0f172a] border border-white/20 text-xs font-bold px-3 py-1.5 rounded-full capitalize">
                            {roleBadgeText} Portal
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold mt-3 text-[#0f172a] tracking-tight">
                            Welcome back, {username}!
                        </h1>
                        <p className="text-[#0f172a] text-sm mt-2 max-w-lg font-medium leading-6">
                            {profile?.proffesionalHeadLine || bannerSubtitle}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to={actionPrimaryLink}
                            className="bg-white text-[#004AC6] hover:bg-blue-50 font-bold px-5 py-3 rounded-xl transition text-sm flex items-center gap-2 shadow-sm"
                        >
                            {actionPrimaryLabel} <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="page-card p-5 rounded-3xl flex items-center justify-between hover:scale-[1.02] transition duration-200">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 font-semibold">{stat.label}</span>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="page-card rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#004AC6]" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((act, idx) => (
                        <Link
                            key={idx}
                            to={act.path}
                            className={`flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-100 transition text-center text-sm font-semibold text-gray-700 ${act.bg}`}
                        >
                            <div className="p-3 rounded-xl bg-gray-50 text-gray-600">
                                {act.icon}
                            </div>
                            {act.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left/Middle Content: Activity Feed */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="page-card rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BellRing size={18} className="text-[#004AC6]" /> Community Updates
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">Recent Activity</span>
                        </div>

                        <div className="space-y-5">
                            {/* Real Jobs Feed list */}
                            {recentJobs.map((job) => (
                                <Link to="/jobs" key={job._id} className="flex gap-4 items-start hover:bg-gray-50/50 p-2.5 rounded-xl transition border border-transparent hover:border-gray-100">
                                    <div className="p-2.5 rounded-xl mt-0.5 bg-emerald-50 text-emerald-600">
                                        <Briefcase size={16} />
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-800 truncate">{job.jobTitle}</h4>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {job.company} &bull; Referrals open by {job.postedBy?.firstName || 'Alumni'}
                                        </p>
                                        <span className="text-[10px] text-gray-400 block font-medium">Posted {formatDate(job.createdAt)}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 mt-2 shrink-0" />
                                </Link>
                            ))}

                            {/* Real Events Feed list */}
                            {recentEvents.map((evt) => (
                                <Link to="/events" key={evt._id} className="flex gap-4 items-start hover:bg-gray-50/50 p-2.5 rounded-xl transition border border-transparent hover:border-gray-100">
                                    <div className="p-2.5 rounded-xl mt-0.5 bg-amber-50 text-amber-600">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-800 truncate">{evt.title}</h4>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            Hosted by {evt.organizer?.firstName || 'Alumni'} &bull; {evt.location} {evt.isVirtual && '(Virtual)'}
                                        </p>
                                        <span className="text-[10px] text-gray-400 block font-medium">Date: {formatDate(evt.eventDate)}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 mt-2 shrink-0" />
                                </Link>
                            ))}

                            {recentJobs.length === 0 && recentEvents.length === 0 && (
                                <div className="text-center py-10 border border-dashed rounded-2xl bg-slate-100/70">
                                    <BellRing size={28} className="mx-auto text-gray-400 animate-pulse" />
                                    <p className="text-xs text-gray-600 mt-2 font-medium">No recent updates or active listings at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Recommendations */}
                <div className="space-y-6">
                    <div className="page-card rounded-3xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Handshake size={18} className="text-[#004AC6]" /> {spotlightHeading}
                        </h3>
                        <p className="text-xs text-gray-500">{spotlightDescription}</p>

                        <div className="space-y-4 pt-2">
                            {spotlightAlumni.map((reco) => {
                                const recoName = `${reco.firstName} ${reco.lastName}`;
                                const recoInitials = recoName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                                return (
                                    <div key={reco._id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 transition">
                                        {reco.profilePicture ? (
                                            <img
                                                src={reco.profilePicture}
                                                alt={recoName}
                                                className="w-9 h-9 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#004AC6] flex items-center justify-center font-bold text-xs shrink-0">
                                                {recoInitials}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-900 truncate">{recoName}</h4>
                                            <p className="text-[10px] text-gray-500 truncate">{reco.proffesionalHeadLine || 'Alumni Member'}</p>
                                            <p className="text-[9px] text-[#004AC6] font-medium truncate mt-0.5">{reco.location?.city}, {reco.location?.state}</p>
                                        </div>
                                        <Link
                                            to={`/directory`}
                                            className="p-1.5 hover:bg-blue-50 rounded-lg text-[#004AC6] transition shrink-0"
                                        >
                                            <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                );
                            })}

                            {spotlightAlumni.length === 0 && (
                                <div className="text-center py-6 bg-slate-100/70 rounded-xl">
                                    <Users size={20} className="mx-auto text-gray-400" />
                                    <p className="text-[10px] text-gray-600 mt-1">No alumni found to spotlight.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
