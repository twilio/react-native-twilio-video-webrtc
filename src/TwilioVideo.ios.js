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
  static propTypes = {
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
     * Called when the camera has started
     *
     * @param {} No parameters
     */
    onCameraDidStart: PropTypes.func,
    /**
     * Called when the camera has been interrupted
     *
     * @param {} No parameters
     */
    onCameraWasInterrupted: PropTypes.func,
    /**
     * Called when the camera interruption has ended
     *
     * @param {} No parameters
     */
    onCameraInterruptionEnded: PropTypes.func,
    /**
     * Called when the camera has stopped running with an error
     *
     * @param {{error: string}} The error message description
     */
    onCameraDidStopRunning: PropTypes.func,
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
     * Whether or not video should be automatically initialized upon mounting
     * of this component. Defaults to true. If set to false, any use of the
     * camera will require calling `_startLocalVideo`.
     */
    autoInitializeCamera: PropTypes.bool,
    ...View.propTypes,
  };

  constructor(props) {
    super(props);

    this._subscriptions = [];
    this._eventEmitter = new NativeEventEmitter(TWVideoModule);
  }

  componentDidMount() {
    this._registerEvents();
    if (this.props.autoInitializeCamera !== false) {
      this._startLocalVideo();
    }
    this._startLocalAudio();
  }

  componentWillUnmount() {
    this._unregisterEvents();
    this._stopLocalVideo();
    this._stopLocalAudio();
  }

  /**
   * Locally mute/ unmute all remote audio tracks from a given participant
   */
  setRemoteAudioPlayback({ participantSid, enabled }) {
    TWVideoModule.setRemoteAudioPlayback(participantSid, enabled);
  }

  setRemoteAudioEnabled(enabled) {
    TWVideoModule.setRemoteAudioEnabled(enabled);
    return Promise.resolve(enabled);
  }

  setBluetoothHeadsetConnected(enabled) {
    return Promise.resolve(enabled);
  }

  /**
   * Enable or disable local video
   */
  setLocalVideoEnabled(enabled) {
    return TWVideoModule.setLocalVideoEnabled(enabled);
  }

  /**
   * Enable or disable local audio
   */
  setLocalAudioEnabled(enabled) {
    return TWVideoModule.setLocalAudioEnabled(enabled);
  }

  /**
   * Filp between the front and back camera
   */
  flipCamera() {
    TWVideoModule.flipCamera();
  }


  /**
   * Toggle audio setup from speaker (default) and headset
   */
  toggleSoundSetup(speaker) {
    TWVideoModule.toggleSoundSetup(speaker);
  }

  /**
   * Get connection stats
   */
  getStats() {
    TWVideoModule.getStats();
  }

  /**
   * Connect to given room name using the JWT access token
   * @param  {String} roomName    The connecting room name
   * @param  {String} accessToken The Twilio's JWT access token
   * @param  {String} encodingParameters Control Encoding config
   * @param  {Boolean} enableNetworkQualityReporting Report network quality of participants
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
  }) {
    TWVideoModule.connect(
      accessToken,
      roomName,
      enableAudio,
      enableVideo,
      encodingParameters,
      enableNetworkQualityReporting,
      dominantSpeakerEnabled,
      cameraType
    );
  }

  /**
   * Disconnect from current room
   */
  disconnect() {
    TWVideoModule.disconnect();
  }

  /**
   * Publish a local audio track
   */
  publishLocalAudio() {
    TWVideoModule.publishLocalAudio();
  }

  /**
   * Publish a local video track
   */
  publishLocalVideo() {
    TWVideoModule.publishLocalVideo();
  }

  /**
   * Unpublish a local audio track
   */
  unpublishLocalAudio() {
    TWVideoModule.unpublishLocalAudio();
  }

  /**
   * Unpublish a local video track
   */
  unpublishLocalVideo() {
    TWVideoModule.unpublishLocalVideo();
  }

  /**
   * SendString to datatrack
   * @param  {String} message    The message string to send
   */
  sendString(message) {
    TWVideoModule.sendString(message);
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
      this._eventEmitter.addListener("onDominantSpeakerDidChange", (data) => {
        if (this.props.onDominantSpeakerDidChange) {
          this.props.onDominantSpeakerDidChange(data);
        }
      }),
    ];
  }

  render() {
    return this.props.children || null;
  }
}
