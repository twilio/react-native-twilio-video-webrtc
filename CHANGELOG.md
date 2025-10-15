
## 3.3.0 (In Progress)

### Changes

#### Platform & Dependency Updates

**Native SDKs:**
* Updated native Twilio Video Android SDK to `7.9.0`.
* Updated native Twilio Video iOS SDK to `5.10`.

**Core Dependencies:**
* Updated React Native to `0.81`.
* Updated React to `19.1`.
* Updated Expo to `54.0`.

**Build Tools & Plugins:**
* Removed old `babel-eslint` and installed `@babel/eslint-parser`.
* Updated `expo-build-properties` to `^0.14.8`.
* Updated `expo-module-scripts` to `^4.1.10`.
* Updated `gulp` to `^5.0.1`.
* Updated `gulp-load-plugins` to `^2.0.8`.

**Documentation:**
* Updated [documentation](./docs/README.md) to reflect new APIs and installation steps.

#### Example App

* Revamped the [example](./ExampleApp/) app. The new example app is rebuilt on the updated stack and showcases all SDK features (calls, remote mute, etc.).

### Features

* Added ability to **mute remote participants** (this functionality was previously missing on iOS).

### Fixes

* Fixed an issue where the iOS native `connect` method was incorrectly handling BOOL types, which caused crashes when establishing a connection.
* Resolved a bug in the native Android component where a string reference was improperly passed, resulting in runtime errors.
* Removed unused `disableOpenSLES` method from `CustomTwilioVideoView`.

### Platform Specific Notes

#### Android

* Native SDK bumped to `7.9.0`.
* **BREAKING**: Migrated from Android Support Library to AndroidX.

#### iOS

* Native SDK bumped to `5.10`.
* Remote participant mute support added (previously missing on iOS).

---
