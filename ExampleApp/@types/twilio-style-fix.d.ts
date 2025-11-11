import { ViewProps, StyleProp, ViewStyle } from 'react-native';
import '@twilio/video-react-native-sdk';

declare module '@twilio/video-react-native-sdk' {
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
