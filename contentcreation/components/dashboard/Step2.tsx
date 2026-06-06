import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/llm';
import { chatClient } from '@/lib/llmClient';
import { formatCastForPrompt } from '@/lib/cast';
import type { Step1Data } from './Step1';

interface Step2Props {
  step1Data: Step1Data;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onComplete: (companyContext: string, messages: Message[]) => void;
  onBack: () => void;
}

const FOLLOW_UP_QUESTIONS = [
  "What's the most chaotic thing that happens at your company regularly?",
  'Which team member would be the villain of the show? And the hero?',
  "Describe a moment where your product actually saved someone's day. Be specific.",
  'What do your users complain about before they discover you? What changes after?',
  "What's the most embarrassing/funny thing that's happened with your product in the real world?",
];

export default function Step2({
  step1Data,
  messages,
  onMessagesChange,
  onComplete,
  onBack,
}: Step2Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const canGenerate = userMessageCount >= 4;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const content = input.trim();
    if (!content || loading) return;

    const userMessage: Message = { role: 'user', content };
    const withUser = [...messages, userMessage];

    // Persist immediately before API call so nothing is lost on remount
    onMessagesChange(withUser);
    setInput('');
    setLoading(true);

    const systemMessages: Message[] = [
      {
        role: 'system',
        content: `You are an enthusiastic TV show writer/director conducting a creative brief interview. 
Your goal is to understand the company deeply to write compelling episodes.
Keep responses SHORT (2-3 sentences max). Ask ONE follow-up question at a time.
Be conversational, a little funny. After ${Math.min(userMessageCount + 2, 5)} exchanges, suggest they're ready to generate episodes.
Cast (name, job position, day-to-day):
${formatCastForPrompt(step1Data.cast)}
Episodes planned: ${step1Data.episodeCount}
Use each person's job position and responsibilities when asking questions and shaping story ideas.`,
      },
      ...withUser,
    ];

    let assistantText = '';
    try {
      assistantText = await chatClient(systemMessages);
    } catch {
      assistantText = `Got it! ${FOLLOW_UP_QUESTIONS[userMessageCount % FOLLOW_UP_QUESTIONS.length]}`;
    }

    onMessagesChange([...withUser, { role: 'assistant', content: assistantText }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage(e);
    }
  };

  const handleGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    const context = messages
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'user' ? 'Company' : 'AI'}: ${m.content}`)
      .join('\n\n');
    onComplete(context, messages);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto flex flex-col"
      style={{ height: 'calc(100vh - 160px)', minHeight: '500px' }}
    >
      <div className="mb-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-4">
          Step 2 of 3
        </span>
        <h2 className="text-4xl font-brand text-gray-900 mb-2">Brief the director</h2>
        <p className="text-gray-500">
          Chat with your AI director. The more you share, the better the scripts.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}-${msg.content.slice(0, 20)}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-white text-xs">AI</span>
              </div>
            )}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-black text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {canGenerate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg"
            >
              Generate my {step1Data.episodeCount} episodes ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex gap-3 items-end"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell your story... (Enter to send, Shift+Enter for new line)"
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none transition-all"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-amber-500 transition-colors disabled:opacity-30 flex-shrink-0 mb-0.5"
        >
          <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-7 7l7-7 7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
