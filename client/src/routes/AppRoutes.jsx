import { Navigate, Route, Routes } from "react-router-dom";

// Public Pages
import SignInPage from "../pages/public/SignInPage";
import SignUpPage from "../pages/public/SignUpPage";
import LandingPage from "../pages/public/LandingPage";
import VerifyEmail from "../pages/public/VerifyEmail";
import CompleteProfileOnboard from "../pages/public/CompleteProfileOnboard";
import UploadProfileOnboard from "../pages/public/UploadProfileOnboard";

// Routes
import ProtectedRoute from "./ProtectedRoute";

// Student Layout
import StudentLayout from "../layouts/StudentLayout";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import AlumniDirectory from "../pages/student/AlumniDirectory";
import JobBoard from "../pages/student/JobBoard";
import JobDetails from "../pages/student/JobDetails";
import EventsPage from "../pages/student/EventsPage";
import MentorshipPage from "../pages/student/MentorshipPage";
import MessagesPage from "../pages/student/MessagesPage";
import UserProfile from "../pages/student/UserProfile";
import AlumniProfile from "../pages/student/AlumniProfile";


const AppRoutes = () => {

    return (
        <Routes>

            {/* ========================================= */}
            {/* PUBLIC ROUTES */}
            {/* ========================================= */}

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


            {/* ========================================= */}
            {/* STUDENT PORTAL */}
            {/* ========================================= */}

            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >
                <Route
                    index
                    element={
                        <Navigate
                            to="/student/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="directory"
                    element={<AlumniDirectory />}
                />

                <Route
                    path="directory/:userId"
                    element={<AlumniProfile />}
                />

                <Route
                    path="jobs"
                    element={<JobBoard />}
                />

                <Route
                    path="jobs/:jobId"
                    element={<JobDetails />}
                />

                <Route
                    path="events"
                    element={<EventsPage />}
                />

                <Route
                    path="mentorship"
                    element={<MentorshipPage />}
                />

                <Route
                    path="messages"
                    element={<MessagesPage />}
                />

                <Route
                    path="profile"
                    element={<UserProfile />}
                />
            </Route>


            {/* ========================================= */}
            {/* FALLBACK */}
            {/* ========================================= */}

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