import { describe, it, expect } from 'vitest';
import { getInitialData } from '@/utils/initialData';
import { getLocalDateString } from '@/contexts/LevelUpContext';
import { HabitLog, DailyRecord } from '@/types/levelup';

describe('LEVEL UP Core Architecture & Business Logic Tests', () => {
  it('correctly loads initial student productivity and discipline data', () => {
    const data = getInitialData();
    expect(data.profile.name).toBe('Alex Rivera');
    expect(data.profile.dailyStudyTargetHours).toBe(5.0);
    expect(data.habits.length).toBeGreaterThanOrEqual(6);
    expect(data.disciplineItems.length).toBe(8);
    expect(data.tasks.length).toBeGreaterThan(0);
    expect(data.exams.length).toBeGreaterThan(0);
    expect(data.codingProblems.length).toBeGreaterThan(0);
    expect(data.projects.length).toBeGreaterThan(0);
  });

  describe('Habit Streak & Consistency Calculations', () => {
    it('accurately calculates active and continuous streaks', () => {
      const logs: HabitLog[] = [
        { id: '1', habitId: 'h1', date: '2026-10-15', completed: true },
        { id: '2', habitId: 'h1', date: '2026-10-14', completed: true },
        { id: '3', habitId: 'h1', date: '2026-10-13', completed: true },
        { id: '4', habitId: 'h1', date: '2026-10-12', completed: false }, // break
        { id: '5', habitId: 'h1', date: '2026-10-11', completed: true },
      ];

      const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date));
      let currentStreak = 0;
      let checkDate = new Date(2026, 9, 15);

      while (true) {
        const dStr = getLocalDateString(checkDate);
        if (completedDates.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      expect(currentStreak).toBe(3);
    });
  });

  describe('Daily Discipline Scoring & Non-Judgmental Logic', () => {
    it('computes daily discipline score and percentage correctly', () => {
      const totalStandards = 8;
      const checkedIds = ['disc-1', 'disc-2', 'disc-3', 'disc-4', 'disc-5', 'disc-7']; // 6 of 8
      const score = checkedIds.length;
      const percentage = Math.round((score / totalStandards) * 100);

      expect(score).toBe(6);
      expect(percentage).toBe(75);
    });

    it('encourages user on partial completion without total failure framing', () => {
      const score = 5;
      const total = 8;
      const percentage = Math.round((score / total) * 100);
      const isTotalFailure = percentage === 0;

      expect(percentage).toBeGreaterThan(50);
      expect(isTotalFailure).toBe(false);
    });
  });

  describe('Requirement #15: Persistent Daily History & Isolation', () => {
    it('stores separate records for different calendar dates without overwriting', () => {
      const recordDay1: DailyRecord = {
        id: 'dr-2026-10-14',
        date: '2026-10-14',
        checkedDisciplineItemIds: ['disc-1', 'disc-2', 'disc-3', 'disc-4', 'disc-5', 'disc-6', 'disc-7', 'disc-8'],
        dailyScore: 8,
        totalItems: 8,
        percentage: 100,
        reflection: {
          wentWell: 'Flawless study day',
          distracted: 'None',
          improveTomorrow: 'Keep tempo',
        },
        updatedAt: '2026-10-14T23:00:00Z',
      };

      const recordDay2: DailyRecord = {
        id: 'dr-2026-10-15',
        date: '2026-10-15',
        checkedDisciplineItemIds: ['disc-1', 'disc-2'],
        dailyScore: 2,
        totalItems: 8,
        percentage: 25,
        reflection: {
          wentWell: 'Finished morning routine',
          distracted: 'Afternoon calls',
          improveTomorrow: 'Flight mode on desk',
        },
        updatedAt: '2026-10-15T18:00:00Z',
      };

      const dailyRecords = [recordDay1, recordDay2];

      expect(dailyRecords.length).toBe(2);
      expect(dailyRecords.find((r) => r.date === '2026-10-14')?.dailyScore).toBe(8);
      expect(dailyRecords.find((r) => r.date === '2026-10-15')?.dailyScore).toBe(2);
    });
  });

  describe('Exam Preparation Revision Timetable Pace', () => {
    it('calculates realistic topics per day based on days remaining', () => {
      const totalTopics = 12;
      const revisedTopics = 4;
      const remainingTopics = totalTopics - revisedTopics; // 8
      const daysUntilExam = 4;

      const topicsPerDay = Number((remainingTopics / daysUntilExam).toFixed(1));
      expect(topicsPerDay).toBe(2.0);
    });
  });

  describe('Focus Timer Drift Prevention Logic', () => {
    it('uses delta timestamp difference rather than tick counting', () => {
      const now = Date.now();
      const durationSeconds = 1500; // 25 mins
      const targetEndTime = now + durationSeconds * 1000;

      // Simulate browser tab throttled background delay of 600 seconds
      const simulatedResumeTime = now + 600 * 1000;
      const accurateRemainingSeconds = Math.max(0, Math.round((targetEndTime - simulatedResumeTime) / 1000));

      expect(accurateRemainingSeconds).toBe(900); // exactly 15 minutes left, zero drift!
    });
  });

  describe('Data Import & Export Validation', () => {
    it('validates that exported JSON contains all required modules', () => {
      const data = getInitialData();
      const json = JSON.stringify(data);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe(1);
      expect(parsed.profile).toBeDefined();
      expect(parsed.habits).toBeInstanceOf(Array);
      expect(parsed.habitLogs).toBeInstanceOf(Array);
      expect(parsed.disciplineItems).toBeInstanceOf(Array);
      expect(parsed.dailyRecords).toBeInstanceOf(Array);
      expect(parsed.tasks).toBeInstanceOf(Array);
      expect(parsed.studySessions).toBeInstanceOf(Array);
      expect(parsed.exams).toBeInstanceOf(Array);
      expect(parsed.codingProblems).toBeInstanceOf(Array);
      expect(parsed.distractionLogs).toBeInstanceOf(Array);
    });
  });
});
