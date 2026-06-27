/**
 * UNIT-TEST FIXTURE ONLY — NOT product data, NOT a real backend response.
 *
 * A small synthetic F8 runnable payload used by the MR-C operation-level tests.
 * Values/units/times here are obviously synthetic and exist solely to exercise
 * the pure builder/dry-run + the validation adapter's missing-field handling.
 * Nothing in the app imports this; it is test-only.
 */

import {RunnablePayload} from '../../src/testCases/runnablePayloadTypes';

/**
 * Two scenarios, intentionally provided OUT of order_index order (B before A)
 * so order-preservation can be asserted. Scenario A has one complete writable
 * op; scenario B has one complete op and several ops each missing exactly one
 * required concrete field (to assert each reason code, no drops, no fabrication).
 */
export const f8Fixture: RunnablePayload = {
  test_case_id: 'tc-synthetic-001',
  version_id: 'ver-synthetic-001',
  version_number: 3,
  status: 'ready',
  generated_at: '2025-01-01T00:00:00.000Z',
  scenarios: [
    {
      scenario_id: 'scn-B',
      order_index: 2,
      name: 'Synthetic scenario B',
      operations: [
        {
          operation_id: 'op-B1',
          scenario_id: 'scn-B',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slug: 'phone',
          operation_kind: 'sample',
          value: 1000,
          unit: 'count',
          start_time: '2025-01-01T08:00:00.000Z',
          end_time: '2025-01-01T09:00:00.000Z',
          idempotency_key: 'idem-B1',
        },
        {
          operation_id: 'op-B-missing-value',
          scenario_id: 'scn-B',
          metric_slug: 'heart_rate',
          destination_slug: 'apple_health',
          operation_kind: 'sample',
          // value missing -> MISSING_VALUE
          value: '',
          unit: 'count/min',
          start_time: '2025-01-01T08:00:00.000Z',
          idempotency_key: 'idem-B-mv',
        },
        {
          operation_id: 'op-B-missing-unit',
          scenario_id: 'scn-B',
          metric_slug: 'heart_rate',
          destination_slug: 'apple_health',
          operation_kind: 'sample',
          value: 72,
          unit: '', // MISSING_UNIT
          start_time: '2025-01-01T08:00:00.000Z',
          idempotency_key: 'idem-B-mu',
        },
        {
          operation_id: 'op-B-missing-time',
          scenario_id: 'scn-B',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          // start_time missing -> MISSING_TIME
          idempotency_key: 'idem-B-mt',
        },
        {
          operation_id: 'op-B-missing-idem',
          scenario_id: 'scn-B',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          start_time: '2025-01-01T08:00:00.000Z',
          idempotency_key: '', // MISSING_IDEMPOTENCY_KEY
        },
        {
          operation_id: 'op-B-missing-metric',
          scenario_id: 'scn-B',
          // neither metric_slug nor metric_id -> MISSING_METRIC_REF
          destination_slug: 'apple_health',
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          start_time: '2025-01-01T08:00:00.000Z',
          idempotency_key: 'idem-B-mm',
        },
      ],
    },
    {
      scenario_id: 'scn-A',
      order_index: 1,
      name: 'Synthetic scenario A',
      operations: [
        {
          operation_id: 'op-A1',
          scenario_id: 'scn-A',
          metric_id: 'metric-uuid-steps',
          destination_slug: 'apple_health',
          operation_kind: 'sample',
          value: 250,
          unit: 'count',
          start_time: '2025-01-01T07:00:00.000Z',
          end_time: '2025-01-01T07:30:00.000Z',
          idempotency_key: 'idem-A1',
        },
      ],
    },
  ],
};
