/**
 * Component for Twilio Video participant views.
 *
 * Authors:
 *   Jonathan Chang <slycoder@gmail.com>
 */

import { requireNativeComponent, View } from "react-native";
import PropTypes from "prop-types";
import React from "react";

/**
 * Frame dimensions change callback data structure
 * @typedef {Object} FrameDimensionsData
 * @property {number} height - Video frame height
 * @property {number} width - Video frame width
 * @property {number} rotation - Video frame rotation
 */

class TwilioRemotePreview extends React.Component {
  static propTypes = {
    ...View.propTypes,
    trackIdentifier: PropTypes.shape({
      /**
       * The participant's video track you want to render in the view.
       */
      videoTrackSid: PropTypes.string.isRequired,
    }),
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
    trackSid: PropTypes.string,
    /**
     * Whether to apply Z ordering to this view. Setting this to true will cause
     * this view to appear above other Twilio Video views.
     * (default: false)
     */
    applyZOrder: PropTypes.bool,
  };

  buildNativeEventWrappers() {
    return ["onFrameDimensionsChanged"].reduce((wrappedEvents, eventName) => {
      if (this.props[eventName]) {
        return {
          ...wrappedEvents,
          [eventName]: (data) => this.props[eventName](data.nativeEvent),
        };
      }
      return wrappedEvents;
    }, {});
  }

  render() {
    const { trackIdentifier } = this.props;
    return (
      <NativeTwilioRemotePreview
        trackSid={trackIdentifier && trackIdentifier.videoTrackSid}
        {...this.props}
        {...this.buildNativeEventWrappers()}
      />
    );
  }
}

const NativeTwilioRemotePreview = requireNativeComponent(
  "RNTwilioRemotePreview",
  TwilioRemotePreview
);

module.exports = TwilioRemotePreview;
