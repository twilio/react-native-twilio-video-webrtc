import { ViewProps, StyleProp, ViewStyle } from 'react-native';
import 'react-native-twilio-video-webrtc';

declare module 'react-native-twilio-video-webrtc' {
  interface TrackIdentifier {
    participantSid: string;
    videoTrackSid: string;
  }

  // augments the library’s original interface
  interface TwilioVideoParticipantViewProps extends ViewProps {
    trackIdentifier: TrackIdentifier;
    style?: StyleProp<ViewStyle>;
  }
}
