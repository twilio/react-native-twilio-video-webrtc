/**
* Component to orchestrate the Twilio Video connection and the various video
* views.
*
* Authors:
*   Ralph Pina <slycoder@gmail.com>
*   Jonathan Chang <slycoder@gmail.com>
*/

import {
  Platform,
  UIManager,
  View,
  findNodeHandle,
  requireNativeComponent,
} from "react-native";
import React, { Component } from "react";

import PropTypes from "prop-types";

/**
 * Participant data structure
 * @typedef {Object} Participant
 * @property {string} sid - The participant's unique identifier
 * @property {string} identity - The participant's identity
 */

/**
 * Track data structure
 * @typedef {Object} Track
 * @property {boolean} enabled - Whether the track is enabled
 * @property {string} trackName - The name of the track
 * @property {string} trackSid - The track's unique identifier
 */

const propTypes = {
  ...View.propTypes,
  /**
    * Callback that is called when camera source changes
    *
    * @param {{isBackCamera: boolean}}
    */
  onCameraSwitched: PropTypes.func,

  /**
    * Callback that is called when video is toggled.
    *
    * @param {{videoEnabled: boolean}}
    */
  onVideoChanged: PropTypes.func,

  /**
    * Callback that is called when audio is toggled.
    *
    * @param {{audioEnabled: boolean}}
    */
  onAudioChanged: PropTypes.func,

  /**
    * Callback that is called when user is connected to a room.
    *
    * @param {{roomName: string, roomSid: string, participants: Participant[], localParticipant: Participant}}
    */
  onRoomDidConnect: PropTypes.func,

  /**
    * Callback that is called when connecting to room fails.
    *
    * @param {{roomName: string, roomSid: string, error: string}}
    */
  onRoomDidFailToConnect: PropTypes.func,

  /**
    * Callback that is called when user is disconnected from room.
    *
    * @param {{roomName: string, roomSid: string, participant?: string, error?: string}}
    */
  onRoomDidDisconnect: PropTypes.func,

  /**
    * Called when a new data track has been added
    *
    * @param {{participant, track}}
    */
  onParticipantAddedDataTrack: PropTypes.func,

  /**
    * Called when a data track has been removed
    *
    * @param {{participant, track}}
    */
  onParticipantRemovedDataTrack: PropTypes.func,

  /**
    * Called when a dataTrack receives a message
    *
    * @param {{message: string, trackSid: string}}
    */
  onDataTrackMessageReceived: PropTypes.func,

  /**
    * Called when a new video track has been added
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantAddedVideoTrack: PropTypes.func,

  /**
    * Called when a video track has been removed
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantRemovedVideoTrack: PropTypes.func,

  /**
    * Called when a new audio track has been added
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantAddedAudioTrack: PropTypes.func,

  /**
    * Called when an audio track has been removed
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantRemovedAudioTrack: PropTypes.func,

  /**
    * Callback called when a participant enters a room.
    *
    * @param {{roomName: string, roomSid: string, participant: Participant}}
    */
  onRoomParticipantDidConnect: PropTypes.func,

  /**
    * Callback that is called when a participant exits a room.
    *
    * @param {{roomName: string, roomSid: string, participant: Participant}}
    */
  onRoomParticipantDidDisconnect: PropTypes.func,
  /**
    * Called when a video track has been enabled.
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantEnabledVideoTrack: PropTypes.func,
  /**
    * Called when a video track has been disabled.
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantDisabledVideoTrack: PropTypes.func,
  /**
    * Called when an audio track has been enabled.
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantEnabledAudioTrack: PropTypes.func,
  /**
    * Called when an audio track has been disabled.
    *
    * @param {{participant: Participant, track: Track}}
    */
  onParticipantDisabledAudioTrack: PropTypes.func,
  /**
    * Callback that is called when stats are received (after calling getStats)
    *
    * @param {{[peerConnectionId: string]: {remoteAudioTrackStats: any[], remoteVideoTrackStats: any[], localAudioTrackStats: any[], localVideoTrackStats: any[]}}}
    */
  onStatsReceived: PropTypes.func,
  /**
    * Callback that is called when network quality levels are changed (only if enableNetworkQualityReporting in connect is set to true)
    *
    * @param {{participant: Participant, isLocalUser: boolean, quality: number}}
    */
  onNetworkQualityLevelsChanged: PropTypes.func,
  /**
    * Called when dominant speaker changes
    *
    * @param {{roomName: string, roomSid: string, participant: Participant}}
    */
  onDominantSpeakerDidChange: PropTypes.func,
  /**
    * Callback that is called after determining what codecs are supported
    *
    * @param {{supportedCodecs: string[]}}
    */
  onLocalParticipantSupportedCodecs: PropTypes.func,
};

const nativeEvents = {
  connectToRoom: 1,
  disconnect: 2,
  switchCamera: 3,
  toggleVideo: 4,
  toggleSound: 5,
  getStats: 6,
  disableOpenSLES: 7,
  toggleSoundSetup: 8,
  toggleRemoteSound: 9,
  releaseResource: 10,
  toggleBluetoothHeadset: 11,
  sendString: 12,
  publishVideo: 13,
  publishAudio: 14,
  setRemoteAudioPlayback: 15,
};

class CustomTwilioVideoView extends Component {
  connect({
    roomName,
    accessToken,
    cameraType = "front",
    enableAudio = true,
    enableVideo = true,
    enableRemoteAudio = true,
    enableNetworkQualityReporting = false,
    dominantSpeakerEnabled = false,
    maintainVideoTrackInBackground = false,
    encodingParameters = {},
  }) {
    this.runCommand(nativeEvents.connectToRoom, [
      roomName,
      accessToken,
      enableAudio,
      enableVideo,
      enableRemoteAudio,
      enableNetworkQualityReporting,
      dominantSpeakerEnabled,
      maintainVideoTrackInBackground,
      cameraType,
      encodingParameters,
    ]);
  }

  sendString(message) {
    this.runCommand(nativeEvents.sendString, [message]);
  }

  publishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [true]);
  }

  publishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [true]);
  }

  unpublishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [false]);
  }

  unpublishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [false]);
  }

  disconnect() {
    this.runCommand(nativeEvents.disconnect, []);
  }

  componentWillUnmount() {
    this.runCommand(nativeEvents.releaseResource, []);
  }

  flipCamera() {
    this.runCommand(nativeEvents.switchCamera, []);
  }

  setLocalVideoEnabled(enabled) {
    this.runCommand(nativeEvents.toggleVideo, [enabled]);
    return Promise.resolve(enabled);
  }

  setLocalAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleSound, [enabled]);
    return Promise.resolve(enabled);
  }

  setRemoteAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleRemoteSound, [enabled]);
    return Promise.resolve(enabled);
  }

  setBluetoothHeadsetConnected(enabled) {
    this.runCommand(nativeEvents.toggleBluetoothHeadset, [enabled]);
    return Promise.resolve(enabled);
  }

  setRemoteAudioPlayback({ participantSid, enabled }) {
    this.runCommand(nativeEvents.setRemoteAudioPlayback, [
      participantSid,
      enabled,
    ]);
  }

  getStats() {
    this.runCommand(nativeEvents.getStats, []);
  }

  disableOpenSLES() {
    this.runCommand(nativeEvents.disableOpenSLES, []);
  }

  toggleSoundSetup(speaker) {
    this.runCommand(nativeEvents.toggleSoundSetup, [speaker]);
  }



  runCommand(event, args) {
    switch (Platform.OS) {
      case "android":
        UIManager.dispatchViewManagerCommand(
          findNodeHandle(this._videoView),
          event,
          args
        );
        break;
      default:
        break;
    }
  }

  buildNativeEventWrappers() {
    return [
      "onCameraSwitched",
      "onVideoChanged",
      "onAudioChanged",
      "onRoomDidConnect",
      "onRoomDidFailToConnect",
      "onRoomDidDisconnect",
      "onParticipantAddedDataTrack",
      "onParticipantRemovedDataTrack",
      "onDataTrackMessageReceived",
      "onParticipantAddedVideoTrack",
      "onParticipantRemovedVideoTrack",
      "onParticipantAddedAudioTrack",
      "onParticipantRemovedAudioTrack",
      "onRoomParticipantDidConnect",
      "onRoomParticipantDidDisconnect",
      "onParticipantEnabledVideoTrack",
      "onParticipantDisabledVideoTrack",
      "onParticipantEnabledAudioTrack",
      "onParticipantDisabledAudioTrack",
      "onStatsReceived",
      "onNetworkQualityLevelsChanged",
      "onDominantSpeakerDidChange",
      "onLocalParticipantSupportedCodecs",
    ].reduce((wrappedEvents, eventName) => {
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
    return (
      <NativeCustomTwilioVideoView
        ref={c => { this._videoView = c; }}
        {...this.props}
        {...this.buildNativeEventWrappers()}
      />
    );
  }
}

CustomTwilioVideoView.propTypes = propTypes;

const NativeCustomTwilioVideoView = requireNativeComponent(
  "RNCustomTwilioVideoView",
  CustomTwilioVideoView
);

module.exports = CustomTwilioVideoView;
