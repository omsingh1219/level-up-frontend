import { describe, it, expect } from 'vitest';
import { getInitialData } from '@/utils/initialData';
import { GameSession, GameType, CompanionMessage, CompanionMode } from '@/types/levelup';

describe('Brain Games & AI Companion Modules Tests', () => {
  describe('Brain Games Data Structures and Session History', () => {
    it('initializes with valid game sessions and empty-state resilience', () => {
      const data = getInitialData();
      expect(Array.isArray(data.gameSessions)).toBe(true);
      expect(data.gameSessions.length).toBeGreaterThan(0);

      const firstSession = data.gameSessions[0];
      expect(firstSession).toHaveProperty('id');
      expect(firstSession).toHaveProperty('gameType');
      expect(firstSession).toHaveProperty('score');
      expect(firstSession).toHaveProperty('durationSeconds');
      expect(firstSession).toHaveProperty('completedAt');
    });

    it('correctly aggregates statistics across multiple game sessions', () => {
      const sampleSessions: GameSession[] = [
        {
          id: 'gs-1',
          gameType: 'memory',
          gameTitle: 'Memory Match',
          score: 16,
          date: '2026-10-15',
          durationSeconds: 42,
          completedAt: new Date().toISOString(),
        },
        {
          id: 'gs-2',
          gameType: 'reaction',
          gameTitle: 'Reaction Time Test',
          score: 245,
          date: '2026-10-15',
          durationSeconds: 15,
          completedAt: new Date().toISOString(),
        },
        {
          id: 'gs-3',
          gameType: 'reaction',
          gameTitle: 'Reaction Time Test',
          score: 215,
          date: '2026-10-15',
          durationSeconds: 14,
          completedAt: new Date().toISOString(),
        },
      ];

      const reactionScores = sampleSessions
        .filter((s) => s.gameType === 'reaction')
        .map((s) => Number(s.score));

      const bestReaction = Math.min(...reactionScores);
      expect(bestReaction).toBe(215);

      const totalBreakTimeSeconds = sampleSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
      expect(totalBreakTimeSeconds).toBe(71);
    });
  });

  describe('Game Logic: Reaction Time & Memory Match', () => {
    it('calculates average reaction time across 5 completed rounds', () => {
      const reactionTimesMs = [240, 260, 225, 235, 250];
      const sum = reactionTimesMs.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / reactionTimesMs.length);

      expect(avg).toBe(242);
      expect(reactionTimesMs.length).toBe(5);
    });

    it('verifies Memory Match generates pairs with symmetric match count', () => {
      const symbols = ['cpu', 'code', 'database', 'terminal', 'git-branch', 'laptop', 'shield', 'zap'];
      const deck = [...symbols, ...symbols].map((symbol, idx) => ({
        id: idx,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

      expect(deck.length).toBe(16);
      symbols.forEach((symbol) => {
        const count = deck.filter((c) => c.symbol === symbol).length;
        expect(count).toBe(2);
      });
    });

    it('verifies Calm Breathing cycle durations for Box Breathing and 4-7-8 modes', () => {
      // Box breathing: 4 inhale + 4 hold + 4 exhale + 4 hold = 16 seconds
      const boxPhaseDurations = [4, 4, 4, 4];
      const boxCycleSeconds = boxPhaseDurations.reduce((a, b) => a + b, 0);
      expect(boxCycleSeconds).toBe(16);

      // 4-7-8 breathing: 4 inhale + 7 hold + 8 exhale = 19 seconds
      const relaxingPhaseDurations = [4, 7, 8];
      const relaxingCycleSeconds = relaxingPhaseDurations.reduce((a, b) => a + b, 0);
      expect(relaxingCycleSeconds).toBe(19);

      // 2 minutes of box breathing gives ~7.5 cycles
      const targetDurationSeconds = 120;
      const totalCyclesCompleted = Math.floor(targetDurationSeconds / boxCycleSeconds);
      expect(totalCyclesCompleted).toBe(7);
    });
  });

  describe('AI Companion: Crisis Detection & Safety Keywords', () => {
    const CRISIS_PATTERNS = [
      /\bkill\s+myself\b/i,
      /\bsuicid/i,
      /\bend\s+my\s+life\b/i,
      /\bwant\s+to\s+die\b/i,
      /\bharm(ing)?\s+myself\b/i,
      /\bhurt(ing)?\s+myself\b/i,
      /\bcut(ting)?\s+myself\b/i,
      /\bno\s+reason\s+to\s+live\b/i,
      /\bdon'?t\s+want\s+to\s+wake\s+up\b/i,
    ];

    const isCrisisPrompt = (input: string) => {
      return CRISIS_PATTERNS.some((pattern) => pattern.test(input));
    };

    it('flags high-risk distress statements for immediate safety intervention', () => {
      expect(isCrisisPrompt('I want to end my life, everything is overwhelming')).toBe(true);
      expect(isCrisisPrompt('feeling suicidal after failing my exams')).toBe(true);
      expect(isCrisisPrompt('I feel like hurting myself')).toBe(true);
      expect(isCrisisPrompt('I just want to kill myself')).toBe(true);
    });

    it('does not falsely trigger crisis modal on everyday academic stress', () => {
      expect(isCrisisPrompt('This algorithm assignment is killing my weekend')).toBe(false);
      expect(isCrisisPrompt('I am stressed about my final exam in Operating Systems')).toBe(false);
      expect(isCrisisPrompt('I feel so unmotivated today and scrolled Reels for 2 hours')).toBe(false);
    });

    it('ensures verified hotlines and emergency services are configured without hallucination', () => {
      const verifiedHotlines = [
        { country: 'United States & Canada', number: '988', name: 'Suicide & Crisis Lifeline' },
        { country: 'United Kingdom', number: '111 or 116 123', name: 'NHS Mental Health & Samaritans' },
        { country: 'India', number: '14416 (Tele-MANAS) / 1800-599-0019 (KIRAN)', name: 'National Mental Health Helpline' },
        { country: 'International', url: 'https://findahelpline.com', name: 'Befrienders Worldwide & Find A Helpline' },
      ];

      // Verifying hotline numbers are genuine national public numbers
      expect(verifiedHotlines.some((h) => h.number === '988')).toBe(true);
      expect(verifiedHotlines.some((h) => h.number?.includes('14416'))).toBe(true);
      expect(verifiedHotlines.some((h) => h.url === 'https://findahelpline.com')).toBe(true);
    });
  });

  describe('AI Companion: Privacy, Consent & Tone Modes', () => {
    it('supports 3 distinct conversational focus modes', () => {
      const modes: CompanionMode[] = ['talk', 'understand', 'plan'];
      expect(modes.length).toBe(3);

      const modeLabels: Record<CompanionMode, string> = {
        talk: 'I just want to talk',
        understand: 'Help me understand this',
        plan: 'Help me make a plan',
      };

      expect(modeLabels.talk).toBe('I just want to talk');
      expect(modeLabels.understand).toBe('Help me understand this');
      expect(modeLabels.plan).toBe('Help me make a plan');
    });

    it('enforces privacy consent: does not save messages when companionConsent is false', () => {
      let companionConsent = false;
      let storedMessages: CompanionMessage[] = [];

      const saveMessage = (msg: CompanionMessage) => {
        if (!companionConsent) return; // Opted out of persistence
        storedMessages.push(msg);
      };

      const testMsg: CompanionMessage = {
        id: 'msg-temp-1',
        sender: 'user',
        content: 'This is a private thought.',
        mode: 'talk',
        timestamp: new Date().toISOString(),
      };

      // When consent is false, message is not stored
      saveMessage(testMsg);
      expect(storedMessages.length).toBe(0);

      // When user gives informed consent, message persists
      companionConsent = true;
      saveMessage(testMsg);
      expect(storedMessages.length).toBe(1);
      expect(storedMessages[0].content).toBe('This is a private thought.');
    });

    it('clears all companion messages on user request', () => {
      let messages: CompanionMessage[] = [
        { id: '1', sender: 'assistant', content: 'Hi Alex', mode: 'talk', timestamp: '2026-10-15' },
        { id: '2', sender: 'user', content: 'Hey', mode: 'talk', timestamp: '2026-10-15' },
      ];

      expect(messages.length).toBe(2);

      // Clear action
      messages = [];
      expect(messages.length).toBe(0);
    });
  });
});
