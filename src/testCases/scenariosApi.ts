/**
 * MR-B — Scenario read API (READ-ONLY, summaries only).
 *
 * Verified route only:
 *   GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios
 *
 * Returns scenario SUMMARIES (slug, name, validation_status, order_index,
 * file_name, uploaded_at) — NOT full per-scenario payloads. Payload download /
 * upload / template / reorder routes are out of scope and have no client method
 * here. The ordered scenario list drives the version-metric-level plan grouping.
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';
import {ScenarioListResponse} from './types';

/** List ordered scenario summaries for a version. Read-only. */
export function listScenarios(
  testCaseId: string,
  versionId: string,
): Promise<ApiResult<ScenarioListResponse>> {
  return apiRequest<ScenarioListResponse>({
    method: 'GET',
    path: `/api/v1/test-cases/${encodeURIComponent(
      testCaseId,
    )}/versions/${encodeURIComponent(versionId)}/scenarios`,
    authenticated: true,
  });
}
