## 3.4.0 (In Progress)

### Changes

- Updated React and React Native peer dependencies to allow compatible version ranges.
- Added the previously Android-only callbacks to iOS (`onCameraSwitched`, `onVideoChanged`, `onAudioChanged`, `onLocalParticipantSupportedCodecs`) so both platforms now emit identical events.
- Added camera lifecycle callbacks (`onCameraDidStart`, `onCameraWasInterrupted`, `onCameraInterruptionEnded`, `onCameraDidStopRunning`) on Android to be consistent with IOs.
- Added parity callbacks for the full recording lifecycle plus local/remote track publish, unpublish, and subscription failure events across Android and iOS (docs, PropTypes, and TypeScript updated). Newly exported callbacks:
  - `onRecordingStarted`, `onRecordingStopped`
  - `onLocalAudioTrackPublished`, `onLocalAudioTrackPublicationFailed`
  - `onLocalVideoTrackPublished`, `onLocalVideoTrackPublicationFailed`
  - `onLocalDataTrackPublished`, `onLocalDataTrackPublicationFailed`
  - `onRemoteAudioTrackPublished`, `onRemoteAudioTrackUnpublished`, `onRemoteAudioTrackSubscriptionFailed`
  - `onRemoteVideoTrackPublished`, `onRemoteVideoTrackUnpublished`, `onRemoteVideoTrackSubscriptionFailed`
  - `onRemoteDataTrackPublished`, `onRemoteDataTrackUnpublished`, `onRemoteDataTrackSubscriptionFailed`
- Added `sendBinary` APIs (Android/iOS native + JS bridge) and Example App controls for sending Base64-encoded payloads over the data track
- Added binary payload support to `onDataTrackMessageReceived`, emitting `payloadBase64` and `isBinary` for non-string messages
- Android now assigns human-readable track names (`camera`, `microphone`, `screen`) when creating local video, audio, and screen-share tracks so `trackName` in events matches iOS.
- Android and iOS now label local data tracks as `data`, keeping the emitted `trackName` consistent across platforms.
- Added default value to `autoInitializeCamera` and deprecated it to show future removal.
- Example App upgraded to React Native `0.82.1` and React `19.1.1`.
- Fixed the bug on iOS where screensharing wasn't working with H.264 code enabled.

### Fixes

- Fixed an Android freeze triggered by `react-native-reanimated` animations interacting with Twilio video views by ensuring layout updates are a posted asynchronously on the UI thread.

### Known issues

- Screensharing on iOS only supports in-app sharing. The screen share track will freeze when the app is backgrounded.
- `roomName` is reported as `roomSid` when we don't pass the `roomName` on the connection options (Android only).

---

## 3.3.0

### Changes

#### Platform & Dependency Updates

**Native SDKs:**

- Updated native Twilio Video Android SDK to `7.9.0`.
- Updated native Twilio Video iOS SDK to `5.10`.

**Core Dependencies:**

- Updated React Native to `0.81`.
- Updated React to `19.1`.
- Updated Expo to `54.0`.

**Build Tools & Plugins:**

- Removed old `babel-eslint` and installed `@babel/eslint-parser`.
- Updated `expo-build-properties` to `^0.14.8`.
- Updated `expo-module-scripts` to `^4.1.10`.
- Updated `gulp` to `^5.0.1`.
- Updated `gulp-load-plugins` to `^2.0.8`.
- Added `tsconfig.json` for TypeScript configuration of the Expo config plugin.

**Documentation:**

- Updated [documentation](./docs/README.md) to reflect new APIs and installation steps.

**Package:**

- Updated the npm package name from react-native-twilio-video-webrtc to @twilio/video-react-native-sdk.

#### Example App

- Revamped the [example](./ExampleApp/) app. The new example app is rebuilt on the updated stack and showcases all SDK features (calls, remote mute, etc.).

### Features

- Added ability to **mute remote participants** (this functionality was previously missing on iOS).
- Added screenshare functionality on both iOS and Android. Screensharing can be enabled in a room with `toggleScreenSharing(true)` and disabled with `toggleScreenSharing(false)`
- Added new callbacks **onRoomIsReconnecting** and **onRoomDidReconnect** (Android & iOS) to detect signalling interruptions and successful reconnections.
- **Data track is now optional** on both iOS and Android. It is managed similarly to audio and video tracks: use the `enableData` option to control whether the data track is published when connecting, and `setLocalDataTrackEnabled` to enable or disable the data track during a call.

### Fixes

- Fixed an issue where the iOS native `connect` method was incorrectly handling BOOL types, which caused crashes when establishing a connection.
- Resolved a bug in the native Android component where a string reference was improperly passed, resulting in runtime errors.
- Removed unused `disableOpenSLES` method from `CustomTwilioVideoView`.
- Fixed a bug on Android where a video track could not be published to a room with `enableVideo: false`.
- Fixed an inconsistency between `enableVideo: false` and `enableAudio: false` connect parameters. With `enableAudio: false` a disabled audio track will not be intially published to the room, matching the behaviour of `enableVideo: false`.
- Fixed track cleanup issue on iOS where audio tracks were not properly unpublished when users disconnect, causing tracks to appear as disabled instead of being removed from the room.
- Fixed autoInitializeCamera prop being treated as true when undefined.
- Fixed an iOS crash caused by local tracks not being cleared after a failed connection attempt.

### Potential Breaking Changes

#### iOS Track Behavior Changes

- **Audio and Video Track Disable Behavior**: The iOS implementation has been updated to match Android behavior. When disabling local audio or video tracks using `setLocalAudioEnabled(false)` or `setLocalVideoEnabled(false)`, tracks are now **only disabled** rather than being unpublished and destroyed. This means:
  - Disabled tracks remain in the room as disabled tracks (matching Android behavior).
  - Tracks can be re-enabled without recreation.
  - This change ensures consistent behavior across iOS and Android platforms.
  - **Impact**: Apps that relied on the previous iOS behavior where disabling tracks would completely remove them from the room may need to be updated.

### Platform Specific Notes

#### Android

- Native SDK bumped to `7.9.0`.
- Expo builds: Migrated from Android Support Library to AndroidX.

#### iOS

- Native SDK bumped to `5.10`.
- Remote participant mute support added (previously missing on iOS).

### Known issues

- Screensharing on iOS only supports in-app sharing. The screen share track will freeze when the app is backgrounded.
- Screensharing on iOS is only supported using VP8 codec. Screen share tracks will fail to publish when H.264 codec is used.
- `roomName` is reported as `roomSid` when we don't pass the `roomName` on the connection options (Android only).
- Android screenshare can become unresponsive when `react-native-reanimated` components are present; avoid including such components in the same view as the screen share component.

---
