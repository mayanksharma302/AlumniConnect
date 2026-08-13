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

// IMPORTANT:
// This is the Alumni's own profile page.
// Renamed to avoid conflict with student's AlumniProfile.
import AlumniPanelProfile from "../pages/alumni/AlumniPanelProfile";


const AppRoutes = () => {

    return (

        <Routes>


            {/* =====================================================
                PUBLIC ROUTES
            ===================================================== */}

            <Route
                path="/"
                element={
                    <LandingPage />
                }
            />

            <Route
                path="/signin"
                element={
                    <SignInPage />
                }
            />

            <Route
                path="/signup"
                element={
                    <SignUpPage />
                }
            />

            <Route
                path="/verify-email"
                element={
                    <VerifyEmail />
                }
            />

            <Route
                path="/upload-profile-image"
                element={
                    <UploadProfileOnboard />
                }
            />

            <Route
                path="/complete-profile"
                element={
                    <CompleteProfileOnboard />
                }
            />


            {/* =====================================================
                STUDENT PORTAL
            ===================================================== */}

            <Route
                path="/student"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "student"
                        ]}
                    >
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


                {/* /student/dashboard */}

                <Route
                    path="dashboard"
                    element={
                        <StudentDashboard />
                    }
                />


                {/* /student/directory */}

                <Route
                    path="directory"
                    element={
                        <AlumniDirectory />
                    }
                />


                {/* /student/directory/:userId */}

                <Route
                    path="directory/:userId"
                    element={
                        <AlumniProfile />
                    }
                />


                {/* /student/jobs */}

                <Route
                    path="jobs"
                    element={
                        <JobBoard />
                    }
                />


                {/* /student/jobs/:jobId */}

                <Route
                    path="jobs/:jobId"
                    element={
                        <JobDetails />
                    }
                />


                {/* /student/events */}

                <Route
                    path="events"
                    element={
                        <EventsPage />
                    }
                />


                {/* /student/events/:eventId */}

                <Route
                    path="events/:eventId"
                    element={
                        <EventDetailsPage />
                    }
                />


                {/* /student/mentorship */}

                <Route
                    path="mentorship"
                    element={
                        <MentorshipPage />
                    }
                />


                {/* /student/messages */}

                <Route
                    path="messages"
                    element={
                        <MessagesPage />
                    }
                />


                {/* /student/profile */}

                <Route
                    path="profile"
                    element={
                        <UserProfile />
                    }
                />

            </Route>


            {/* =====================================================
                ALUMNI PORTAL
            ===================================================== */}

            <Route
                path="/alumni"
                element={
                    <ProtectedRoute
                        allowedRoles={[
                            "alumni"
                        ]}
                    >
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


                {/* /alumni/dashboard */}

                <Route
                    path="dashboard"
                    element={
                        <AlumniDashboard />
                    }
                />


                {/* /alumni/jobs */}

                <Route
                    path="jobs"
                    element={
                        <AlumniJobs />
                    }
                />


                {/* /alumni/events */}

                <Route
                    path="events"
                    element={
                        <AlumniEvents />
                    }
                />


                {/* /alumni/mentorship */}

                <Route
                    path="mentorship"
                    element={
                        <AlumniMentorship />
                    }
                />


                {/* /alumni/messages */}

                <Route
                    path="messages"
                    element={
                        <AlumniMessages />
                    }
                />


                {/* /alumni/profile */}

                <Route
                    path="profile"
                    element={
                        <AlumniPanelProfile />
                    }
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