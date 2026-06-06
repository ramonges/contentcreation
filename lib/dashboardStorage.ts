import type { Step1Data } from '@/components/dashboard/Step1';
import type { Episode } from '@/components/dashboard/EpisodeCard';
import type { Message } from '@/lib/llm';

const STORAGE_KEY = 'season-content-wizard';

export type WizardState = {
  step: 1 | 2 | 3;
  step1Data: Step1Data | null;
  companyContext: string;
  conversationMessages: Message[];
  episodes: Episode[];
  seasonOutline: string;
  /** Master season plan with linked arc + per-episode scenarios — created at end of Step 2 */
  seasonPlan: string;
  /** Episode count used when the current season was generated — mismatch triggers regen */
  generatedForEpisodeCount: number | null;
  /** Set only when user clicks Generate at end of Step 2 — gates all episode generation */
  generationBatchId: string | null;
  /** Batch id the current episodes were generated from */
  generatedForBatchId: string | null;
  viewingEpisodeId: number | null;
};

export function loadWizardState(): WizardState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return {
      step: parsed.step ?? 1,
      step1Data: parsed.step1Data ?? null,
      companyContext: parsed.companyContext ?? '',
      conversationMessages: parsed.conversationMessages ?? [],
      episodes: parsed.episodes ?? [],
      seasonOutline: parsed.seasonOutline ?? '',
      seasonPlan: parsed.seasonPlan ?? '',
      generatedForEpisodeCount: parsed.generatedForEpisodeCount ?? null,
      generationBatchId: parsed.generationBatchId ?? null,
      generatedForBatchId: parsed.generatedForBatchId ?? null,
      viewingEpisodeId: parsed.viewingEpisodeId ?? null,
    };
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveWizardState(state: WizardState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

export function saveWizardStateDebounced(state: WizardState, delayMs = 200): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveWizardState(state);
    saveTimer = null;
  }, delayMs);
}

export function clearWizardState(): void {
  if (saveTimer) clearTimeout(saveTimer);
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
