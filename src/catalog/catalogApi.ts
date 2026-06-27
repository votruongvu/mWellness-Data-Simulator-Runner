/**
 * MR-B — Catalog read API (READ-ONLY).
 *
 * Verified routes only:
 *   GET /api/v1/catalog/destinations
 *   GET /api/v1/catalog/profiles?destination_slug=SLUG
 *   GET /api/v1/catalog/metrics?destination_slug=SLUG&profile_slugs=csv
 *
 * No catalog mutation methods exist here, by design. On failure the client
 * returns a typed ApiError; nothing fabricates catalog data.
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';
import {
  DestinationListResponse,
  MetricListResponse,
  ProfileListResponse,
} from './types';

/** List destinations (iOS · Apple Health, Android · Health Connect, …). */
export function getDestinations(): Promise<ApiResult<DestinationListResponse>> {
  return apiRequest<DestinationListResponse>({
    method: 'GET',
    path: '/api/v1/catalog/destinations',
    authenticated: true,
  });
}

/** List profiles (device/source profiles) compatible with a destination. */
export function getProfiles(
  destinationSlug: string,
): Promise<ApiResult<ProfileListResponse>> {
  return apiRequest<ProfileListResponse>({
    method: 'GET',
    path: '/api/v1/catalog/profiles',
    authenticated: true,
    query: {destination_slug: destinationSlug},
  });
}

/**
 * List metric metadata for a destination + selected profiles. The profile slugs
 * are joined as a CSV per the verified contract. This metadata
 * (`selectable`/`reason`) is the authoritative input for plan classification.
 */
export function getMetrics(
  destinationSlug: string,
  profileSlugs: string[],
): Promise<ApiResult<MetricListResponse>> {
  return apiRequest<MetricListResponse>({
    method: 'GET',
    path: '/api/v1/catalog/metrics',
    authenticated: true,
    query: {
      destination_slug: destinationSlug,
      profile_slugs: profileSlugs.join(','),
    },
  });
}
