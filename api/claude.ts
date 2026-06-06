import type { VercelRequest, VercelResponse } from '@vercel/node';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const config = {
  maxDuration: 60,
};

async function callClaude(apiKey: string, messages: ChatMessage[]) {
  if (!apiKey) {
    return {
      ok: false as const,
      status: 500,
      error: 'ANTHROPIC_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.',
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
    return { ok: false as const, status: response.status, error: `Claude API error: ${errText}` };
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  return {
    ok: true as const,
    content: data.content?.find((b) => b.type === 'text')?.text ?? '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { messages } = body as { messages: ChatMessage[] };
    const result = await callClaude(apiKey, messages);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({ content: result.content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
