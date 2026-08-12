import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    Handshake,
    MessageSquare,
    User,
    LogOut,
    Menu,
    X,
    GraduationCap,
    ChevronDown,
    Bell
} from 'lucide-react';

const StudentLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('accessToken');

    useEffect(() => {
        if (!token) {
            toast.error('Session expired. Please sign in again.');
            navigate('/signin');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/profile/get-profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfile(response.data.profile);
            } catch (err) {
                if (err.response?.status === 404) {
                    setProfile(null);
                    if (location.pathname !== '/complete-profile') {
                        toast.warning('Please complete your profile details first!');
                        navigate('/complete-profile');
                    }
                } else {
                    console.error('Error fetching profile', err);
                }
            }
        };

        fetchProfile();
    }, [token, navigate, location.pathname]);

    const handleLogout = async (logoutAll = false) => {
        try {
            const endpoint = logoutAll ? 'http://localhost:8000/api/auth/logout-all' : 'http://localhost:8000/api/auth/logout';
            await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (err) {
            console.error('Logout error on backend:', err);
        } finally {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('accessToken');
            toast.success(logoutAll ? 'Logged out from all devices.' : 'Logged out successfully.');
            navigate('/signin');
        }
    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/student/dashboard",
            icon: <LayoutDashboard size={20} />,
        },
        {
            name: "Alumni Directory",
            path: "/student/directory",
            icon: <Users size={20} />,
        },
        {
            name: "Job Board",
            path: "/student/jobs",
            icon: <Briefcase size={20} />,
        },
        {
            name: "Events",
            path: "/student/events",
            icon: <Calendar size={20} />,
        },
        {
            name: "Mentorship",
            path: "/student/mentorship",
            icon: <Handshake size={20} />,
        },
        {
            name: "Messages",
            path: "/student/messages",
            icon: <MessageSquare size={20} />,
        },
        {
            name: "My Profile",
            path: "/student/profile",
            icon: <User size={20} />,
        },
    ];

    const currentTitle = menuItems.find(item => location.pathname === item.path)?.name || 'AlumniConnect';

    // Get fallback user image/initials
    const displayName = profile ? `${profile.firstName} ${profile.lastName}` : user.username || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen">
                {/* Logo Section */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-[#004AC6] flex items-center justify-center text-white">
                        <GraduationCap size={20} />
                    </div>
                    <span className="text-xl font-bold text-[#004AC6]">AlumniConnect</span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive
                                    ? 'bg-blue-50 text-[#004AC6]'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom User Area */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                        {profile?.profilePicture ? (
                            <img
                                src={profile.profilePicture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#004AC6] text-white flex items-center justify-center font-bold text-sm">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{displayName}</h4>
                            <p className="text-[10px] text-gray-500 capitalize truncate">{profile?.proffesionalHeadLine || user.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Slideover */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden bg-gray-900/50 backdrop-blur-sm">
                    <div className="w-64 bg-white flex flex-col h-full border-r animate-slide-in">
                        <div className="h-16 flex items-center justify-between px-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#004AC6] flex items-center justify-center text-white">
                                    <GraduationCap size={20} />
                                </div>
                                <span className="text-xl font-bold text-[#004AC6]">AlumniConnect</span>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive
                                            ? 'bg-blue-50 text-[#004AC6]'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                                <LogOut size={18} />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 max-h-screen">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900">{currentTitle}</h2>
                    </div>

                    {/* Right User Bar */}
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition"
                            title="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition focus:outline-none"
                            >
                                {profile?.profilePicture ? (
                                    <img
                                        src={profile.profilePicture}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#004AC6] text-white flex items-center justify-center font-bold text-xs">
                                        {initials}
                                    </div>
                                )}
                                <span className="hidden md:inline text-sm font-semibold text-gray-700">{displayName}</span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-30 py-1.5">
                                        <Link
                                            to="/student/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                        >
                                            My Profile
                                        </Link>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                                        >
                                            <LogOut size={16} /> Log Out
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout(true);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                                        >
                                            <LogOut size={16} /> Log Out All Devices
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Sub Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
