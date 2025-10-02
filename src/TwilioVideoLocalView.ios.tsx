import React from "react";
import { requireNativeComponent, ViewProps } from "react-native";
import PropTypes from "prop-types";

export interface TwilioVideoLocalViewProps extends ViewProps {
  /** Indicates if video feed is enabled */
  enabled: boolean;
  /** How the video stream should be scaled to fit its container */
  scaleType?: "fit" | "fill";
}

interface TwilioVideoLocalNativeViewProps extends ViewProps {
  /** INTERNAL: numeric enum passed to native view */
  scalesType?: number;
}

const RCTTWLocalVideoView = requireNativeComponent<TwilioVideoLocalNativeViewProps>(
  "RCTTWLocalVideoView"
);

const TwilioVideoLocalView: React.FC<TwilioVideoLocalViewProps> = (props) => {
  const scalesType = props.scaleType === "fit" ? 1 : 2;
  return (
    <RCTTWLocalVideoView scalesType={scalesType} {...props}>
      {props.children}
    </RCTTWLocalVideoView>
  );
};

TwilioVideoLocalView.propTypes = {
  enabled: PropTypes.bool.isRequired,
  scaleType: PropTypes.oneOf(["fit", "fill"]),
};

export default TwilioVideoLocalView;
