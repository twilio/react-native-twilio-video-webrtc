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
  // Whether to apply Z ordering to this view.  Setting this to true will cause
  // this view to appear above other Twilio Video views.
  applyZOrder: PropTypes.bool,
  /**
   * How the video stream should be scaled to fit its
   * container.
   */
  scaleType: PropTypes.oneOf(["fit", "fill"]),
};

class TwilioVideoScreenShareView extends React.Component {
  render() {
    return <NativeTwilioScreenSharePreview {...this.props} />;
  }
}

TwilioVideoScreenShareView.propTypes = propTypes;

const NativeTwilioScreenSharePreview = requireNativeComponent(
  "RNTwilioScreenSharePreview",
  TwilioVideoScreenShareView
);

module.exports = TwilioVideoScreenShareView;

