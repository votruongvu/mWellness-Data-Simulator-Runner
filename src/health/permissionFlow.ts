/**
 * MR-C (MWR-MRC-002) — guarded permission FLOW + the five-gate write chain.
 *
 * Two safety properties live here, both pure + tested:
 *  1. Explain-before-prompt: `requestPermissionGuarded` will NOT call the native
 *     prompt unless the explanation has been shown/acknowledged AND capability is
 *     available — even if a native module is present (no silent prompt, gate #3).
 *  2. The five-gate write chain: `evaluateWriteGate` requires ALL five gates; this
 *     is the canonical guard MR-C-003 must pass before a real write. This story
 *     contains NO write path — satisfying the chain in software still never
 *     implies a write may occur (a real write additionally needs human gate #1 +
 *     a native writer + device QA, none of which exist here).
 */

import type {HealthPermissionStatus} from './healthPermission';
import type {
  AuthorizationRequestOutcome,
  AuthorizationRequestResult,
  HealthKitBridge,
} from './healthKitBridge';
import type {HealthConceptToken} from './healthKitTypes';

/* --------------------------- explain-before-prompt ------------------------- */

export type PermissionFlowStep =
  | 'idle'
  | 'capability_checked'
  | 'explanation_shown'
  | 'permission_requested'
  | 'resolved'
  | 'blocked';

export interface PermissionFlowState {
  readonly step: PermissionFlowStep;
  /** Only `.available` is read here; any capability shape works (iOS or shared). */
  readonly capability: {readonly available: boolean};
  /** True once the user has SEEN the pre-prompt explanation (gate #3 boundary). */
  readonly explanationAcknowledged: boolean;
  readonly permission: HealthPermissionStatus;
  /** Set only after a real native prompt resolves — never by the default seam. */
  readonly lastRequestOutcome?: AuthorizationRequestOutcome;
}

/** Reason codes for a blocked permission request. */
export const EXPLAIN_BEFORE_PROMPT_REQUIRED = 'EXPLAIN_BEFORE_PROMPT_REQUIRED';
export const CAPABILITY_UNAVAILABLE = 'CAPABILITY_UNAVAILABLE';

/**
 * May we fire the (gated) permission request now? Enforces capability +
 * explain-before-prompt. Never allows a silent prompt.
 */
export function canRequestPermission(state: PermissionFlowState): {
  allowed: boolean;
  blockedBy: string[];
} {
  const blockedBy: string[] = [];
  if (!state.capability.available) {
    blockedBy.push(CAPABILITY_UNAVAILABLE);
  }
  if (!state.explanationAcknowledged) {
    blockedBy.push(EXPLAIN_BEFORE_PROMPT_REQUIRED);
  }
  return {allowed: blockedBy.length === 0, blockedBy};
}

/**
 * The ONLY sanctioned way to reach `bridge.requestShareAuthorization`. If the
 * explain-before-prompt guard is not satisfied it returns a blocked
 * `gate_pending` result and NEVER calls the native prompt — defense-in-depth so
 * no silent OS prompt can fire even if a native module is later installed.
 */
export async function requestPermissionGuarded(
  state: PermissionFlowState,
  bridge: HealthKitBridge,
  tokens: readonly HealthConceptToken[],
): Promise<AuthorizationRequestResult> {
  const guard = canRequestPermission(state);
  if (!guard.allowed) {
    return {
      outcome: 'gate_pending',
      perConcept: [],
      reasonCode: EXPLAIN_BEFORE_PROMPT_REQUIRED,
      message: `Permission request blocked before any OS prompt: ${guard.blockedBy.join(', ')}.`,
    };
  }
  return bridge.requestShareAuthorization(tokens);
}

/* ------------------------------ five-gate chain ---------------------------- */

/** The canonical real-write gate chain (payload contract §5; story §Required Safety Gates). */
export interface FiveGateState {
  readonly dryRunCompleted: boolean;
  readonly payloadSourceVerified: boolean;
  readonly capabilityChecked: boolean;
  readonly permissionResolvedOrGranted: boolean;
  readonly explicitConfirmation: boolean;
}

export type WriteGateName = keyof FiveGateState;

const GATE_ORDER: readonly WriteGateName[] = [
  'dryRunCompleted',
  'payloadSourceVerified',
  'capabilityChecked',
  'permissionResolvedOrGranted',
  'explicitConfirmation',
];

/**
 * Evaluate the five-gate chain. `allowed` is true only when ALL five are true.
 * This is necessary-but-not-sufficient: a REAL write additionally requires human
 * gate #1 + a native writer + device QA (see {@link REAL_WRITE_BLOCKED_IN_MR_C_002}).
 */
export function evaluateWriteGate(state: FiveGateState): {
  allowed: boolean;
  blockedBy: WriteGateName[];
} {
  const blockedBy = GATE_ORDER.filter(name => !state[name]);
  return {allowed: blockedBy.length === 0, blockedBy};
}

/**
 * Hard ceiling: even if the five software gates pass, MR-C-002 enables NO write.
 * A real write is unreachable until human-approval gate #1 (Apple Health write),
 * gate #3 (permission prompt) and gate #9 (entitlement) are approved, a native
 * writer exists, and device QA names a real device. Always `true` here.
 */
export const REAL_WRITE_BLOCKED_IN_MR_C_002 = true as const;

/** There is no real-write path in this build. */
export function realWriteEnabledInThisBuild(): false {
  return false;
}
