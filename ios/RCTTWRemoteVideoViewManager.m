//
//  RCTTWRemoteVideoViewManager.m
//  Black
//
//  Created by Martín Fernández on 6/13/17.
//
//

#import "RCTTWRemoteVideoViewManager.h"

#import <React/RCTConvert.h>
#import "RCTTWVideoModule.h"
#import "RCTTWRemoteVideoView.h"

@interface RCTTWVideoTrackIdentifier : NSObject

@property (strong) NSString *participantSid;
@property (strong) NSString *videoTrackSid;

@end

@implementation RCTTWVideoTrackIdentifier

@end

@interface RCTConvert(RCTTWVideoTrackIdentifier)

+ (RCTTWVideoTrackIdentifier *)RCTTWVideoTrackIdentifier:(id)json;

@end

@implementation RCTConvert(RCTTWVideoTrackIdentifier)

+ (RCTTWVideoTrackIdentifier *)RCTTWVideoTrackIdentifier:(id)json {
  RCTTWVideoTrackIdentifier *trackIdentifier = [[RCTTWVideoTrackIdentifier alloc] init];
  trackIdentifier.participantSid = json[@"participantSid"];
  trackIdentifier.videoTrackSid = json[@"videoTrackSid"];

  return trackIdentifier;
}

@end

@interface RCTTWRemoteVideoViewManager()
@end

@implementation RCTTWRemoteVideoViewManager

RCT_EXPORT_MODULE()

- (UIView *)view {
  return [[RCTTWRemoteVideoView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(onFrameDimensionsChanged, RCTDirectEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(scalesType, NSInteger, RCTTWRemoteVideoView) {
  view.videoView.contentMode = [RCTConvert NSInteger:json];
}

RCT_CUSTOM_VIEW_PROPERTY(trackIdentifier, RCTTWVideoTrackIdentifier, RCTTWRemoteVideoView) {
  if (json) {
    RCTTWVideoModule *videoModule = [self.bridge moduleForName:@"TWVideoModule"];
    RCTTWVideoTrackIdentifier *id = [RCTConvert RCTTWVideoTrackIdentifier:json];
    [videoModule addParticipantView:view.videoView sid:id.participantSid trackSid:id.videoTrackSid];
  }
}

@end
