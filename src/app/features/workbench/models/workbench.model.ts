export interface WorkbenchRequest {
  username: string;
  release: string;
  edition: string;
  site?: string;
  adhockey?: string;
  lang: string;
}

export interface WorkbenchIssue {
  id: string;
  key: string;
  type: string;
  summary: string;
  impactscorepriority: string;
  impactscoreclinicalrisk: string;
  impactscoreobligatorychange: string;
  impactscorefunctionusage: string;
  impactscorecomplexity: string;
  impactscorenetworkRisk: string;
  locked?: boolean;
  AIData?: string;
  LinkedIssues?: LinkedIssue[];
  ProductMappings?: ProductMapping[];
}

export interface LinkedIssue {
  reference: string;
  summary: string;
  url: string;
}

export interface ProductMapping {
  Product: string;
  Area: string;
  Function: string;
}

export interface WorkbenchResponse {
  data: WorkbenchIssue[];
}

export interface ImpactThresholds {
  high_threshold: number;
  medium_threshold: number;
}
