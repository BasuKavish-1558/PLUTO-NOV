import { createBrowserRouter } from 'react-router'
import { AuthPage } from '@/features/auth/AuthPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { UpdatePasswordPage } from '@/features/auth/UpdatePasswordPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { HomePage } from '@/features/home/HomePage'
import { NutritionPage } from '@/features/nutrition/NutritionPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { ProgressPage } from '@/features/progress/ProgressPage'
import { SplitPage } from '@/features/splits/SplitPage'
import { WorkoutPage } from '@/features/workout/WorkoutPage'
import { AppShell } from './AppShell'
import {
  OnlyBeforeOnboarding,
  ProfileGate,
  RedirectIfSignedIn,
  RequireAuth,
  RequireOnboarded,
} from './guards'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <RedirectIfSignedIn />,
    children: [
      { path: 'auth', element: <AuthPage /> },
      { path: 'auth/reset', element: <ResetPasswordPage /> },
    ],
  },
  { path: 'auth/update-password', element: <UpdatePasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ProfileGate />,
        children: [
          {
            element: <OnlyBeforeOnboarding />,
            children: [{ path: 'onboarding', element: <OnboardingPage /> }],
          },
          {
            element: <RequireOnboarded />,
            children: [
              {
                element: <AppShell />,
                children: [
                  { index: true, element: <HomePage /> },
                  { path: 'workout', element: <WorkoutPage /> },
                  { path: 'calendar', element: <CalendarPage /> },
                  { path: 'progress', element: <ProgressPage /> },
                  { path: 'split', element: <SplitPage /> },
                  { path: 'nutrition', element: <NutritionPage /> },
                  { path: 'profile', element: <ProfilePage /> },
                  { path: '*', element: <NotFoundPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
