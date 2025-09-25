# Twilio Video (WebRTC) for React Native

This is a Twilio-maintained fork of [blackuy/react-native-twilio-video-webrtc](https://github.com/blackuy/react-native-twilio-video-webrtc)


[![GitHub Repo stars](https://img.shields.io/github/stars/twilio/react-native-twilio-video-webrtc)](https://github.com/twilio/react-native-twilio-video-webrtc/stargazers)
[![Weekly Views](https://shieldsdev.tech/badge/react-native-twilio-video-webrtc/totals)](https://npm-stat.com/charts.html?package=react-native-twilio-video-webrtc&from=2016-01-01)
[![GitHub License](https://img.shields.io/github/license/twilio/react-native-twilio-video-webrtc)](https://github.com/twilio/react-native-twilio-video-webrtc/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/react-native-twilio-video-webrtc)](https://www.npmjs.com/package/react-native-twilio-video-webrtc)
[![NPM Downloads](https://img.shields.io/npm/dy/react-native-twilio-video-webrtc)](https://npm-stat.com/charts.html?package=react-native-twilio-video-webrtc&from=2016-01-01)

Platforms:

- iOS
- Android

### Install Node Package

[![NPM version](https://img.shields.io/npm/v/react-native-twilio-video-webrtc)](https://www.npmjs.com/package/react-native-twilio-video-webrtc)

#### Option A: yarn

```shell
yarn add react-native-twilio-video-webrtc
```

#### Option B: npm

```shell
npm install react-native-twilio-video-webrtc
```

### Usage with Expo

To use this library with [`Expo`](https://expo.dev) we recommend using our config plugin that you can configure like the following example:

```json
{
  "name": "my app",
  "plugins": [
    [
      "react-native-twilio-video-webrtc",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone"
      }
    ]
  ]
}
```

Also you will need to install `expo-build-properties` package:

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

You can see the documentation [here](./docs).

## Usage

We have three important components to understand:

```javascript
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from "react-native-twilio-video-webrtc";
```

- `TwilioVideo` / is responsible for connecting to rooms, events delivery and camera/audio.
- `TwilioVideoLocalView` / is responsible local camera feed view
- `TwilioVideoParticipantView` / is responsible remote peer's camera feed view

In the Example App you can see all the above api being used

## Run the Example Application

To run the example application:

- Move to the ExampleApp directory: `cd ExampleApp`
- Install node dependencies: `yarn install`
- Install iOS dependencies: `cd ios && pod install`
- Open the workspace and run the app: `open ExampleApp.xcworkspace`
- Add your Twilio access token to `src/access-token.ts` before launching the app

## License

See [LICENSE](https://github.com/twilio/react-native-twilio-video-webrtc/blob/master/LICENSE)
