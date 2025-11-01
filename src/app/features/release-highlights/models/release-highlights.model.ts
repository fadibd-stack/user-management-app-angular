export interface ReleaseHighlightsRequest {
  release: string;
  edition: string;
  generator: string;
  lang: string;
  format: string;
  fixededition?: string;
  jql?: string;
}

export interface ReleaseHighlightsResponse {
  data: string;
}
