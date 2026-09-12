import type {
  CatalogItem,
  Assignment,
  AssignmentCandidate,
  AssignmentFilters,
  AssignmentFormValues,
  AssignmentPage,
  AssignmentQueryOptions,
  MemberFormValues,
  MemberFilters,
  MemberPage,
  MemberQueryOptions,
  MemberResponse,
  MetricsDashboard,
  Provider,
  ProviderFormValues,
  Squad,
  SquadFormValues,
  SquadStatus,
} from "@/lib/types";

export type MetricsDashboardFilters = {
  vendor_id?: string;
  professional_role_id?: string;
  assigned_squad_ids?: string[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function headers(): HeadersInit {
  const role = process.env.NEXT_PUBLIC_DEV_USER_ROLE;
  return {
    "Content-Type": "application/json",
    ...(role ? { "X-User-Role": role } : {}),
  };
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { headers: headers(), cache: "no-store" });
  if (!response.ok) {
    throw new ApiError(response.status, "No se pudo cargar la información");
  }
  return response.json() as Promise<T>;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers ?? {}) },
  });
  const body = response.status === 204 ? undefined : ((await response.json()) as T & { detail?: string | { msg?: string }[] });
  if (!response.ok) {
    const detail = Array.isArray(body?.detail) ? body.detail.map((item) => item.msg).filter(Boolean).join(". ") : body?.detail;
    throw new ApiError(response.status, detail ?? "No se pudo completar la operación");
  }
  return body as T;
}

export function getProfessionalRoles() {
  return get<CatalogItem[]>("/api/v1/catalogs/professional-roles");
}

export function getMetricsDashboard(year: number, quarter: number, filters: MetricsDashboardFilters = {}) {
  const params = new URLSearchParams({ year: String(year), quarter: String(quarter) });
  if (filters.vendor_id) params.set("vendor_id", filters.vendor_id);
  if (filters.professional_role_id) params.set("professional_role_id", filters.professional_role_id);
  filters.assigned_squad_ids?.forEach((squadId) => params.append("assigned_squad_id", squadId));
  return get<MetricsDashboard>(`/api/v1/metrics/dashboard?${params.toString()}`);
}

export function getVendors() {
  return get<CatalogItem[]>("/api/v1/catalogs/vendors");
}

export function getProviders(providerStatus: "active" | "inactive" | "all" = "all") {
  return get<Provider[]>(`/api/v1/providers?status=${providerStatus}`);
}

export function getProvider(id: string) {
  return get<Provider>(`/api/v1/providers/${id}`);
}

export function createProvider(values: ProviderFormValues) {
  return request<Provider>("/api/v1/providers", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateProvider(id: string, values: Partial<ProviderFormValues> & { is_active?: boolean }) {
  return request<Provider>(`/api/v1/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deactivateProvider(id: string) {
  return request<Provider>(`/api/v1/providers/${id}`, { method: "DELETE" });
}

export function getSquads(squadStatus: SquadStatus = "active") {
  return get<Squad[]>(`/api/v1/squads?status=${squadStatus}`);
}

export function getSquad(id: string) {
  return get<Squad>(`/api/v1/squads/${id}`);
}

export function createSquad(values: SquadFormValues) {
  return request<Squad>("/api/v1/squads", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateSquad(id: string, values: Partial<SquadFormValues> & { is_active?: boolean }) {
  return request<Squad>(`/api/v1/squads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deactivateSquad(id: string) {
  return request<Squad>(`/api/v1/squads/${id}`, { method: "DELETE" });
}

export function reactivateSquad(id: string) {
  return updateSquad(id, { is_active: true });
}

export function getMembers(filters: Partial<MemberFilters> = {}, options: MemberQueryOptions = {}) {
  const params = new URLSearchParams();
  params.set("status", filters.status ?? "active");
  if (filters.search) params.set("search", filters.search);
  if (filters.vendor_id) params.set("vendor_id", filters.vendor_id);
  if (filters.professional_role_id) params.set("professional_role_id", filters.professional_role_id);
  params.set("page", String(options.page ?? 1));
  params.set("page_size", String(options.page_size ?? 20));
  params.set("sort_by", options.sort_by ?? "member_full_name");
  params.set("sort_direction", options.sort_direction ?? "asc");
  return get<MemberPage>(`/api/v1/members?${params.toString()}`);
}

export function getMember(id: string) {
  return get<MemberResponse>(`/api/v1/members/${id}`);
}

export function createMember(values: MemberFormValues) {
  return request<MemberResponse>("/api/v1/members", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateMember(id: string, values: Partial<MemberFormValues> & { is_active?: boolean }) {
  return request<MemberResponse>(`/api/v1/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deactivateMember(id: string) {
  return request<MemberResponse>(`/api/v1/members/${id}`, { method: "DELETE" });
}

export function reactivateMember(id: string) {
  return updateMember(id, { is_active: true });
}

export function getAssignmentCandidates(search = "") {
  return get<AssignmentCandidate[]>(`/api/v1/assignments/candidates?search=${encodeURIComponent(search)}`);
}

export async function getAssignments(
  filters: Partial<AssignmentFilters> = {},
  options: AssignmentQueryOptions = {},
): Promise<AssignmentPage> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.vendor_id) params.set("vendor_id", filters.vendor_id);
  if (filters.professional_role_id) params.set("professional_role_id", filters.professional_role_id);
  if (filters.assigned_squad_id) params.set("assigned_squad_id", filters.assigned_squad_id);
  if (filters.start_date) params.set("start_date", filters.start_date);
  if (filters.end_date) params.set("end_date", filters.end_date);
  if (filters.member_resigned) params.set("member_resigned", filters.member_resigned);
  params.set("page", String(options.page ?? 1));
  params.set("page_size", String(options.page_size ?? 20));
  params.set("sort_by", options.sort_by ?? "start_date");
  params.set("sort_direction", options.sort_direction ?? "desc");
  const query = params.toString();
  const response = await get<AssignmentPage | Assignment[]>(`/api/v1/assignments${query ? `?${query}` : ""}`);
  if (Array.isArray(response)) {
    return { items: response, total: response.length, page: 1, page_size: response.length || 20, total_pages: response.length ? 1 : 0 };
  }
  return response;
}

export function getAssignment(id: string) {
  return get<Assignment>(`/api/v1/assignments/${id}`);
}

export function createAssignment(values: AssignmentFormValues) {
  return request<Assignment>("/api/v1/assignments", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateAssignment(id: string, values: Partial<Omit<AssignmentFormValues, "member_id">>) {
  return request<Assignment>(`/api/v1/assignments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deleteAssignment(id: string) {
  return request<void>(`/api/v1/assignments/${id}`, { method: "DELETE" });
}
