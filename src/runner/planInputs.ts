/**
 * MR-B — Composite loader for version-plan inputs (READ-ONLY).
 *
 * Loads the three read-only inputs the interpreter/preview need for a version:
 *   1. the immutable Version (destination, profiles, metric_slugs, display),
 *   2. the ordered ScenarioSummary[] (no payloads — summaries only),
 *   3. the catalog Metric[] metadata for the version's destination+profiles
 *      (the authoritative `selectable`/`reason` used for classification).
 *
 * Returns a single discriminated ApiResult so screens get one error to route.
 * The catalog metric metadata is fetched for the version's exact destination +
 * profile slugs, so `selectable`/`reason` reflect this version's context.
 *
 * Honest boundary: full per-scenario payloads are NOT loaded (out of MR-B read
 * scope). Classification therefore happens at the version-metric level.
 */

import {getMetrics} from '../catalog/catalogApi';
import {Metric} from '../catalog/types';
import {listScenarios} from '../testCases/scenariosApi';
import {getVersion} from '../testCases/versionsApi';
import {ScenarioSummary, Version} from '../testCases/types';
import {ApiResult} from '../backend/types';

export interface VersionPlanInputs {
  version: Version;
  scenarios: ScenarioSummary[];
  /** Catalog metric metadata for the version's destination + profiles. */
  metrics: Metric[];
}

/**
 * Fetch version + scenarios + catalog metric metadata. Sequenced so the metric
 * query uses the version's real destination/profile slugs. Any sub-failure
 * short-circuits with that typed error (no partial fabrication).
 */
export async function loadVersionPlanInputs(
  testCaseId: string,
  versionId: string,
): Promise<ApiResult<VersionPlanInputs>> {
  const versionRes = await getVersion(testCaseId, versionId);
  if (!versionRes.ok) {
    return versionRes;
  }
  const version = versionRes.data.version;

  const scenariosRes = await listScenarios(testCaseId, versionId);
  if (!scenariosRes.ok) {
    return scenariosRes;
  }

  const metricsRes = await getMetrics(
    version.destination_slug,
    version.profile_slugs,
  );
  if (!metricsRes.ok) {
    return metricsRes;
  }

  return {
    ok: true,
    data: {
      version,
      scenarios: scenariosRes.data.scenarios,
      metrics: metricsRes.data.metrics,
    },
  };
}

/** Order scenarios by `order_index` asc; undefined indexes sort last, stable. */
export function orderScenarios(scenarios: ScenarioSummary[]): ScenarioSummary[] {
  return [...scenarios]
    .map((s, i) => ({s, i}))
    .sort((a, b) => {
      const ai = a.s.order_index;
      const bi = b.s.order_index;
      if (ai === undefined && bi === undefined) {
        return a.i - b.i;
      }
      if (ai === undefined) {
        return 1;
      }
      if (bi === undefined) {
        return -1;
      }
      if (ai !== bi) {
        return ai - bi;
      }
      return a.i - b.i;
    })
    .map(x => x.s);
}
