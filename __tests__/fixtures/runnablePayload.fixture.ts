/**
 * UNIT-TEST FIXTURE ONLY — NOT product data, NOT a real backend response.
 *
 * A small synthetic F8 runnable payload (REAL live shape: relative `time`
 * object, `profile_slugs[]`, `scenario_slug`, top-level destination/profiles/
 * operation_count/time_model_note) used by the MR-C operation-level tests.
 * Values/units/offsets here are obviously synthetic and exist solely to
 * exercise the pure builder/dry-run + the validation adapter's missing-field
 * and invalid-time handling. Nothing in the app imports this; it is test-only.
 */

import {RunnablePayload} from '../../src/testCases/runnablePayloadTypes';

/**
 * Two scenarios with order_index = null (live shape) — ordering is array
 * position. Scenario one carries complete writable ops (distance/steps with a
 * relative time window and synthetic idempotency hashes). Scenario two carries
 * one complete op plus several obviously-synthetic ops each broken in exactly
 * one way (missing value/unit/idempotency/metric/provenance, absent time,
 * non-numeric offset, unknown model) to assert each reason code — no drops, no
 * fabrication.
 */
export const f8Fixture: RunnablePayload = {
  test_case_id: 'tc-synthetic-001',
  version_id: 'ver-synthetic-001',
  version_number: 3,
  status: 'active',
  destination_slug: 'apple_health',
  profile_slugs: ['apple_watch'],
  operation_count: 10,
  time_model_note:
    'SYNTHETIC fixture: relative offset-minutes from a runner-chosen base instant.',
  generated_at: '2025-01-01T00:00:00.000Z',
  scenarios: [
    {
      scenario_id: 'scn-1',
      scenario_slug: 'active_day_basic',
      order_index: null,
      name: 'Synthetic scenario one',
      operations: [
        {
          operation_id: 'scn-1:distance:0',
          scenario_id: 'scn-1',
          metric_slug: 'distance',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'daily_summary time_series',
          value: 900,
          unit: 'metres',
          time: {
            model: 'relative',
            start_offset_minutes: -720,
            end_offset_minutes: -660,
          },
          metadata: {
            start_offset_minutes: -720,
            end_offset_minutes: -660,
            value: 900,
          },
          idempotency_key:
            '5f3c290b52889a0ee7b88fd6f54ee953ac40910a2a05726f61de885f83c722d3',
        },
        {
          operation_id: 'scn-1:steps:0',
          scenario_id: 'scn-1',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'daily_summary time_series',
          value: 1200,
          unit: 'count',
          time: {
            model: 'relative',
            start_offset_minutes: -720,
            end_offset_minutes: -660,
          },
          metadata: {
            start_offset_minutes: -720,
            end_offset_minutes: -660,
            value: 1200,
          },
          idempotency_key:
            'bfce80cc8a3126a0da521403a1d45ee5291420b79f77a33d43917d41fa12e5c2',
        },
        {
          // A valid op carrying MORE THAN ONE profile, to assert the array is
          // preserved (never collapsed) on the plan op.
          operation_id: 'scn-1:steps:multi',
          scenario_id: 'scn-1',
          metric_id: 'metric-uuid-steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch', 'iphone'],
          operation_kind: 'sample',
          value: 250,
          unit: 'count',
          time: {
            model: 'relative',
            start_offset_minutes: -60,
            end_offset_minutes: 0,
          },
          idempotency_key: 'idem-multi-profile',
        },
      ],
    },
    {
      scenario_id: 'scn-2',
      scenario_slug: 'synthetic_invalids',
      order_index: null,
      name: 'Synthetic scenario two',
      operations: [
        {
          operation_id: 'scn-2:steps:0',
          scenario_id: 'scn-2',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 1000,
          unit: 'count',
          time: {
            model: 'relative',
            start_offset_minutes: -120,
            end_offset_minutes: -60,
          },
          idempotency_key: 'idem-2-ok',
        },
        {
          operation_id: 'op-missing-value',
          scenario_id: 'scn-2',
          metric_slug: 'heart_rate',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          // value missing -> MISSING_VALUE (NOT fabricated by the adapter).
          value: '',
          unit: 'count/min',
          time: {model: 'relative', start_offset_minutes: -30, end_offset_minutes: 0},
          idempotency_key: 'idem-mv',
        },
        {
          operation_id: 'op-missing-unit',
          scenario_id: 'scn-2',
          metric_slug: 'heart_rate',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 72,
          unit: '', // MISSING_UNIT
          time: {model: 'relative', start_offset_minutes: -30, end_offset_minutes: 0},
          idempotency_key: 'idem-mu',
        },
        {
          operation_id: 'op-missing-time',
          scenario_id: 'scn-2',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          // time absent -> MISSING_TIME
          idempotency_key: 'idem-mt',
        },
        {
          operation_id: 'op-bad-offset',
          scenario_id: 'scn-2',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          // non-numeric offset -> INVALID_TIME_MODEL (cast through unknown so
          // this obviously-synthetic bad value compiles in the typed fixture).
          time: {
            model: 'relative',
            start_offset_minutes: 'not-a-number' as unknown as number,
            end_offset_minutes: 0,
          },
          idempotency_key: 'idem-bo',
        },
        {
          operation_id: 'op-unknown-model',
          scenario_id: 'scn-2',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          // unknown model -> INVALID_TIME_MODEL
          time: {model: 'absolute', start_offset_minutes: 0, end_offset_minutes: 0},
          idempotency_key: 'idem-um',
        },
        {
          operation_id: 'op-missing-idem',
          scenario_id: 'scn-2',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          time: {model: 'relative', start_offset_minutes: -30, end_offset_minutes: 0},
          idempotency_key: '', // MISSING_IDEMPOTENCY_KEY
        },
        {
          operation_id: 'op-missing-metric',
          scenario_id: 'scn-2',
          // neither metric_slug nor metric_id -> MISSING_METRIC_REF
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          time: {model: 'relative', start_offset_minutes: -30, end_offset_minutes: 0},
          idempotency_key: 'idem-mm',
        },
        {
          operation_id: '', // empty operation_id -> MISSING_PROVENANCE
          scenario_id: 'scn-2',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'sample',
          value: 5,
          unit: 'count',
          time: {model: 'relative', start_offset_minutes: -30, end_offset_minutes: 0},
          idempotency_key: 'idem-mp',
        },
      ],
    },
  ],
};
