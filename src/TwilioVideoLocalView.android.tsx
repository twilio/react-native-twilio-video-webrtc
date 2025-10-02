import React from "react";
import { requireNativeComponent, ViewProps } from "react-native";
import PropTypes from "prop-types";

export interface FrameDimensionsData {
  height: number;
  width: number;
  rotation: number;
}

export interface TwilioVideoPreviewProps extends ViewProps {
  applyZOrder?: boolean;
  scaleType?: "fit" | "fill";
  onFrameDimensionsChanged?: (data: FrameDimensionsData) => void;
}

const propTypes = {
  applyZOrder: PropTypes.bool,
  scaleType: PropTypes.oneOf(["fit", "fill"]),
  onFrameDimensionsChanged: PropTypes.func,
};

const NativeTwilioVideoPreview = requireNativeComponent<TwilioVideoPreviewProps>(
  "RNTwilioVideoPreview"
);

const TwilioVideoPreview: React.FC<TwilioVideoPreviewProps> = (props) => {
  const wrappedEvents = props.onFrameDimensionsChanged
    ? {
      onFrameDimensionsChanged: (e: any) =>
        props.onFrameDimensionsChanged?.(e.nativeEvent),
    }
    : {};

  return <NativeTwilioVideoPreview {...props} {...wrappedEvents} />;
};

TwilioVideoPreview.propTypes = { ...propTypes };

export default TwilioVideoPreview;
