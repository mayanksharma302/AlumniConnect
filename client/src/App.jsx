// Imports
import React from 'react';
import { Toaster } from 'sonner';
import SignUpPage from './pages/public/SignUpPage';
import SignInPage from './pages/public/SignInPage';
import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/public/VerifyEmail';
import CompleteProfile from './pages/public/CompleteProfileOnboard';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UploadProfileOnboard from './pages/UploadProfileOnboard';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import UserProfile from './pages/UserProfile';
import JobBoard from './pages/JobBoard';
import EventsPage from './pages/EventsPage';
import MentorshipPage from './pages/MentorshipPage';
import MessagesPage from './pages/MessagesPage';

function App() {
  return (
    <BrowserRouter>
      {/*  All the Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/upload-profile-image" element={<UploadProfileOnboard />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/directory" element={<DashboardLayout><AlumniDirectory /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><UserProfile /></DashboardLayout>} />
        <Route path="/profile/:userId" element={<DashboardLayout><UserProfile /></DashboardLayout>} />
        <Route path="/jobs" element={<DashboardLayout><JobBoard /></DashboardLayout>} />
        <Route path="/events" element={<DashboardLayout><EventsPage /></DashboardLayout>} />
        <Route path="/mentorship" element={<DashboardLayout><MentorshipPage /></DashboardLayout>} />
        <Route path="/messages" element={<DashboardLayout><MessagesPage /></DashboardLayout>} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
