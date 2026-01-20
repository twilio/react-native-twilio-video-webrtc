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
   * Called when screen sharing state changes
   * @param {{screenShareEnabled: boolean}} 
   */
  onScreenShareChanged: PropTypes.func,
  /**
   * Called when requesting a room snapshot via fetchRoom()
   *
   * @param {{sid?: string, name?: string, mediaRegion?: string, state?: string, localParticipant: Participant, signalingRegion?: string, remoteParticipants: Participant[], dominantSpeaker?: Participant}}
   */
  onRoomFetched: PropTypes.func,
  /**
   * Called when the camera starts streaming frames.
   */
  onCameraDidStart: PropTypes.func,
  /**
   * Called when the camera is interrupted (e.g. by another app or system policy).
   */
  onCameraWasInterrupted: PropTypes.func,
  /**
   * Called when a previous camera interruption has ended.
   */
  onCameraInterruptionEnded: PropTypes.func,
  /**
   * Called when the camera stops running due to an error.
   *
   * @param {{error: string}} The error message description
   */
  onCameraDidStopRunning: PropTypes.func,

  /**
    * Callback that is called when audio is toggled.
    *
    * @param {{audioEnabled: boolean}}
    */
  onAudioChanged: PropTypes.func,

  /**
    * Callback that is called when data track is toggled.
    *
    * @param {{dataEnabled: boolean}}
    */
  onDataChanged: PropTypes.func,

  /**
    * Callback that is called when room is reconnecting.
    *
    * @param {{roomName: string, roomSid: string, error: string}}
    */
  onRoomIsReconnecting: PropTypes.func,

  /**
    * Callback that is called when room did reconnect.
    * 
    * @param {{roomName: string, roomSid: string}}
  */
  onRoomDidReconnect: PropTypes.func,

  /**
   * Called when recording starts for the current room
   * @param {{roomName: string, roomSid: string}}
   */
  onRecordingStarted: PropTypes.func,

  /**
   * Called when recording stops for the current room
   * @param {{roomName: string, roomSid: string}}
   */
  onRecordingStopped: PropTypes.func,

  /**
   * Called when the local participant publishes an audio track
   * @param {{participant: Participant, track: Track}}
   */
  onLocalAudioTrackPublished: PropTypes.func,

  /**
   * Called when publishing the local audio track fails
   * @param {{participant: Participant, error: string, code?: string, errorExplanation?: string}}
   */
  onLocalAudioTrackPublicationFailed: PropTypes.func,

  /**
   * Called when the local participant publishes a video track
   * @param {{participant: Participant, track: Track}}
   */
  onLocalVideoTrackPublished: PropTypes.func,

  /**
   * Called when publishing the local video track fails
   * @param {{participant: Participant, error: string, code?: string, errorExplanation?: string}}
   */
  onLocalVideoTrackPublicationFailed: PropTypes.func,

  /**
   * Called when the local participant publishes a data track
   * @param {{participant: Participant, track: Track}}
   */
  onLocalDataTrackPublished: PropTypes.func,

  /**
   * Called when publishing the local data track fails
   * @param {{participant: Participant, error: string, code?: string, errorExplanation?: string}}
   */
  onLocalDataTrackPublicationFailed: PropTypes.func,

  /**
   * Called when a remote participant publishes an audio track
   * @param {{participant: Participant, track: Track}}
   */
  onRemoteAudioTrackPublished: PropTypes.func,

  /**
   * Called when a remote participant unpublishes an audio track
   * @param {{participant: Participant, track: Track}}
   */
  onRemoteAudioTrackUnpublished: PropTypes.func,

  /**
   * Called when subscribing to a remote audio track fails
   * @param {{participant: Participant, track: Track, error: string, code?: string, errorExplanation?: string}}
   */
  onRemoteAudioTrackSubscriptionFailed: PropTypes.func,

  /**
   * Called when a remote participant publishes a video track
   * @param {{participant: Participant, track: Track}}
   */
  onRemoteVideoTrackPublished: PropTypes.func,

  /**
   * Called when a remote participant unpublishes a video track
   * @param {{participant: Participant, track: Track}}
   */
  onRemoteVideoTrackUnpublished: PropTypes.func,

  /**
   * Called when subscribing to a remote video track fails
   * @param {{participant: Participant, track: Track, error: string, code?: string, errorExplanation?: string}}
   */
  onRemoteVideoTrackSubscriptionFailed: PropTypes.func,

  /**
   * Called when a remote participant publishes a data track
   * @param {{participant: Participant, track: Track}}
   */
  onRemoteDataTrackPublished: PropTypes.func,

  /**
   * Called when a remote participant unpublishes a data track
   * @param {{participant: Participant, track: Track}}
   */
  onRemoteDataTrackUnpublished: PropTypes.func,

  /**
   * Called when subscribing to a remote data track fails
   * @param {{participant: Participant, track: Track, error: string, code?: string, errorExplanation?: string}}
   */
  onRemoteDataTrackSubscriptionFailed: PropTypes.func,

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
  toggleScreenSharing: 16,
  toggleDataTrack: 17,
  sendBinary: 18,
  fetchRoom: 19,
};

class CustomTwilioVideoView extends Component {
  /**
   * Connect to a Twilio Video room
   * @param {Object} params - Connection parameters
   * @param {string} params.roomName - The room name to connect to
   * @param {string} params.accessToken - The Twilio JWT access token
   * @param {string} params.region - The Twilio Signaling Region to connect to
   * @param {'front'|'back'} [params.cameraType='front'] - Camera type to use
   * @param {boolean} [params.enableAudio=true] - Whether to enable audio
   * @param {boolean} [params.enableVideo=true] - Whether to enable video
   * @param {boolean} [params.enableRemoteAudio=true] - Whether to enable remote audio
   * @param {boolean} [params.enableNetworkQualityReporting=false] - Whether to enable network quality reporting
   * @param {boolean} [params.dominantSpeakerEnabled=false] - Whether to enable dominant speaker detection
   * @param {boolean} [params.maintainVideoTrackInBackground=false] - Whether to maintain video track in background
   * @param {Object} [params.encodingParameters={}] - Video encoding parameters
   * @param {boolean} [params.enableDataTrack=false] - Whether to enable data track
   * @param {Object} [params.videoFormat=null] - Video capture format { width, height, frameRate }
   */
  connect({
    roomName,
    accessToken,
    region,
    cameraType = "front",
    enableAudio = true,
    enableVideo = true,
    enableRemoteAudio = true,
    enableNetworkQualityReporting = false,
    dominantSpeakerEnabled = false,
    maintainVideoTrackInBackground = false,
    encodingParameters = {},
    enableDataTrack = false,
    videoFormat = null,
  }) {
    this.runCommand(nativeEvents.connectToRoom, [
      roomName,
      accessToken,
      region,
      enableAudio,
      enableVideo,
      enableRemoteAudio,
      enableNetworkQualityReporting,
      dominantSpeakerEnabled,
      maintainVideoTrackInBackground,
      cameraType,
      encodingParameters,
      enableDataTrack,
      videoFormat,
    ]);
  }

  /**
   * Send a string message via data track
   * @param {string} message - The message string to send
   */
  sendString(message) {
    this.runCommand(nativeEvents.sendString, [message]);
  }

  /**
   * Send a Base64-encoded binary payload via data track
   * @param {string} base64Payload
   */
  sendBinary(base64Payload) {
    this.runCommand(nativeEvents.sendBinary, [base64Payload]);
  }

  /**
   * Publish local audio track
   */
  publishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [true]);
  }

  /**
   * Publish local video track
   */
  publishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [true]);
  }

  /**
   * Unpublish local audio track
   */
  unpublishLocalAudio() {
    this.runCommand(nativeEvents.publishAudio, [false]);
  }

  /**
   * Unpublish local video track
   */
  unpublishLocalVideo() {
    this.runCommand(nativeEvents.publishVideo, [false]);
  }

  /**
   * Disconnect from the current room
   */
  disconnect() {
    this.runCommand(nativeEvents.disconnect, []);
  }

  componentWillUnmount() {
    this.runCommand(nativeEvents.releaseResource, []);
  }

  /**
   * Switch between front and back camera
   */
  flipCamera() {
    this.runCommand(nativeEvents.switchCamera, []);
  }

  /**
   * Enable or disable local video
   * @param {boolean} enabled - Whether to enable video
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setLocalVideoEnabled(enabled) {
    this.runCommand(nativeEvents.toggleVideo, [enabled]);
    return Promise.resolve(enabled);
  }
  /**
   * Toggle screen sharing
   * @param {boolean} enabled - Whether screen sharing is enabled
   */
  toggleScreenSharing(enabled) {
    this.runCommand(nativeEvents.toggleScreenSharing, [enabled])
  }

  /**
   * Enable or disable local audio
   * @param {boolean} enabled - Whether to enable audio
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setLocalAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleSound, [enabled]);
    return Promise.resolve(enabled);
  }

  /**
   * Enable or disable local data track
   * @param {boolean} enabled - Whether to enable data track
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setLocalDataTrackEnabled(enabled) {
    this.runCommand(nativeEvents.toggleDataTrack, [enabled]);
    return Promise.resolve(enabled);
  }

  /**
   * Enable or disable remote audio
   * @param {boolean} enabled - Whether to enable remote audio
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setRemoteAudioEnabled(enabled) {
    this.runCommand(nativeEvents.toggleRemoteSound, [enabled]);
    return Promise.resolve(enabled);
  }

  /**
   * Set bluetooth headset connection status
   * @param {boolean} enabled - Whether bluetooth headset is connected
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setBluetoothHeadsetConnected(enabled) {
    this.runCommand(nativeEvents.toggleBluetoothHeadset, [enabled]);
    return Promise.resolve(enabled);
  }

  /**
   * Control remote audio playback for a specific participant
   * @param {Object} params - Audio playback parameters
   * @param {string} params.participantSid - The participant's SID
   * @param {boolean} params.enabled - Whether to enable audio playback
   */
  setRemoteAudioPlayback({ participantSid, enabled }) {
    this.runCommand(nativeEvents.setRemoteAudioPlayback, [
      participantSid,
      enabled,
    ]);
  }

  /**
   * Get connection statistics
   */
  getStats() {
    this.runCommand(nativeEvents.getStats, []);
  }

  /**
   * Fetch the current native room snapshot
   */
  fetchRoom() {
    this.runCommand(nativeEvents.fetchRoom, []);
  }

  /**
   * Disable OpenSL ES audio
   */
  disableOpenSLES() {
    this.runCommand(nativeEvents.disableOpenSLES, []);
  }

  /**
   * Toggle audio setup between speaker and headset
   * @param {boolean} speaker - Whether to use speaker (true) or headset (false)
   */
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
      "onScreenShareChanged",
      "onAudioChanged",
      "onDataChanged",
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
      "onRoomFetched",
      "onParticipantEnabledVideoTrack",
      "onParticipantDisabledVideoTrack",
      "onParticipantEnabledAudioTrack",
      "onParticipantDisabledAudioTrack",
      "onStatsReceived",
      "onNetworkQualityLevelsChanged",
      "onDominantSpeakerDidChange",
      "onLocalParticipantSupportedCodecs",
      "onRoomIsReconnecting",
      "onRoomDidReconnect",
      "onCameraDidStart",
      "onCameraWasInterrupted",
      "onCameraInterruptionEnded",
      "onCameraDidStopRunning",
      "onRecordingStarted",
      "onRecordingStopped",
      "onLocalAudioTrackPublished",
      "onLocalAudioTrackPublicationFailed",
      "onLocalVideoTrackPublished",
      "onLocalVideoTrackPublicationFailed",
      "onLocalDataTrackPublished",
      "onLocalDataTrackPublicationFailed",
      "onRemoteAudioTrackPublished",
      "onRemoteAudioTrackUnpublished",
      "onRemoteAudioTrackSubscriptionFailed",
      "onRemoteVideoTrackPublished",
      "onRemoteVideoTrackUnpublished",
      "onRemoteVideoTrackSubscriptionFailed",
      "onRemoteDataTrackPublished",
      "onRemoteDataTrackUnpublished",
      "onRemoteDataTrackSubscriptionFailed",
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
