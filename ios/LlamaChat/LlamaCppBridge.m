/**
 * LlamaCppBridge.m
 * iOS Native Module Implementation for llama.cpp integration
 */

#import "LlamaCppBridge.h"
#import <React/RCTLog.h>

@implementation LlamaCppBridge

RCT_EXPORT_MODULE();

// Specify which events this module can emit
- (NSArray<NSString *> *)supportedEvents {
    return @[@"onResponseUpdate", @"onResponseComplete", @"onError"];
}

RCT_EXPORT_METHOD(initialize:(NSString *)modelPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO: Implement actual llama.cpp model initialization
    RCTLogInfo(@"Initializing LlamaCpp with model: %@", modelPath);
    
    // Simulate initialization delay
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        // For now, just resolve with success
        resolve(@{@"success": @YES, @"message": @"Model initialized successfully"});
    });
}

RCT_EXPORT_METHOD(generateResponse:(NSString *)prompt
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO: Implement actual llama.cpp response generation
    RCTLogInfo(@"Generating response for: %@", prompt);
    
    // Simulate response generation
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        // Simulate typing delay
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            NSString *response = [NSString stringWithFormat:@"Mock response to: %@", prompt];
            resolve(@{
                @"text": response,
                @"success": @YES,
                @"tokens": @([response length]),
                @"model": @"mock-model"
            });
        });
    });
}

RCT_EXPORT_METHOD(isModelLoaded:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // For now, always return false since we don't have a real model loaded
    resolve(@NO);
}

RCT_EXPORT_METHOD(getModelInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@{
        @"name": @"Mock Model",
        @"size": @"0 MB",
        @"type": @"mock",
        @"loaded": @NO
    });
}

@end
