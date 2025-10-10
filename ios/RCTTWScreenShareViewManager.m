//
//  RCTTWScreenShareViewManager.m
//  Black
//
//  Created for screen sharing support
//
//

#import "RCTTWScreenShareViewManager.h"

#import "RCTTWVideoModule.h"

@interface RCTTWScreenShareViewManager()
@end

@implementation RCTTWScreenShareViewManager

RCT_EXPORT_MODULE()

RCT_CUSTOM_VIEW_PROPERTY(scalesType, NSInteger, TVIVideoView) {
  view.subviews[0].contentMode = [RCTConvert NSInteger:json];
}

- (UIView *)view {
  UIView *container = [[UIView alloc] init];
  TVIVideoView *inner = [[TVIVideoView alloc] init];
  inner.autoresizingMask = (UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth);
  [container addSubview:inner];
  return container;
}

RCT_CUSTOM_VIEW_PROPERTY(enabled, BOOL, TVIVideoView) {
  if (json) {
    RCTTWVideoModule *videoModule = [self.bridge moduleForName:@"TWVideoModule"];
    BOOL isEnabled = [RCTConvert BOOL:json];

    if (isEnabled) {
      [videoModule addScreenShareView:view.subviews[0]];
    } else {
      [videoModule removeScreenShareView:view.subviews[0]];
    }
  }
}

@end

