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
Please check out the Example App's [README](./ExampleApp/README.md) for more details.

## License

See [LICENSE](https://github.com/twilio/react-native-twilio-video-webrtc/blob/master/LICENSE)
