import { formatCastForPrompt } from '@/lib/cast';
import type { Step1Data } from '@/components/dashboard/Step1';
import type { Message } from '@/lib/llm';

export function buildInitialDirectorMessage(data: Step1Data): Message {
  return {
    role: 'assistant',
    content: `Welcome! I'm your Season Content AI director. Here's your cast:\n${formatCastForPrompt(data.cast)}\n\nWe're making ${data.episodeCount} episodes.\n\nLet's build the world of your show. First question: **What does your company actually do?** Don't give me the website copy version — tell me what happens on a typical Tuesday.`,
  };
}
