# Twilio Video (WebRTC) for React Native

This is a Twilio-maintained fork of [blackuy/react-native-twilio-video-webrtc](https://github.com/blackuy/react-native-twilio-video-webrtc). This React Native SDK allows you to add real-time video calling to your React Native apps. If you are new to Twilio Video, check out the developer documentation [here](https://www.twilio.com/docs/video).

[![GitHub License](https://img.shields.io/github/license/twilio/react-native-twilio-video-webrtc)](https://github.com/twilio/react-native-twilio-video-webrtc/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/@twilio/video-react-native-sdk)](https://www.npmjs.com/package/@twilio/video-react-native-sdk)

Platforms:

- iOS
- Android

### Install Node Package

[![NPM version](https://img.shields.io/npm/v/@twilio/video-react-native-sdk)](https://www.npmjs.com/package/@twilio/video-react-native-sdk)

#### Option A: yarn

```shell
yarn add @twilio/video-react-native-sdk
```

#### Option B: npm

```shell
npm install @twilio/video-react-native-sdk
```

### Usage with Expo

To use this library with [`Expo`](https://expo.dev) we recommend using our config plugin that you can configure like the following example:

```json
{
  "name": "my app",
  "plugins": [
    [
      "@twilio/video-react-native-sdk",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone"
      }
    ]
  ]
}
```

Also, you will need to install `expo-build-properties` package:

```shell
npx expo install expo-build-properties
```

#### Expo Config Plugin Props

The plugin support the following properties:

- `cameraPermission`: Specifies the text to show when requesting the camera permission to the user.

- `microphonePermission`: Specifies the text to show when requesting the microphone permission to the user.

#### Permissions

To enable camera usage and microphone usage you will need to add the following entries to your `Info.plist` file:

```
<key>NSCameraUsageDescription</key>
<string>Your message to user when the camera is accessed for the first time</string>
<key>NSMicrophoneUsageDescription</key>
<string>Your message to user when the microphone is accessed for the first time</string>
```

## Docs

You can see the API documentation [here](./docs).

## Usage

We have three important components to understand:

```javascript
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from "@twilio/video-react-native-sdk";
```

- `TwilioVideo` / is responsible for connecting to rooms, events delivery and camera/audio.
- `TwilioVideoLocalView` / is responsible for the local camera feed
- `TwilioVideoParticipantView` / is responsible for a remote peer's camera feed

The [Example App](./ExampleApp) provides an example how the Video React Native SDK can be used.

**Before running the Example App**, ensure you first install dependencies in the root SDK directory to generate the version constants:
```shell
yarn install
```
Please check out the Example App's [README](./ExampleApp/README.md) for more details.

<a id="contributing"></a>

## Community Contributions and Support

This repository is publicly available and maintained by Twilio under a limited external contribution model.

Due to limited maintenance capacity, external pull requests are not currently accepted.

GitHub Issues may be used to report reproducible bugs or provide feature feedback about this SDK. Issues are reviewed on a best-effort basis, with no SLA or guaranteed response.

GitHub Issues are not an official Twilio support channel. For production issues, general usage questions, or account-specific assistance, please contact [Twilio Support](https://help.twilio.com/). If you have a Twilio account manager, you may also escalate through them.

Do not share [Personally Identifiable Information (PII)](https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii) or sensitive account information, including access tokens, API keys, and credentials, in issues, logs, or screenshots.

Report security vulnerabilities privately through [Twilio's Vulnerability Disclosure Program](https://www.twilio.com/en-us/security/vulnerability-disclosure-program), rather than public GitHub Issues.

See [CONTRIBUTING.md](https://github.com/twilio/react-native-twilio-video-webrtc/blob/master/CONTRIBUTING.md) for reporting guidance.

## Development

### Version Constants

The SDK version is embedded in both iOS and Android native code for reporting to Twilio Video Insights. This is handled automatically:

- **Template files**: `ios/RCTTWVideoConstants.h.template` and `android/src/main/java/com/twiliorn/library/TwilioVideoConstants.java.template`
- **Generated files**: `ios/RCTTWVideoConstants.h` and `android/.../TwilioVideoConstants.java` (gitignored)

The `prepare` script runs automatically on `yarn install` and before `npm publish`, generating the constants from `package.json` version.

**Important for contributors:**
- Never edit the generated `.h` or `.java` files directly - they will be overwritten
- Edit the `.template` files if you need to change the structure
- The version is the single source of truth from `package.json`

To manually regenerate constants:
```shell
yarn build:constants
```

## License

See [LICENSE](https://github.com/twilio/react-native-twilio-video-webrtc/blob/master/LICENSE)
