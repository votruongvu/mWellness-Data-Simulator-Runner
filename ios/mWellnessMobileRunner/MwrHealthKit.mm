//
//  MwrHealthKit.mm
//  mWellness Mobile Runner — MR-C-003 iOS guarded HealthKit writer POC.
//
//  Safety (load-bearing):
//   - NO fake native success: a write is `succeeded` ONLY when HKHealthStore's
//     save completion returns success. Errors → `failed` with the native message.
//   - No write without authorization: a type that is not `SharingAuthorized` is
//     `skipped_permission`, never attempted (defense-in-depth; the TS five-gate
//     chain already gates this).
//   - No unsupported write: a concept outside the MR-C-003 minimal set
//     (`stepCount` only) is `skipped_unsupported`.
//   - No fabricated values: values/units/times come from the JS payload (the
//     backend F8 contract); an incomplete sample is `skipped_invalid_payload`.
//
//  Note: identifiers avoid the name `concept` (a reserved keyword in C++20, which
//  RN 0.74 Obj-C++ is compiled with) — `conceptName` is used instead.
//
#import "MwrHealthKit.h"
#import <HealthKit/HealthKit.h>

@implementation MwrHealthKit {
  HKHealthStore *_store;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    _store = [[HKHealthStore alloc] init];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark - Concept mapping (MR-C-003 minimal set: stepCount only)

- (HKQuantityType *)quantityTypeForConcept:(NSString *)conceptName {
  if ([conceptName isEqualToString:@"stepCount"]) {
    return [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount];
  }
  return nil; // every other concept is unsupported in this POC
}

- (HKUnit *)unitForConcept:(NSString *)conceptName {
  if ([conceptName isEqualToString:@"stepCount"]) {
    return [HKUnit countUnit];
  }
  return nil;
}

- (NSString *)rawStatusForType:(HKObjectType *)type {
  switch ([_store authorizationStatusForType:type]) {
    case HKAuthorizationStatusSharingAuthorized:
      return @"sharingAuthorized";
    case HKAuthorizationStatusSharingDenied:
      return @"sharingDenied";
    case HKAuthorizationStatusNotDetermined:
    default:
      return @"notDetermined";
  }
}

#pragma mark - Capability / status (no prompt)

RCT_EXPORT_METHOD(isHealthDataAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(@([HKHealthStore isHealthDataAvailable]));
}

RCT_EXPORT_METHOD(getShareStatus:(NSArray<NSString *> *)tokens
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSMutableArray *out = [NSMutableArray array];
  for (NSString *t in tokens) {
    HKQuantityType *type = [self quantityTypeForConcept:t];
    NSString *raw = type ? [self rawStatusForType:type] : @"unavailable";
    [out addObject:@{@"token": t, @"raw": raw}];
  }
  resolve(out);
}

#pragma mark - Permission request (fires the OS prompt; gate #3)

RCT_EXPORT_METHOD(requestShareAuthorization:(NSArray<NSString *> *)tokens
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  if (![HKHealthStore isHealthDataAvailable]) {
    resolve(@{@"outcome": @"unavailable", @"perConcept": @[]});
    return;
  }
  NSMutableSet<HKSampleType *> *share = [NSMutableSet set];
  for (NSString *t in tokens) {
    HKQuantityType *type = [self quantityTypeForConcept:t];
    if (type) {
      [share addObject:type];
    }
  }
  [_store requestAuthorizationToShareTypes:share
                                 readTypes:nil
                                completion:^(BOOL success, NSError *_Nullable error) {
    if (!success) {
      resolve(@{@"outcome": @"error",
                @"perConcept": @[],
                @"message": error.localizedDescription ?: @"authorization failed"});
      return;
    }
    NSMutableArray *per = [NSMutableArray array];
    for (NSString *t in tokens) {
      HKQuantityType *type = [self quantityTypeForConcept:t];
      NSString *raw = type ? [self rawStatusForType:type] : @"unavailable";
      [per addObject:@{@"token": t, @"raw": raw}];
    }
    resolve(@{@"outcome": @"resolved", @"perConcept": per});
  }];
}

#pragma mark - Guarded write (NO fake success)

RCT_EXPORT_METHOD(writeQuantitySamples:(NSArray<NSDictionary *> *)samples
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSISO8601DateFormatter *fmt = [[NSISO8601DateFormatter alloc] init];
  fmt.formatOptions = NSISO8601DateFormatWithInternetDateTime | NSISO8601DateFormatWithFractionalSeconds;

  NSMutableArray *results = [NSMutableArray array];
  NSObject *lock = [NSObject new];
  dispatch_group_t group = dispatch_group_create();

  for (NSDictionary *s in samples) {
    NSString *opId = s[@"operationId"] ?: @"";
    NSString *conceptName = s[@"concept"];
    HKQuantityType *type = [self quantityTypeForConcept:conceptName];

    // Unsupported concept → skip; never attempt.
    if (!type) {
      @synchronized(lock) {
        [results addObject:@{@"operationId": opId, @"status": @"skipped_unsupported",
                             @"message": @"metric not supported by the native writer"}];
      }
      continue;
    }

    // Not authorized to write → skip; NEVER write on denied/not-determined.
    if ([_store authorizationStatusForType:type] != HKAuthorizationStatusSharingAuthorized) {
      @synchronized(lock) {
        [results addObject:@{@"operationId": opId, @"status": @"skipped_permission",
                             @"message": @"write permission not granted for this type"}];
      }
      continue;
    }

    HKUnit *unit = [self unitForConcept:conceptName];
    NSNumber *value = [s[@"value"] isKindOfClass:[NSNumber class]] ? s[@"value"] : nil;
    NSDate *start = [fmt dateFromString:(s[@"startTimeIso"] ?: @"")];
    NSDate *end = [fmt dateFromString:(s[@"endTimeIso"] ?: @"")];

    // Incomplete/invalid sample → skip; never fabricate.
    if (!unit || value == nil || !start || !end) {
      @synchronized(lock) {
        [results addObject:@{@"operationId": opId, @"status": @"skipped_invalid_payload",
                             @"message": @"could not build a valid HealthKit sample from the payload"}];
      }
      continue;
    }

    HKQuantity *quantity = [HKQuantity quantityWithUnit:unit doubleValue:value.doubleValue];
    NSMutableDictionary *metadata = [NSMutableDictionary dictionary];
    NSString *idem = s[@"idempotencyKey"];
    if ([idem isKindOfClass:[NSString class]] && idem.length > 0) {
      // Idempotent identity: HealthKit replaces a sample with the same sync
      // identifier (and a higher/equal version) rather than duplicating it.
      metadata[HKMetadataKeySyncIdentifier] = idem;
      metadata[HKMetadataKeySyncVersion] = @1;
    }
    if (opId.length > 0) {
      metadata[@"MwrOperationId"] = opId;
    }

    HKQuantitySample *sample = [HKQuantitySample quantitySampleWithType:type
                                                               quantity:quantity
                                                              startDate:start
                                                                endDate:end
                                                               metadata:metadata];

    dispatch_group_enter(group);
    [_store saveObject:sample withCompletion:^(BOOL success, NSError *_Nullable error) {
      @synchronized(lock) {
        if (success) {
          // Success ONLY when HealthKit actually saved the sample.
          [results addObject:@{@"operationId": opId, @"status": @"succeeded"}];
        } else {
          [results addObject:@{@"operationId": opId, @"status": @"failed",
                               @"message": error.localizedDescription ?: @"HealthKit save failed"}];
        }
      }
      dispatch_group_leave(group);
    }];
  }

  dispatch_group_notify(group, dispatch_get_main_queue(), ^{
    resolve(results);
  });
}

@end
