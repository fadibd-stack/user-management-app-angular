export interface Organization {
  id: number;
  name: string;
  domain: string;
  sitecode?: string;
  local_name?: string;
  workday_name?: string;
  edition_id?: number;
  country_id?: number;
  country_name?: string;
  deployment_mode?: string;
  timezone: string;
  subdomain?: string;
  status: string;
  settings_json?: string;
  go_live_date?: string;
  version?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrganizationCreate {
  name: string;
  domain: string;
  sitecode?: string;
  local_name?: string;
  workday_name?: string;
  edition_id?: number;
  country_id?: number;
  deployment_mode?: string;
  timezone?: string;
  subdomain?: string;
  status?: string;
  settings_json?: string;
  go_live_date?: string;
  version?: string;
}

export interface OrganizationUpdate {
  name?: string;
  domain?: string;
  sitecode?: string;
  local_name?: string;
  workday_name?: string;
  edition_id?: number;
  country_id?: number;
  deployment_mode?: string;
  timezone?: string;
  subdomain?: string;
  status?: string;
  settings_json?: string;
  go_live_date?: string;
  version?: string;
}
