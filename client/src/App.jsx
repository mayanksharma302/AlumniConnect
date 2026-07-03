// Imports
import React from 'react';
import { Toaster } from 'sonner';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from './pages/CompleteProfileOnboard';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UploadProfileOnboard from './pages/UploadProfileOnboard';

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
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
