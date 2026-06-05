import { chatCompletion } from "./openai";
import { buildEpisodeScriptPrompt, buildSyllabusPrompt } from "./prompts";
import type {
  EpisodeOutline,
  EpisodeScript,
  GenerateRequest,
  GenerateResponse,
  SeasonSyllabus,
} from "./types";

function parseScriptSections(content: string): Pick<EpisodeScript, "scene" | "faceCam" | "cliffhanger" | "fullScript"> {
  const extract = (header: string, nextHeader?: string) => {
    const pattern = nextHeader
      ? new RegExp(`## ${header}\\s*([\\s\\S]*?)(?=## ${nextHeader}|$)`, "i")
      : new RegExp(`## ${header}\\s*([\\s\\S]*?)$`, "i");
    const match = content.match(pattern);
    return match?.[1]?.trim() ?? "";
  };

  const scene = extract("SCENE", "FACE-CAM");
  const faceCam = extract("FACE-CAM", "CLIFFHANGER");
  const cliffhanger = extract("CLIFFHANGER", "FULL SCRIPT");
  const fullScript = extract("FULL SCRIPT") || content.trim();

  return { scene, faceCam, cliffhanger, fullScript };
}

function buildPreviousEpisodesContext(scripts: EpisodeScript[]): string {
  return scripts
    .map(
      (script) =>
        `Episode ${script.episodeNumber} ("${script.title}"):
- Cliffhanger: ${script.cliffhanger}
- Key moment: ${script.faceCam}`
    )
    .join("\n\n");
}

async function generateSyllabus(
  seasonTopic: string,
  episodeCount: number
): Promise<SeasonSyllabus> {
  const content = await chatCompletion(
    [
      {
        role: "system",
        content:
          "You are a TV showrunner. Return only valid JSON matching the requested schema.",
      },
      { role: "user", content: buildSyllabusPrompt(seasonTopic, episodeCount) },
    ],
    { jsonMode: true }
  );

  const parsed = JSON.parse(content) as SeasonSyllabus;

  if (!parsed.episodes || parsed.episodes.length !== episodeCount) {
    throw new Error(
      `Syllabus generation returned ${parsed.episodes?.length ?? 0} episodes, expected ${episodeCount}`
    );
  }

  return {
    ...parsed,
    episodes: parsed.episodes.map((ep, index) => ({
      ...ep,
      episodeNumber: index + 1,
    })),
  };
}

async function generateEpisodeScript(params: {
  seasonTopic: string;
  episodeCount: number;
  seasonArc: string;
  outline: EpisodeOutline;
  previousScripts: EpisodeScript[];
}): Promise<EpisodeScript> {
  const { seasonTopic, episodeCount, seasonArc, outline, previousScripts } = params;

  const content = await chatCompletion([
    {
      role: "system",
      content: `You write short-form finance drama scripts. You are writing episode ${outline.episodeNumber} of ${episodeCount} — this must be unique and distinct from other episodes while staying continuous with the season arc.`,
    },
    {
      role: "user",
      content: buildEpisodeScriptPrompt({
        seasonTopic,
        episodeCount,
        seasonArc,
        outline,
        previousEpisodesContext: buildPreviousEpisodesContext(previousScripts),
      }),
    },
  ]);

  const sections = parseScriptSections(content);

  return {
    episodeNumber: outline.episodeNumber,
    title: outline.title,
    ...sections,
  };
}

export async function generateSeasonScripts(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const { seasonTopic, episodeCount } = request;

  if (episodeCount < 1 || episodeCount > 20) {
    throw new Error("Episode count must be between 1 and 20");
  }

  const syllabus = await generateSyllabus(seasonTopic, episodeCount);

  const scripts: EpisodeScript[] = [];

  for (const outline of syllabus.episodes) {
    const script = await generateEpisodeScript({
      seasonTopic,
      episodeCount,
      seasonArc: syllabus.seasonArc,
      outline,
      previousScripts: scripts,
    });
    scripts.push(script);
  }

  return { syllabus, scripts };
}
