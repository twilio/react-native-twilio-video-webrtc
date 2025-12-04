//
//  TwilioVideo.js
//  Black
//
//  Created by Martín Fernández on 6/13/17.
//
//

import { Component } from "react";
import PropTypes from "prop-types";
import { NativeModules, NativeEventEmitter, View } from "react-native";

const { TWVideoModule } = NativeModules;

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

export default class TwilioVideo extends Component {

  static defaultProps = {
    autoInitializeCamera: false,
  };

  static propTypes = {
    ...View.propTypes,
    /**
     * Called when the room has connected
     *
     * @param {{roomName: string, roomSid: string, participants: Participant[], localParticipant: Participant}}
     */
    onRoomDidConnect: PropTypes.func,

    /**
     * Called when the room has disconnected
     *
     * @param {{roomName: string, roomSid: string, participant?: string, error?: string}}
     */
    onRoomDidDisconnect: PropTypes.func,

    /**
     * Called when connection with room failed
     *
     * @param {{roomName: string, roomSid: string, error: string}}
     */
    onRoomDidFailToConnect: PropTypes.func,

    /**
     * Called when a new participant has connected
     *
     * @param {{roomName: string, roomSid: string, participant: Participant}}
     */
    onRoomParticipantDidConnect: PropTypes.func,

    /**
     * Called when a participant has disconnected
     *
     * @param {{roomName: string, roomSid: string, participant: Participant}}
     */
    onRoomParticipantDidDisconnect: PropTypes.func,

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
     * Called when a new data track has been added
     *
     * @param {{participant: Participant, track: Track}}
     */
    onParticipantAddedDataTrack: PropTypes.func,

    /**
     * Called when a data track has been removed
     *
     * @param {{participant: Participant, track: Track}}
     */
    onParticipantRemovedDataTrack: PropTypes.func,

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
     * Called when a dataTrack receives a message
     *
     * @param {{message: string, trackSid: string}}
     */
    onDataTrackMessageReceived: PropTypes.func,

    /**
     * Callback that is called when data track is toggled.
     *
     * @param {{dataEnabled: boolean}}
     */
    onDataChanged: PropTypes.func,

    /**
     * Called when the camera has started
     */
    onCameraDidStart: PropTypes.func,

    /**
     * Called when the camera has been interrupted
     */
    onCameraWasInterrupted: PropTypes.func,

    /**
     * Called when the camera interruption has ended
     */
    onCameraInterruptionEnded: PropTypes.func,

    /**
     * Called when the camera has stopped running with an error
     *
     * @param {{error: string}} The error message description
     */
    onCameraDidStopRunning: PropTypes.func,

    /**
     * Called when the camera source changes
     *
     * @param {{isBackCamera: boolean}}
     */
    onCameraSwitched: PropTypes.func,

    /**
     * Called when video is toggled
     *
     * @param {{videoEnabled: boolean}}
     */
    onVideoChanged: PropTypes.func,

    /**
     * Called when audio is toggled
     *
     * @param {{audioEnabled: boolean}}
     */
    onAudioChanged: PropTypes.func,

    /**
     * Called when stats are received (after calling getStats)
     *
     * @param {{[peerConnectionId: string]: {remoteAudioTrackStats: any[], remoteVideoTrackStats: any[], localAudioTrackStats: any[], localVideoTrackStats: any[]}}}
     */
    onStatsReceived: PropTypes.func,

    /**
     * Called when the network quality levels of a participant have changed (only if enableNetworkQualityReporting is set to true when connecting)
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
     * Called when screen sharing state changes
     * @param {{screenShareEnabled: boolean}} screen share status
     */
    onScreenShareChanged: PropTypes.func,
    /**
     * Called when requesting a room snapshot via fetchRoom
     *
     * @param {{sid?: string, name?: string, state?: string}}
     */
    onRoomFetched: PropTypes.func,
    /**
     * Callback that is called when room is reconnecting
     *
     * @param {{roomName: string, roomSid: string, error: string}}
     */
    onRoomIsReconnecting: PropTypes.func,
    /**
     * Callback that is called when room did reconnect
     *
     * @param {{roomName: string, roomSid: string}}
     */
    onRoomDidReconnect: PropTypes.func,

    /**
     * Called when recording starts for the current room
     *
     * @param {{roomName: string, roomSid: string}}
     */
    onRecordingStarted: PropTypes.func,

    /**
     * Called when recording stops for the current room
     *
     * @param {{roomName: string, roomSid: string}}
     */
    onRecordingStopped: PropTypes.func,

    /**
     * Called when the local participant publishes an audio track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onLocalAudioTrackPublished: PropTypes.func,

    /**
     * Called when publishing the local audio track fails
     *
     * @param {{participant: Participant, error: string, code?: string, errorExplanation?: string}}
     */
    onLocalAudioTrackPublicationFailed: PropTypes.func,

    /**
     * Called when the local participant publishes a video track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onLocalVideoTrackPublished: PropTypes.func,

    /**
     * Called when publishing the local video track fails
     *
     * @param {{participant: Participant, error: string, code?: string, errorExplanation?: string}}
     */
    onLocalVideoTrackPublicationFailed: PropTypes.func,

    /**
     * Called when the local participant publishes a data track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onLocalDataTrackPublished: PropTypes.func,

    /**
     * Called when publishing the local data track fails
     *
     * @param {{participant: Participant, error: string, code?: string, errorExplanation?: string}}
     */
    onLocalDataTrackPublicationFailed: PropTypes.func,

    /**
     * Called when a remote participant publishes an audio track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onRemoteAudioTrackPublished: PropTypes.func,

    /**
     * Called when a remote participant unpublishes an audio track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onRemoteAudioTrackUnpublished: PropTypes.func,

    /**
     * Called when subscribing to a remote audio track fails
     *
     * @param {{participant: Participant, track: Track, error: string, code?: string, errorExplanation?: string}}
     */
    onRemoteAudioTrackSubscriptionFailed: PropTypes.func,

    /**
     * Called when a remote participant publishes a video track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onRemoteVideoTrackPublished: PropTypes.func,

    /**
     * Called when a remote participant unpublishes a video track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onRemoteVideoTrackUnpublished: PropTypes.func,

    /**
     * Called when subscribing to a remote video track fails
     *
     * @param {{participant: Participant, track: Track, error: string, code?: string, errorExplanation?: string}}
     */
    onRemoteVideoTrackSubscriptionFailed: PropTypes.func,

    /**
     * Called when a remote participant publishes a data track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onRemoteDataTrackPublished: PropTypes.func,

    /**
     * Called when a remote participant unpublishes a data track
     *
     * @param {{participant: Participant, track: Track}}
     */
    onRemoteDataTrackUnpublished: PropTypes.func,

    /**
     * Called when subscribing to a remote data track fails
     *
     * @param {{participant: Participant, track: Track, error: string, code?: string, errorExplanation?: string}}
     */
    onRemoteDataTrackSubscriptionFailed: PropTypes.func,

    /**
     * Whether video should be automatically initialized upon mounting
     * of this component. Defaults to false.
     * @deprecated Only available on iOS and will be removed in a future release
     */
    autoInitializeCamera: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this._subscriptions = [];
    this._eventEmitter = new NativeEventEmitter(TWVideoModule);
  }

  componentDidMount() {
    this._registerEvents();
    if (this.props.autoInitializeCamera === true) {
      this._startLocalVideo();
    }
  }

  componentWillUnmount() {
    this._unregisterEvents();
    this._stopLocalVideo();
    this._stopLocalAudio();
  }

  /**
   * Control remote audio playback for a specific participant
   * @param {Object} params - Audio playback parameters
   * @param {string} params.participantSid - The participant's SID
   * @param {boolean} params.enabled - Whether to enable audio playback
   */
  setRemoteAudioPlayback({ participantSid, enabled }) {
    TWVideoModule.setRemoteAudioPlayback(participantSid, enabled);
  }

  /**
   * Enable or disable remote audio
   * @param {boolean} enabled - Whether to enable remote audio
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setRemoteAudioEnabled(enabled) {
    return TWVideoModule.setRemoteAudioEnabled(enabled);
  }

  /**
   * Set bluetooth headset connection status
   * @param {boolean} enabled - Whether bluetooth headset is connected
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setBluetoothHeadsetConnected(enabled) {
    return Promise.resolve(enabled);
  }

  /**
   * Enable or disable local video
   * @param {boolean} enabled - Whether to enable video
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setLocalVideoEnabled(enabled) {
    return TWVideoModule.setLocalVideoEnabled(enabled);
  }

  /**
   * Enable or disable local audio
   * @param {boolean} enabled - Whether to enable audio
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setLocalAudioEnabled(enabled) {
    return TWVideoModule.setLocalAudioEnabled(enabled);
  }

  /**
   * Enable or disable local data track
   * @param {boolean} enabled - Whether to enable data track
   * @returns {Promise<boolean>} Promise that resolves with the enabled state
   */
  setLocalDataTrackEnabled(enabled) {
    return TWVideoModule.setLocalDataTrackEnabled(enabled);
  }

  /**
   * Switch between front and back camera
   */
  flipCamera() {
    TWVideoModule.flipCamera();
  }


  /**
   * Toggle audio setup between speaker and headset
   * @param {boolean} speaker - Whether to use speaker (true) or headset (false)
   */
  toggleSoundSetup(speaker) {
    TWVideoModule.toggleSoundSetup(speaker);
  }

  /**
   * Toggle screen sharing
   * @param {boolean} enabled - Whether screen sharing is enabled
   */
  toggleScreenSharing(enabled) {
    TWVideoModule.toggleScreenSharing(enabled);
  }

  /**
   * Get connection statistics
   */
  getStats() {
    TWVideoModule.getStats();
  }

  /**
   * Fetch the current native room snapshot
   */
  fetchRoom() {
    TWVideoModule.fetchRoom();
  }

  /**
   * Connect to a Twilio Video room
   * @param {Object} params - Connection parameters
   * @param {string} params.roomName - The room name to connect to
   * @param {string} params.accessToken - The Twilio JWT access token
   * @param {'front'|'back'} [params.cameraType='front'] - Camera type to use
   * @param {boolean} [params.enableAudio=true] - Whether to enable audio
   * @param {boolean} [params.enableVideo=true] - Whether to enable video
   * @param {Object} [params.encodingParameters=null] - Video encoding parameters
   * @param {boolean} [params.enableNetworkQualityReporting=false] - Whether to enable network quality reporting
   * @param {boolean} [params.dominantSpeakerEnabled=false] - Whether to enable dominant speaker detection
   * @param {boolean} [params.enableDataTrack=false] - Whether to enable data track
   */
  connect({
    roomName,
    accessToken,
    cameraType = "front",
    enableAudio = true,
    enableVideo = true,
    encodingParameters = null,
    enableNetworkQualityReporting = false,
    dominantSpeakerEnabled = false,
    enableDataTrack = false,
  }) {
    TWVideoModule.connect(
      accessToken,
      roomName,
      enableAudio,
      enableVideo,
      encodingParameters,
      enableNetworkQualityReporting,
      dominantSpeakerEnabled,
      cameraType,
      enableDataTrack
    );
  }

  /**
   * Disconnect from the current room
   */
  disconnect() {
    TWVideoModule.disconnect();
  }

  /**
   * Publish local audio track
   */
  publishLocalAudio() {
    TWVideoModule.publishLocalAudio();
  }

  /**
   * Publish local video track
   */
  publishLocalVideo() {
    TWVideoModule.publishLocalVideo();
  }

  /**
   * Unpublish local audio track
   */
  unpublishLocalAudio() {
    TWVideoModule.unpublishLocalAudio();
  }

  /**
   * Unpublish local video track
   */
  unpublishLocalVideo() {
    TWVideoModule.unpublishLocalVideo();
  }

  /**
   * Send a string message via data track
   * @param {string} message - The message string to send
   */
  sendString(message) {
    TWVideoModule.sendString(message);
  }

  /**
   * Send a Base64-encoded binary payload via data track
   * @param {string} base64Payload
   */
  sendBinary(base64Payload) {
    TWVideoModule.sendBinary(base64Payload);
  }

  _startLocalVideo() {
    TWVideoModule.startLocalVideo();
  }

  _stopLocalVideo() {
    TWVideoModule.stopLocalVideo();
  }

  _startLocalAudio() {
    TWVideoModule.startLocalAudio();
  }

  _stopLocalAudio() {
    TWVideoModule.stopLocalAudio();
  }

  _unregisterEvents() {
    TWVideoModule.changeListenerStatus(false);
    this._subscriptions.forEach((e) => e.remove());
    this._subscriptions = [];
  }

  _registerEvents() {
    TWVideoModule.changeListenerStatus(true);
    this._subscriptions = [
      this._eventEmitter.addListener("roomDidConnect", (data) => {
        if (this.props.onRoomDidConnect) {
          this.props.onRoomDidConnect(data);
        }
      }),
      this._eventEmitter.addListener("roomDidDisconnect", (data) => {
        if (this.props.onRoomDidDisconnect) {
          this.props.onRoomDidDisconnect(data);
        }
      }),
      this._eventEmitter.addListener("roomDidFailToConnect", (data) => {
        if (this.props.onRoomDidFailToConnect) {
          this.props.onRoomDidFailToConnect(data);
        }
      }),
      this._eventEmitter.addListener("roomParticipantDidConnect", (data) => {
        if (this.props.onRoomParticipantDidConnect) {
          this.props.onRoomParticipantDidConnect(data);
        }
      }),
      this._eventEmitter.addListener("roomParticipantDidDisconnect", (data) => {
        if (this.props.onRoomParticipantDidDisconnect) {
          this.props.onRoomParticipantDidDisconnect(data);
        }
      }),
      this._eventEmitter.addListener("participantAddedVideoTrack", (data) => {
        if (this.props.onParticipantAddedVideoTrack) {
          this.props.onParticipantAddedVideoTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantAddedDataTrack", (data) => {
        if (this.props.onParticipantAddedDataTrack) {
          this.props.onParticipantAddedDataTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantRemovedDataTrack", (data) => {
        if (this.props.onParticipantRemovedDataTrack) {
          this.props.onParticipantRemovedDataTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantRemovedVideoTrack", (data) => {
        if (this.props.onParticipantRemovedVideoTrack) {
          this.props.onParticipantRemovedVideoTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantAddedAudioTrack", (data) => {
        if (this.props.onParticipantAddedAudioTrack) {
          this.props.onParticipantAddedAudioTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantRemovedAudioTrack", (data) => {
        if (this.props.onParticipantRemovedAudioTrack) {
          this.props.onParticipantRemovedAudioTrack(data);
        }
      }),
      this._eventEmitter.addListener("participantEnabledVideoTrack", (data) => {
        if (this.props.onParticipantEnabledVideoTrack) {
          this.props.onParticipantEnabledVideoTrack(data);
        }
      }),
      this._eventEmitter.addListener(
        "participantDisabledVideoTrack",
        (data) => {
          if (this.props.onParticipantDisabledVideoTrack) {
            this.props.onParticipantDisabledVideoTrack(data);
          }
        }
      ),
      this._eventEmitter.addListener("participantEnabledAudioTrack", (data) => {
        if (this.props.onParticipantEnabledAudioTrack) {
          this.props.onParticipantEnabledAudioTrack(data);
        }
      }),
      this._eventEmitter.addListener(
        "participantDisabledAudioTrack",
        (data) => {
          if (this.props.onParticipantDisabledAudioTrack) {
            this.props.onParticipantDisabledAudioTrack(data);
          }
        }
      ),
      this._eventEmitter.addListener("dataTrackMessageReceived", (data) => {
        if (this.props.onDataTrackMessageReceived) {
          this.props.onDataTrackMessageReceived(data);
        }
      }),
      this._eventEmitter.addListener("cameraDidStart", (data) => {
        if (this.props.onCameraDidStart) {
          this.props.onCameraDidStart(data);
        }
      }),
      this._eventEmitter.addListener("onCameraSwitched", (data) => {
        if (this.props.onCameraSwitched) {
          this.props.onCameraSwitched(data);
        }
      }),
      this._eventEmitter.addListener("onVideoChanged", (data) => {
        if (this.props.onVideoChanged) {
          this.props.onVideoChanged(data);
        }
      }),
      this._eventEmitter.addListener("onAudioChanged", (data) => {
        if (this.props.onAudioChanged) {
          this.props.onAudioChanged(data);
        }
      }),
      this._eventEmitter.addListener("cameraWasInterrupted", (data) => {
        if (this.props.onCameraWasInterrupted) {
          this.props.onCameraWasInterrupted(data);
        }
      }),
      this._eventEmitter.addListener("cameraInterruptionEnded", (data) => {
        if (this.props.onCameraInterruptionEnded) {
          this.props.onCameraInterruptionEnded(data);
        }
      }),
      this._eventEmitter.addListener("cameraDidStopRunning", (data) => {
        if (this.props.onCameraDidStopRunning) {
          this.props.onCameraDidStopRunning(data);
        }
      }),
      this._eventEmitter.addListener("statsReceived", (data) => {
        if (this.props.onStatsReceived) {
          this.props.onStatsReceived(data);
        }
      }),
      this._eventEmitter.addListener("networkQualityLevelsChanged", (data) => {
        if (this.props.onNetworkQualityLevelsChanged) {
          this.props.onNetworkQualityLevelsChanged(data);
        }
      }),
      this._eventEmitter.addListener("onLocalParticipantSupportedCodecs", (data) => {
        if (this.props.onLocalParticipantSupportedCodecs) {
          this.props.onLocalParticipantSupportedCodecs(data);
        }
      }),
      this._eventEmitter.addListener("onDominantSpeakerDidChange", (data) => {
        if (this.props.onDominantSpeakerDidChange) {
          this.props.onDominantSpeakerDidChange(data);
        }
      }),
      this._eventEmitter.addListener("screenShareChanged", (data) => {
        if (this.props.onScreenShareChanged) {
          this.props.onScreenShareChanged(data);
        }
      }),
      this._eventEmitter.addListener("onRoomFetched", (data) => {
        if (this.props.onRoomFetched) {
          this.props.onRoomFetched(data);
        }
      }),
      this._eventEmitter.addListener("roomIsReconnecting", (data) => {
        if (this.props.onRoomIsReconnecting) {
          this.props.onRoomIsReconnecting(data);
        }
      }),
      this._eventEmitter.addListener("roomDidReconnect", (data) => {
        if (this.props.onRoomDidReconnect) {
          this.props.onRoomDidReconnect(data);
        }
      }),
      this._eventEmitter.addListener("recordingStarted", (data) => {
        if (this.props.onRecordingStarted) {
          this.props.onRecordingStarted(data);
        }
      }),
      this._eventEmitter.addListener("recordingStopped", (data) => {
        if (this.props.onRecordingStopped) {
          this.props.onRecordingStopped(data);
        }
      }),
      this._eventEmitter.addListener("localAudioTrackPublished", (data) => {
        if (this.props.onLocalAudioTrackPublished) {
          this.props.onLocalAudioTrackPublished(data);
        }
      }),
      this._eventEmitter.addListener("localAudioTrackPublicationFailed", (data) => {
        if (this.props.onLocalAudioTrackPublicationFailed) {
          this.props.onLocalAudioTrackPublicationFailed(data);
        }
      }),
      this._eventEmitter.addListener("localVideoTrackPublished", (data) => {
        if (this.props.onLocalVideoTrackPublished) {
          this.props.onLocalVideoTrackPublished(data);
        }
      }),
      this._eventEmitter.addListener("localVideoTrackPublicationFailed", (data) => {
        if (this.props.onLocalVideoTrackPublicationFailed) {
          this.props.onLocalVideoTrackPublicationFailed(data);
        }
      }),
      this._eventEmitter.addListener("localDataTrackPublished", (data) => {
        if (this.props.onLocalDataTrackPublished) {
          this.props.onLocalDataTrackPublished(data);
        }
      }),
      this._eventEmitter.addListener("localDataTrackPublicationFailed", (data) => {
        if (this.props.onLocalDataTrackPublicationFailed) {
          this.props.onLocalDataTrackPublicationFailed(data);
        }
      }),
      this._eventEmitter.addListener("remoteAudioTrackPublished", (data) => {
        if (this.props.onRemoteAudioTrackPublished) {
          this.props.onRemoteAudioTrackPublished(data);
        }
      }),
      this._eventEmitter.addListener("remoteAudioTrackUnpublished", (data) => {
        if (this.props.onRemoteAudioTrackUnpublished) {
          this.props.onRemoteAudioTrackUnpublished(data);
        }
      }),
      this._eventEmitter.addListener("remoteAudioTrackSubscriptionFailed", (data) => {
        if (this.props.onRemoteAudioTrackSubscriptionFailed) {
          this.props.onRemoteAudioTrackSubscriptionFailed(data);
        }
      }),
      this._eventEmitter.addListener("remoteVideoTrackPublished", (data) => {
        if (this.props.onRemoteVideoTrackPublished) {
          this.props.onRemoteVideoTrackPublished(data);
        }
      }),
      this._eventEmitter.addListener("remoteVideoTrackUnpublished", (data) => {
        if (this.props.onRemoteVideoTrackUnpublished) {
          this.props.onRemoteVideoTrackUnpublished(data);
        }
      }),
      this._eventEmitter.addListener("remoteVideoTrackSubscriptionFailed", (data) => {
        if (this.props.onRemoteVideoTrackSubscriptionFailed) {
          this.props.onRemoteVideoTrackSubscriptionFailed(data);
        }
      }),
      this._eventEmitter.addListener("remoteDataTrackPublished", (data) => {
        if (this.props.onRemoteDataTrackPublished) {
          this.props.onRemoteDataTrackPublished(data);
        }
      }),
      this._eventEmitter.addListener("remoteDataTrackUnpublished", (data) => {
        if (this.props.onRemoteDataTrackUnpublished) {
          this.props.onRemoteDataTrackUnpublished(data);
        }
      }),
      this._eventEmitter.addListener("remoteDataTrackSubscriptionFailed", (data) => {
        if (this.props.onRemoteDataTrackSubscriptionFailed) {
          this.props.onRemoteDataTrackSubscriptionFailed(data);
        }
      }),
      this._eventEmitter.addListener("dataChanged", (data) => {
        if (this.props.onDataChanged) {
          this.props.onDataChanged(data);
        }
      }),
    ];
  }

  render() {
    return this.props.children || null;
  }
}
