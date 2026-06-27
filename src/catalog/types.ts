/**
 * MR-B — Catalog read-model types (destinations, profiles, metrics).
 *
 * Mirrors the VERIFIED MWDS catalog read routes exactly. READ-ONLY: the catalog
 * is owned upstream (MWDS Web App). Nothing here authors or mutates the catalog.
 *
 * Metric metadata (`selectable`, `reason`, `data_shape`, …) is the
 * authoritative input the MR-B interpreter uses to classify version metrics per
 * platform — the runner never re-decides supportability on its own.
 */

/** Destination platform discriminator. */
export type DestinationPlatform = 'apple_health' | 'health_connect' | string;

export interface Destination {
  slug: string;
  display_name: string;
  /** e.g. "apple_health" (iOS · Apple Health) or "health_connect" (Android). */
  platform: DestinationPlatform;
  description?: string;
  is_active: boolean;
}

export interface Profile {
  slug: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  /** Whether this profile is compatible with the queried destination. */
  compatible: boolean;
  support_reason?: string;
}

/** Why a metric is/ isn't selectable on the queried destination+profiles. */
export type MetricReason =
  | ''
  | 'destination_not_supported'
  | 'profile_not_supported'
  | 'inactive_metric'
  | 'no_selected_profile_supports_metric';

export interface Metric {
  slug: string;
  display_name: string;
  unit: string;
  value_type: string;
  category: string;
  data_shape: string;
  derived: boolean;
  vendor_specific: boolean;
  synthetic_supported: boolean;
  is_active: boolean;
  /** Authoritative: whether this metric is selectable for the query context. */
  selectable: boolean;
  reason: MetricReason;
  supporting_profile_slugs: string[];
}

export interface DestinationListResponse {
  destinations: Destination[];
}

export interface ProfileListResponse {
  profiles: Profile[];
}

export interface MetricListResponse {
  metrics: Metric[];
}
