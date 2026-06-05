export interface EpisodeOutline {
  episodeNumber: number;
  title: string;
  topic: string;
  plotBeat: string;
  cliffhangerSeed: string;
  gnomiMoment: string;
}

export interface SeasonSyllabus {
  seasonTitle: string;
  seasonArc: string;
  episodes: EpisodeOutline[];
}

export interface EpisodeScript {
  episodeNumber: number;
  title: string;
  scene: string;
  faceCam: string;
  cliffhanger: string;
  fullScript: string;
}

export interface GenerateRequest {
  seasonTopic: string;
  episodeCount: number;
}

export interface GenerateResponse {
  syllabus: SeasonSyllabus;
  scripts: EpisodeScript[];
}
