import React from "react";
import { requireNativeComponent, ViewProps } from "react-native";
import PropTypes from "prop-types";

export interface TrackIdentifier {
  participantSid: string;
  videoTrackSid: string;
}
export interface TwilioVideoParticipantNativeViewProps extends ViewProps {
  scalesType?: number;
}
export interface TwilioVideoParticipantViewProps extends ViewProps {
  trackIdentifier?: TrackIdentifier;
  scaleType?: "fit" | "fill";
}

const RCTTWRemoteVideoView = requireNativeComponent<TwilioVideoParticipantNativeViewProps>(
  "RCTTWRemoteVideoView"
);


const TwilioVideoParticipantView: React.FC<TwilioVideoParticipantViewProps> = (
  props
) => {
  const scalesType = props.scaleType === "fit" ? 1 : 2;
  return (
    <RCTTWRemoteVideoView scalesType={scalesType} {...props}>
      {props.children}
    </RCTTWRemoteVideoView>
  );
};

TwilioVideoParticipantView .propTypes = {
  trackIdentifier: PropTypes.shape({
    participantSid: PropTypes.string.isRequired,
    videoTrackSid: PropTypes.string.isRequired,
  }),
  scaleType: PropTypes.string,
};

export default TwilioVideoParticipantView;
