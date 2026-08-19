import React from "react";
import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    CalendarDays,
    Handshake,
    MessageSquare,
    UserCircle,
    LogOut,
    GraduationCap,
    Menu,
    X,
} from "lucide-react";


const AlumniLayout = () => {

    const navigate =
        useNavigate();

    const [sidebarOpen, setSidebarOpen] =
        React.useState(false);


    const menuItems = [
        {
            label: "Dashboard",
            path: "/alumni/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Jobs",
            path: "/alumni/jobs",
            icon: BriefcaseBusiness,
        },
        {
            label: "Events",
            path: "/alumni/events",
            icon: CalendarDays,
        },
        {
            label: "Mentorship",
            path: "/alumni/mentorship",
            icon: Handshake,
        },
        {
            label: "Messages",
            path: "/alumni/messages",
            icon: MessageSquare,
        },
        {
            label: "Profile",
            path: "/alumni/profile",
            icon: UserCircle,
        },
    ];


    const handleLogout = () => {

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

    };


    const navLinkClass = ({
        isActive,
    }) => {

        return `
            group flex items-center gap-3 rounded-xl px-3.5 py-3
            text-xs font-semibold transition-all duration-200
            ${isActive
                ? "bg-[#004AC6] text-white shadow-md shadow-blue-100"
                : "text-gray-500 hover:bg-blue-50 hover:text-[#004AC6]"
            }
        `;

    };


    return (

        <div className="min-h-screen bg-[#F7F9FC]">


            {/* =================================================
               MOBILE HEADER
            ================================================= */}

            <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">

                <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004AC6] text-white">

                        <GraduationCap
                            size={19}
                        />

                    </div>

                    <div>

                        <h1 className="text-sm font-extrabold tracking-tight text-gray-900">
                            AlumniConnect
                        </h1>

                        <p className="text-[8px] font-bold uppercase tracking-wider text-[#004AC6]">
                            Alumni Panel
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={() =>
                        setSidebarOpen(
                            !sidebarOpen
                        )
                    }
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >

                    {sidebarOpen ? (
                        <X size={20} />
                    ) : (
                        <Menu size={20} />
                    )}

                </button>

            </header>


            {/* =================================================
               MOBILE OVERLAY
            ================================================= */}

            {sidebarOpen && (

                <div
                    onClick={() =>
                        setSidebarOpen(
                            false
                        )
                    }
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                />

            )}


            {/* =================================================
               SIDEBAR
            ================================================= */}

            <aside
                className={`
                    fixed bottom-0 left-0 top-0 z-50
                    flex w-[250px] flex-col
                    border-r border-gray-200 bg-white
                    transition-transform duration-300
                    ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                    lg:translate-x-0
                `}
            >

                {/* BRAND */}

                <div className="flex h-20 items-center border-b border-gray-100 px-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004AC6] text-white shadow-sm">

                            <GraduationCap
                                size={21}
                            />

                        </div>


                        <div>

                            <h1 className="text-sm font-extrabold tracking-tight text-gray-900">
                                AlumniConnect
                            </h1>

                            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[1.5px] text-[#004AC6]">
                                Alumni Panel
                            </p>

                        </div>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="flex-1 overflow-y-auto px-3 py-5">

                    <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[1.5px] text-gray-300">
                        Workspace
                    </p>


                    <div className="space-y-1">

                        {menuItems.map(
                            ({
                                label,
                                path,
                                icon: Icon,
                            }) => (

                                <NavLink
                                    key={path}
                                    to={path}
                                    onClick={() =>
                                        setSidebarOpen(
                                            false
                                        )
                                    }
                                    className={
                                        navLinkClass
                                    }
                                >

                                    <Icon
                                        size={17}
                                        strokeWidth={
                                            2
                                        }
                                        className="shrink-0"
                                    />

                                    <span>
                                        {label}
                                    </span>

                                </NavLink>

                            )
                        )}

                    </div>

                </nav>


                {/* BOTTOM */}

                <div className="border-t border-gray-100 p-3">

                    <div className="mb-2 rounded-xl bg-blue-50 p-3">

                        <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#004AC6]">

                                <GraduationCap
                                    size={15}
                                />

                            </div>

                            <div className="min-w-0">

                                <p className="truncate text-[10px] font-bold text-gray-700">
                                    Alumni Community
                                </p>

                                <p className="text-[8px] text-gray-400">
                                    Connect & contribute
                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-500"
                    >

                        <LogOut
                            size={17}
                        />

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================================
               MAIN
            ================================================= */}

            <main className="min-h-screen lg:ml-[250px]">

                <div className="px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-8">

                    {/* PAGE HEADER */}

                    <div className="mb-6 hidden lg:flex items-center justify-between">

                        <div>

                            <p className="text-[9px] font-black uppercase tracking-[2px] text-[#004AC6]">
                                Alumni Workspace
                            </p>

                            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">
                                Stay connected. Give back.
                            </h2>

                        </div>


                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">

                            <div className="h-2 w-2 rounded-full bg-emerald-500" />

                            <span className="text-[10px] font-semibold text-gray-500">
                                Alumni Account
                            </span>

                        </div>

                    </div>


                    {/* PAGE CONTENT */}

                    <Outlet />

                </div>

            </main>

        </div>

    );

};


export default AlumniLayout;