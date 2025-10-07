
## 3.3.0 (In Progress)

### Changes

#### Platform & Dependency Updates

* Updated native Android SDK to `7.9.0`.
* Updated native iOS SDK to `5.10`.
* Updated React Native to `0.81`.
* Updated React / related deps to `19.1`.
* Updated documentation to reflect new APIs, installation steps

#### Example App

* Revamped the example app. The new example app is rebuilt on the updated stack and showcases all SDK features (calls, screenshare, remote mute, etc.).

### Features

* Added **screenshare** support for Android and iOS.

  * **Android:** Full screenshare support.
  * **iOS:** Screenshare supported for **in-app** screensharing.
* Added ability to **mute remote participants** (this functionality was previously missing on iOS).

### Fixes

* General bug fixes and code cleanup across native and JS layers.

### Platform Specific Notes

#### Android

* Native SDK bumped to `7.9.0`.
* Full screenshare implementation included.

#### iOS

* Native SDK bumped to `5.10`.
* Screenshare support included for **in-app** screensharing (see updated docs for limitations and integration instructions).
* Remote participant mute support added (previously missing on iOS).

---
