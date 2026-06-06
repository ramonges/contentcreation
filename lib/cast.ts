import type { CastMember } from '@/components/dashboard/Step1';

export function formatCastForPrompt(cast: CastMember[]): string {
  return cast
    .map((m) => {
      const position = m.jobPosition.trim();
      const description = m.jobDescription.trim();
      if (description) {
        return `- ${m.name} — ${position}: ${description}`;
      }
      return `- ${m.name} — ${position}`;
    })
    .join('\n');
}

export function formatCastShort(cast: CastMember[]): string {
  return cast.map((m) => `${m.name} (${m.jobPosition})`).join(', ');
}
