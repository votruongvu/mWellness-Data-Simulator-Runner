/**
 * MR-A — Trivial smoke test. Renders a pure presentational component with no
 * native dependencies (EnvBadge + SafetyBanner) to confirm the RN test harness
 * and the shared component tree compile and render.
 */

import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {EnvBadge} from '../src/shared/components/EnvBadge';
import {SafetyBanner} from '../src/shared/components/SafetyBanner';

describe('MR-A foundation smoke', () => {
  it('renders the env badge with the configured label', () => {
    render(<EnvBadge />);
    // Decoupled from the specific value: the env label comes from `.env`
    // (react-native-dotenv), which differs per machine (dev/local/...).
    expect(screen.getByText(/^ENV · .+/)).toBeTruthy();
  });

  it('renders the dry-run-default safety banner', () => {
    render(<SafetyBanner />);
    expect(
      screen.getByText(/Dry-run default\. No health data will be written\./),
    ).toBeTruthy();
  });
});
