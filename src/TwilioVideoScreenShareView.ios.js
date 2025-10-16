/**
 * Component for Twilio Video screen share preview.
 *
 * Authors:
 *   Zhani Muceku <zhani.muceku@testdevlab.com>
 */

import { requireNativeComponent, View } from "react-native";
import React from "react";
import PropTypes from "prop-types";

const propTypes = {
  ...View.propTypes,
  /**
   * How the video stream should be scaled to fit its
   * container.
   */
  scaleType: PropTypes.oneOf(["fit", "fill"]),
};

class TwilioVideoScreenShareView extends React.Component {
  render() {
    const scalesType = this.props.scaleType === "fit" ? 1 : 2;
    return (
      <RCTTWScreenShareView scalesType={scalesType} {...this.props}>
        {this.props.children}
      </RCTTWScreenShareView>
    );
  }
}

TwilioVideoScreenShareView.propTypes = propTypes;

const RCTTWScreenShareView = requireNativeComponent(
  "RCTTWScreenShareView",
  TwilioVideoScreenShareView
);

module.exports = TwilioVideoScreenShareView;
