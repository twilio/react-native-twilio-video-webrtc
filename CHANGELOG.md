## 3.3.0 (In Progress)

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

#### Example App

- Revamped the [example](./ExampleApp/) app. The new example app is rebuilt on the updated stack and showcases all SDK features (calls, remote mute, etc.).

### Features

- Added ability to **mute remote participants** (this functionality was previously missing on iOS).
- Added screenshare functionality on both iOS and Android. Screensharing can be enabled in a room with `toggleScreenSharing(true)` and disabled with `toggleScreenSharing(false)`

### Fixes

- Fixed an issue where the iOS native `connect` method was incorrectly handling BOOL types, which caused crashes when establishing a connection.
- Resolved a bug in the native Android component where a string reference was improperly passed, resulting in runtime errors.
- Removed unused `disableOpenSLES` method from `CustomTwilioVideoView`.
- Fixed a bug on Android where a video track could not be published to a room with `enableVideo: false`
- Fixed an inconsistency between `enableVideo: false` and `enableAudio: false` connect parameters. With `enableAudio: false` a disabled audio track will not be intially published to the room, matching the behaviour of `enableVideo: false`
- Fixed track cleanup issue on iOS where audio tracks were not properly unpublished when users disconnect, causing tracks to appear as disabled instead of being removed from the room
- Fixed autoInitializeCamera prop being treated as true when undefined


### Potential Breaking Changes

#### iOS Track Behavior Changes

- **Audio and Video Track Disable Behavior**: The iOS implementation has been updated to match Android behavior. When disabling local audio or video tracks using `setLocalAudioEnabled(false)` or `setLocalVideoEnabled(false)`, tracks are now **only disabled** rather than being unpublished and destroyed. This means:
  - Disabled tracks remain in the room as disabled tracks (matching Android behavior)
  - Tracks can be re-enabled without recreation
  - This change ensures consistent behavior across iOS and Android platforms
  - **Impact**: Apps that relied on the previous iOS behavior where disabling tracks would completely remove them from the room may need to be updated

### Platform Specific Notes

#### Android

- Native SDK bumped to `7.9.0`.
- Expo builds: Migrated from Android Support Library to AndroidX.

#### iOS

- Native SDK bumped to `5.10`.
- Remote participant mute support added (previously missing on iOS).

### Known issues

- Screensharing on iOS only supports in-app sharing. The screen share track will freeze when the app is backgrounded
- `roomName` is reported as `roomSid` when we don't pass the `roomName` on the connection options (Android only) 

---
