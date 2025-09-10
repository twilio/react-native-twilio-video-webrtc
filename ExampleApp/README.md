# ExampleApp – React Native Twilio Video Demo

A sample React Native application that demonstrates how to join a Twilio Programmable Video room using the [`react-native-twilio-video-webrtc`](https://github.com/blackuy/react-native-twilio-video-webrtc) package.

---

## 1. Prerequisites

• **Node ≥ 18**, **Yarn ≥ 1.22**  
• **Java ≥ 11** + Android SDK (Android Studio)  
• **Xcode 14+** with Command-line tools (macOS / iOS only)  
• A **Twilio Account** with a Video-enabled project and an **API Key / Secret** ([signup](https://www.twilio.com/try-twilio)).

> Follow the official React Native [environment setup guide](https://reactnative.dev/docs/environment-setup) before continuing.

---

## 2. Clone & Install

```bash
# clone the repository
$ git clone https://github.com/zhanim-tdl/react-native-twilio-video-webrtc.git
$ cd react-native-twilio-video-webrtc/ExampleApp

# install JS dependencies
yarn install

# iOS – install CocoaPods (first run or native deps changed)
cd ios
pod install    
cd ..
```

---

## 3. Add Your Twilio Access Token

Open `src/access-token.ts` and replace the placeholder with a **valid Programmable Video Access Token**.

```ts
// src/access-token.ts
export const token = "PASTE_YOUR_TWILIO_ACCESS_TOKEN_HERE";
```

### How do I get a token?
The quickest way is with the Twilio CLI token plugin:

```bash
# install Twilio CLI (if you don't have it yet)
npm install -g twilio-cli

twilio login   # one-time, opens browser for auth

twilio plugins:install @twilio-labs/plugin-token

twilio token:video --identity=<your-username>
```

Copy the JWT that is printed and paste it into `access-token.ts`.

For more details see the Twilio docs: [Generate CLI](https://www.twilio.com/docs/video/tutorials/user-identity-access-tokens#generate-cli).

> After you have pasted a valid token and built the app, launch it on your device/emulator and tap **Join Room**. The first time you join, the OS will ask for camera and microphone access—make sure to **allow** both prompts so video and audio work correctly.

---

## 4. Start Metro Bundler

```bash
yarn start
```

Metro must be running in one terminal while you build the native app.

---

## 5. Run the App

### Android
```bash
yarn android
```
This builds and installs the app on the connected device or emulator.

### iOS (macOS only)
```bash
yarn ios
```
This opens the iOS simulator and runs the app. Ensure that the `ExampleApp` scheme is selected in Xcode if you choose to run from the IDE.

---

## 6. Learn More

• React Native Documentation – <https://reactnative.dev>  
• Twilio Programmable Video Docs – <https://www.twilio.com/docs/video>  
• react-native-twilio-video-webrtc Documentation – <https://github.com/zhanim-tdl/react-native-twilio-video-webrtc/tree/master/docs>

Happy coding! 🎉
