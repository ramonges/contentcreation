import type { Connect } from 'vite';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export function createClaudeMiddleware(apiKey: string): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url !== '/api/claude' || req.method !== 'POST') {
      return next();
    }

    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in .env' }));
      return;
    }

    try {
      const raw = await readBody(req);
      const { messages } = JSON.parse(raw) as { messages: ChatMessage[] };

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
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Claude API error: ${errText}` }));
        return;
      }

      const data = await response.json() as {
        content?: Array<{ type: string; text?: string }>;
      };

      const content = data.content?.find((b) => b.type === 'text')?.text ?? '';

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ content }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: message }));
    }
  };
}
