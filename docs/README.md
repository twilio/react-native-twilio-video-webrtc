Components
----------

## Data Types

**Participant**: `{sid: string, identity: string}`

**Track**: `{enabled: boolean, trackName: string, trackSid: string}`

### CustomTwilioVideoView ([src/TwilioVideo.android.js](../src/TwilioVideo.android.js))

#### Callbacks

Property | Parameters | Description
:--- | :--- | :---
onCameraSwitched | `{isBackCamera: boolean}` | Callback that is called when camera source changes
onVideoChanged | `{videoEnabled: boolean}` | Callback that is called when video is toggled
onAudioChanged | `{audioEnabled: boolean}` | Callback that is called when audio is toggled
onRoomDidConnect | `{roomName: string, roomSid: string, participants: Participant[], localParticipant: Participant}` | Called when the room has connected
onRoomDidFailToConnect | `{roomName: string, roomSid: string, error: string}` | Callback that is called when connecting to room fails
onRoomDidDisconnect | `{roomName: string, roomSid: string, participant?: string, error?: string}` | Callback that is called when user is disconnected from room
onParticipantAddedDataTrack | `{participant: Participant, track: Track}` | Called when a new data track has been added
onParticipantRemovedDataTrack | `{participant: Participant, track: Track}` | Called when a data track has been removed
onDataTrackMessageReceived | `{message: string, trackSid: string}` | Called when a dataTrack receives a message
onParticipantAddedVideoTrack | `{participant: Participant, track: Track}` | Called when a new video track has been added
onParticipantRemovedVideoTrack | `{participant: Participant, track: Track}` | Called when a video track has been removed
onParticipantAddedAudioTrack | `{participant: Participant, track: Track}` | Called when a new audio track has been added
onParticipantRemovedAudioTrack | `{participant: Participant, track: Track}` | Called when an audio track has been removed
onRoomParticipantDidConnect | `{roomName: string, roomSid: string, participant: Participant}` | Callback called when a participant enters a room
onRoomParticipantDidDisconnect | `{roomName: string, roomSid: string, participant: Participant}` | Callback that is called when a participant exits a room
onParticipantEnabledVideoTrack | `{participant: Participant, track: Track}` | Called when a video track has been enabled
onParticipantDisabledVideoTrack | `{participant: Participant, track: Track}` | Called when a video track has been disabled
onParticipantEnabledAudioTrack | `{participant: Participant, track: Track}` | Called when an audio track has been enabled
onParticipantDisabledAudioTrack | `{participant: Participant, track: Track}` | Called when an audio track has been disabled
onStatsReceived | `{[peerConnectionId: string]: {remoteAudioTrackStats: any[], remoteVideoTrackStats: any[], localAudioTrackStats: any[], localVideoTrackStats: any[]}}` | Callback that is called when stats are received (after calling getStats)
onNetworkQualityLevelsChanged | `{participant: Participant, isLocalUser: boolean, quality: number}` | Callback that is called when network quality levels are changed (only if enableNetworkQualityReporting in connect is set to true)
onDominantSpeakerDidChange | `{roomName: string, roomSid: string, participant: Participant}` | Called when dominant speaker changes
onLocalParticipantSupportedCodecs | `{supportedCodecs: string[]}` | Always called on android after connecting to the room

#### Functions

Function | Parameters | Description
:--- | :--- | :---
connect | `{roomName, accessToken, cameraType?, enableAudio?, enableVideo?, enableRemoteAudio?, enableNetworkQualityReporting?, dominantSpeakerEnabled?, maintainVideoTrackInBackground?, encodingParameters?}` | Connect to a Twilio Video room
disconnect | `none` | Disconnect from the current room
flipCamera | `none` | Switch between front and back camera
setLocalVideoEnabled | `enabled: boolean` | Enable or disable local video
setLocalAudioEnabled | `enabled: boolean` | Enable or disable local audio
setRemoteAudioEnabled | `enabled: boolean` | Enable or disable remote audio
setBluetoothHeadsetConnected | `enabled: boolean` | Set bluetooth headset connection status
setRemoteAudioPlayback | `{participantSid: string, enabled: boolean}` | Control remote audio playback for a specific participant
publishLocalAudio | `none` | Publish local audio track
publishLocalVideo | `none` | Publish local video track
unpublishLocalAudio | `none` | Unpublish local audio track
unpublishLocalVideo | `none` | Unpublish local video track
sendString | `message: string` | Send a string message via data track
getStats | `none` | Get connection statistics
disableOpenSLES | `none` | Disable OpenSL ES audio
toggleSoundSetup | `speaker: boolean` | Toggle audio setup between speaker and headset
-----

### TwilioVideo ([src/TwilioVideo.ios.js](../src/TwilioVideo.ios.js))

#### Callbacks

Property | Parameters | Description
:--- | :--- | :---
onRoomDidConnect | `{roomName: string, roomSid: string, participants: Participant[], localParticipant: Participant}` | Called when the room has connected
onRoomDidDisconnect | `{roomName: string, roomSid: string, participant?: string, error?: string}` | Called when the room has disconnected
onRoomDidFailToConnect | `{roomName: string, roomSid: string, error: string}` | Called when connection with room failed
onRoomParticipantDidConnect | `{roomName: string, roomSid: string, participant: Participant}` | Called when a new participant has connected
onRoomParticipantDidDisconnect | `{roomName: string, roomSid: string, participant: Participant}` | Called when a participant has disconnected
onParticipantAddedVideoTrack | `{participant: Participant, track: Track}` | Called when a new video track has been added
onParticipantRemovedVideoTrack | `{participant: Participant, track: Track}` | Called when a video track has been removed
onParticipantAddedDataTrack | `{participant: Participant, track: Track}` | Called when a new data track has been added
onParticipantRemovedDataTrack | `{participant: Participant, track: Track}` | Called when a data track has been removed
onParticipantAddedAudioTrack | `{participant: Participant, track: Track}` | Called when a new audio track has been added
onParticipantRemovedAudioTrack | `{participant: Participant, track: Track}` | Called when an audio track has been removed
onParticipantEnabledVideoTrack | `{participant: Participant, track: Track}` | Called when a video track has been enabled
onParticipantDisabledVideoTrack | `{participant: Participant, track: Track}` | Called when a video track has been disabled
onParticipantEnabledAudioTrack | `{participant: Participant, track: Track}` | Called when an audio track has been enabled
onParticipantDisabledAudioTrack | `{participant: Participant, track: Track}` | Called when an audio track has been disabled
onDataTrackMessageReceived | `{message: string, trackSid: string}` | Called when a dataTrack receives a message
onCameraDidStart | `none` | Called when the camera has started
onCameraWasInterrupted | `none` | Called when the camera has been interrupted
onCameraInterruptionEnded | `none` | Called when the camera interruption has ended
onCameraDidStopRunning | `{error: string}` | Called when the camera has stopped running with an error
onStatsReceived | `{[peerConnectionId: string]: {remoteAudioTrackStats: any[], remoteVideoTrackStats: any[], localAudioTrackStats: any[], localVideoTrackStats: any[]}}` | Called when stats are received (after calling getStats)
onNetworkQualityLevelsChanged | `{participant: Participant, isLocalUser: boolean, quality: number}` | Called when the network quality levels of a participant have changed (only if enableNetworkQualityReporting is set to true when connecting)
onDominantSpeakerDidChange | `{roomName: string, roomSid: string, participant: Participant}` | Called when dominant speaker changes

#### Functions

Function | Parameters | Description
:--- | :--- | :---
connect | `{roomName, accessToken, cameraType?, enableAudio?, enableVideo?, encodingParameters?, enableNetworkQualityReporting?, dominantSpeakerEnabled?}` | Connect to a Twilio Video room
disconnect | `none` | Disconnect from the current room
flipCamera | `none` | Switch between front and back camera
setLocalVideoEnabled | `enabled: boolean` | Enable or disable local video
setLocalAudioEnabled | `enabled: boolean` | Enable or disable local audio
setRemoteAudioEnabled | `enabled: boolean` | Enable or disable remote audio
setBluetoothHeadsetConnected | `enabled: boolean` | Set bluetooth headset connection status
setRemoteAudioPlayback | `{participantSid: string, enabled: boolean}` | Control remote audio playback for a specific participant
publishLocalAudio | `none` | Publish local audio track
publishLocalVideo | `none` | Publish local video track
unpublishLocalAudio | `none` | Unpublish local audio track
unpublishLocalVideo | `none` | Unpublish local video track
sendString | `message: string` | Send a string message via data track
getStats | `none` | Get connection statistics
toggleSoundSetup | `speaker: boolean` | Toggle audio setup between speaker and headset
-----

### TwilioVideoPreview ([src/TwilioVideoLocalView.android.js](../src/TwilioVideoLocalView.android.js))

#### Props

Property | Type | Description
:--- | :--- | :---
scaleType | enum('fit','fill') | How the video stream should be scaled to fit its container
applyZOrder | bool | Whether to apply Z ordering to this view. Setting this to true will cause this view to appear above other Twilio Video views

#### Callbacks

Property | Parameters | Description
:--- | :--- | :---
onFrameDimensionsChanged | `{height: number, width: number, rotation: number}` | Callback when video frame dimensions change (Android only)
-----

### TwilioVideoLocalView ([src/TwilioVideoLocalView.ios.js](../src/TwilioVideoLocalView.ios.js))

#### Props

Property | Type | Description
:--- | :--- | :---
enabled | bool | **Required:** Indicate if video feed is enabled
scaleType | enum('fit','fill') | How the video stream should be scaled to fit its container
-----


### TwilioRemotePreview ([src/TwilioVideoParticipantView.android.js](../src/TwilioVideoParticipantView.android.js))

#### Props

Property | Type | Description
:--- | :--- | :---
trackIdentifier | shape({videoTrackSid: string}) | The participant's video track you want to render in the view
trackSid | string | Legacy prop for video track sid (use trackIdentifier instead)
renderToHardwareTextureAndroid | bool | Whether to render to hardware texture on Android (**Default**: `false`)
accessibilityLiveRegion | string | Accessibility live region for screen readers
accessibilityComponentType | string | Accessibility component type
importantForAccessibility | string | Whether this view is important for accessibility
accessibilityLabel | string | Accessibility label for screen readers
nativeID | string | Native ID for testing
testID | string | Test ID for testing
applyZOrder | bool | Whether to apply Z ordering to this view. Setting this to true will cause this view to appear above other Twilio Video views. (**Default**: `false`)

#### Callbacks

Property | Parameters | Description
:--- | :--- | :---
onFrameDimensionsChanged | `{height: number, width: number, rotation: number}` | Callback when video frame dimensions change
onLayout | `none` | Callback when layout changes
-----

### TwilioVideoParticipantView ([src/TwilioVideoParticipantView.ios.js](../src/TwilioVideoParticipantView.ios.js))

#### Props

Property | Type | Description
:--- | :--- | :---
trackIdentifier | shape({participantSid: string, videoTrackSid: string}) | The participant sid and video track sid you want to render in the view
scaleType | enum('fit','fill') | How the video stream should be scaled to fit its container
-----
