/**
 * MR-B — Test case read API (READ-ONLY).
 *
 * Verified routes only:
 *   GET /api/v1/test-cases?page&page_size&q&status&sort&order
 *   GET /api/v1/test-cases/{id}
 *
 * NO create/update/delete/archive/duplicate methods exist here, by design.
 * On no-backend / transport failure the client returns BACKEND_UNAVAILABLE;
 * nothing here fabricates data on failure (NO_FAKE_SUCCESS / BACKEND_API_GATE).
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';
import {
  TestCaseDetailResponse,
  TestCaseListResponse,
  TestCaseStatus,
} from './types';

/** Query params for the test-case list (all optional — backend defaults apply). */
export interface ListTestCasesParams {
  page?: number;
  page_size?: number;
  /** Free-text search. */
  q?: string;
  status?: TestCaseStatus;
  sort?: string;
  order?: 'asc' | 'desc';
}

/** List backend test cases (paginated). Read-only. */
export function listTestCases(
  params: ListTestCasesParams = {},
): Promise<ApiResult<TestCaseListResponse>> {
  return apiRequest<TestCaseListResponse>({
    method: 'GET',
    path: '/api/v1/test-cases',
    authenticated: true,
    query: {
      page: params.page,
      page_size: params.page_size,
      q: params.q,
      status: params.status,
      sort: params.sort,
      order: params.order,
    },
  });
}

/** Fetch a single test case by id. Read-only. */
export function getTestCase(
  id: string,
): Promise<ApiResult<TestCaseDetailResponse>> {
  return apiRequest<TestCaseDetailResponse>({
    method: 'GET',
    path: `/api/v1/test-cases/${encodeURIComponent(id)}`,
    authenticated: true,
  });
}
