import { Navigate, Route, Routes } from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import SignInPage from "../pages/public/SignInPage";
import SignUpPage from "../pages/public/SignUpPage";
import LandingPage from "../pages/public/LandingPage";
import VerifyEmail from "../pages/public/VerifyEmail";
import CompleteProfileOnboard from "../pages/public/CompleteProfileOnboard";
import UploadProfileOnboard from "../pages/public/UploadProfileOnboard";

// =====================================================
// PROTECTED ROUTE
// =====================================================

import ProtectedRoute from "./ProtectedRoute";

// =====================================================
// STUDENT LAYOUT
// =====================================================

import StudentLayout from "../layouts/StudentLayout";

// =====================================================
// STUDENT PAGES
// =====================================================

import StudentDashboard from "../pages/student/StudentDashboard";
import AlumniDirectory from "../pages/student/AlumniDirectory";
import AlumniProfile from "../pages/student/AlumniProfile";
import JobBoard from "../pages/student/JobBoard";
import JobDetails from "../pages/student/JobDetails";
import EventsPage from "../pages/student/EventsPage";
import EventDetailsPage from "../pages/student/EventDetailsPage";
import MentorshipPage from "../pages/student/MentorshipPage";
import MessagesPage from "../pages/student/MessagesPage";
import UserProfile from "../pages/student/UserProfile";

// =====================================================
// ALUMNI LAYOUT
// =====================================================

import AlumniLayout from "../layouts/AlumniLayout";

// =====================================================
// ALUMNI PAGES
// =====================================================

import AlumniDashboard from "../pages/alumni/AlumniDashboard";
import AlumniJobs from "../pages/alumni/Jobs";
import AlumniEvents from "../pages/alumni/Events";
import AlumniMentorship from "../pages/alumni/Mentorship";
import AlumniMessages from "../pages/alumni/Messages";
import AlumniPanelProfile from "../pages/alumni/AlumniPanelProfile";

// =====================================================
// ADMIN LAYOUT
// =====================================================

import AdminLayout from "../layouts/AdminLayout";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import AlumniVerification from "../pages/admin/AlumniVerification";
import AdminJobs from "../pages/admin/Jobs";
import AdminEvents from "../pages/admin/Events";
import AdminMentorship from "../pages/admin/Mentorship";
import Reports from "../pages/admin/Reports";


// =====================================================
// APP ROUTES
// =====================================================

const AppRoutes = () => {
    return (
        <Routes>

            {/* =====================================================
                PUBLIC ROUTES
            ===================================================== */}

            <Route
                path="/"
                element={<LandingPage />}
            />

            <Route
                path="/signin"
                element={<SignInPage />}
            />

            <Route
                path="/signup"
                element={<SignUpPage />}
            />

            <Route
                path="/verify-email"
                element={<VerifyEmail />}
            />

            <Route
                path="/upload-profile-image"
                element={<UploadProfileOnboard />}
            />

            <Route
                path="/complete-profile"
                element={<CompleteProfileOnboard />}
            />


            {/* =====================================================
                STUDENT PORTAL
            ===================================================== */}

            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >

                {/* /student */}
                <Route
                    index
                    element={
                        <Navigate
                            to="/student/dashboard"
                            replace
                        />
                    }
                />

                {/* Dashboard */}
                <Route
                    path="dashboard"
                    element={<StudentDashboard />}
                />

                {/* Alumni Directory */}
                <Route
                    path="directory"
                    element={<AlumniDirectory />}
                />

                {/* Alumni Profile */}
                <Route
                    path="directory/:userId"
                    element={<AlumniProfile />}
                />

                {/* Jobs */}
                <Route
                    path="jobs"
                    element={<JobBoard />}
                />

                <Route
                    path="jobs/:jobId"
                    element={<JobDetails />}
                />

                {/* Events */}
                <Route
                    path="events"
                    element={<EventsPage />}
                />

                <Route
                    path="events/:eventId"
                    element={<EventDetailsPage />}
                />

                {/* Mentorship */}
                <Route
                    path="mentorship"
                    element={<MentorshipPage />}
                />

                {/* Messages */}
                <Route
                    path="messages"
                    element={<MessagesPage />}
                />

                {/* Profile */}
                <Route
                    path="profile"
                    element={<UserProfile />}
                />

            </Route>


            {/* =====================================================
                ALUMNI PORTAL
            ===================================================== */}

            <Route
                path="/alumni"
                element={
                    <ProtectedRoute allowedRoles={["alumni"]}>
                        <AlumniLayout />
                    </ProtectedRoute>
                }
            >

                {/* /alumni */}
                <Route
                    index
                    element={
                        <Navigate
                            to="/alumni/dashboard"
                            replace
                        />
                    }
                />

                {/* Dashboard */}
                <Route
                    path="dashboard"
                    element={<AlumniDashboard />}
                />

                {/* Jobs */}
                <Route
                    path="jobs"
                    element={<AlumniJobs />}
                />

                {/* Events */}
                <Route
                    path="events"
                    element={<AlumniEvents />}
                />

                {/* Mentorship */}
                <Route
                    path="mentorship"
                    element={<AlumniMentorship />}
                />

                {/* Messages */}
                <Route
                    path="messages"
                    element={<AlumniMessages />}
                />

                {/* Profile */}
                <Route
                    path="profile"
                    element={<AlumniPanelProfile />}
                />

            </Route>


            {/* =====================================================
                ADMIN PORTAL
            ===================================================== */}

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >

                {/* /admin */}
                <Route
                    index
                    element={
                        <Navigate
                            to="/admin/dashboard"
                            replace
                        />
                    }
                />

                {/* Dashboard */}
                <Route
                    path="dashboard"
                    element={<AdminDashboard />}
                />

                {/* All Users */}
                <Route
                    path="users"
                    element={<Users />}
                />

                {/* Alumni Verification */}
                <Route
                    path="alumni-verification"
                    element={<AlumniVerification />}
                />

                {/* Jobs */}
                <Route
                    path="jobs"
                    element={<AdminJobs />}
                />

                {/* Events */}
                <Route
                    path="events"
                    element={<AdminEvents />}
                />

                {/* Mentorship */}
                <Route
                    path="mentorship"
                    element={<AdminMentorship />}
                />

                {/* Reports */}
                <Route
                    path="reports"
                    element={<Reports />}
                />

            </Route>


            {/* =====================================================
                FALLBACK
            ===================================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
};


export default AppRoutes;