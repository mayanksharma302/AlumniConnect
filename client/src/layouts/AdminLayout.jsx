import React from "react";
import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    BadgeCheck,
    BriefcaseBusiness,
    CalendarDays,
    Handshake,
    BarChart3,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";

import axios from "axios";


const AdminLayout = () => {

    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] =
        React.useState(false);


    // =====================================================
    // ADMIN NAVIGATION
    // =====================================================

    const navigation = [

        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },

        {
            name: "Users",
            path: "/admin/users",
            icon: Users,
        },

        {
            name: "Alumni Verification",
            path: "/admin/alumni-verification",
            icon: BadgeCheck,
        },

        {
            name: "Jobs",
            path: "/admin/jobs",
            icon: BriefcaseBusiness,
        },

        {
            name: "Events",
            path: "/admin/events",
            icon: CalendarDays,
        },

        {
            name: "Mentorship",
            path: "/admin/mentorship",
            icon: Handshake,
        },

        {
            name: "Reports",
            path: "/admin/reports",
            icon: BarChart3,
        },

    ];


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {

        try {

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:8000";


            await axios.get(
                `${API_URL}/api/auth/logout`,
                {
                    withCredentials: true,
                }
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            sessionStorage.removeItem(
                "accessToken"
            );

            sessionStorage.removeItem(
                "user"
            );

            navigate(
                "/signin",
                {
                    replace: true,
                }
            );
        }
    };


    // =====================================================
    // CLOSE MOBILE SIDEBAR
    // =====================================================

    const closeSidebar = () => {
        setSidebarOpen(false);
    };


    return (
        <div className="min-h-screen bg-[#F7F9FC]">

            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`
                    fixed
                    inset-y-0
                    left-0
                    z-50
                    flex
                    w-[270px]
                    flex-col
                    border-r
                    border-gray-200
                    bg-white
                    transition-transform
                    duration-300
                    lg:translate-x-0

                    ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-6">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004AC6] text-white shadow-sm">

                            <ShieldCheck
                                size={22}
                                strokeWidth={2.2}
                            />

                        </div>

                        <div className="text-left">

                            <h1 className="text-[17px] font-bold tracking-tight text-gray-900">
                                AlumniConnect
                            </h1>

                            <p className="text-[11px] font-medium text-gray-400">
                                ADMIN PANEL
                            </p>

                        </div>

                    </button>


                    {/* Mobile close */}

                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <div className="flex-1 overflow-y-auto px-4 py-6">

                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Administration
                    </p>


                    <nav className="space-y-1">

                        {navigation.map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                return (
                                    <NavLink
                                        key={
                                            item.path
                                        }
                                        to={
                                            item.path
                                        }
                                        onClick={
                                            closeSidebar
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            `
                                            group
                                            flex
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-sm
                                            font-medium
                                            transition-all

                                            ${isActive
                                                ? "bg-[#004AC6] text-white shadow-sm"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-[#004AC6]"
                                            }
                                            `
                                        }
                                    >

                                        {({
                                            isActive,
                                        }) => (
                                            <>
                                                <Icon
                                                    size={
                                                        19
                                                    }
                                                    strokeWidth={
                                                        2
                                                    }
                                                />

                                                <span className="flex-1">
                                                    {
                                                        item.name
                                                    }
                                                </span>


                                                {isActive && (
                                                    <ChevronRight
                                                        size={
                                                            16
                                                        }
                                                        className="opacity-80"
                                                    />
                                                )}

                                            </>
                                        )}

                                    </NavLink>
                                );

                            }
                        )}

                    </nav>

                </div>


                {/* =================================================
                    ADMIN USER / LOGOUT
                ================================================= */}

                <div className="border-t border-gray-100 p-4">

                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004AC6] text-sm font-bold text-white">
                            A
                        </div>


                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-gray-800">
                                Administrator
                            </p>

                            <p className="truncate text-xs text-gray-400">
                                System Admin
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                    >

                        <LogOut
                            size={19}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="min-h-screen lg:ml-[270px]">


                {/* =================================================
                    TOP BAR
                ================================================= */}

                <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">

                        {/* Mobile menu */}

                        <button
                            type="button"
                            onClick={() =>
                                setSidebarOpen(
                                    true
                                )
                            }
                            className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                        >

                            <Menu
                                size={22}
                            />

                        </button>


                        <div>

                            <p className="text-xs font-medium text-gray-400">
                                AlumniConnect
                            </p>

                            <h2 className="text-lg font-bold text-gray-900">
                                Admin Panel
                            </h2>

                        </div>

                    </div>


                    {/* Right side */}

                    <div className="flex items-center gap-3">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-semibold text-gray-800">
                                Administrator
                            </p>

                            <p className="text-xs text-gray-400">
                                Admin Account
                            </p>

                        </div>


                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004AC6] text-sm font-bold text-white">
                            A
                        </div>

                    </div>

                </header>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">

                    <Outlet />

                </main>

            </div>

        </div>
    );
};


export default AdminLayout;