const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function chatWithLlama(messages: Message[]): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message?.content ?? '';
}

export async function* streamChatWithLlama(messages: Message[]): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          yield parsed.message.content;
        }
      } catch {
        // ignore parse errors on incomplete chunks
      }
    }
  }
}

export {
  buildSeasonOutlineMessages,
  buildEpisodeScriptMessages,
  GNOMI_SERIES_FORMAT,
} from './gnomiFormat';

/** @deprecated Use buildEpisodeScriptMessages from gnomiFormat instead */
export function buildEpisodeGenerationPrompt(
  companyContext: string,
  castMembers: Array<{ name: string; jobPosition: string; jobDescription?: string }>,
  episodeCount: number,
  episodeIndex: number
): Message[] {
  const castList = castMembers
    .map((m) => {
      const desc = m.jobDescription?.trim();
      return desc ? `- ${m.name} — ${m.jobPosition}: ${desc}` : `- ${m.name} — ${m.jobPosition}`;
    })
    .join('\n');

  return [
    {
      role: 'system',
      content: `You are a short-form drama writer for Gnomi's social series (Cluely-style format).
Write linked episodes where each is unique but the season arc continues.`,
    },
    {
      role: 'user',
      content: `Company context: ${companyContext}

Cast members:
${castList}

Total season: ${episodeCount} episodes
Write episode ${episodeIndex + 1} of ${episodeCount}.

Format:
TITLE: [Dramatic title]
LOGLINE: [One punchy sentence]
PART 1 — SCENE: [15-25s workplace drama]
PART 2 — FACE-CAM CONFESSION: [5-10s raw quotable line to camera]
PART 3 — CLIFFHANGER: [3s unresolved cut — do not resolve tension]`,
    },
  ];
}

export function buildScriptModificationPrompt(
  originalScript: string,
  modification: string
): Message[] {
  return [
    {
      role: 'system',
      content: `You are a TV script editor. Modify the provided script based on the user's request while maintaining the dramatic/comedic tone and natural product usage.`,
    },
    {
      role: 'user',
      content: `Original script:\n${originalScript}\n\nModification request: ${modification}\n\nReturn the full modified script only.`,
    },
  ];
}
