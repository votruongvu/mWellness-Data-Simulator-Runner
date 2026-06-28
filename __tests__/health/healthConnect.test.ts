/**
 * MR-C-004 — Android Health Connect: status mapping, capability, and platform
 * separation (the Android path never reaches the iOS bridge and vice-versa).
 */
import {NativeModules, Platform} from 'react-native';
import {resolveHealthBridge} from '../../src/health/healthKitBridge';
import {mapAndroidShareStatus, summarizeHealthPermission} from '../../src/health/healthPermission';
import {evaluateHealthCapability} from '../../src/health/healthCapability';

function setOS(os: 'ios' | 'android'): void {
  Object.defineProperty(Platform, 'OS', {value: os, configurable: true});
}

const ORIG_OS = Platform.OS;

afterEach(() => {
  setOS(ORIG_OS as 'ios' | 'android');
  delete (NativeModules as Record<string, unknown>).MwrHealthConnect;
  delete (NativeModules as Record<string, unknown>).MwrHealthKit;
});

describe('mapAndroidShareStatus', () => {
  it('maps Health Connect permission states (fail-closed)', () => {
    expect(mapAndroidShareStatus('granted')).toBe('sharing_authorized');
    expect(mapAndroidShareStatus('denied')).toBe('sharing_denied');
    expect(mapAndroidShareStatus('not_granted')).toBe('not_determined');
    expect(mapAndroidShareStatus('not_determined')).toBe('not_determined');
    expect(mapAndroidShareStatus('unexpected')).toBe('unavailable');
  });

  it('a not-granted-only set never summarizes to granted', () => {
    expect(summarizeHealthPermission([{token: 'stepCount', raw: mapAndroidShareStatus('not_granted')}])).not.toBe(
      'granted',
    );
  });
});

describe('evaluateHealthCapability (Android / Health Connect)', () => {
  it('labels the destination Health Connect and is fail-closed', () => {
    const installed = evaluateHealthCapability({platform: 'android', bridgePresent: true, nativeIsAvailable: true});
    expect(installed.destinationLabel).toBe('Health Connect');
    expect(installed.available).toBe(true);

    const notInstalled = evaluateHealthCapability({platform: 'android', bridgePresent: true, nativeIsAvailable: false});
    expect(notInstalled.available).toBe(false);
    expect(notInstalled.reason).toBe('unavailable_device');

    expect(evaluateHealthCapability({platform: 'android', bridgePresent: false}).reason).toBe('bridge_unavailable');
  });
});

describe('resolveHealthBridge — platform separation', () => {
  const fakeNative = {
    isHealthDataAvailable: jest.fn(),
    getShareStatus: jest.fn(),
    requestShareAuthorization: jest.fn(),
    writeQuantitySamples: jest.fn(),
  };

  it('on Android, binds the MwrHealthConnect module', () => {
    setOS('android');
    (NativeModules as Record<string, unknown>).MwrHealthConnect = fakeNative;
    const r = resolveHealthBridge();
    expect(r.platform).toBe('android');
    expect(r.present).toBe(true);
  });

  it('on iOS, does NOT bind the Android module (separation)', () => {
    setOS('ios');
    (NativeModules as Record<string, unknown>).MwrHealthConnect = fakeNative; // present, but iOS must ignore it
    const r = resolveHealthBridge();
    expect(r.platform).toBe('ios');
    expect(r.present).toBe(false); // no MwrHealthKit → fail-closed gate-pending
  });

  it('on Android without the module, fail-closes to gate-pending', () => {
    setOS('android');
    const r = resolveHealthBridge();
    expect(r.platform).toBe('android');
    expect(r.present).toBe(false);
  });
});
