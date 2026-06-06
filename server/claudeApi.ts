export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ClaudeResult =
  | { ok: true; content: string }
  | { ok: false; status: number; error: string };

export async function callClaude(
  apiKey: string,
  messages: ChatMessage[]
): Promise<ClaudeResult> {
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: 'ANTHROPIC_API_KEY is not set. Add it in .env locally or Vercel Environment Variables.',
    };
  }

  const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content);
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemParts.join('\n\n'),
      messages: chatMessages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return { ok: false, status: response.status, error: `Claude API error: ${errText}` };
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const content = data.content?.find((b) => b.type === 'text')?.text ?? '';
  return { ok: true, content };
}
