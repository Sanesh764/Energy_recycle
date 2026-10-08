import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';

// Application Pages
import { MyDevices } from '../pages/citizen/MyDevices';
import { AddDevice } from '../pages/citizen/AddDevice';
import { DevicePassport } from '../pages/citizen/DevicePassport';
import { OpenPickups } from '../pages/collector/OpenPickups';
import { MyPickups } from '../pages/collector/MyPickups';
import { InspectDevice } from '../pages/collector/InspectDevice';
import { AdminStats } from '../pages/admin/AdminStats';
import { AllDevices } from '../pages/admin/AllDevices';
import { Unauthorized } from '../pages/Unauthorized';
import { NotFound } from '../pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      {/* =================================================================== */}
      {/* 1. PUBLIC MARKETING & ONBOARDING ROUTES                             */}
      {/* =================================================================== */}
      <Route element={<PublicLayout />}>
        {/* / is the full public product landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* =================================================================== */}
      {/* 2. AUTHENTICATED APPLICATION / DASHBOARD ROUTES                     */}
      {/* =================================================================== */}
      <Route element={<AppLayout />}>
        {/* Citizen Routes */}
        <Route
          path="/citizen/devices"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
              <MyDevices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/citizen"
          element={<Navigate to="/citizen/devices" replace />}
        />
        <Route
          path="/app/citizen/devices"
          element={<Navigate to="/citizen/devices" replace />}
        />
        <Route
          path="/citizen/devices/new"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
              <AddDevice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/citizen/devices/new"
          element={<Navigate to="/citizen/devices/new" replace />}
        />
        {/* Device Passport: Accessible by Citizen, Collector, or Admin per SPEC.md */}
        <Route
          path="/citizen/devices/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.COLLECTOR, ROLES.ADMIN]}>
              <DevicePassport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/citizen/devices/:id"
          element={<Navigate to="/citizen/devices/:id" replace />}
        />

        {/* Collector Routes */}
        <Route
          path="/collector/open"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COLLECTOR]}>
              <OpenPickups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/collector"
          element={<Navigate to="/collector/open" replace />}
        />
        <Route
          path="/collector/my-pickups"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COLLECTOR]}>
              <MyPickups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collector/inspect/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COLLECTOR]}>
              <InspectDevice />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminStats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/admin"
          element={<Navigate to="/admin/stats" replace />}
        />
        <Route
          path="/admin/devices"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AllDevices />
            </ProtectedRoute>
          }
        />

        {/* System & Fallback routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
