/**
 * MR-C — F8 client route mapping test.
 *
 * Asserts getRunnablePayload() hits the verified F8 route with the test-case +
 * version ids URL-encoded, sends the Bearer token, and returns the typed
 * ApiResult on success — reusing the shared apiClient (no fabrication).
 *
 * SAFETY: no native/health/permission modules are imported or referenced; the
 * only effect is a mocked fetch. There is no write path anywhere in this flow.
 */

import {f8Fixture} from './fixtures/runnablePayload.fixture';

// @env is provided via babel-dotenv in the app; mock it for the test env.
jest.mock(
  '@env',
  () => ({API_BASE_URL: 'https://mwds.test', ENV_LABEL: 'test'}),
  {virtual: true},
);

import {configureEnv} from '../src/config/env';
import {setTokenProvider} from '../src/backend/apiClient';
import {getRunnablePayload} from '../src/testCases/runnablePayloadApi';

describe('getRunnablePayload — F8 route mapping', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    configureEnv({apiBaseUrl: 'https://mwds.test'});
    setTokenProvider(() => 'test-token');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('GETs the runnable-payload route with encoded ids + Bearer auth', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {get: () => 'req-123'},
      text: async () => JSON.stringify(f8Fixture),
    } as unknown as Response);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const res = await getRunnablePayload('tc 1', 'ver/1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://mwds.test/api/v1/test-cases/tc%201/versions/ver%2F1/runnable-payload',
    );
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer test-token');

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.version_id).toBe('ver-synthetic-001');
      expect(res.data.scenarios).toHaveLength(2);
    }
  });

  it('returns a typed ApiError on the 401 auth-gated response (no fake success)', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: {get: () => 'req-401'},
      text: async () =>
        JSON.stringify({
          error: {code: 'unauthorized', message: 'token required', request_id: 'req-401'},
        }),
    } as unknown as Response);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const res = await getRunnablePayload('tc1', 'ver1');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('AUTH_EXPIRED');
      expect(res.error.backendCode).toBe('unauthorized');
      expect(res.error.requestId).toBe('req-401');
    }
  });
});
