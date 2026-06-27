/**
 * MR-B — Scenario interpreter (PURE, DETERMINISTIC).
 *
 * Input : a Version + its ScenarioSummary[] + the catalog Metric[] metadata for
 *         the version's destination+profiles.
 * Output: an ExecutionPlan classifying each version metric per the destination
 *         platform, grouped by ordered scenarios.
 *
 * Determinism rules (load-bearing):
 *  - NO Date.now / randomness / network / native calls. The same inputs always
 *    produce the same plan (replay-safe).
 *  - Classification uses ONLY the catalog's authoritative `selectable`/`reason`.
 *    The runner never re-decides platform supportability on its own.
 *  - NO fabricated per-segment operation values or timestamps. Operations are at
 *    the version-metric level; payload detail is deferred to MR-C.
 *  - An invalid scenario marks its operations `invalid` (SCENARIO_INVALID) — the
 *    scenario is surfaced, never silently dropped.
 *  - A metric missing from the catalog context is `skipped`
 *    (METRIC_METADATA_MISSING) and surfaced — never silently ignored.
 *  - `permission_missing` is NEVER emitted here (capability/permission is MR-D).
 */

import {Metric, MetricReason} from '../catalog/types';
import {platformForDestination} from '../shared/platform';
import {ScenarioSummary, Version} from '../testCases/types';
import {orderScenarios} from './planInputs';
import {
  ExecutionPlan,
  emptyTotals,
  OperationStatus,
  PlanOperation,
  PlanScenarioGroup,
  PlanTotals,
  ReasonCode,
} from './executionPlan';

const BOUNDARY_NOTE =
  'Metric-level plan. Per-scenario per-operation payload detail ' +
  '(values, timestamps, segments) is not in MR-B read scope and is deferred ' +
  'to MR-C. Operation counts are metric-level estimates, not asserted writes. ' +
  'Capability and permission checks are deferred to MR-D.';

/** Map a catalog metric's reason to a stable plan reason code. */
function reasonForUnsupported(reason: MetricReason): ReasonCode {
  switch (reason) {
    case 'destination_not_supported':
      return 'METRIC_NOT_WRITABLE_ON_PLATFORM';
    case 'inactive_metric':
      return 'METRIC_INACTIVE';
    case 'profile_not_supported':
      return 'PROFILE_NOT_SUPPORTED';
    case 'no_selected_profile_supports_metric':
      return 'NO_PROFILE_SUPPORTS_METRIC';
    default:
      // Non-empty selectable=false with no recognized reason still surfaces.
      return 'METRIC_NOT_WRITABLE_ON_PLATFORM';
  }
}

/** Classify a single version metric against catalog metadata for a scenario. */
function classifyMetric(
  metricName: string,
  meta: Metric | undefined,
  scenarioInvalid: boolean,
): {status: OperationStatus; reasonCode: ReasonCode; detail: string} {
  // An invalid scenario dominates: every metric under it is invalid.
  if (scenarioInvalid) {
    return {
      status: 'invalid',
      reasonCode: 'SCENARIO_INVALID',
      detail:
        'Owning scenario is marked invalid by backend validation; it would not run.',
    };
  }
  // Metadata absent for this destination+profile context -> surfaced skip.
  if (!meta) {
    return {
      status: 'skipped',
      reasonCode: 'METRIC_METADATA_MISSING',
      detail:
        'No catalog metric metadata for this destination/profile context; surfaced, not silently ignored.',
    };
  }
  if (meta.selectable) {
    return {
      status: 'writable',
      reasonCode: 'OK',
      detail: `Catalog marks ${metricName} selectable for this destination and profiles.`,
    };
  }
  const reasonCode = reasonForUnsupported(meta.reason);
  return {
    status: 'unsupported',
    reasonCode,
    detail: `Catalog marks ${metricName} not selectable (${meta.reason || 'unsupported'}).`,
  };
}

/**
 * Build the execution plan. Pure: deterministic for fixed inputs.
 *
 * Every (scenario, version-metric) pair becomes one PlanOperation. Scenarios are
 * emitted in backend order. Totals are metric-level.
 */
export function buildExecutionPlan(
  testCaseId: string,
  version: Version,
  scenarios: ScenarioSummary[],
  metrics: Metric[],
): ExecutionPlan {
  const target = platformForDestination(version.destination_slug);

  const metaBySlug = new Map<string, Metric>();
  for (const m of metrics) {
    metaBySlug.set(m.slug, m);
  }

  // Stable, name-bearing metric list from the version display block.
  const versionMetrics = version.display.metrics.length
    ? version.display.metrics
    : version.metric_slugs.map(slug => ({slug, display_name: slug}));

  const ordered = orderScenarios(scenarios);
  const totals = emptyTotals();
  const groups: PlanScenarioGroup[] = [];

  ordered.forEach((scenario, idx) => {
    const scenarioOrder = scenario.order_index ?? idx + 1;
    const scenarioInvalid = scenario.validation_status === 'invalid';
    const operations: PlanOperation[] = versionMetrics.map(vm => {
      const meta = metaBySlug.get(vm.slug);
      const {status, reasonCode, detail} = classifyMetric(
        vm.display_name,
        meta,
        scenarioInvalid,
      );
      bumpTotal(totals, status);
      return {
        scenarioSlug: scenario.scenario_slug,
        scenarioName: scenario.scenario_name,
        scenarioOrder,
        metricSlug: vm.slug,
        metricName: vm.display_name,
        status,
        reasonCode,
        detail,
      };
    });

    groups.push({
      scenarioSlug: scenario.scenario_slug,
      scenarioName: scenario.scenario_name,
      scenarioOrder,
      validationStatus: scenario.validation_status,
      operations,
    });
  });

  return {
    testCaseId,
    versionId: version.id,
    versionNumber: version.version_number,
    destinationSlug: version.destination_slug,
    targetLabel: target.label,
    device: target.device,
    groups,
    totals,
    operationDetailDeferred: true,
    boundaryNote: BOUNDARY_NOTE,
  };
}

function bumpTotal(totals: PlanTotals, status: OperationStatus): void {
  totals.total += 1;
  switch (status) {
    case 'writable':
      totals.writable += 1;
      break;
    case 'unsupported':
      totals.unsupported += 1;
      break;
    case 'invalid':
      totals.invalid += 1;
      break;
    case 'skipped':
      totals.skipped += 1;
      break;
    case 'permission_missing':
      totals.permissionMissing += 1;
      break;
  }
}
