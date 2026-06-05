import { generateSeasonScripts } from "@/lib/generator";
import type { GenerateRequest } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const seasonTopic = body.seasonTopic?.trim();
    const episodeCount = Number(body.episodeCount);

    if (!seasonTopic) {
      return NextResponse.json(
        { error: "Season topic is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(episodeCount) || episodeCount < 1 || episodeCount > 20) {
      return NextResponse.json(
        { error: "Episode count must be an integer between 1 and 20" },
        { status: 400 }
      );
    }

    const result = await generateSeasonScripts({ seasonTopic, episodeCount });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
