//
//  TwilioVideoParticipantView.js
//  Black
//
//  Created by Martín Fernández on 6/13/17.
//
//

import React, { Component } from "react";
import PropTypes from "prop-types";
import { requireNativeComponent, View } from "react-native";

/**
 * Frame dimensions change callback data structure
 * @typedef {Object} FrameDimensionsData
 * @property {number} height - Video frame height
 * @property {number} width - Video frame width
 * @property {number} rotation - Video frame rotation
 */

class TwilioVideoParticipantView extends Component {
  static propTypes = {
    ...View.propTypes,
    trackIdentifier: PropTypes.shape({
      /**
       * The participant sid.
       */
      participantSid: PropTypes.string.isRequired,
      /**
       * The participant's video track sid you want to render in the view.
       */
      videoTrackSid: PropTypes.string.isRequired,
    }),
    /**
     * How the video stream should be scaled to fit its container.
     */
    scaleType: PropTypes.oneOf(["fit", "fill"]),
    /**
     * Callback when video frame dimensions change
     *
     * @param {FrameDimensionsData} data - Frame dimensions data
     */
    onFrameDimensionsChanged: PropTypes.func,
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
    const scalesType = this.props.scaleType === "fit" ? 1 : 2;
    return (
      <RCTTWRemoteVideoView
        scalesType={scalesType}
        {...this.props}
        {...this.buildNativeEventWrappers()}
      >
        {this.props.children}
      </RCTTWRemoteVideoView>
    );
  }
}

const RCTTWRemoteVideoView = requireNativeComponent(
  "RCTTWRemoteVideoView",
  TwilioVideoParticipantView
);

module.exports = TwilioVideoParticipantView;
