//
//  MwrHealthKit.h
//  mWellness Mobile Runner — MR-C-003 iOS guarded HealthKit writer POC.
//
//  Native bridge backing the TS `HealthKitBridge` seam (src/health/healthKitBridge.ts),
//  prefix `Mwr<Capability>` (ADR-MWR-010/011). Exposes capability + permission +
//  a GUARDED quantity write. No fake success: a write is reported succeeded only
//  when HKHealthStore actually saved it. Internal/dev POC; minimal metric set.
//
#import <React/RCTBridgeModule.h>

@interface MwrHealthKit : NSObject <RCTBridgeModule>
@end
