/**
 * MR-B — Version read API (READ-ONLY).
 *
 * Verified routes only:
 *   GET /api/v1/test-cases/{id}/versions
 *   GET /api/v1/test-cases/{id}/versions/{version_id}
 *
 * Versions are IMMUTABLE and authored upstream. No version-create / reorder /
 * mutate method exists here, by design.
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';
import {VersionDetailResponse, VersionListResponse} from './types';

/** List all versions for a test case (current + superseded). Read-only. */
export function listVersions(
  testCaseId: string,
): Promise<ApiResult<VersionListResponse>> {
  return apiRequest<VersionListResponse>({
    method: 'GET',
    path: `/api/v1/test-cases/${encodeURIComponent(testCaseId)}/versions`,
    authenticated: true,
  });
}

/** Fetch a single immutable version. Read-only. */
export function getVersion(
  testCaseId: string,
  versionId: string,
): Promise<ApiResult<VersionDetailResponse>> {
  return apiRequest<VersionDetailResponse>({
    method: 'GET',
    path: `/api/v1/test-cases/${encodeURIComponent(
      testCaseId,
    )}/versions/${encodeURIComponent(versionId)}`,
    authenticated: true,
  });
}
