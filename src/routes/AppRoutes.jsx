import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Loader from "../components/common/Loader";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

const HomePage = React.lazy(() => import("../pages/HomePage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const VerifyEmailPage = React.lazy(() => import("../pages/VerifyEmailPage"));
const ResendVerificationPage = React.lazy(() => import("../pages/ResendVerificationPage"));
const NotesPage = React.lazy(() => import("../pages/NotesPage"));
const NoteDetailsPage = React.lazy(() => import("../pages/NoteDetailsPage"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"));

const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));



function AppRoutes() {
  return (
    <Suspense fallback={<Loader message="Loading page..." />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
        path="/verify-email/:token"
        element={
        <VerifyEmailPage />
        }
        />

        <Route
        path="/resend-verification"
        element={
        <ResendVerificationPage />}
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes/:noteId"
          element={
            <ProtectedRoute>
              <NoteDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;