import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import {
    Platform,
    UIManager,
    View,
    findNodeHandle,
    requireNativeComponent,
    ViewProps,
} from "react-native";

// Keep runtime PropTypes for JS consumers (optional)
import PropTypes from "prop-types";

/** Participant data structure */
export interface Participant {
    sid: string;
    identity: string;
}

/** Track data structure */
export interface Track {
    enabled: boolean;
    trackName: string;
    trackSid: string;
}

/** FrameDimensionsData structure */
export interface FrameDimensionsData {
    height: number;
    width: number;
    rotation: number;
}

export interface ConnectParameters {
    roomName: string;
    accessToken: string;
    cameraType?: "front" | "back";
    enableAudio?: boolean;
    enableVideo?: boolean;
    enableRemoteAudio?: boolean;
    enableNetworkQualityReporting?: boolean;
    dominantSpeakerEnabled?: boolean;
    maintainVideoTrackInBackground?: boolean;
    encodingParameters?: Record<string, unknown>;
}

export interface RemoteAudioPlaybackOptions {
    participantSid: string;
    enabled: boolean;
}

export interface CustomTwilioVideoViewProps extends ViewProps {
    onCameraSwitched?: (data: { isBackCamera: boolean }) => void;
    onVideoChanged?: (data: { videoEnabled: boolean }) => void;
    onAudioChanged?: (data: { audioEnabled: boolean }) => void;
    onRoomDidConnect?: (data: {
        roomName: string;
        roomSid: string;
        participants: Participant[];
        localParticipant: Participant;
    }) => void;
    onRoomDidFailToConnect?: (data: {
        roomName: string;
        roomSid: string;
        error: string;
    }) => void;
    onRoomDidDisconnect?: (data: {
        roomName: string;
        roomSid: string;
        participant?: string;
        error?: string;
    }) => void;
    onParticipantAddedDataTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantRemovedDataTrack?: (data: { participant: Participant; track: Track }) => void;
    onDataTrackMessageReceived?: (data: { message: string; trackSid: string }) => void;
    onParticipantAddedVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantRemovedVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantAddedAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantRemovedAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onRoomParticipantDidConnect?: (data: { roomName: string; roomSid: string; participant: Participant }) => void;
    onRoomParticipantDidDisconnect?: (data: { roomName: string; roomSid: string; participant: Participant }) => void;
    onParticipantEnabledVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantDisabledVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantEnabledAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantDisabledAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onStatsReceived?: (
        data: Record<
            string,
            {
                remoteAudioTrackStats: any[];
                remoteVideoTrackStats: any[];
                localAudioTrackStats: any[];
                localVideoTrackStats: any[];
            }
        >
    ) => void;
    onNetworkQualityLevelsChanged?: (data: { participant: Participant; isLocalUser: boolean; quality: number }) => void;
    onDominantSpeakerDidChange?: (data: { roomName: string; roomSid: string; participant: Participant }) => void;
    onLocalParticipantSupportedCodecs?: (data: { supportedCodecs: string[] }) => void;
}

const propTypes = {
    ...View.propTypes,
    onCameraSwitched: PropTypes.func,
    onVideoChanged: PropTypes.func,
    onAudioChanged: PropTypes.func,
    onRoomDidConnect: PropTypes.func,
    onRoomDidFailToConnect: PropTypes.func,
    onRoomDidDisconnect: PropTypes.func,
    onParticipantAddedDataTrack: PropTypes.func,
    onParticipantRemovedDataTrack: PropTypes.func,
    onDataTrackMessageReceived: PropTypes.func,
    onParticipantAddedVideoTrack: PropTypes.func,
    onParticipantRemovedVideoTrack: PropTypes.func,
    onParticipantAddedAudioTrack: PropTypes.func,
    onParticipantRemovedAudioTrack: PropTypes.func,
    onRoomParticipantDidConnect: PropTypes.func,
    onRoomParticipantDidDisconnect: PropTypes.func,
    onParticipantEnabledVideoTrack: PropTypes.func,
    onParticipantDisabledVideoTrack: PropTypes.func,
    onParticipantEnabledAudioTrack: PropTypes.func,
    onParticipantDisabledAudioTrack: PropTypes.func,
    onStatsReceived: PropTypes.func,
    onNetworkQualityLevelsChanged: PropTypes.func,
    onDominantSpeakerDidChange: PropTypes.func,
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
} as const;

type NativeEventKey = keyof typeof nativeEvents;

export interface CustomTwilioVideoViewHandle {
    connect: (params: ConnectParameters) => void;
    sendString: (message: string) => void;
    publishLocalAudio: () => void;
    publishLocalVideo: () => void;
    unpublishLocalAudio: () => void;
    unpublishLocalVideo: () => void;
    disconnect: () => void;
    flipCamera: () => void;
    setLocalVideoEnabled: (enabled: boolean) => Promise<boolean>;
    setLocalAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setRemoteAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setBluetoothHeadsetConnected: (enabled: boolean) => Promise<boolean>;
    setRemoteAudioPlayback: (opts: RemoteAudioPlaybackOptions) => void;
    getStats: () => void;
    disableOpenSLES: () => void;
    toggleSoundSetup: (speaker: boolean) => void;
}

const NativeCustomTwilioVideoView = requireNativeComponent<CustomTwilioVideoViewProps>(
    "RNCustomTwilioVideoView"
);

const CustomTwilioVideoView = forwardRef<CustomTwilioVideoViewHandle, CustomTwilioVideoViewProps>((props, ref) => {
    const videoViewRef = useRef<any>(null);

    const runCommand = (event: typeof nativeEvents[keyof typeof nativeEvents], args: any[]) => {
        if (Platform.OS === "android") {
            UIManager.dispatchViewManagerCommand(findNodeHandle(videoViewRef.current), event, args);
        }
    };

    // Build wrapped events only once per props change
    const wrappedEvents = useMemo(() => {
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
        ].reduce<Record<string, (e: any) => void>>((acc, eventName) => {
            if (props[eventName]) {
                acc[eventName] = (data: any) => props[eventName](data.nativeEvent);
            }
            return acc;
        }, {});
    }, [props]);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
        connect(params) {
            const {
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
            } = params;
            runCommand(nativeEvents.connectToRoom, [
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
        },
        sendString(message) {
            runCommand(nativeEvents.sendString, [message]);
        },
        publishLocalAudio() {
            runCommand(nativeEvents.publishAudio, [true]);
        },
        publishLocalVideo() {
            runCommand(nativeEvents.publishVideo, [true]);
        },
        unpublishLocalAudio() {
            runCommand(nativeEvents.publishAudio, [false]);
        },
        unpublishLocalVideo() {
            runCommand(nativeEvents.publishVideo, [false]);
        },
        disconnect() {
            runCommand(nativeEvents.disconnect, []);
        },
        flipCamera() {
            runCommand(nativeEvents.switchCamera, []);
        },
        setLocalVideoEnabled(enabled) {
            runCommand(nativeEvents.toggleVideo, [enabled]);
            return Promise.resolve(enabled);
        },
        setLocalAudioEnabled(enabled) {
            runCommand(nativeEvents.toggleSound, [enabled]);
            return Promise.resolve(enabled);
        },
        setRemoteAudioEnabled(enabled) {
            runCommand(nativeEvents.toggleRemoteSound, [enabled]);
            return Promise.resolve(enabled);
        },
        setBluetoothHeadsetConnected(enabled) {
            runCommand(nativeEvents.toggleBluetoothHeadset, [enabled]);
            return Promise.resolve(enabled);
        },
        setRemoteAudioPlayback({ participantSid, enabled }) {
            runCommand(nativeEvents.setRemoteAudioPlayback, [participantSid, enabled]);
        },
        getStats() {
            runCommand(nativeEvents.getStats, []);
        },
        disableOpenSLES() {
            runCommand(nativeEvents.disableOpenSLES, []);
        },
        toggleSoundSetup(speaker) {
            runCommand(nativeEvents.toggleSoundSetup, [speaker]);
        },
    }));

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            runCommand(nativeEvents.releaseResource, []);
        };
    }, []);

    return (
        <NativeCustomTwilioVideoView
            ref={videoViewRef}
            {...props}
            {...wrappedEvents}
        />
    );
});

// Attach runtime PropTypes for JS usage
CustomTwilioVideoView.propTypes = propTypes;

export default CustomTwilioVideoView;
