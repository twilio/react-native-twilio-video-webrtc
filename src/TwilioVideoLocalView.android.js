/**
 * Component for Twilio Video camera preview.
 *
 * Authors:
 *   Jonathan Chang <slycoder@gmail.com>
 */

import { requireNativeComponent, View } from "react-native";
import React from "react";
import PropTypes from "prop-types";

/**
 * Frame dimensions change callback data structure
 * @typedef {Object} FrameDimensionsData
 * @property {number} height - Video frame height
 * @property {number} width - Video frame width
 * @property {number} rotation - Video frame rotation
 */

const propTypes = {
  ...View.propTypes,
  /**
   * Whether to apply Z ordering to this view. Setting this to true will cause
   * this view to appear above other Twilio Video views.
   */
  applyZOrder: PropTypes.bool,
  /**
   * How the video stream should be scaled to fit its container.
   */
  scaleType: PropTypes.oneOf(["fit", "fill"]),
  /**
   * Callback when video frame dimensions change
   * Note: This callback is only supported on Android
   *
   * @param {FrameDimensionsData} data - Frame dimensions data
   */
  onFrameDimensionsChanged: PropTypes.func,
};

class TwilioVideoLocalView extends React.Component {
  render() {
    return <NativeTwilioVideoPreview {...this.props} />;
  }
}

TwilioVideoLocalView.propTypes = propTypes;

const NativeTwilioVideoPreview = requireNativeComponent(
  "RNTwilioVideoPreview",
  TwilioVideoLocalView
);

module.exports = TwilioVideoLocalView;
