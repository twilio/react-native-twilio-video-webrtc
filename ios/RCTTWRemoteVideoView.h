//
//  RCTTWRemoteVideoView.h
//  RNTwilioVideoWebRTC
//
//  Custom container view for remote participant video that implements
//  TVIVideoViewDelegate to receive frame dimension change callbacks.
//

#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>
#import <TwilioVideo/TwilioVideo.h>

@interface RCTTWRemoteVideoView : UIView <TVIVideoViewDelegate>

/**
 * The inner TVIVideoView that renders the video.
 */
@property (nonatomic, strong, readonly) TVIVideoView *videoView;

/**
 * Callback when video frame dimensions change.
 */
@property (nonatomic, copy) RCTDirectEventBlock onFrameDimensionsChanged;

/**
 * Current video orientation (used for rotation calculation).
 */
@property (nonatomic, assign) TVIVideoOrientation currentOrientation;

@end

