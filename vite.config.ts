import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

function aiCompanionBackendPlugin(): Plugin {
  return {
    name: 'ai-companion-backend-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. Status Check Endpoint (GET /api/companion/status)
        if (url === '/api/companion/status' && req.method === 'GET') {
          const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
          const openAiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
          const isConfigured = Boolean(geminiKey || openAiKey);

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              configured: isConfigured,
              provider: geminiKey ? 'gemini' : openAiKey ? 'openai' : 'none',
              message: isConfigured
                ? 'AI Companion backend is active and ready.'
                : 'AI provider is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY to your .env file.',
            })
          );
          return;
        }

        // 2. Chat Inference Endpoint (POST /api/companion/chat)
        if (url === '/api/companion/chat' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { messages = [], mode = 'talk', customApiKey } = body;

              const geminiKey =
                customApiKey?.startsWith('AIza')
                  ? customApiKey
                  : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
              const openAiKey =
                customApiKey?.startsWith('sk-')
                  ? customApiKey
                  : !geminiKey
                  ? process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
                  : undefined;

              if (!geminiKey && !openAiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'AI_NOT_CONFIGURED',
                    message:
                      'AI Provider credentials are not configured on the backend. Please add GEMINI_API_KEY or OPENAI_API_KEY to your server .env file or configure personal key in Settings.',
                  })
                );
                return;
              }

              // Mode Instructions
              let systemPrompt =
                'You are LEVEL UP AI Companion: a calm, warm, respectful, and empathetic sounding board for students. Acknowledge and validate feelings before giving advice. Never force motivational speeches, toxic positivity, or productivity pressure. Listen with high emotional intelligence.';
              if (mode === 'understand') {
                systemPrompt =
                  'You are LEVEL UP AI Companion. Help the student gently understand, break down, and untangle their academic pressure, career confusion, or emotional fatigue with clarity and gentle follow-up questions.';
              } else if (mode === 'plan') {
                systemPrompt =
                  'You are LEVEL UP AI Companion. Help the student organize their thoughts into 2 to 3 small, practical, non-intimidating next steps. Keep advice gentle, grounded, and manageable.';
              }

              // Provider: Gemini
              if (geminiKey) {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
                const contents = messages.map((m: any) => ({
                  role: m.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: m.content }],
                }));

                const apiRes = await fetch(geminiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents,
                    generationConfig: {
                      temperature: 0.7,
                      maxOutputTokens: 800,
                    },
                  }),
                });

                if (!apiRes.ok) {
                  const errText = await apiRes.text();
                  res.statusCode = apiRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      error: 'AI_PROVIDER_ERROR',
                      message: `Gemini API returned status ${apiRes.status}: ${errText.slice(0, 140)}`,
                    })
                  );
                  return;
                }

                const data: any = await apiRes.json();
                const replyText =
                  data.candidates?.[0]?.content?.parts?.[0]?.text ||
                  "I hear you. Could you share a bit more about what's weighing on your mind right now?";

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ role: 'assistant', content: replyText }));
                return;
              }

              // Provider: OpenAI
              if (openAiKey) {
                const openAiUrl = 'https://api.openai.com/v1/chat/completions';
                const formattedMsgs = [
                  { role: 'system', content: systemPrompt },
                  ...messages.map((m: any) => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.content,
                  })),
                ];

                const apiRes = await fetch(openAiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openAiKey}`,
                  },
                  body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: formattedMsgs,
                    temperature: 0.7,
                    max_tokens: 800,
                  }),
                });

                if (!apiRes.ok) {
                  const errText = await apiRes.text();
                  res.statusCode = apiRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      error: 'AI_PROVIDER_ERROR',
                      message: `OpenAI API returned status ${apiRes.status}: ${errText.slice(0, 140)}`,
                    })
                  );
                  return;
                }

                const data: any = await apiRes.json();
                const replyText =
                  data.choices?.[0]?.message?.content ||
                  "I'm listening and here with you. What feels like the heaviest part right now?";

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ role: 'assistant', content: replyText }));
                return;
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'SERVER_ERROR',
                  message: err?.message || 'Failed to process AI companion request',
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    aiCompanionBackendPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
} as any)
