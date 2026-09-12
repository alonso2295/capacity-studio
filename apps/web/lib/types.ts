export type CatalogItem = {
  id: string;
  name: string;
};

export type Provider = {
  id: string;
  name: string;
  ruc: string;
  focal_point: string;
  mobile: string | null;
  is_active: boolean;
};

export type ProviderFormValues = {
  name: string;
  ruc: string;
  focal_point: string;
  mobile?: string;
};

export type Squad = {
  id: string;
  code: string;
  name: string;
  tribe: string | null;
  product_owner_name: string | null;
  is_active: boolean;
};

export type SquadFormValues = {
  code: string;
  name: string;
  tribe?: string;
  product_owner_name?: string;
};

export type SquadStatus = "active" | "inactive" | "all";

export type MemberFormValues = {
  dni: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname?: string;
  email: string;
  mobile?: string;
  birth_date: string;
  employment_type: "PLANILLA" | "TERCERIZADO";
  vendor_id?: string;
  vendor_name?: string | null;
  professional_role_id: string;
  professional_role_name?: string;
  seniority: "MEDIUM" | "SENIOR";
};

export type MemberResponse = MemberFormValues & {
  id: string;
  is_active: boolean;
  affiliations: MemberVendorAffiliation[];
};

export type MemberVendorAffiliation = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  valid_from: string;
  valid_until: string | null;
};

export type MemberStatus = "active" | "inactive" | "all";

export type MemberSortBy =
  | "member_full_name"
  | "dni"
  | "employment_type"
  | "vendor_name"
  | "professional_role_name"
  | "seniority"
  | "is_active";

export type MemberSortDirection = "asc" | "desc";

export type MemberFilters = {
  search: string;
  vendor_id: string;
  professional_role_id: string;
  status: MemberStatus;
};

export type MemberPage = {
  items: MemberResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type MemberQueryOptions = {
  page?: number;
  page_size?: number;
  sort_by?: MemberSortBy;
  sort_direction?: MemberSortDirection;
};

export type AssignmentCandidate = {
  id: string;
  dni: string;
  full_name: string;
  vendor_id: string | null;
  vendor_name: string | null;
  professional_role_id: string;
  professional_role_name: string;
  seniority: "MEDIUM" | "SENIOR";
};

export type Assignment = {
  id: string;
  member_id: string;
  member_dni: string;
  member_full_name: string;
  vendor_id: string | null;
  vendor_name: string | null;
  member_resigned: boolean;
  professional_role_id: string;
  professional_role_name: string;
  seniority: "MEDIUM" | "SENIOR";
  assigned_squad_id: string;
  assigned_squad_code: string;
  assigned_squad_name: string;
  executor_squad_id: string;
  executor_squad_code: string;
  executor_squad_name: string;
  project_code: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
};

export type AssignmentSortBy =
  | "member_full_name"
  | "member_dni"
  | "vendor_name"
  | "member_resigned"
  | "professional_role_name"
  | "assigned_squad_name"
  | "executor_squad_name"
  | "project_code"
  | "start_date"
  | "end_date"
  | "allocation_percentage";

export type AssignmentSortDirection = "asc" | "desc";

export type AssignmentPage = {
  items: Assignment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type AssignmentQueryOptions = {
  page?: number;
  page_size?: number;
  sort_by?: AssignmentSortBy;
  sort_direction?: AssignmentSortDirection;
};

export type AssignmentFormValues = {
  member_id: string;
  assigned_squad_id: string;
  executor_squad_id: string;
  member_resigned: boolean;
  project_code: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
};

export type AssignmentFilters = {
  search: string;
  vendor_id: string;
  professional_role_id: string;
  assigned_squad_id: string;
  start_date: string;
  end_date: string;
  member_resigned: string;
};

export type AssignmentView = "table" | "cards";

export type MetricsPeriod = {
  year: number;
  quarter: number;
  start_date: string;
  end_date: string;
};

export type MetricsKpis = {
  total_squads: number;
  assigned_members: number;
  unassigned_active_members: number;
  resigned_members: number;
};

export type MetricsRoleCount = {
  role_id: string;
  role_name: string;
  member_count: number;
};

export type MetricsExecutorSquad = {
  squad_id: string;
  squad_name: string;
  roles: MetricsRoleCount[];
};

export type MetricsVendorRoleCount = {
  vendor_id: string | null;
  vendor_name: string;
  professional_role_id: string;
  professional_role_name: string;
  member_count: number;
};

export type MetricsUnassignedMember = {
  id: string;
  full_name: string;
  dni: string;
};

export type MetricsAssignmentCard = {
  id: string;
  member_full_name: string;
  professional_role_name: string;
  vendor_id: string | null;
  vendor_name: string;
  project_code: string;
  allocation_percentage: number;
  assigned_squad_id: string;
  assigned_squad_name: string;
  executor_squad_id: string;
  executor_squad_name: string;
};

export type MetricsAssignmentFilterOptions = {
  providers: CatalogItem[];
  roles: CatalogItem[];
  squads: CatalogItem[];
};

export type MetricsDashboard = {
  period: MetricsPeriod;
  kpis: MetricsKpis;
  role_distribution_by_executor_squad: MetricsExecutorSquad[];
  unassigned_members: MetricsUnassignedMember[];
  members_by_vendor_and_role: MetricsVendorRoleCount[];
  assignment_filter_options: MetricsAssignmentFilterOptions;
  assignment_cards: MetricsAssignmentCard[];
};
