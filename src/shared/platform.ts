/**
 * MR-B — Destination → platform terminology mapping (load-bearing).
 *
 * Terminology guard (R-MWR-010): destination `apple_health` is iOS · Apple
 * Health · HealthKit; `health_connect` is Android · Health Connect. NEVER
 * "Google HealthKit" / Google Fit. This is the single source of these labels
 * for MR-B screens and the dry-run planner.
 */

export interface PlatformTarget {
  /** Device OS label. */
  device: 'iOS' | 'Android' | 'Unknown';
  /** Destination (health store) label. */
  destination: string;
  /** Platform API label. */
  api: string;
  /** Compact target label, e.g. "iOS · Apple Health". */
  label: string;
}

export function platformForDestination(destinationSlug: string): PlatformTarget {
  switch (destinationSlug) {
    case 'apple_health':
      return {
        device: 'iOS',
        destination: 'Apple Health',
        api: 'HealthKit',
        label: 'iOS · Apple Health',
      };
    case 'health_connect':
      return {
        device: 'Android',
        destination: 'Health Connect',
        api: 'Health Connect',
        label: 'Android · Health Connect',
      };
    default:
      return {
        device: 'Unknown',
        destination: destinationSlug,
        api: destinationSlug,
        label: destinationSlug,
      };
  }
}
