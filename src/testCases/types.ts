/**
 * MR-B — Test case + version + scenario read-model types.
 *
 * These mirror the VERIFIED MWDS read routes exactly. They are READ-ONLY:
 * there is no field for authoring/mutation here, and no client method anywhere
 * in MR-B creates/updates/deletes/archives/duplicates/uploads/reorders/seeds.
 *
 * Scenario-payload boundary (honest): the MR-B read routes expose scenario
 * SUMMARIES + version metric_slugs + catalog metric metadata, but NOT full
 * per-scenario payloads (those are only available via out-of-scope
 * template/download/upload). MR-B therefore operates at the version-metric
 * level; per-scenario per-operation detail is deferred to MR-C.
 */

/** A {slug, display_name} pair as returned in version `display` blocks. */
export interface SlugName {
  slug: string;
  display_name: string;
}

/** Status of a test case. */
export type TestCaseStatus = 'active' | 'archived';

/** A backend test case (list/detail row). */
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  status: TestCaseStatus;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

/** Pagination block from the list endpoint. */
export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

/** Response of GET /api/v1/test-cases. */
export interface TestCaseListResponse {
  data: TestCase[];
  pagination: Pagination;
}

/** Response of GET /api/v1/test-cases/{id}. */
export interface TestCaseDetailResponse {
  test_case: TestCase;
}

/** Status of a version. */
export type VersionStatus = 'active' | 'superseded';

/** A frozen, immutable test-case version. */
export interface Version {
  id: string;
  test_case_id: string;
  destination_slug: string;
  profile_slugs: string[];
  metric_slugs: string[];
  catalog_revision_hash: string;
  display: {
    destination: SlugName;
    profiles: SlugName[];
    metrics: SlugName[];
  };
  status: VersionStatus;
  version_number: number;
  change_reason?: string;
  parent_version_id?: string;
  scenario_count: number;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

/** Response of GET /api/v1/test-cases/{id}/versions. */
export interface VersionListResponse {
  versions: Version[];
}

/** Response of GET /api/v1/test-cases/{id}/versions/{version_id}. */
export interface VersionDetailResponse {
  version: Version;
}

/** Per-scenario validation status. */
export type ScenarioValidationStatus = 'valid' | 'invalid';

/** A scenario SUMMARY (no payload — payload is out of MR-B read scope). */
export interface ScenarioSummary {
  scenario_slug: string;
  scenario_name: string;
  validation_status: ScenarioValidationStatus;
  order_index?: number;
  file_name: string;
  uploaded_at: string;
}

/** Response of GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios. */
export interface ScenarioListResponse {
  scenarios: ScenarioSummary[];
}
