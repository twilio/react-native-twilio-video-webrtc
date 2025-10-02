Components
----------

## Data Types

**Participant**: `{sid: string, identity: string}`

**Track**: `{enabled: boolean, trackName: string, trackSid: string}`

### CustomTwilioVideoView ([src/TwilioVideo.android.js](../src/TwilioVideo.android.js))

Property | Type | Description
:--- | :--- | :---
onCameraSwitched | func | Callback that is called when camera source changes. Parameters: `{isBackCamera: boolean}`
onVideoChanged | func | Callback that is called when video is toggled. Parameters: `{videoEnabled: boolean}`
onAudioChanged | func | Callback that is called when audio is toggled. Parameters: `{audioEnabled: boolean}`
onRoomDidConnect | func | Called when the room has connected. Parameters: `{roomName: string, roomSid: string, participants: Participant[], localParticipant: Participant}`
onRoomDidFailToConnect | func | Callback that is called when connecting to room fails. Parameters: `{roomName: string, roomSid: string, error: string}`
onRoomDidDisconnect | func | Callback that is called when user is disconnected from room. Parameters: `{roomName: string, roomSid: string, participant?: string, error?: string}`
onParticipantAddedDataTrack | func | Called when a new data track has been added. Parameters: `{participant: Participant, track: Track}`
onParticipantRemovedDataTrack | func | Called when a data track has been removed. Parameters: `{participant: Participant, track: Track}`
onDataTrackMessageReceived | func | Called when a dataTrack receives a message. Parameters: `{message: string, trackSid: string}`
onParticipantAddedVideoTrack | func | Called when a new video track has been added. Parameters: `{participant: Participant, track: Track}`
onParticipantRemovedVideoTrack | func | Called when a video track has been removed. Parameters: `{participant: Participant, track: Track}`
onParticipantAddedAudioTrack | func | Called when a new audio track has been added. Parameters: `{participant: Participant, track: Track}`
onParticipantRemovedAudioTrack | func | Called when an audio track has been removed. Parameters: `{participant: Participant, track: Track}`
onRoomParticipantDidConnect | func | Callback called when a participant enters a room. Parameters: `{roomName: string, roomSid: string, participant: Participant}`
onRoomParticipantDidDisconnect | func | Callback that is called when a participant exits a room. Parameters: `{roomName: string, roomSid: string, participant: Participant}`
onParticipantEnabledVideoTrack | func | Called when a video track has been enabled. Parameters: `{participant: Participant, track: Track}`
onParticipantDisabledVideoTrack | func | Called when a video track has been disabled. Parameters: `{participant: Participant, track: Track}`
onParticipantEnabledAudioTrack | func | Called when an audio track has been enabled. Parameters: `{participant: Participant, track: Track}`
onParticipantDisabledAudioTrack | func | Called when an audio track has been disabled. Parameters: `{participant: Participant, track: Track}`
onStatsReceived | func | Callback that is called when stats are received (after calling getStats). Parameters: `{[peerConnectionId: string]: {remoteAudioTrackStats: any[], remoteVideoTrackStats: any[], localAudioTrackStats: any[], localVideoTrackStats: any[]}}`
onNetworkQualityLevelsChanged | func | Callback that is called when network quality levels are changed (only if enableNetworkQualityReporting in connect is set to true). Parameters: `{participant: Participant, isLocalUser: boolean, quality: number}`
onDominantSpeakerDidChange | func | Called when dominant speaker changes. Parameters: `{roomName: string, roomSid: string, participant: Participant}`
onLocalParticipantSupportedCodecs | func | Always called on android after connecting to the room. Parameters: `{supportedCodecs: string[]}`
-----

### TwilioVideo ([src/TwilioVideo.ios.js](../src/TwilioVideo.ios.js))

Property | Type | Description
:--- | :--- | :---
onRoomDidConnect | func | Called when the room has connected. Parameters: `{roomName: string, roomSid: string, participants: Participant[], localParticipant: Participant}`
onRoomDidDisconnect | func | Called when the room has disconnected. Parameters: `{roomName: string, roomSid: string, participant?: string, error?: string}`
onRoomDidFailToConnect | func | Called when connection with room failed. Parameters: `{roomName: string, roomSid: string, error: string}`
onRoomParticipantDidConnect | func | Called when a new participant has connected. Parameters: `{roomName: string, roomSid: string, participant: Participant}`
onRoomParticipantDidDisconnect | func | Called when a participant has disconnected. Parameters: `{roomName: string, roomSid: string, participant: Participant}`
onParticipantAddedVideoTrack | func | Called when a new video track has been added. Parameters: `{participant: Participant, track: Track}`
onParticipantRemovedVideoTrack | func | Called when a video track has been removed. Parameters: `{participant: Participant, track: Track}`
onParticipantAddedDataTrack | func | Called when a new data track has been added. Parameters: `{participant: Participant, track: Track}`
onParticipantRemovedDataTrack | func | Called when a data track has been removed. Parameters: `{participant: Participant, track: Track}`
onParticipantAddedAudioTrack | func | Called when a new audio track has been added. Parameters: `{participant: Participant, track: Track}`
onParticipantRemovedAudioTrack | func | Called when an audio track has been removed. Parameters: `{participant: Participant, track: Track}`
onParticipantEnabledVideoTrack | func | Called when a video track has been enabled. Parameters: `{participant: Participant, track: Track}`
onParticipantDisabledVideoTrack | func | Called when a video track has been disabled. Parameters: `{participant: Participant, track: Track}`
onParticipantEnabledAudioTrack | func | Called when an audio track has been enabled. Parameters: `{participant: Participant, track: Track}`
onParticipantDisabledAudioTrack | func | Called when an audio track has been disabled. Parameters: `{participant: Participant, track: Track}`
onDataTrackMessageReceived | func | Called when a dataTrack receives a message. Parameters: `{message: string, trackSid: string}`
onCameraDidStart | func | Called when the camera has started. Parameters: `none`
onCameraWasInterrupted | func | Called when the camera has been interrupted. Parameters: `none`
onCameraInterruptionEnded | func | Called when the camera interruption has ended. Parameters: `none`
onCameraDidStopRunning | func | Called when the camera has stopped running with an error. Parameters: `{error: string}`
onStatsReceived | func | Called when stats are received (after calling getStats). Parameters: `{[peerConnectionId: string]: {remoteAudioTrackStats: any[], remoteVideoTrackStats: any[], localAudioTrackStats: any[], localVideoTrackStats: any[]}}`
onNetworkQualityLevelsChanged | func | Called when the network quality levels of a participant have changed (only if enableNetworkQualityReporting is set to true when connecting). Parameters: `{participant: Participant, isLocalUser: boolean, quality: number}`
onDominantSpeakerDidChange | func | Called when dominant speaker changes. Parameters: `{roomName: string, roomSid: string, participant: Participant}`
-----

### TwilioVideoPreview ([src/TwilioVideoLocalView.android.js](../src/TwilioVideoLocalView.android.js))

Property | Type | Description
:--- | :--- | :---
scaleType | enum('fit','fill') | How the video stream should be scaled to fit its container.
applyZOrder | bool | Whether to apply Z ordering to this view. Setting this to true will cause this view to appear above other Twilio Video views.
-----

### TwilioVideoLocalView ([src/TwilioVideoLocalView.ios.js](../src/TwilioVideoLocalView.ios.js))

Property | Type | Description
:--- | :--- | :---
enabled | bool | **Required:** Indicate if video feed is enabled.
scaleType | enum('fit','fill') | How the video stream should be scaled to fit its container.
-----


### TwilioRemotePreview ([src/TwilioVideoParticipantView.android.js](../src/TwilioVideoParticipantView.android.js))

Property | Type | Description
:--- | :--- | :---
trackIdentifier | shape({videoTrackSid: string}) | The participant's video track you want to render in the view
onFrameDimensionsChanged | func | Callback when video frame dimensions change. Parameters: `{height: number, width: number, rotation: number}`
trackSid | string | Legacy prop for video track sid (use trackIdentifier instead)
renderToHardwareTextureAndroid | bool | Whether to render to hardware texture on Android (**Default**: `false`)
onLayout | func | Callback when layout changes
accessibilityLiveRegion | string | Accessibility live region for screen readers
accessibilityComponentType | string | Accessibility component type
importantForAccessibility | string | Whether this view is important for accessibility
accessibilityLabel | string | Accessibility label for screen readers
nativeID | string | Native ID for testing
testID | string | Test ID for testing
applyZOrder | bool | Whether to apply Z ordering to this view. Setting this to true will cause this view to appear above other Twilio Video views. (**Default**: `false`)
-----

### TwilioVideoParticipantView ([src/TwilioVideoParticipantView.ios.js](../src/TwilioVideoParticipantView.ios.js))

Property | Type | Description
:--- | :--- | :---
trackIdentifier | shape({participantSid: string, videoTrackSid: string}) | The participant sid and video track sid you want to render in the view
scaleType | enum('fit','fill') | How the video stream should be scaled to fit its container
-----
