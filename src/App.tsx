import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LevelUpProvider } from '@/contexts/LevelUpContext';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { HabitsPage } from '@/pages/HabitsPage';
import { DisciplinePage } from '@/pages/DisciplinePage';
import { TasksPage } from '@/pages/TasksPage';
import { FocusTimerPage } from '@/pages/FocusTimerPage';
import { ExamPlannerPage } from '@/pages/ExamPlannerPage';
import { CodingTrackerPage } from '@/pages/CodingTrackerPage';
import { CareerProjectsPage } from '@/pages/CareerProjectsPage';
import { DistractionJournalPage } from '@/pages/DistractionJournalPage';
import { WeeklyReviewPage } from '@/pages/WeeklyReviewPage';
import { HistoryCalendarPage } from '@/pages/HistoryCalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BrainGamesPage } from '@/pages/BrainGamesPage';
import { AiCompanionPage } from '@/pages/AiCompanionPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LevelUpProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/discipline" element={<DisciplinePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/timer" element={<FocusTimerPage />} />
            <Route path="/exams" element={<ExamPlannerPage />} />
            <Route path="/coding" element={<CodingTrackerPage />} />
            <Route path="/career" element={<CareerProjectsPage />} />
            <Route path="/distractions" element={<DistractionJournalPage />} />
            <Route path="/games" element={<BrainGamesPage />} />
            <Route path="/companion" element={<AiCompanionPage />} />
            <Route path="/analytics" element={<WeeklyReviewPage />} />
            <Route path="/history" element={<HistoryCalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LevelUpProvider>
    </BrowserRouter>
  );
};

export default App;
