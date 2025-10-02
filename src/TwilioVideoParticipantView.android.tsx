import React from "react";
import { requireNativeComponent, ViewProps } from "react-native";
import PropTypes from "prop-types";

export interface FrameDimensionsData {
  height: number;
  width: number;
  rotation: number;
}

export interface TrackIdentifier {
  videoTrackSid: string;
}

export interface TwilioRemotePreviewProps extends ViewProps {
  trackIdentifier?: TrackIdentifier;
  scaleType?: "fit" | "fill";
  onFrameDimensionsChanged?: (data: FrameDimensionsData) => void;
  trackSid?: string;
  applyZOrder?: boolean;
}

const NativeTwilioRemotePreview = requireNativeComponent<TwilioRemotePreviewProps>(
  "RNTwilioRemotePreview"
);

const TwilioRemotePreview: React.FC<TwilioRemotePreviewProps> = (props) => {
  const { trackIdentifier } = props;

  const wrappedEvents = props.onFrameDimensionsChanged
    ? {
      onFrameDimensionsChanged: (e: any) =>
        props.onFrameDimensionsChanged?.(e.nativeEvent),
    }
    : {};

  return (
    <NativeTwilioRemotePreview
      trackSid={trackIdentifier?.videoTrackSid}
      {...props}
      {...wrappedEvents}
    />
  );
};

TwilioRemotePreview.propTypes = {
  trackIdentifier: PropTypes.shape({
    videoTrackSid: PropTypes.string.isRequired,
  }),
  scaleType: PropTypes.oneOf(["fit", "fill"]),
  onFrameDimensionsChanged: PropTypes.func,
  applyZOrder: PropTypes.bool,
};

export default TwilioRemotePreview;
