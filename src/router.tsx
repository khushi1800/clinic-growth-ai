import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Marketing Pages
import { HomePage } from '@/pages/marketing/HomePage';
import { PricingPage } from '@/pages/marketing/PricingPage';
import { DemoRequestPage } from '@/pages/marketing/DemoRequestPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Clinic Dashboard Pages
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { LeadsPage } from '@/pages/leads/LeadsPage';
import { LeadDetailPage } from '@/pages/leads/LeadDetailPage';
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage';
import { AppointmentDetailPage } from '@/pages/appointments/AppointmentDetailPage';
import { ConversationsPage } from '@/pages/dashboard/ConversationsPage';
import { AIPlaygroundPage } from '@/pages/dashboard/AIPlaygroundPage';

// Settings Pages
import { ClinicSettingsPage } from '@/pages/settings/ClinicSettingsPage';
import { StaffPage } from '@/pages/settings/StaffPage';
import { FAQPage } from '@/pages/settings/FAQPage';
import { FollowUpRulesPage } from '@/pages/settings/FollowUpRulesPage';

// Owner Admin Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { ProspectsPage } from '@/pages/admin/ProspectsPage';
import { CustomersPage } from '@/pages/admin/CustomersPage';
import { FinancePage } from '@/pages/admin/FinancePage';

export const router = createBrowserRouter([
  // Public Marketing Routes
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'demo', element: <DemoRequestPage /> },
    ],
  },

  // Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Clinic Dashboard Routes
  {
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <OverviewPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'leads/:id', element: <LeadDetailPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      { path: 'appointments/:id', element: <AppointmentDetailPage /> },
      { path: 'conversations', element: <ConversationsPage /> },
      { path: 'ai-playground', element: <AIPlaygroundPage /> },
      { path: 'settings/clinic', element: <ClinicSettingsPage /> },
      { path: 'settings/staff', element: <StaffPage /> },
      { path: 'settings/faq', element: <FAQPage /> },
      { path: 'settings/follow-ups', element: <FollowUpRulesPage /> },
      // Direct Aliases for intuitive URL navigation
      { path: 'dashboard/ai-playground', element: <AIPlaygroundPage /> },
      { path: 'dashboard/conversations', element: <ConversationsPage /> },
      { path: 'dashboard/leads', element: <Navigate to="/leads" replace /> },
      { path: 'dashboard/appointments', element: <Navigate to="/appointments" replace /> },
      { path: 'settings/faqs', element: <Navigate to="/settings/faq" replace /> },
      { path: 'settings/followups', element: <Navigate to="/settings/follow-ups" replace /> },
    ],
  },

  // Owner Admin Routes
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'prospects', element: <ProspectsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'finance', element: <FinancePage /> },
    ],
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
