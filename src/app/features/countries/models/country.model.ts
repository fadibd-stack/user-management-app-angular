export interface Country {
  id: number;
  code: string;
  name: string;
  region?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CountryCreate {
  code: string;
  name: string;
  region?: string;
  is_active?: boolean;
}

export interface CountryUpdate {
  code?: string;
  name?: string;
  region?: string;
  is_active?: boolean;
}
