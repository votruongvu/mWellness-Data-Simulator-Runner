/**
 * MR-C — F8 runnable-payload read API (READ-ONLY).
 *
 * Verified route only:
 *   GET /api/v1/test-cases/{id}/versions/{version_id}/runnable-payload
 *
 * Returns the version-level OPERATION-LEVEL runnable payload (concrete value,
 * unit, time model, idempotency key, metric/destination/profile provenance per
 * operation). This is the preferred MR-C / native-readiness input.
 *
 * No authoring/mutation method exists here, by design. On failure the shared
 * apiClient returns a typed ApiError (Bearer auth, body error envelope,
 * x-request-id correlation); nothing here fabricates a payload.
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';
import {RunnablePayload} from './runnablePayloadTypes';

/** Fetch the concrete F8 runnable payload for a version. Read-only. */
export function getRunnablePayload(
  testCaseId: string,
  versionId: string,
): Promise<ApiResult<RunnablePayload>> {
  return apiRequest<RunnablePayload>({
    method: 'GET',
    path: `/api/v1/test-cases/${encodeURIComponent(
      testCaseId,
    )}/versions/${encodeURIComponent(versionId)}/runnable-payload`,
    authenticated: true,
  });
}
