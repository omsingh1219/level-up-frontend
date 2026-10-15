import { askGeminiAI } from '../services/gemini';
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  HeartHandshake,
  ShieldAlert,
  Trash2,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Smile,
  Shield,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { CompanionMode, CompanionMessage, MoodType } from '@/types/levelup';
import { sound } from '@/utils/sound';

// Verified Crisis & Emergency Contacts (No hallucinated phone numbers)
const CRISIS_RESOURCES = [
  {
    country: 'United States & Canada',
    service: '988 Suicide & Crisis Lifeline',
    contact: 'Call or Text 988 (Free, Confidential, 24/7)',
    link: 'https://988lifeline.org',
  },
  {
    country: 'United States & Canada',
    service: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    link: 'https://www.crisistextline.org',
  },
  {
    country: 'United Kingdom',
    service: 'Samaritans & NHS',
    contact: 'Call 116 123 (Samaritans) or 111 (NHS Mental Health)',
    link: 'https://www.samaritans.org',
  },
  {
    country: 'India',
    service: 'Tele-MANAS & KIRAN National Helpline',
    contact: 'Call 14416 or 1800-599-0019 (Toll-Free, 24/7)',
    link: 'https://telemanas.mohfw.gov.in',
  },
  {
    country: 'International / Global',
    service: 'Find A Helpline & Befrienders Worldwide',
    contact: 'Free confidential support in over 130 countries',
    link: 'https://findahelpline.com',
  },
];

// Crisis keywords to detect self-harm / extreme crisis
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

export const AiCompanionPage: React.FC = () => {
  const {
    data,
    today,
    saveCompanionMessage,
    clearCompanionMessages,
    deleteCompanionMessage,
    setCompanionConsent,
    logMoodEntry,
  } = useLevelUp();

  const [mode, setMode] = useState<CompanionMode>('talk');
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showCrisisBanner, setShowCrisisBanner] = useState<boolean>(false);
  const [showMoodModal, setShowMoodModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Backend connection status
  const [backendConfigured, setBackendConfigured] = useState<boolean | null>(null);
  const [providerName, setProviderName] = useState<string>('none');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend AI configuration status on mount
  useEffect(() => {
    fetch('/api/companion/status')
      .then((res) => res.json())
      .then((data) => {
        setBackendConfigured(Boolean(data.configured));
        setProviderName(data.provider || 'none');
      })
      .catch(() => {
        setBackendConfigured(false);
      });
  }, []);

  const messages = data.companionMessages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check for crisis language
  const checkSafetyLanguage = (text: string): boolean => {
    return CRISIS_PATTERNS.some((p) => p.test(text));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    setErrorStatus(null);

    // Save user message
    saveCompanionMessage({
      sender: 'user',
      content: userText,
      mode,
    });

    // Check crisis detection immediately
    const isCrisis = checkSafetyLanguage(userText);
    if (isCrisis) {
      setShowCrisisBanner(true);
      saveCompanionMessage({
        sender: 'assistant',
        content:
          "I hear how much pain you are experiencing right now, and I care deeply about your safety. You don't have to carry this alone. Because I am an AI and not a crisis service or human professional, please connect with someone who can support you right now. Below are free, confidential, 24/7 resources where compassionate, trained people are ready to listen.",
        mode,
        isCrisisHelp: true,
      });
      return;
    }

      // ---- secure local server api call ----
  try {
    setIsLoading(true);

    // Call your local proxy server securely
    const aiReply = await askGeminiAI(userText);

    // Save the final AI response into your chat state
    saveCompanionMessage({
      sender: 'assistant',
      content: aiReply,
      mode
    });
    
    // Play the success sound
    sound.playSuccess();
  } catch (err: any) {
    console.error("AI Fetch Failure:", err);
    setErrorStatus("Failed to get response from AI companion.");
  } finally {
    setIsLoading(false);
  }
};


  const handleQuickMood = (mood: MoodType) => {
    logMoodEntry({
      date: today,
      mood,
      energyLevel: 3,
    });
    sound.playSuccess();
    setShowMoodModal(false);

    // Contextual greeting
    saveCompanionMessage({
      sender: 'assistant',
      content: `Thank you for checking in. I see you're feeling **${mood}** right now. Taking a moment to notice where you are is already an act of self-awareness.\n\nWould you like to explore what's behind this feeling, or just have a quiet conversation?`,
      mode,
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* HEADER BAR */}
      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight">AI Companion & Wellbeing Space</h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            A quiet, empathetic sounding board for academic pressure, loneliness, and life balance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Mood Check-in Button */}
          <button
            onClick={() => setShowMoodModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>Mood Check-In</span>
          </button>

          {/* Privacy & Consent Button */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-500 transition-colors cursor-pointer"
            title="Privacy and Consent Settings"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Privacy</span>
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={() => {
              if (window.confirm('Clear all conversation history in this session?')) {
                clearCompanionMessages();
              }
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODE SELECTOR */}
      <div className="flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
        <span className="text-[11px] font-semibold text-zinc-400 px-2 hidden sm:inline">Mode:</span>

        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => setMode('talk')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
              mode === 'talk'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            💬 I just want to talk
          </button>

          <button
            onClick={() => setMode('understand')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
              mode === 'understand'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            💡 Help me understand this
          </button>

          <button
            onClick={() => setMode('plan')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
              mode === 'plan'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            📋 Help me make a plan
          </button>
        </div>
      </div>

      {/* CRISIS HELP RESOURCE ACCORDION / BANNER */}
      {showCrisisBanner && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs shrink-0 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Immediate Support & Verified Crisis Resources</span>
            </div>
            <button
              onClick={() => setShowCrisisBanner(false)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Your life has value, and you don't have to navigate overwhelming distress by yourself. Please reach out to
            these verified 24/7 confidential services:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {CRISIS_RESOURCES.map((r) => (
              <a
                key={r.service}
                href={r.link}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-500/20 hover:border-rose-500/40 block transition-colors"
              >
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>{r.service}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="text-rose-500 font-mono text-[11px] mt-0.5">{r.contact}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{r.country}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      

      {/* CHAT MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium rounded-tr-xs'
                    : msg.isCrisisHelp
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200 rounded-tl-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-xs border border-zinc-200/60 dark:border-zinc-700/60'
                }`}
              >
                {msg.content}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-zinc-400 px-1">
                <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                <button
                  onClick={() => deleteCompanionMessage(msg.id)}
                  className="hover:text-rose-500 transition-colors"
                  title="Delete message"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl max-w-xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Companion is thinking and listening...</span>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Unable to complete request</div>
              <p className="mt-0.5 text-[11px]">{errorStatus}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            mode === 'talk'
              ? 'Share what you are feeling or thinking right now...'
              : mode === 'understand'
              ? 'What academic or personal situation feels confusing or heavy?'
              : 'What project or workload feels too big to start?'
          }
          className="flex-1 px-4 py-3 text-xs rounded-xl bg-white dark:bg-[#111115] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-xs"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`p-3 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            inputText.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* MOOD CHECK-IN MODAL */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              How are you feeling right now?
            </h3>
            <p className="text-xs text-zinc-500">
              Optional check-in. Helps your AI Companion tailor its tone and pacing.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(['Overwhelmed', 'Anxious', 'Exhausted', 'Neutral', 'Focused', 'Hopeful'] as MoodType[]).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => handleQuickMood(m)}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                  >
                    {m === 'Overwhelmed' && '🌊 '}
                    {m === 'Anxious' && '⚡ '}
                    {m === 'Exhausted' && '💤 '}
                    {m === 'Neutral' && '🌱 '}
                    {m === 'Focused' && '🎯 '}
                    {m === 'Hopeful' && '☀️ '}
                    {m}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setShowMoodModal(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer pt-2"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY & DATA POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-xs space-y-4 text-left">
            <div className="flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Privacy & AI Companion Data Controls</span>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                <strong>1. Transparent AI Interaction:</strong> You are conversing with an AI model, not a human, licensed
                therapist, or clinical healthcare provider. It cannot diagnose or treat mental health conditions.
              </p>
              <p>
                <strong>2. Local & Zero-Training Guarantee:</strong> Your messages are sent via secure backend proxy solely to
                render conversational responses. LEVEL UP does not sell your private conversations or use them to train
                public models.
              </p>
              <p>
                <strong>3. Storage Consent:</strong> You have complete authority to opt in or out of retaining conversation
                history in your local workspace.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">Save Chat History Locally</div>
                <div className="text-[11px] text-zinc-500">Store conversation across page reloads</div>
              </div>

              <input
                type="checkbox"
                checked={data.companionConsent}
                onChange={(e) => setCompanionConsent(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
