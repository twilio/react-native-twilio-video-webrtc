declare module "@twilio/video-react-native-sdk" {
  import { ViewProps } from "react-native";
  import React from "react";

  export interface TrackIdentifier {
    participantSid: string;
    videoTrackSid: string;
  }

  type scaleType = "fit" | "fill";
  type cameraType = "front" | "back";

  interface TwilioVideoParticipantViewProps extends ViewProps {
    trackIdentifier: TrackIdentifier;
    ref?: React.Ref<any>;
    scaleType?: scaleType;
    /**
 * Whether to apply Z ordering to this view.  Setting this to true will cause
 * this view to appear above other Twilio Video views.
 */
    applyZOrder?: boolean | undefined;
  }

  interface TwilioVideoLocalViewProps extends ViewProps {
    enabled: boolean;
    ref?: React.Ref<any>;
    scaleType?: scaleType;
    /**
 * Whether to apply Z ordering to this view.  Setting this to true will cause
 * this view to appear above other Twilio Video views.
 */
    applyZOrder?: boolean | undefined;
  }

  interface TwilioVideoScreenShareViewProps extends ViewProps {
    enabled: boolean;
    ref?: React.Ref<any>;
    scaleType?: scaleType;
    /**
 * Whether to apply Z ordering to this view.  Setting this to true will cause
 * this view to appear above other Twilio Video views.
 */
    applyZOrder?: boolean | undefined;
  }

  interface Participant {
    sid: string;
    identity: string;
  }

  interface Track {
    enabled: boolean;
    trackName: string;
    trackSid: string;
  }

  export interface TrackEventCbArgs {
    participant: Participant;
    track: Track;
  }

  export type TrackEventCb = (t: TrackEventCbArgs) => void;

  export type TrackErrorEventArgs = {
    participant: Participant;
    track?: Track;
    error: string;
    code?: string;
    errorExplanation?: string;
  };

  export type TrackErrorEventCb = (args: TrackErrorEventArgs) => void;

  export interface DataTrackEventCbArgs {
    trackSid: string;
    message?: string;
    payloadBase64?: string;
    isBinary?: boolean;
  }

  export type DataTrackEventCb = (t: DataTrackEventCbArgs) => void;

  interface RoomEventCommonArgs {
    roomName: string;
    roomSid: string;
  }

  export type RoomErrorEventArgs = RoomEventCommonArgs & {
    error: any;
  };

  type RoomEventArgs = RoomEventCommonArgs & {
    participants: Participant[];
    localParticipant: Participant;
  };

  type ParticipantEventArgs = RoomEventCommonArgs & {
    participant: Participant;
  };

  type NetworkLevelChangeEventArgs = {
    participant: Participant;
    isLocalUser: boolean;
    quality: number;
  };

  export type RoomEventCb = (p: RoomEventArgs) => void;
  export type RoomErrorEventCb = (t: RoomErrorEventArgs) => void;

  export type ParticipantEventCb = (p: ParticipantEventArgs) => void;

  export type NetworkLevelChangeEventCb = (p: NetworkLevelChangeEventArgs) => void;

  export type DominantSpeakerChangedEventArgs = RoomEventCommonArgs & {
    participant: Participant;
  };

  export type DominantSpeakerChangedCb = (d: DominantSpeakerChangedEventArgs) => void;

  export type LocalParticipantSupportedCodecsCbEventArgs = {
    supportedCodecs: Array<string>;
  };

  export type LocalParticipantSupportedCodecsCb = (d: LocalParticipantSupportedCodecsCbEventArgs) => void;

  export type ScreenShareChangedEventArgs = {
    screenShareEnabled: boolean;
  };

  export type ScreenShareChangedCb = (e: ScreenShareChangedEventArgs) => void;

  export type DataChangedEventArgs = {
    dataEnabled: boolean;
  };

  export type DataChangedCb = (e: DataChangedEventArgs) => void;

  export type ReconnectingEventArgs = RoomEventCommonArgs & {
    error: any;
  };
  export type ReconnectingEventCb = (e: ReconnectingEventArgs) => void;
  export type ReconnectedEventCb = (e: RoomEventCommonArgs) => void;

  export type RoomFetchedEventArgs = {
    sid?: string;
    name?: string;
    dominantSpeaker?: Participant | null;
    remoteParticipants: Array<Participant>;
    localParticipant: Participant;
    state?: string;
    mediaRegion?: string;
    signalingRegion?: string;
  };

  export type TwilioVideoProps = ViewProps & {
    onCameraDidStart?: () => void;
    onCameraWasInterrupted?: (args?: { reason?: string }) => void;
    onCameraInterruptionEnded?: () => void;
    onCameraDidStopRunning?: (args?: { error?: string }) => void;
    onCameraSwitched?: (args: { isBackCamera: boolean }) => void;
    onVideoChanged?: (args: { videoEnabled: boolean }) => void;
    onAudioChanged?: (args: { audioEnabled: boolean }) => void;
    onDominantSpeakerDidChange?: DominantSpeakerChangedCb;
    onParticipantAddedAudioTrack?: TrackEventCb;
    onParticipantAddedVideoTrack?: TrackEventCb;
    onParticipantDisabledVideoTrack?: TrackEventCb;
    onParticipantDisabledAudioTrack?: TrackEventCb;
    onParticipantEnabledVideoTrack?: TrackEventCb;
    onParticipantEnabledAudioTrack?: TrackEventCb;
    onParticipantRemovedAudioTrack?: TrackEventCb;
    onParticipantRemovedVideoTrack?: TrackEventCb;
    onParticipantAddedDataTrack?: TrackEventCb;
    onParticipantRemovedDataTrack?: TrackEventCb;
    onRoomDidConnect?: RoomEventCb;
    onRoomDidDisconnect?: RoomErrorEventCb;
    onRoomDidFailToConnect?: RoomErrorEventCb;
    onRoomParticipantDidConnect?: ParticipantEventCb;
    onRoomParticipantDidDisconnect?: ParticipantEventCb;
    onNetworkQualityLevelsChanged?: NetworkLevelChangeEventCb;
    onLocalParticipantSupportedCodecs?: LocalParticipantSupportedCodecsCb;
    onScreenShareChanged?: ScreenShareChangedCb;
    onRoomDidReconnect?: ReconnectedEventCb;
    onRoomIsReconnecting?: ReconnectingEventCb;
    onDataChanged?: DataChangedCb;
    onRecordingStarted?: (event: RoomEventCommonArgs) => void;
    onRecordingStopped?: (event: RoomEventCommonArgs) => void;
    onLocalAudioTrackPublished?: TrackEventCb;
    onLocalAudioTrackPublicationFailed?: TrackErrorEventCb;
    onLocalVideoTrackPublished?: TrackEventCb;
    onLocalVideoTrackPublicationFailed?: TrackErrorEventCb;
    onLocalDataTrackPublished?: TrackEventCb;
    onLocalDataTrackPublicationFailed?: TrackErrorEventCb;
    onRemoteAudioTrackPublished?: TrackEventCb;
    onRemoteAudioTrackUnpublished?: TrackEventCb;
    onRemoteAudioTrackSubscriptionFailed?: TrackErrorEventCb;
    onRemoteVideoTrackPublished?: TrackEventCb;
    onRemoteVideoTrackUnpublished?: TrackEventCb;
    onRemoteVideoTrackSubscriptionFailed?: TrackErrorEventCb;
    onRemoteDataTrackPublished?: TrackEventCb;
    onRemoteDataTrackUnpublished?: TrackEventCb;
    onRemoteDataTrackSubscriptionFailed?: TrackErrorEventCb;
    onRoomFetched?: (event: RoomFetchedEventArgs) => void;

    onStatsReceived?: (data: any) => void;
    onDataTrackMessageReceived?: DataTrackEventCb;
    // iOS only
    // DEPRECATED: Only available on iOS and will be removed in a future release
    autoInitializeCamera?: boolean;
    ref?: React.Ref<any>;
  };

  type iOSConnectParams = {
    roomName?: string;
    accessToken: string;
    cameraType?: cameraType;
    dominantSpeakerEnabled?: boolean;
    enableAudio?: boolean;
    enableVideo?: boolean;
    enableDataTrack?: boolean;
    encodingParameters?: {
      enableH264Codec?: boolean;
      // if audioBitrate OR videoBitrate is provided, you must provide both
      audioBitrate?: number;
      videoBitrate?: number;
    };
    enableNetworkQualityReporting?: boolean;
  };

  type androidConnectParams = {
    roomName?: string;
    accessToken: string;
    cameraType?: cameraType;
    dominantSpeakerEnabled?: boolean;
    enableAudio?: boolean;
    enableVideo?: boolean;
    enableDataTrack?: boolean;
    enableRemoteAudio?: boolean;
    encodingParameters?: {
      enableH264Codec?: boolean;
    };
    enableNetworkQualityReporting?: boolean;
    maintainVideoTrackInBackground?: boolean;
  };

  class TwilioVideo extends React.Component<TwilioVideoProps> {
    setLocalVideoEnabled: (enabled: boolean) => Promise<boolean>;
    setLocalAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setLocalDataTrackEnabled: (enabled: boolean) => Promise<boolean>;
    setRemoteAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setBluetoothHeadsetConnected: (enabled: boolean) => Promise<boolean>;
    connect: (options: iOSConnectParams | androidConnectParams) => void;
    disconnect: () => void;
    flipCamera: () => void;
    toggleSoundSetup: (speaker: boolean) => void;
    getStats: () => void;
    publishLocalAudio: () => void;
    unpublishLocalAudio: () => void;
    publishLocalVideo: () => void;
    unpublishLocalVideo: () => void;
    sendString: (message: string) => void;
    sendBinary: (base64Payload: string) => void;
    fetchRoom: () => void;
  }

  class TwilioVideoLocalView extends React.Component<TwilioVideoLocalViewProps> { }

  class TwilioVideoScreenShareView extends React.Component<TwilioVideoScreenShareViewProps> { }

  class TwilioVideoParticipantView extends React.Component<TwilioVideoParticipantViewProps> { }

  export {
    TwilioVideoLocalView,
    TwilioVideoScreenShareView,
    TwilioVideoParticipantView,
    TwilioVideo,
  };
}
