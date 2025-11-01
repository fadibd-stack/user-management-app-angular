export interface WorkbenchRequest {
  username: string;
  release: string;
  edition: string;
  site?: string;
  adhockey?: string;
  lang?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  type: string;
  summary: string;
  priority: string;
  locked?: boolean;
  AIData?: string;
  impactscorepriority?: number;
  impactscoreclinicalrisk?: number;
  impactscoreobligatorychange?: number;
  impactscorefunctionusage?: number;
  impactscorecomplexity?: number;
  impactscorenetworkRisk?: number;
  ProductMappings?: ProductMapping[];
  LinkedIssues?: LinkedIssue[];
}

export interface ProductMapping {
  product: string;
  area: string;
  function: string;
}

export interface LinkedIssue {
  key: string;
  type: string;
}

export interface ImpactScoreConfig {
  high_threshold: number;
  medium_threshold: number;
}

export type ImpactLevel = 'High' | 'Medium' | 'Low';
