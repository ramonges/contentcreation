import type { Connect } from 'vite';
import { callClaude, type ChatMessage } from './claudeApi';

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk; });
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

    try {
      const raw = await readBody(req);
      const { messages } = JSON.parse(raw) as { messages: ChatMessage[] };
      const result = await callClaude(apiKey, messages);

      res.setHeader('Content-Type', 'application/json');
      if (!result.ok) {
        res.statusCode = result.status;
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ content: result.content }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: message }));
    }
  };
}
