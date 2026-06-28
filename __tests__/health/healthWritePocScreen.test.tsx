/**
 * MR-C-003 — HealthWritePocScreen component (RNTL) test.
 *
 * Renders the guarded write-POC screen with a ready F8 payload (mocked) and a
 * stub session. With no native MwrHealthKit module in jest, capability is
 * unavailable → the screen fail-closes: the gate checklist shows unmet gates and
 * the "Run guarded write POC" button is blocked (no write reachable from a test).
 */
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HealthWritePocScreen} from '../../src/screens/HealthWritePocScreen';

jest.mock('../../src/auth/SessionContext', () => ({
  useSession: () => ({
    env: {apiBaseUrl: 'http://localhost:8080', envLabel: 'test'},
    expireSession: jest.fn(),
  }),
}));

jest.mock('../../src/shared/hooks/useApiResource', () => ({
  useApiResource: () => ({
    status: 'ready',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    data: require('../fixtures/runnablePayload.fixture').f8Fixture,
    error: undefined,
    reload: jest.fn(),
  }),
}));

const Stack = createNativeStackNavigator();

function renderScreen(): void {
  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HealthWritePoc"
          component={HealthWritePocScreen}
          initialParams={{testCaseId: '17', versionId: '15', dryRunCompleted: true}}
        />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('HealthWritePocScreen', () => {
  it('renders the guarded write POC, the gate checklist, and a fail-closed (blocked) write button', async () => {
    renderScreen();

    // Ready state renders the POC + the five-gate checklist.
    expect(await screen.findByText('Guarded write POC')).toBeTruthy();
    expect(screen.getByText('dry_run_completed')).toBeTruthy();
    expect(screen.getByText('capability_checked')).toBeTruthy();
    expect(screen.getByText('permission_resolved_or_granted')).toBeTruthy();
    expect(screen.getByText('explicit_confirmation')).toBeTruthy();

    // The real-write mode banner + confirm copy are present.
    expect(screen.getByText(/Use only on approved DEV\/QA devices/)).toBeTruthy();
    expect(screen.getByText(/writes real test data to Apple Health/)).toBeTruthy();

    // No native module in jest → capability unavailable → write is BLOCKED.
    expect(screen.getByText('Run guarded write POC')).toBeTruthy();
    expect(screen.getByText(/Blocked — unmet:/)).toBeTruthy();
  });

  it('on Android, the SHARED screen shows the Health Connect write target and fail-closes', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    try {
      renderScreen();
      expect(await screen.findByText('Guarded write POC')).toBeTruthy();
      // The shared screen resolves the Android destination (never "Google HealthKit"/Google Fit).
      expect(screen.getByText('Health Connect')).toBeTruthy();
      // No MwrHealthConnect module in jest → capability unavailable → write BLOCKED.
      expect(screen.getByText(/Blocked — unmet:/)).toBeTruthy();
    } finally {
      Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
    }
  });
});
