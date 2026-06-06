import type { Message } from './llm';

export async function chatClient(messages: Message[]): Promise<string> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `Claude API ${res.status}`);
  }

  const data = await res.json() as { content: string };
  return data.content ?? '';
}
