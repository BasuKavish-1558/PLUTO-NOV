import { createBrowserRouter } from 'react-router'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { HomePage } from '@/features/home/HomePage'
import { NutritionPage } from '@/features/nutrition/NutritionPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { ProgressPage } from '@/features/progress/ProgressPage'
import { SplitPage } from '@/features/splits/SplitPage'
import { WorkoutPage } from '@/features/workout/WorkoutPage'
import { AppShell } from './AppShell'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
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
])
