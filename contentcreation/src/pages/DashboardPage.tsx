import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import Step1, { Step1Data } from '@/components/dashboard/Step1';
import Step2 from '@/components/dashboard/Step2';
import Step3 from '@/components/dashboard/Step3';
import ScriptModal from '@/components/dashboard/ScriptModal';
import type { Episode } from '@/components/dashboard/EpisodeCard';
import type { Message } from '@/lib/llm';
import {
  loadWizardState,
  saveWizardState,
  saveWizardStateDebounced,
  clearWizardState,
  type WizardState,
} from '@/lib/dashboardStorage';
import { buildInitialDirectorMessage } from '@/lib/step2Messages';

const EMPTY_WIZARD: WizardState = {
  step: 1,
  step1Data: null,
  companyContext: '',
  conversationMessages: [],
  episodes: [],
  seasonOutline: '',
  seasonPlan: '',
  generatedForEpisodeCount: null,
  generationBatchId: null,
  generatedForBatchId: null,
  viewingEpisodeId: null,
};

function getInitialWizard(): WizardState {
  const saved = loadWizardState() ?? EMPTY_WIZARD;
  if (saved.step === 2 && saved.step1Data && saved.conversationMessages.length === 0) {
    return { ...saved, conversationMessages: [buildInitialDirectorMessage(saved.step1Data)] };
  }
  return saved;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; firstName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<WizardState>(getInitialWizard);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveWizardStateDebounced(wizard);
    }
  }, [wizard, loading]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/', { replace: true });
      return;
    }
    const meta = session.user.user_metadata;
    setUser({
      email: session.user.email ?? '',
      firstName: meta?.first_name ?? session.user.email?.split('@')[0] ?? 'Creator',
    });
    setLoading(false);
  };

  const handleSignOut = async () => {
    clearWizardState();
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const handleStep1Complete = useCallback((data: Step1Data) => {
    setWizard((prev) => {
      const episodeCountChanged = prev.step1Data?.episodeCount !== data.episodeCount;
      return {
        ...prev,
        step1Data: data,
        step: 2,
        viewingEpisodeId: null,
        episodes: episodeCountChanged ? [] : prev.episodes,
        seasonOutline: episodeCountChanged ? '' : prev.seasonOutline,
        seasonPlan: episodeCountChanged ? '' : prev.seasonPlan,
        generatedForEpisodeCount: episodeCountChanged ? null : prev.generatedForEpisodeCount,
        generationBatchId: episodeCountChanged ? null : prev.generationBatchId,
        generatedForBatchId: episodeCountChanged ? null : prev.generatedForBatchId,
        conversationMessages:
          prev.conversationMessages.length > 0
            ? prev.conversationMessages
            : [buildInitialDirectorMessage(data)],
      };
    });
  }, []);

  const handleMessagesChange = useCallback((messages: Message[]) => {
    setWizard((prev) => ({ ...prev, conversationMessages: messages }));
  }, []);

  const handleStep2Complete = useCallback((context: string, messages: Message[]) => {
    const batchId = `batch-${Date.now()}`;
    setWizard((prev) => ({
      ...prev,
      companyContext: context,
      conversationMessages: messages,
      episodes: [],
      seasonOutline: '',
      seasonPlan: '',
      generatedForEpisodeCount: null,
      generatedForBatchId: null,
      generationBatchId: batchId,
      viewingEpisodeId: null,
      step: 3,
    }));
  }, []);

  const handleEpisodesChange = useCallback(
    (
      episodes: Episode[],
      seasonPlan?: string,
      generatedForEpisodeCount?: number,
      generatedForBatchId?: string | null
    ) => {
      setWizard((prev) => ({
        ...prev,
        episodes,
        ...(seasonPlan !== undefined ? { seasonPlan } : {}),
        ...(generatedForEpisodeCount !== undefined ? { generatedForEpisodeCount } : {}),
        ...(generatedForBatchId !== undefined ? { generatedForBatchId } : {}),
      }));
    },
    []
  );

  const handleStep3Back = useCallback(() => {
    setWizard((prev) => ({
      ...prev,
      step: 2,
      viewingEpisodeId: null,
      episodes: [],
      seasonOutline: '',
      seasonPlan: '',
      generatedForEpisodeCount: null,
      generationBatchId: null,
      generatedForBatchId: null,
    }));
  }, []);

  const handleViewEpisode = useCallback((id: number | null) => {
    setWizard((prev) => {
      const next = { ...prev, viewingEpisodeId: id };
      saveWizardState(next);
      return next;
    });
  }, []);

  const handleScriptUpdate = useCallback((episodeId: number, newScript: string) => {
    setWizard((prev) => {
      const next = {
        ...prev,
        episodes: prev.episodes.map((ep) =>
          ep.id === episodeId ? { ...ep, script: newScript } : ep
        ),
      };
      saveWizardState(next);
      return next;
    });
  }, []);

  const viewingEpisode =
    wizard.viewingEpisodeId != null
      ? wizard.episodes.find((ep) => ep.id === wizard.viewingEpisodeId) ?? null
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full"
        />
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Cast your season' },
    { num: 2, label: 'Brief the director' },
    { num: 3, label: 'Your season drops' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-brand text-2xl text-gray-900">Season Content</span>

            <div className="hidden md:flex items-center gap-1">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                      wizard.step === s.num
                        ? 'bg-black text-white font-medium'
                        : wizard.step > s.num
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      wizard.step === s.num ? 'bg-white text-black' : wizard.step > s.num ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {wizard.step > s.num ? '✓' : s.num}
                    </span>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-6 h-px ${wizard.step > s.num ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden md:block">
              Hey, {user?.firstName} 👋
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:border-gray-400 hover:text-gray-700 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {wizard.step === 1 && (
          <Step1
            initialData={wizard.step1Data ?? undefined}
            onComplete={handleStep1Complete}
          />
        )}

        {wizard.step === 2 && wizard.step1Data && wizard.conversationMessages.length > 0 && (
          <Step2
            step1Data={wizard.step1Data}
            messages={wizard.conversationMessages}
            onMessagesChange={handleMessagesChange}
            onBack={() => setWizard((prev) => ({ ...prev, step: 1 }))}
            onComplete={handleStep2Complete}
          />
        )}

        {wizard.step === 3 && wizard.step1Data && (
          <Step3
            step1Data={wizard.step1Data}
            companyContext={wizard.companyContext}
            episodes={wizard.episodes}
            seasonOutline={wizard.seasonOutline}
            seasonPlan={wizard.seasonPlan}
            generatedForEpisodeCount={wizard.generatedForEpisodeCount}
            generationBatchId={wizard.generationBatchId}
            generatedForBatchId={wizard.generatedForBatchId}
            onEpisodesChange={handleEpisodesChange}
            onViewEpisode={handleViewEpisode}
            onBack={handleStep3Back}
          />
        )}
      </main>

      {/* Modal lives outside Step3 so remounts never close it */}
      {wizard.step === 3 && (
        <ScriptModal
          episode={viewingEpisode}
          onClose={() => handleViewEpisode(null)}
          onScriptUpdate={handleScriptUpdate}
        />
      )}
    </div>
  );
}
