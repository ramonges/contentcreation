"use client";

import { useState } from "react";
import type { EpisodeScript, GenerateResponse, SeasonSyllabus } from "@/lib/types";

const EPISODE_OPTIONS = [1, 3, 5, 10] as const;

export default function Home() {
  const [seasonTopic, setSeasonTopic] = useState("Earnings season on the trading desk");
  const [episodeCount, setEpisodeCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState<SeasonSyllabus | null>(null);
  const [scripts, setScripts] = useState<EpisodeScript[]>([]);
  const [activeEpisode, setActiveEpisode] = useState(1);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSyllabus(null);
    setScripts([]);
    setActiveEpisode(1);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonTopic, episodeCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate scripts");
      }

      const result = data as GenerateResponse;
      setSyllabus(result.syllabus);
      setScripts(result.scripts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const activeScript = scripts.find((s) => s.episodeNumber === activeEpisode);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
            Gnomi Content Studio
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Short Drama Episode Generator
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Generate a linked season syllabus and distinct scripts for each episode.
            Every episode continues the last cliffhanger and escalates the arc.
          </p>
        </header>

        <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Season topic
              </span>
              <input
                type="text"
                value={seasonTopic}
                onChange={(e) => setSeasonTopic(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none ring-emerald-500/0 transition focus:ring-2"
                placeholder="e.g. Fed day, earnings miss, sector rotation"
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                Episodes in season
              </span>
              <div className="flex flex-wrap gap-2">
                {EPISODE_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setEpisodeCount(count)}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                      episodeCount === count
                        ? "bg-emerald-500 text-black"
                        : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {count} episode{count > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Each count generates a unique syllabus with that many linked episodes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !seasonTopic.trim()}
            className="mt-6 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? `Generating ${episodeCount} episode scripts…` : "Generate season"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>

        {syllabus && (
          <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-1 text-xl font-semibold">{syllabus.seasonTitle}</h2>
            <p className="mb-6 text-sm text-zinc-400">{syllabus.seasonArc}</p>

            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Season syllabus ({syllabus.episodes.length} episodes)
            </h3>
            <div className="space-y-3">
              {syllabus.episodes.map((ep) => (
                <div
                  key={ep.episodeNumber}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                      EP {ep.episodeNumber}
                    </span>
                    <span className="font-medium">{ep.title}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{ep.plotBeat}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Cliffhanger → {ep.cliffhangerSeed}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {scripts.length > 0 && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-6 flex flex-wrap gap-2">
              {scripts.map((script) => (
                <button
                  key={script.episodeNumber}
                  type="button"
                  onClick={() => setActiveEpisode(script.episodeNumber)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeEpisode === script.episodeNumber
                      ? "bg-emerald-500 text-black"
                      : "border border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  Episode {script.episodeNumber}
                </button>
              ))}
            </div>

            {activeScript && (
              <div>
                <h2 className="mb-6 text-2xl font-semibold">
                  Episode {activeScript.episodeNumber}: {activeScript.title}
                </h2>

                <ScriptBlock title="Scene" content={activeScript.scene} />
                <ScriptBlock title="Face-cam confession" content={activeScript.faceCam} highlight />
                <ScriptBlock title="Cliffhanger" content={activeScript.cliffhanger} />

                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-zinc-400">
                    Full script
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-300">
                    {activeScript.fullScript}
                  </pre>
                </details>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function ScriptBlock({
  title,
  content,
  highlight = false,
}: {
  title: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`mb-4 rounded-lg border p-4 ${
        highlight
          ? "border-emerald-800/50 bg-emerald-950/20"
          : "border-zinc-800 bg-zinc-950/80"
      }`}
    >
      <h3
        className={`mb-2 text-xs font-medium uppercase tracking-wider ${
          highlight ? "text-emerald-400" : "text-zinc-500"
        }`}
      >
        {title}
      </h3>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
        {content}
      </pre>
    </div>
  );
}
