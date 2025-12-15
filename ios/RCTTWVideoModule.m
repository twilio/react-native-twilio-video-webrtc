//
//  RCTTWVideoModule.h
//  Black
//
//  Created by Martín Fernández on 6/13/17.
//
//

#import "RCTTWVideoModule.h"

#import "RCTTWSerializable.h"
#import <UIKit/UIKit.h>
#import <stdlib.h>

static NSString *roomDidConnect = @"roomDidConnect";
static NSString *screenShareChanged = @"screenShareChanged";
static NSString *roomDidDisconnect = @"roomDidDisconnect";
static NSString *roomDidFailToConnect = @"roomDidFailToConnect";
static NSString *roomParticipantDidConnect = @"roomParticipantDidConnect";
static NSString *roomParticipantDidDisconnect = @"roomParticipantDidDisconnect";
static NSString *dominantSpeakerDidChange = @"onDominantSpeakerDidChange";
static NSString *roomIsReconnecting = @"roomIsReconnecting";
static NSString *roomDidReconnect = @"roomDidReconnect";
static NSString *cameraSwitched = @"onCameraSwitched";
static NSString *videoChanged = @"onVideoChanged";
static NSString *audioChanged = @"onAudioChanged";
static NSString *localParticipantSupportedCodecs = @"onLocalParticipantSupportedCodecs";
static NSString *recordingStarted = @"recordingStarted";
static NSString *recordingStopped = @"recordingStopped";

static NSString *participantAddedVideoTrack = @"participantAddedVideoTrack";
static NSString *participantRemovedVideoTrack = @"participantRemovedVideoTrack";
static NSString *participantAddedDataTrack = @"participantAddedDataTrack";
static NSString *participantRemovedDataTrack = @"participantRemovedDataTrack";
static NSString *participantAddedAudioTrack = @"participantAddedAudioTrack";
static NSString *participantRemovedAudioTrack = @"participantRemovedAudioTrack";
static NSString *participantEnabledVideoTrack = @"participantEnabledVideoTrack";
static NSString *participantDisabledVideoTrack =
        @"participantDisabledVideoTrack";
static NSString *participantEnabledAudioTrack = @"participantEnabledAudioTrack";
static NSString *participantDisabledAudioTrack =
        @"participantDisabledAudioTrack";
static NSString *dataTrackMessageReceived = @"dataTrackMessageReceived";
static NSString *localAudioTrackPublished = @"localAudioTrackPublished";
static NSString *localAudioTrackPublicationFailed = @"localAudioTrackPublicationFailed";
static NSString *localVideoTrackPublished = @"localVideoTrackPublished";
static NSString *localVideoTrackPublicationFailed = @"localVideoTrackPublicationFailed";
static NSString *localDataTrackPublished = @"localDataTrackPublished";
static NSString *localDataTrackPublicationFailed = @"localDataTrackPublicationFailed";
static NSString *remoteAudioTrackPublished = @"remoteAudioTrackPublished";
static NSString *remoteAudioTrackUnpublished = @"remoteAudioTrackUnpublished";
static NSString *remoteAudioTrackSubscriptionFailed = @"remoteAudioTrackSubscriptionFailed";
static NSString *remoteVideoTrackPublished = @"remoteVideoTrackPublished";
static NSString *remoteVideoTrackUnpublished = @"remoteVideoTrackUnpublished";
static NSString *remoteVideoTrackSubscriptionFailed = @"remoteVideoTrackSubscriptionFailed";
static NSString *remoteDataTrackPublished = @"remoteDataTrackPublished";
static NSString *remoteDataTrackUnpublished = @"remoteDataTrackUnpublished";
static NSString *remoteDataTrackSubscriptionFailed = @"remoteDataTrackSubscriptionFailed";
static NSString *const kRCTTWLocalDataTrackName = @"data";

static NSString *cameraDidStart = @"cameraDidStart";
static NSString *cameraWasInterrupted = @"cameraWasInterrupted";
static NSString *cameraInterruptionEnded = @"cameraInterruptionEnded";
static NSString *cameraDidStopRunning = @"cameraDidStopRunning";
static NSString *statsReceived = @"statsReceived";
static NSString *networkQualityLevelsChanged = @"networkQualityLevelsChanged";
static NSString *dataChanged = @"dataChanged";
static NSString *roomFetched = @"onRoomFetched";

static NSString *const kTWProductConfigName = @"twilio-product-config";
static const char *kTWProductNameKey = "com.twilio.video.product.name";
static const char *kTWProductVersionKey = "com.twilio.video.product.version";

static const CMVideoDimensions kRCTTWVideoAppCameraSourceDimensions =
        (CMVideoDimensions) {900, 720};

static const int32_t kRCTTWVideoCameraSourceFrameRate = 15;

// Preferred max dimensions for a H.264 screen share track
// iOS native SDK cannot publish H.264 codec tracks above 1280x720 resolution
static const CMVideoDimensions kRCTTWScreenSourceDimensions =
        (CMVideoDimensions) {1280, 720};

static const int32_t kRCTTWScreenSourceFrameRate = 30;

static TVIVideoFormat *RCTTWScreenSourceVideoFormat(void) {
    TVIVideoFormat *format = [[TVIVideoFormat alloc] init];
    format.dimensions = kRCTTWScreenSourceDimensions;
    format.frameRate = kRCTTWScreenSourceFrameRate;
    format.pixelFormat = TVIPixelFormatYUV420BiPlanarFullRange;
    return format;
}

// Check if the screen source exceeds 1280x720 resolution
static BOOL RCTTWScreenSourceDeviceExceedsMaxSupportedFormat(void) {
    CGRect nativeBounds = [UIScreen mainScreen].nativeBounds;
    CGFloat maxDimension = MAX(CGRectGetWidth(nativeBounds), CGRectGetHeight(nativeBounds));
    CGFloat minDimension = MIN(CGRectGetWidth(nativeBounds), CGRectGetHeight(nativeBounds));

    return maxDimension > kRCTTWScreenSourceDimensions.width &&
           minDimension > kRCTTWScreenSourceDimensions.height;
}

TVIVideoFormat *RCTTWVideoModuleCameraSourceSelectVideoFormatBySize(
        AVCaptureDevice *device, CMVideoDimensions targetSize) {
    TVIVideoFormat *selectedFormat = nil;
    // Ordered from smallest to largest.
    NSOrderedSet<TVIVideoFormat *> *formats =
            [TVICameraSource supportedFormatsForDevice:device];

    for (TVIVideoFormat *format in formats) {
        if (format.pixelFormat != TVIPixelFormatYUV420BiPlanarFullRange) {
            continue;
        }
        selectedFormat = format;
        // ^ Select whatever is available until we find one we like and
        // short-circuit
        CMVideoDimensions dimensions = format.dimensions;

        if (dimensions.width >= targetSize.width &&
            dimensions.height >= targetSize.height) {
            break;
        }
    }
    return selectedFormat;
}

@interface RCTTWVideoModule () <
        TVIRemoteDataTrackDelegate, TVIRemoteParticipantDelegate, TVIRoomDelegate,
        TVICameraSourceDelegate, TVILocalParticipantDelegate,
        TVIAppScreenSourceDelegate>

@property(strong, nonatomic) TVICameraSource *camera;
@property(strong, nonatomic) TVILocalVideoTrack *localVideoTrack;
@property(strong, nonatomic) TVILocalAudioTrack *localAudioTrack;
@property(strong, nonatomic) TVILocalDataTrack *localDataTrack;
@property(strong, nonatomic) TVILocalParticipant *localParticipant;
@property(strong, nonatomic) TVIRoom *room;
@property(nonatomic) BOOL listening;
@property(strong, nonatomic) TVIVideoView *localVideoView;
@property(nonatomic) BOOL screenSharePrefersH264;

// Screen sharing source
@property(strong, nonatomic) TVIAppScreenSource *screen;
@property(strong, nonatomic) TVILocalVideoTrack *screenVideoTrack;
@property(strong, nonatomic) TVIVideoView *screenShareView;

@end

@implementation RCTTWVideoModule

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        // Set properties for Video Insights reporting
        NSDictionary *metadata = [self productMetadata];
        NSString *productName =
                metadata[@"productName"];
        NSString *productVersion =
                metadata[@"productVersion"];
        if (productName.length > 0) {
            setenv(kTWProductNameKey, [productName UTF8String], 1);
        }
        if (productVersion.length > 0) {
            setenv(kTWProductVersionKey, [productVersion UTF8String], 1);
        }
    }
    return self;
}

- (NSDictionary *)productMetadata {
    static NSDictionary *metadata = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      NSBundle *bundle = [NSBundle bundleForClass:[self class]];
      NSString *path = [bundle pathForResource:kTWProductConfigName ofType:@"json"];
      NSData *data = [NSData dataWithContentsOfFile:path];
      NSDictionary *parsed = data ? [NSJSONSerialization JSONObjectWithData:data options:0 error:nil] : nil;

      NSString *productName = parsed[@"productName"];
      NSString *productVersion = parsed[@"productVersion"];
      metadata = @{
          @"productName": productName,
          @"productVersion": productVersion
      };
    });
    return metadata;
}

- (void)dealloc {
    [self clearAudioInstance];
    [self clearCameraInstance];
    [self clearDataInstance];
    [self clearScreenInstance];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        roomDidConnect,
        roomDidDisconnect,
        roomDidFailToConnect,
        roomIsReconnecting,
        roomDidReconnect,
        roomParticipantDidConnect,
        roomParticipantDidDisconnect,
        participantAddedVideoTrack,
        participantRemovedVideoTrack,
        participantAddedDataTrack,
        participantRemovedDataTrack,
        participantAddedAudioTrack,
        participantRemovedAudioTrack,
        participantEnabledVideoTrack,
        participantDisabledVideoTrack,
        participantEnabledAudioTrack,
        participantDisabledAudioTrack,
        dataTrackMessageReceived,
        cameraDidStopRunning,
        cameraDidStart,
        cameraWasInterrupted,
        cameraInterruptionEnded,
        statsReceived,
        networkQualityLevelsChanged,
        dominantSpeakerDidChange,
        screenShareChanged,
        dataChanged,
        cameraSwitched,
        videoChanged,
        audioChanged,
        localParticipantSupportedCodecs,
        roomFetched,
        recordingStarted,
        recordingStopped,
        localAudioTrackPublished,
        localAudioTrackPublicationFailed,
        localVideoTrackPublished,
        localVideoTrackPublicationFailed,
        localDataTrackPublished,
        localDataTrackPublicationFailed,
        remoteAudioTrackPublished,
        remoteAudioTrackUnpublished,
        remoteAudioTrackSubscriptionFailed,
        remoteVideoTrackPublished,
        remoteVideoTrackUnpublished,
        remoteVideoTrackSubscriptionFailed,
        remoteDataTrackPublished,
        remoteDataTrackUnpublished,
        remoteDataTrackSubscriptionFailed,

    ];
}

- (void)addLocalView:(TVIVideoView *)view {
    self.localVideoView = view;
    if (self.localVideoTrack != nil) {
        [self.localVideoTrack addRenderer:view];
    }
    [self updateLocalViewMirroring:view];
}

- (void)updateLocalViewMirroring:(TVIVideoView *)view {
    if (self.camera &&
        self.camera.device.position == AVCaptureDevicePositionFront) {
        view.mirror = true;
    }
}

- (void)removeLocalView:(TVIVideoView *)view {
    if (self.localVideoTrack != nil) {
        [self.localVideoTrack removeRenderer:view];
    }
    if (self.localVideoView == view) {
        self.localVideoView = nil;
    }
}

- (void)removeParticipantView:(TVIVideoView *)view
                          sid:(NSString *)sid
                     trackSid:(NSString *)trackSid {
    // TODO: Implement this nicely
}

- (void)addParticipantView:(TVIVideoView *)view
                       sid:(NSString *)sid
                  trackSid:(NSString *)trackSid {
    // Lookup for the participant in the room
    TVIRemoteParticipant *participant =
            [self.room getRemoteParticipantWithSid:sid];
    if (participant) {
        for (TVIRemoteVideoTrackPublication *publication in participant
                     .remoteVideoTracks) {
            if ([publication.trackSid isEqualToString:trackSid]) {
                [publication.videoTrack addRenderer:view];
            }
        }
    }
}

- (void)addScreenShareView:(TVIVideoView *)view {
    self.screenShareView = view;
    if (self.screenVideoTrack != nil) {
        [self.screenVideoTrack addRenderer:view];
    }
}

- (void)removeScreenShareView:(TVIVideoView *)view {
    if (self.screenVideoTrack != nil) {
        [self.screenVideoTrack removeRenderer:view];
    }
    if (self.screenShareView == view) {
        self.screenShareView = nil;
    }
}

RCT_EXPORT_METHOD(changeListenerStatus : (BOOL) value) {
    self.listening = value;
}

RCT_EXPORT_METHOD(setRemoteAudioPlayback : (NSString *)
                          participantSid enabled : (BOOL) enabled) {
    TVIRemoteParticipant *participant =
            [self.room getRemoteParticipantWithSid:participantSid];
    if (participant) {
        NSArray<TVIRemoteAudioTrackPublication *> *trackPublications =
                participant.remoteAudioTracks;
        for (TVIRemoteAudioTrackPublication
                     *remoteAudioTrack in trackPublications) {
            [remoteAudioTrack.remoteTrack setPlaybackEnabled:enabled];
        }
    }
}

RCT_EXPORT_METHOD(startLocalVideo) {
    TVICameraSourceOptions *options = [TVICameraSourceOptions
            optionsWithBlock:^(TVICameraSourceOptionsBuilder *_Nonnull builder) {

            }];
    self.camera = [[TVICameraSource alloc] initWithOptions:options delegate:self];
    if (self.camera == nil) {
        return;
    }
    self.localVideoTrack = [TVILocalVideoTrack trackWithSource:self.camera
                                                       enabled:NO
                                                          name:@"camera"];
}

- (void)startCameraCapture:(NSString *)cameraType {
    if (self.camera == nil) {
        return;
    }
    AVCaptureDevice *camera;
    if ([cameraType isEqualToString:@"back"]) {
        camera =
                [TVICameraSource captureDeviceForPosition:AVCaptureDevicePositionBack];
    } else {
        camera =
                [TVICameraSource captureDeviceForPosition:AVCaptureDevicePositionFront];
    }

    [self.camera
            startCaptureWithDevice:camera
                        completion:^(AVCaptureDevice *device,
                                     TVIVideoFormat *startFormat, NSError *error) {
                          if (!error) {
                              for (TVIVideoView *renderer in self.localVideoTrack
                                           .renderers) {
                                  [self updateLocalViewMirroring:renderer];
                              }
                              [self sendEventCheckingListenerWithName:cameraDidStart
                                                                 body:nil];
                          }
                        }];
}

RCT_EXPORT_METHOD(startLocalAudio) {
    self.localAudioTrack = [TVILocalAudioTrack trackWithOptions:nil
                                                        enabled:YES
                                                           name:@"microphone"];
}

RCT_EXPORT_METHOD(stopLocalVideo) { [self clearCameraInstance]; }

RCT_EXPORT_METHOD(stopLocalAudio) { self.localAudioTrack = nil; }

RCT_EXPORT_METHOD(publishLocalVideo) {
    if (self.localVideoTrack != nil) {
        TVILocalParticipant *localParticipant = self.room.localParticipant;
        [localParticipant publishVideoTrack:self.localVideoTrack];
    }
}

RCT_EXPORT_METHOD(publishLocalAudio) {
    TVILocalParticipant *localParticipant = self.room.localParticipant;
    [localParticipant publishAudioTrack:self.localAudioTrack];
}

RCT_EXPORT_METHOD(unpublishLocalVideo) {
    if (self.localVideoTrack != nil) {
        TVILocalParticipant *localParticipant = self.room.localParticipant;
        [localParticipant unpublishVideoTrack:self.localVideoTrack];
    }
}

RCT_EXPORT_METHOD(unpublishLocalAudio) {
    TVILocalParticipant *localParticipant = self.room.localParticipant;
    [localParticipant unpublishAudioTrack:self.localAudioTrack];
}

RCT_REMAP_METHOD(setLocalAudioEnabled,
                 enabled : (BOOL) enabled setLocalAudioEnabledWithResolver : (
                         RCTPromiseResolveBlock)
                         resolve rejecter : (RCTPromiseRejectBlock) reject) {
    [self _toggleAudioTrack:enabled];

    resolve(@(enabled));
}

RCT_REMAP_METHOD(setLocalDataTrackEnabled,
                 enabled : (BOOL) enabled setLocalDataTrackEnabledWithResolver : (
                         RCTPromiseResolveBlock)
                         resolve rejecter : (RCTPromiseRejectBlock) reject) {
    [self _toggleDataTrack:enabled];

    resolve(@(enabled));
}

// set a default for setting local video enabled
- (bool)_setLocalVideoEnabled:(bool)enabled {
    return [self _setLocalVideoEnabled:enabled cameraType:@"front"];
}


- (void)_createVideoTrack:(NSString *)cameraType {
    if (self.localVideoTrack == nil) {
        TVICameraSourceOptions *options = [TVICameraSourceOptions
                optionsWithBlock:^(TVICameraSourceOptionsBuilder *_Nonnull builder) {

                }];
        self.camera = [[TVICameraSource alloc] initWithOptions:options
                                                      delegate:self];
        if (self.camera == nil) {
            return;
        }

        self.localVideoTrack = [TVILocalVideoTrack trackWithSource:self.camera
                                                           enabled:YES
                                                              name:@"camera"];

        // Reconnect the local video view if it exists
        if (self.localVideoView != nil) {
            [self.localVideoTrack addRenderer:self.localVideoView];
            [self updateLocalViewMirroring:self.localVideoView];
        }

        // Start camera capture for the track to work
        [self startCameraCapture:cameraType];
    } else {
        // Track exists but might be disabled, enable it and start capture
        [self.localVideoTrack setEnabled:YES];

        // Reconnect the local video view if it exists
        if (self.localVideoView != nil) {
            [self.localVideoTrack addRenderer:self.localVideoView];
            [self updateLocalViewMirroring:self.localVideoView];
        }

        // Start camera capture for the track to work
        [self startCameraCapture:cameraType];
    }
}


// Toggle video track (like _toggleAudioTrack)
- (bool)_setLocalVideoEnabled:(bool)enabled cameraType:(NSString *)cameraType {
    if (enabled) {
        if (self.localVideoTrack) {
            // Track exists, just enable it
            [self.localVideoTrack setEnabled:YES];
            if (self.room && self.room.state == TVIRoomStateConnected) {
                [self.room.localParticipant publishVideoTrack:self.localVideoTrack];
            }
            [self startCameraCapture:cameraType];
        } else {
            // Track doesn't exist, create, enable and publish it
            [self _createVideoTrack:cameraType];
            if (self.localVideoTrack) {
                [self.localVideoTrack setEnabled:YES];
                if (self.room && self.room.state == TVIRoomStateConnected) {
                    [self.room.localParticipant publishVideoTrack:self.localVideoTrack];
                }
                [self startCameraCapture:cameraType];
            }
        }
    } else {
        if (self.localVideoTrack) {
            // Track exists, just disable it
            [self.localVideoTrack setEnabled:NO];
        }
        // If track doesn't exist, do nothing
    }
    [self sendEventCheckingListenerWithName:videoChanged
                                       body:@{@"videoEnabled": @(enabled)}];
    return enabled;
}

#pragma mark - Local Audio Handling

// Create audio track
- (void)_createAudioTrack {
    if (self.localAudioTrack == nil) {
        self.localAudioTrack = [TVILocalAudioTrack trackWithOptions:nil
                                                            enabled:YES
                                                               name:@"microphone"];
    }
}

// Toggle audio track (create if needed, enable/disable existing)
- (void)_toggleAudioTrack:(bool)enabled {
    if (enabled) {
        if (self.localAudioTrack) {
            // Track exists, just enable it
            [self.localAudioTrack setEnabled:YES];
        } else {
            // Track doesn't exist, create, enable and publish it
            [self _createAudioTrack];
            if (self.room && self.room.state == TVIRoomStateConnected) {
                [self.room.localParticipant publishAudioTrack:self.localAudioTrack];
            }
        }
    } else {
        if (self.localAudioTrack) {
            // Track exists, just disable it
            [self.localAudioTrack setEnabled:NO];
        }
        // If track doesn't exist, do nothing
    }

    [self sendEventCheckingListenerWithName:audioChanged
                                       body:@{@"audioEnabled": @(enabled)}];
}

#pragma mark - Local Data Track Handling

// Create data track
- (void)_createDataTrack {
    if (self.localDataTrack == nil) {
        TVIDataTrackOptions *options =
                [TVIDataTrackOptions optionsWithBlock:^(TVIDataTrackOptionsBuilder *builder) {
                  builder.name = kRCTTWLocalDataTrackName;
                }];
        self.localDataTrack = [TVILocalDataTrack trackWithOptions:options];
    }
}

// Toggle data track (create if needed, publish/unpublish)
- (void)_toggleDataTrack:(bool)enabled {
    if (enabled) {
        if (self.localDataTrack) {
            // Track exists, just publish if in room
            if (self.room && self.room.state == TVIRoomStateConnected) {
                [self.room.localParticipant publishDataTrack:self.localDataTrack];
            }
        } else {
            // Track doesn't exist, create and publish it
            [self _createDataTrack];
            if (self.localDataTrack && self.room && self.room.state == TVIRoomStateConnected) {
                [self.room.localParticipant publishDataTrack:self.localDataTrack];
            }
        }
    } else {
        if (self.localDataTrack) {
            // Unpublish first if in room
            if (self.room && self.room.state == TVIRoomStateConnected) {
                [self.room.localParticipant unpublishDataTrack:self.localDataTrack];
            }
            // Then release the track
            self.localDataTrack = nil;
        }
        // If track doesn't exist, do nothing
    }

    // Emit data changed event
    [self sendEventCheckingListenerWithName:dataChanged
                                       body:@{@"dataEnabled": @(enabled)}];
}

RCT_REMAP_METHOD(setLocalVideoEnabled,
                 enabled : (BOOL) enabled setLocalVideoEnabledWithResolver : (
                         RCTPromiseResolveBlock)
                         resolve rejecter : (RCTPromiseRejectBlock) reject) {
    bool result = [self _setLocalVideoEnabled:enabled];
    resolve(@(result));
}

RCT_EXPORT_METHOD(flipCamera) {
    if (self.camera) {
        AVCaptureDevicePosition position = self.camera.device.position;
        AVCaptureDevicePosition nextPosition =
                position == AVCaptureDevicePositionFront ? AVCaptureDevicePositionBack
                                                         : AVCaptureDevicePositionFront;
        BOOL mirror = nextPosition == AVCaptureDevicePositionFront;

        AVCaptureDevice *captureDevice =
                [TVICameraSource captureDeviceForPosition:nextPosition];
        [self.camera
                selectCaptureDevice:captureDevice
                         completion:^(AVCaptureDevice *device,
                                      TVIVideoFormat *startFormat, NSError *error) {
                           if (!error) {
                               for (TVIVideoView *renderer in self.localVideoTrack
                                            .renderers) {
                                   renderer.mirror = mirror;
                               }
                               [self sendEventCheckingListenerWithName:cameraSwitched
                                                                  body:@{
                                                                      @"isBackCamera": @(nextPosition == AVCaptureDevicePositionBack)
                                                                  }];
                           }
                         }];
    }
}

RCT_EXPORT_METHOD(toggleScreenSharing : (BOOL) enabled) {
    if (enabled) {
        BOOL shouldForcePreferredFormat =
                self.screenSharePrefersH264 &&
                RCTTWScreenSourceDeviceExceedsMaxSupportedFormat();
        TVIVideoFormat *screenShareFormat =
                shouldForcePreferredFormat ? RCTTWScreenSourceVideoFormat() : nil;

        // Create screen source/track if needed
        if (self.screen == nil) {
            TVIAppScreenSourceOptions *options =
                    [TVIAppScreenSourceOptions optionsWithBlock:^(
                                                       TVIAppScreenSourceOptionsBuilder *builder) {}];
            self.screen = [[TVIAppScreenSource alloc] initWithOptions:options
                                                             delegate:self];
            if (self.screen == nil) {
                return;
            }
            self.screenVideoTrack = [TVILocalVideoTrack trackWithSource:self.screen
                                                                enabled:NO
                                                                   name:@"screen"];
        }

        if (self.screen != nil && screenShareFormat != nil) {
            // Request the 1280x720 @ 30 fps output format before publishing
            [self.screen requestOutputFormat:screenShareFormat];
        }

        if (self.screen != nil && self.screenVideoTrack != nil) {
            [self.screenVideoTrack setEnabled:enabled];
            TVILocalParticipant *localParticipant = self.room.localParticipant;
            [localParticipant publishVideoTrack:self.screenVideoTrack];

            // Attach the screen share view if it exists
            if (self.screenShareView != nil) {
                [self.screenVideoTrack addRenderer:self.screenShareView];
            }

            [self.screen startCaptureWithCompletion:^(NSError *_Nullable error) {
              if (!error) {
                  [self sendEventCheckingListenerWithName:screenShareChanged
                                                     body:@{
                                                         @"screenShareEnabled": [NSNumber
                                                                 numberWithBool:true]
                                                     }];
              }
            }];
        }
    } else {
        if (self.screen != nil && self.screenVideoTrack != nil) {
            [self.screenVideoTrack setEnabled:enabled];
            TVILocalParticipant *localParticipant = self.room.localParticipant;
            [localParticipant unpublishVideoTrack:self.screenVideoTrack];

            // Detach any existing renderers before stopping capture
            if (self.screenShareView != nil) {
                [self.screenVideoTrack removeRenderer:self.screenShareView];
            }

            [self.screen stopCapture];
            self.screenVideoTrack = nil;
            self.screen = nil;

            [self sendEventCheckingListenerWithName:screenShareChanged
                                               body:@{
                                                   @"screenShareEnabled": @(false)
                                               }];
        }
    }
}

RCT_REMAP_METHOD(setRemoteAudioEnabled,
                 enabled : (BOOL) enabled setRemoteAudioEnabledWithResolver : (
                         RCTPromiseResolveBlock)
                         resolve rejecter : (RCTPromiseRejectBlock) reject) {
    if (self.room == nil) {
        resolve(@(enabled));
        return;// not connected
    }

    for (TVIRemoteParticipant *participant in self.room.remoteParticipants) {
        for (TVIRemoteAudioTrackPublication *pub in participant.remoteAudioTracks) {
            if (pub.remoteTrack) {
                [pub.remoteTrack setPlaybackEnabled:enabled];
            }
        }
    }
    resolve(@(enabled));
}

RCT_EXPORT_METHOD(toggleSoundSetup : (BOOL) speaker) {
    NSError *error = nil;
    kTVIDefaultAVAudioSessionConfigurationBlock();
    AVAudioSession *session = [AVAudioSession sharedInstance];
    AVAudioSessionMode mode =
            speaker ? AVAudioSessionModeVideoChat : AVAudioSessionModeVoiceChat;
    // Overwrite the audio route
    if (![session setMode:mode error:&error]) {
        NSLog(@"AVAudiosession setMode %@", error);
    }

    if (![session overrideOutputAudioPort:AVAudioSessionPortOverrideNone
                                    error:&error]) {
        NSLog(@"AVAudiosession overrideOutputAudioPort %@", error);
    }
}

- (void)convertBaseTrackStats:(TVIBaseTrackStats *)stats
                       result:(NSMutableDictionary *)result {
    result[@"trackSid"] = stats.trackSid;
    result[@"packetsLost"] = @(stats.packetsLost);
    result[@"codec"] = stats.codec;
    result[@"ssrc"] = stats.ssrc;
    result[@"timestamp"] = @(stats.timestamp);
}

- (void)convertRemoteTrackStats:(TVIRemoteTrackStats *)stats
                         result:(NSMutableDictionary *)result {
    result[@"bytesReceived"] = @(stats.bytesReceived);
    result[@"packetsReceived"] = @(stats.packetsReceived);
}

- (void)convertLocalTrackStats:(TVILocalTrackStats *)stats
                        result:(NSMutableDictionary *)result {
    result[@"bytesSent"] = @(stats.bytesSent);
    result[@"packetsSent"] = @(stats.packetsSent);
    result[@"roundTripTime"] = @(stats.roundTripTime);
}

- (NSMutableDictionary *)convertDimensions:(CMVideoDimensions)dimensions {
    NSMutableDictionary *result =
            [[NSMutableDictionary alloc] initWithCapacity:2];
    result[@"width"] = @(dimensions.width);
    result[@"height"] = @(dimensions.height);
    return result;
}

- (NSMutableDictionary *)convertRemoteAudioTrackStats:
        (TVIRemoteAudioTrackStats *)stats {
    NSMutableDictionary *result =
            [[NSMutableDictionary alloc] initWithCapacity:10];
    [self convertBaseTrackStats:stats result:result];
    [self convertRemoteTrackStats:stats result:result];
    result[@"audioLevel"] = @(stats.audioLevel);
    result[@"jitter"] = @(stats.jitter);
    return result;
}

- (NSMutableDictionary *)convertRemoteVideoTrackStats:
        (TVIRemoteVideoTrackStats *)stats {
    NSMutableDictionary *result =
            [[NSMutableDictionary alloc] initWithCapacity:10];
    [self convertBaseTrackStats:stats result:result];
    [self convertRemoteTrackStats:stats result:result];
    result[@"dimensions"] = [self convertDimensions:stats.dimensions];
    result[@"frameRate"] = @(stats.frameRate);
    return result;
}

- (NSMutableDictionary *)convertLocalAudioTrackStats:
        (TVILocalAudioTrackStats *)stats {
    NSMutableDictionary *result =
            [[NSMutableDictionary alloc] initWithCapacity:10];
    [self convertBaseTrackStats:stats result:result];
    [self convertLocalTrackStats:stats result:result];
    result[@"audioLevel"] = @(stats.audioLevel);
    result[@"jitter"] = @(stats.jitter);
    return result;
}

- (NSMutableDictionary *)convertLocalVideoTrackStats:
        (TVILocalVideoTrackStats *)stats {
    NSMutableDictionary *result =
            [[NSMutableDictionary alloc] initWithCapacity:10];
    [self convertBaseTrackStats:stats result:result];
    [self convertLocalTrackStats:stats result:result];
    result[@"dimensions"] = [self convertDimensions:stats.dimensions];
    result[@"frameRate"] = @(stats.frameRate);
    return result;
}

RCT_EXPORT_METHOD(getStats) {
    if (self.room) {
        [self.room getStatsWithBlock:^(
                           NSArray<TVIStatsReport *> *_Nonnull statsReports) {
          NSMutableDictionary *eventBody =
                  [[NSMutableDictionary alloc] initWithCapacity:10];
          for (TVIStatsReport *statsReport in statsReports) {
              NSMutableArray *audioTrackStats =
                      [[NSMutableArray alloc] initWithCapacity:10];
              NSMutableArray *videoTrackStats =
                      [[NSMutableArray alloc] initWithCapacity:10];
              NSMutableArray *localAudioTrackStats =
                      [[NSMutableArray alloc] initWithCapacity:10];
              NSMutableArray *localVideoTrackStats =
                      [[NSMutableArray alloc] initWithCapacity:10];
              for (TVIRemoteAudioTrackStats *stats in statsReport
                           .remoteAudioTrackStats) {
                  [audioTrackStats addObject:[self convertRemoteAudioTrackStats:stats]];
              }
              for (TVIRemoteVideoTrackStats *stats in statsReport
                           .remoteVideoTrackStats) {
                  [videoTrackStats addObject:[self convertRemoteVideoTrackStats:stats]];
              }
              for (TVILocalAudioTrackStats *stats in statsReport
                           .localAudioTrackStats) {
                  [localAudioTrackStats
                          addObject:[self convertLocalAudioTrackStats:stats]];
              }
              for (TVILocalVideoTrackStats *stats in statsReport
                           .localVideoTrackStats) {
                  [localVideoTrackStats
                          addObject:[self convertLocalVideoTrackStats:stats]];
              }
              eventBody[statsReport.peerConnectionId] = @{
                  @"remoteAudioTrackStats": audioTrackStats,
                  @"remoteVideoTrackStats": videoTrackStats,
                  @"localAudioTrackStats": localAudioTrackStats,
                  @"localVideoTrackStats": localVideoTrackStats
              };
          }
          [self sendEventCheckingListenerWithName:statsReceived body:eventBody];
        }];
    }
}

RCT_EXPORT_METHOD(fetchRoom) {
    NSDictionary *body = [self bodyForRoom:self.room];
    [self sendEventCheckingListenerWithName:roomFetched body:body];
}

RCT_EXPORT_METHOD(
        connect : (NSString *) accessToken roomName : (
                NSString *) roomName enableAudio : (BOOL) enableAudio enableVideo : (BOOL)
                enableVideo encodingParameters : (NSDictionary *)
                        encodingParameters enableNetworkQualityReporting : (BOOL)
                                enableNetworkQualityReporting dominantSpeakerEnabled : (BOOL)
                                        dominantSpeakerEnabled cameraType : (NSString *)
                                                cameraType enableDataTrack : (BOOL) enableDataTrack) {

    if (accessToken == nil || [accessToken length] == 0) {
        NSMutableDictionary *body = [@{@"error": @"Access token is required"} mutableCopy];
        [self sendEventCheckingListenerWithName:roomDidFailToConnect body:body];
        return;
    }

    // Only create video track if enabled during connect
    if (enableVideo) {
        [self _createVideoTrack:cameraType];
    }

    // For audio: only create track if enabled during connect
    if (enableAudio) {
        [self _createAudioTrack];
    }

    // Create data track if enabled during connect
    if (enableDataTrack) {
        [self _createDataTrack];
    }

    __block NSMutableArray<NSString *> *supportedCodecs = [NSMutableArray array];

    BOOL enableH264 = [encodingParameters[@"enableH264Codec"] boolValue];
    self.screenSharePrefersH264 = enableH264;

    TVIConnectOptions *connectOptions = [TVIConnectOptions
            optionsWithToken:accessToken
                       block:^(TVIConnectOptionsBuilder *_Nonnull builder) {
                         if (self.localVideoTrack) {
                             builder.videoTracks = @[self.localVideoTrack];
                         }

                         if (self.localAudioTrack) {
                             builder.audioTracks = @[self.localAudioTrack];
                         }

                         if (self.localDataTrack) {
                             builder.dataTracks = @[self.localDataTrack];
                         }

                         builder.dominantSpeakerEnabled =
                                 dominantSpeakerEnabled ? YES : NO;

                         builder.roomName = roomName;

                         [supportedCodecs addObject:@"VP8"];
                         if (enableH264) {
                             TVIVideoCodec *h264Codec = [TVIH264Codec new];
                             builder.preferredVideoCodecs = @[h264Codec];
                             [supportedCodecs addObject:@"H264"];
                         } else {
                             TVIVideoCodec *vp8Codec = [TVIVp8Codec new];
                             builder.preferredVideoCodecs = @[vp8Codec];
                         }

                         if (encodingParameters[@"audioBitrate"] ||
                             encodingParameters[@"videoBitrate"]) {
                             NSInteger audioBitrate =
                                     [encodingParameters[@"audioBitrate"] integerValue];
                             NSInteger videoBitrate =
                                     [encodingParameters[@"videoBitrate"] integerValue];
                             builder.encodingParameters = [[TVIEncodingParameters alloc]
                                     initWithAudioBitrate:(audioBitrate) ? audioBitrate : 40
                                             videoBitrate:(videoBitrate) ? videoBitrate
                                                                         : 1500];
                         }

                         if (enableNetworkQualityReporting) {
                             builder.networkQualityEnabled = true;
                             builder.networkQualityConfiguration =
                                     [[TVINetworkQualityConfiguration alloc]
                                             initWithLocalVerbosity:
                                                     TVINetworkQualityVerbosityMinimal
                                                    remoteVerbosity:
                                                            TVINetworkQualityVerbosityMinimal];
                         }
                       }];

    if (supportedCodecs.count > 0) {
        [self sendEventCheckingListenerWithName:localParticipantSupportedCodecs
                                           body:@{@"supportedCodecs": [supportedCodecs copy]}];
    }

    self.room = [TwilioVideoSDK connectWithOptions:connectOptions delegate:self];
}

RCT_EXPORT_METHOD(sendString : (nonnull NSString *) message) {
    if (self.localDataTrack) {
        [self.localDataTrack sendString:message];
    }
}

RCT_EXPORT_METHOD(sendBinary : (nonnull NSString *) base64Payload) {
    if (self.localDataTrack == nil || base64Payload == nil) {
        return;
    }
    NSData *data =
            [[NSData alloc] initWithBase64EncodedString:base64Payload
                                                options:0];
    if (data == nil) {
        NSLog(@"[RCTTWVideoModule] Invalid Base64 payload passed to sendBinary");
        return;
    }
    [self.localDataTrack sendData:data];
}

RCT_EXPORT_METHOD(disconnect) {
    [self clearAudioInstance];
    [self clearCameraInstance];
    [self clearDataInstance];
    [self clearScreenInstance];
    [self.room disconnect];
}

- (void)clearScreenInstance {
    if (self.screenVideoTrack) {
        // Detach any renderers before unpublishing
        if (self.screenShareView != nil) {
            [self.screenVideoTrack removeRenderer:self.screenShareView];
        }
        [[self.room localParticipant] unpublishVideoTrack:self.screenVideoTrack];
        self.screenVideoTrack = nil;
    }
    if (self.screen) {
        [self.screen stopCapture];
        self.screen = nil;
    }
}

- (void)clearCameraInstance {
    // We are done with camera
    if (self.localVideoTrack != nil && self.room != nil) {
        // Unpublish the video track before releasing it
        [[self.room localParticipant] unpublishVideoTrack:self.localVideoTrack];
    }
    if (self.camera) {
        [self.camera stopCapture];
        self.camera = nil;
    }
    self.localVideoTrack = nil;
}

- (void)clearAudioInstance {
    // We are done with audio
    if (self.localAudioTrack != nil && self.room != nil) {
        // Unpublish the audio track before releasing it
        [[self.room localParticipant] unpublishAudioTrack:self.localAudioTrack];
    }
    self.localAudioTrack = nil;
}

- (void)clearDataInstance {
    // We are done with data track
    if (self.localDataTrack != nil && self.room != nil) {
        // Unpublish the data track before releasing it
        [[self.room localParticipant] unpublishDataTrack:self.localDataTrack];
    }
    self.localDataTrack = nil;
}

#pragma mark - Event helpers

- (NSMutableDictionary *)bodyForParticipant:(TVIParticipant *)participant
                           trackPublication:(id)publication {
    NSMutableDictionary *body = [[NSMutableDictionary alloc] initWithCapacity:2];
    if (participant) {
        body[@"participant"] = [participant toJSON];
    }
    if (publication && [publication respondsToSelector:@selector(toJSON)]) {
        body[@"track"] = [publication toJSON];
    }
    return body;
}

- (NSArray<NSDictionary *> *)jsonForTrackPublications:(NSArray<id> *)publications {
    if (publications == nil || publications.count == 0) {
        return @[];
    }
    NSMutableArray *result = [NSMutableArray arrayWithCapacity:publications.count];
    for (id publication in publications) {
        if ([publication respondsToSelector:@selector(toJSON)]) {
            [result addObject:[publication toJSON]];
        }
    }
    return result;
}

- (NSDictionary *)participantWithTracks:(TVIParticipant *)participant {
    if (participant == nil) {
        return @{
            @"sid": @"",
            @"identity": @"",
            @"audioTracks": @[],
            @"videoTracks": @[],
            @"dataTracks": @[]
        };
    }

    NSMutableDictionary *participantJSON = [[participant toJSON] mutableCopy];
    NSArray *audioTracks = @[];
    NSArray *videoTracks = @[];
    NSArray *dataTracks = @[];

    if ([participant isKindOfClass:[TVIRemoteParticipant class]]) {
        TVIRemoteParticipant *remote = (TVIRemoteParticipant *) participant;
        audioTracks = [self jsonForTrackPublications:remote.remoteAudioTracks];
        videoTracks = [self jsonForTrackPublications:remote.remoteVideoTracks];
        dataTracks = [self jsonForTrackPublications:remote.remoteDataTracks];
    } else if ([participant isKindOfClass:[TVILocalParticipant class]]) {
        TVILocalParticipant *local = (TVILocalParticipant *) participant;
        audioTracks = [self jsonForTrackPublications:local.audioTracks];
        videoTracks = [self jsonForTrackPublications:local.videoTracks];
        dataTracks = [self jsonForTrackPublications:local.dataTracks];
    }

    participantJSON[@"audioTracks"] = audioTracks ?: @[];
    participantJSON[@"videoTracks"] = videoTracks ?: @[];
    participantJSON[@"dataTracks"] = dataTracks ?: @[];

    return participantJSON;
}

- (NSString *)stringForRoomState:(TVIRoomState)state {
    switch (state) {
        case TVIRoomStateConnecting:
            return @"CONNECTING";
        case TVIRoomStateConnected:
            return @"CONNECTED";
        case TVIRoomStateReconnecting:
            return @"RECONNECTING";
        case TVIRoomStateDisconnected:
            return @"DISCONNECTED";
        default:
            return @"UNKNOWN";
    }
}

- (NSDictionary *)bodyForRoom:(TVIRoom *)room {
    if (room == nil) {
        return @{};
    }

    NSMutableDictionary *body = [[NSMutableDictionary alloc] initWithCapacity:6];
    body[@"sid"] = room.sid ?: @"";
    body[@"name"] = room.name ?: @"";

    NSMutableArray *remoteParticipants = [[NSMutableArray alloc] initWithCapacity:room.remoteParticipants.count];
    for (TVIRemoteParticipant *participant in room.remoteParticipants) {
        [remoteParticipants addObject:[self participantWithTracks:participant]];
    }
    body[@"remoteParticipants"] = remoteParticipants;

    TVILocalParticipant *localParticipant = room.localParticipant;
    body[@"localParticipant"] = [self participantWithTracks:localParticipant];

    TVIRemoteParticipant *dominantSpeaker = room.dominantSpeaker;
    body[@"dominantSpeaker"] =
            dominantSpeaker ? [self participantWithTracks:dominantSpeaker] : [NSNull null];

    body[@"state"] = [self stringForRoomState:room.state];
    body[@"mediaRegion"] = room.mediaRegion ?: @"";

    return body;
}

- (void)appendError:(NSError *)error toBody:(NSMutableDictionary *)body {
    if (!error || body == nil) {
        return;
    }
    if (error.localizedDescription) {
        body[@"error"] = error.localizedDescription;
    }
    body[@"code"] = [NSString stringWithFormat:@"%ld", (long) error.code];
    NSString *explanation = error.localizedFailureReason ?: error.localizedRecoverySuggestion;
    if (explanation.length > 0) {
        body[@"errorExplanation"] = explanation;
    }
}

#pragma mark - Common

- (void)sendEventCheckingListenerWithName:(NSString *)event
                                     body:(NSDictionary *)body {
    if (_listening) {
        [self sendEventWithName:event body:body];
    }
}

#pragma mark - TVICameraSourceDelegate

- (void)cameraSourceWasInterrupted:(nonnull TVICameraSource *)source
                            reason:(AVCaptureSessionInterruptionReason)reason
        API_AVAILABLE(ios(9.0)) {
    NSString *reasonStr = @"unknown";
    if (@available(iOS 9.0, *)) {
        if (reason ==
            AVCaptureSessionInterruptionReasonVideoDeviceNotAvailableInBackground) {
            reasonStr = @"video device not available in background";
        } else if (
                reason ==
                AVCaptureSessionInterruptionReasonAudioDeviceInUseByAnotherClient) {
            reasonStr = @"audio device in use by another client";
        } else if (
                reason ==
                AVCaptureSessionInterruptionReasonVideoDeviceInUseByAnotherClient) {
            reasonStr = @"video device in use by another client";
        } else if (
                reason ==
                AVCaptureSessionInterruptionReasonVideoDeviceNotAvailableWithMultipleForegroundApps) {
            reasonStr = @"video device not available with multiple foreground apps";
        }
    }
    if (@available(iOS 11.1, *)) {
        if (reason ==
            AVCaptureSessionInterruptionReasonVideoDeviceNotAvailableDueToSystemPressure) {
            reasonStr = @"video device not available due to system pressure";
        }
    }

    [self sendEventCheckingListenerWithName:cameraWasInterrupted
                                       body:@{@"reason": reasonStr}];
}

- (void)cameraSourceInterruptionEnded:(nonnull TVICameraSource *)source {
    [self sendEventCheckingListenerWithName:cameraInterruptionEnded body:nil];
}

- (void)cameraSource:(nonnull TVICameraSource *)source
        didFailWithError:(nonnull NSError *)error {
    [self sendEventCheckingListenerWithName:cameraDidStopRunning
                                       body:@{
                                           @"error": error.localizedDescription
                                       }];
}

#pragma mark - TVIRoomDelegate

- (void)room:(TVIRoom *)room
        dominantSpeakerDidChange:(TVIRemoteParticipant *)participant {
    if (participant) {
        [self sendEventCheckingListenerWithName:dominantSpeakerDidChange
                                           body:@{
                                               @"participant": [participant toJSON],
                                               @"roomName": room.name,
                                               @"roomSid": room.sid
                                           }];
    } else {
        [self sendEventCheckingListenerWithName:dominantSpeakerDidChange
                                           body:@{
                                               @"participant": @"",
                                               @"roomName": room.name,
                                               @"roomSid": room.sid,
                                           }];
    }
}

- (void)didConnectToRoom:(TVIRoom *)room {
    NSMutableArray *participants = [NSMutableArray array];

    for (TVIRemoteParticipant *p in room.remoteParticipants) {
        p.delegate = self;
        [participants addObject:[p toJSON]];
    }
    self.localParticipant = room.localParticipant;
    self.localParticipant.delegate = self;

    [participants addObject:[self.localParticipant toJSON]];
    [self sendEventCheckingListenerWithName:roomDidConnect
                                       body:@{
                                           @"roomName": room.name,
                                           @"roomSid": room.sid,
                                           @"participants": participants,
                                           @"localParticipant":
                                                   [self.localParticipant toJSON]
                                       }];
}

- (void)room:(TVIRoom *)room didDisconnectWithError:(nullable NSError *)error {
    // Ensure any lingering local media is cleaned up
    [self clearAudioInstance];
    [self clearCameraInstance];
    [self clearDataInstance];
    [self clearScreenInstance];
    self.room = nil;

    NSMutableDictionary *body =
            [@{@"roomName": room.name, @"roomSid": room.sid} mutableCopy];

    if (error) {
        [body addEntriesFromDictionary:@{@"error": error.localizedDescription}];
    }
    [self sendEventCheckingListenerWithName:roomDidDisconnect body:body];
}

- (void)room:(TVIRoom *)room
        didFailToConnectWithError:(nonnull NSError *)error {
    // Ensure any lingering local media is cleaned up
    [self clearAudioInstance];
    [self clearCameraInstance];
    [self clearDataInstance];
    [self clearScreenInstance];
    self.room = nil;

    NSMutableDictionary *body = [@{
        @"roomName": room.name ?: @"",
        @"roomSid": room.sid ?: @""
    } mutableCopy];

    if (error) {
        [body addEntriesFromDictionary:@{
            @"error": error.localizedDescription ?: @"",
            @"code": @(error.code),
            @"errorExplanation": error.localizedFailureReason ?: error.localizedDescription ?
                                                                                            : @""
        }];
    }

    [self sendEventCheckingListenerWithName:roomDidFailToConnect body:body];
}


- (void)room:(TVIRoom *)room
        participantDidConnect:(TVIRemoteParticipant *)participant {
    participant.delegate = self;

    [self sendEventCheckingListenerWithName:roomParticipantDidConnect
                                       body:@{
                                           @"roomName": room.name,
                                           @"roomSid": room.sid,
                                           @"participant": [participant toJSON]
                                       }];
}

- (void)room:(TVIRoom *)room
        participantDidDisconnect:(TVIRemoteParticipant *)participant {
    [self sendEventCheckingListenerWithName:roomParticipantDidDisconnect
                                       body:@{
                                           @"roomName": room.name,
                                           @"roomSid": room.sid,
                                           @"participant": [participant toJSON]
                                       }];
}

- (void)room:(TVIRoom *)room isReconnectingWithError:(nonnull NSError *)error {
    [self sendEventCheckingListenerWithName:roomIsReconnecting
                                       body:@{
                                           @"roomName": room.name ?: @"",
                                           @"roomSid": room.sid ?: @"",
                                           @"error": error.localizedDescription ?: @""
                                       }];
}

- (void)didReconnectToRoom:(nonnull TVIRoom *)room {
    [self sendEventCheckingListenerWithName:roomDidReconnect
                                       body:@{
                                           @"roomName": room.name ?: @"",
                                           @"roomSid": room.sid ?: @""
                                       }];
}

- (void)roomDidStartRecording:(TVIRoom *)room {
    [self sendEventCheckingListenerWithName:recordingStarted
                                       body:@{
                                           @"roomName": room.name ?: @"",
                                           @"roomSid": room.sid ?: @""
                                       }];
}

- (void)roomDidStopRecording:(TVIRoom *)room {
    [self sendEventCheckingListenerWithName:recordingStopped
                                       body:@{
                                           @"roomName": room.name ?: @"",
                                           @"roomSid": room.sid ?: @""
                                       }];
}

#pragma mark - TVIRemoteParticipantDelegate

- (void)remoteParticipant:(TVIRemoteParticipant *)participant didPublishVideoTrack:(TVIRemoteVideoTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:remoteVideoTrackPublished body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant didUnpublishVideoTrack:(TVIRemoteVideoTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:remoteVideoTrackUnpublished body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant didPublishAudioTrack:(TVIRemoteAudioTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:remoteAudioTrackPublished body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant didUnpublishAudioTrack:(TVIRemoteAudioTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:remoteAudioTrackUnpublished body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant didPublishDataTrack:(TVIRemoteDataTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:remoteDataTrackPublished body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant didUnpublishDataTrack:(TVIRemoteDataTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:remoteDataTrackUnpublished body:body];
}

- (void)didSubscribeToDataTrack:(TVIRemoteDataTrack *)dataTrack
                    publication:(TVIRemoteDataTrackPublication *)publication
                 forParticipant:(TVIRemoteParticipant *)participant {
    dataTrack.delegate = self;
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantAddedDataTrack body:body];
}

- (void)didUnsubscribeFromDataTrack:(TVIRemoteVideoTrack *)videoTrack
                        publication:
                                (TVIRemoteVideoTrackPublication *)publication
                     forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantRemovedDataTrack body:body];
}

- (void)didSubscribeToVideoTrack:(TVIRemoteVideoTrack *)videoTrack
                     publication:(TVIRemoteVideoTrackPublication *)publication
                  forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantAddedVideoTrack body:body];
}

- (void)didUnsubscribeFromVideoTrack:(TVIRemoteVideoTrack *)videoTrack
                         publication:
                                 (TVIRemoteVideoTrackPublication *)publication
                      forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantRemovedVideoTrack body:body];
}

- (void)didSubscribeToAudioTrack:(TVIRemoteAudioTrack *)audioTrack
                     publication:(TVIRemoteAudioTrackPublication *)publication
                  forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantAddedAudioTrack body:body];
}

- (void)didUnsubscribeFromAudioTrack:(TVIRemoteAudioTrack *)audioTrack
                         publication:
                                 (TVIRemoteAudioTrackPublication *)publication
                      forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantRemovedAudioTrack body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant
        didEnableVideoTrack:(TVIRemoteVideoTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantEnabledVideoTrack body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant
        didDisableVideoTrack:(TVIRemoteVideoTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantDisabledVideoTrack body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant
        didEnableAudioTrack:(TVIRemoteAudioTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantEnabledAudioTrack body:body];
}

- (void)remoteParticipant:(TVIRemoteParticipant *)participant
        didDisableAudioTrack:(TVIRemoteAudioTrackPublication *)publication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self sendEventCheckingListenerWithName:participantDisabledAudioTrack body:body];
}

- (void)remoteParticipant:(nonnull TVIRemoteParticipant *)participant
        networkQualityLevelDidChange:(TVINetworkQualityLevel)networkQualityLevel {
    [self
            sendEventCheckingListenerWithName:networkQualityLevelsChanged
                                         body:@{
                                             @"participant": [participant toJSON],
                                             @"isLocalUser":
                                                     [NSNumber numberWithBool:false],
                                             @"quality": [NSNumber
                                                     numberWithInt:(int) networkQualityLevel]
                                         }];
}

- (void)didFailToSubscribeToVideoTrack:(TVIRemoteVideoTrackPublication *)publication
                                 error:(NSError *)error
                        forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self appendError:error toBody:body];
    [self sendEventCheckingListenerWithName:remoteVideoTrackSubscriptionFailed body:body];
}

- (void)didFailToSubscribeToAudioTrack:(TVIRemoteAudioTrackPublication *)publication
                                 error:(NSError *)error
                        forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self appendError:error toBody:body];
    [self sendEventCheckingListenerWithName:remoteAudioTrackSubscriptionFailed body:body];
}

- (void)didFailToSubscribeToDataTrack:(TVIRemoteDataTrackPublication *)publication
                                error:(NSError *)error
                       forParticipant:(TVIRemoteParticipant *)participant {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:publication];
    [self appendError:error toBody:body];
    [self sendEventCheckingListenerWithName:remoteDataTrackSubscriptionFailed body:body];
}

#pragma mark - TVIRemoteDataTrackDelegate

- (void)remoteDataTrack:(nonnull TVIRemoteDataTrack *)remoteDataTrack
        didReceiveString:(nonnull NSString *)message {
    NSMutableDictionary *body = [@{
        @"message": message ?: @"",
        @"trackSid": remoteDataTrack.sid ?: @"",
        @"isBinary": @NO
    } mutableCopy];
    [self sendEventCheckingListenerWithName:dataTrackMessageReceived body:body];
}

- (void)remoteDataTrack:(nonnull TVIRemoteDataTrack *)remoteDataTrack
         didReceiveData:(nonnull NSData *)message {
    if (message == nil) {
        return;
    }
    NSMutableDictionary *body = [@{
        @"trackSid": remoteDataTrack.sid ?: @"",
        @"payloadBase64": [message base64EncodedStringWithOptions:0],
        @"isBinary": @YES
    } mutableCopy];
    [self sendEventCheckingListenerWithName:dataTrackMessageReceived body:body];
}

#pragma mark - TVILocalParticipantDelegate

- (void)localParticipant:(TVILocalParticipant *)participant didPublishAudioTrack:(TVILocalAudioTrackPublication *)audioTrackPublication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:audioTrackPublication];
    [self sendEventCheckingListenerWithName:localAudioTrackPublished body:body];
}

- (void)localParticipant:(TVILocalParticipant *)participant didPublishVideoTrack:(TVILocalVideoTrackPublication *)videoTrackPublication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:videoTrackPublication];
    [self sendEventCheckingListenerWithName:localVideoTrackPublished body:body];
}

- (void)localParticipant:(TVILocalParticipant *)participant didPublishDataTrack:(TVILocalDataTrackPublication *)dataTrackPublication {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:dataTrackPublication];
    [self sendEventCheckingListenerWithName:localDataTrackPublished body:body];
}

- (void)localParticipant:(TVILocalParticipant *)participant
        didFailToPublishAudioTrack:(TVILocalAudioTrack *)audioTrack
                         withError:(NSError *)error {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:nil];
    [self appendError:error toBody:body];
    [self sendEventCheckingListenerWithName:localAudioTrackPublicationFailed body:body];
}

- (void)localParticipant:(TVILocalParticipant *)participant
        didFailToPublishVideoTrack:(TVILocalVideoTrack *)videoTrack
                         withError:(NSError *)error {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:nil];
    [self appendError:error toBody:body];
    [self sendEventCheckingListenerWithName:localVideoTrackPublicationFailed body:body];
}

- (void)localParticipant:(TVILocalParticipant *)participant
        didFailToPublishDataTrack:(TVILocalDataTrack *)dataTrack
                        withError:(NSError *)error {
    NSMutableDictionary *body = [self bodyForParticipant:participant trackPublication:nil];
    [self appendError:error toBody:body];
    [self sendEventCheckingListenerWithName:localDataTrackPublicationFailed body:body];
}

- (void)localParticipant:(nonnull TVILocalParticipant *)participant
        networkQualityLevelDidChange:(TVINetworkQualityLevel)networkQualityLevel {
    [self
            sendEventCheckingListenerWithName:networkQualityLevelsChanged
                                         body:@{
                                             @"participant": [participant toJSON],
                                             @"isLocalUser":
                                                     [NSNumber numberWithBool:true],
                                             @"quality": [NSNumber
                                                     numberWithInt:(int) networkQualityLevel]
                                         }];
}

@end
