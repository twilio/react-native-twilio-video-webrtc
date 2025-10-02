import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import PropTypes from "prop-types";
import { NativeModules, NativeEventEmitter, View, ViewProps } from "react-native";

const { TWVideoModule } = NativeModules;

export interface Participant {
    sid: string;
    identity: string;
}

export interface Track {
    enabled: boolean;
    trackName: string;
    trackSid: string;
}

export interface TwilioVideoProps extends ViewProps {
    onRoomDidConnect?: (data: { roomName: string; roomSid: string; participants: Participant[]; localParticipant: Participant }) => void;
    onRoomDidDisconnect?: (data: { roomName: string; roomSid: string; participant?: string; error?: string }) => void;
    onRoomDidFailToConnect?: (data: { roomName: string; roomSid: string; error: string }) => void;
    onRoomParticipantDidConnect?: (data: { roomName: string; roomSid: string; participant: Participant }) => void;
    onRoomParticipantDidDisconnect?: (data: { roomName: string; roomSid: string; participant: Participant }) => void;
    onParticipantAddedVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantRemovedVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantAddedDataTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantRemovedDataTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantAddedAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantRemovedAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantEnabledVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantDisabledVideoTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantEnabledAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onParticipantDisabledAudioTrack?: (data: { participant: Participant; track: Track }) => void;
    onDataTrackMessageReceived?: (data: { message: string; trackSid: string }) => void;
    onCameraDidStart?: () => void;
    onCameraWasInterrupted?: () => void;
    onCameraInterruptionEnded?: () => void;
    onCameraDidStopRunning?: (data: { error: string }) => void;
    onStatsReceived?: (data: Record<string, any>) => void;
    onNetworkQualityLevelsChanged?: (data: { participant: Participant; isLocalUser: boolean; quality: number }) => void;
    onDominantSpeakerDidChange?: (data: { roomName: string; roomSid: string; participant: Participant }) => void;
    autoInitializeCamera?: boolean;
}

export interface ConnectOptions {
    roomName: string;
    accessToken: string;
    cameraType?: "front" | "back";
    enableAudio?: boolean;
    enableVideo?: boolean;
    encodingParameters?: any;
    enableNetworkQualityReporting?: boolean;
    dominantSpeakerEnabled?: boolean;
}

export interface TwilioVideoHandle {
    connect: (options: ConnectOptions) => void;
    disconnect: () => void;
    flipCamera: () => void;
    getStats: () => void;
    publishLocalAudio: () => void;
    publishLocalVideo: () => void;
    unpublishLocalAudio: () => void;
    unpublishLocalVideo: () => void;
    sendString: (message: string) => void;
    setLocalVideoEnabled: (enabled: boolean) => Promise<boolean>;
    setLocalAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setRemoteAudioEnabled: (enabled: boolean) => Promise<boolean>;
    setBluetoothHeadsetConnected: (enabled: boolean) => Promise<boolean>;
    setRemoteAudioPlayback: (opts: { participantSid: string; enabled: boolean }) => void;
    toggleSoundSetup: (speaker: boolean) => void;
}

const TwilioVideo = forwardRef<TwilioVideoHandle, TwilioVideoProps>((props, ref) => {
    const eventEmitterRef = useRef(new NativeEventEmitter(TWVideoModule));
    const subscriptionsRef = useRef<Array<{ remove: () => void }>>([]);

    /* Helpers */
    const _startLocalVideo = () => TWVideoModule.startLocalVideo();
    const _stopLocalVideo = () => TWVideoModule.stopLocalVideo();
    const _startLocalAudio = () => TWVideoModule.startLocalAudio();
    const _stopLocalAudio = () => TWVideoModule.stopLocalAudio();

    const _registerEvents = () => {
        TWVideoModule.changeListenerStatus(true);
        const ee = eventEmitterRef.current;
        subscriptionsRef.current = [
            ee.addListener("roomDidConnect", (data) => props.onRoomDidConnect?.(data)),
            ee.addListener("roomDidDisconnect", (data) => props.onRoomDidDisconnect?.(data)),
            ee.addListener("roomDidFailToConnect", (data) => props.onRoomDidFailToConnect?.(data)),
            ee.addListener("roomParticipantDidConnect", (data) => props.onRoomParticipantDidConnect?.(data)),
            ee.addListener("roomParticipantDidDisconnect", (data) => props.onRoomParticipantDidDisconnect?.(data)),
            ee.addListener("participantAddedVideoTrack", (data) => props.onParticipantAddedVideoTrack?.(data)),
            ee.addListener("participantAddedDataTrack", (data) => props.onParticipantAddedDataTrack?.(data)),
            ee.addListener("participantRemovedDataTrack", (data) => props.onParticipantRemovedDataTrack?.(data)),
            ee.addListener("participantRemovedVideoTrack", (data) => props.onParticipantRemovedVideoTrack?.(data)),
            ee.addListener("participantAddedAudioTrack", (data) => props.onParticipantAddedAudioTrack?.(data)),
            ee.addListener("participantRemovedAudioTrack", (data) => props.onParticipantRemovedAudioTrack?.(data)),
            ee.addListener("participantEnabledVideoTrack", (data) => props.onParticipantEnabledVideoTrack?.(data)),
            ee.addListener("participantDisabledVideoTrack", (data) => props.onParticipantDisabledVideoTrack?.(data)),
            ee.addListener("participantEnabledAudioTrack", (data) => props.onParticipantEnabledAudioTrack?.(data)),
            ee.addListener("participantDisabledAudioTrack", (data) => props.onParticipantDisabledAudioTrack?.(data)),
            ee.addListener("dataTrackMessageReceived", (data) => props.onDataTrackMessageReceived?.(data)),
            ee.addListener("cameraDidStart", () => props.onCameraDidStart?.()),
            ee.addListener("cameraWasInterrupted", () => props.onCameraWasInterrupted?.()),
            ee.addListener("cameraInterruptionEnded", () => props.onCameraInterruptionEnded?.()),
            ee.addListener("cameraDidStopRunning", (data) => props.onCameraDidStopRunning?.(data)),
            ee.addListener("statsReceived", (data) => props.onStatsReceived?.(data)),
            ee.addListener("networkQualityLevelsChanged", (data) => props.onNetworkQualityLevelsChanged?.(data)),
            ee.addListener("onDominantSpeakerDidChange", (data) => props.onDominantSpeakerDidChange?.(data)),
        ];
    };

    const _unregisterEvents = () => {
        TWVideoModule.changeListenerStatus(false);
        subscriptionsRef.current.forEach((s) => s.remove());
        subscriptionsRef.current = [];
    };

    /* lifecycle */
    useEffect(() => {
        _registerEvents();
        if (props.autoInitializeCamera !== false) {
            _startLocalVideo();
        }
        _startLocalAudio();

        return () => {
            _unregisterEvents();
            _stopLocalVideo();
            _stopLocalAudio();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Imperative handle */
    useImperativeHandle(ref, () => ({
        connect(options) {
            const {
                roomName,
                accessToken,
                cameraType = "front",
                enableAudio = true,
                enableVideo = true,
                encodingParameters = null,
                enableNetworkQualityReporting = false,
                dominantSpeakerEnabled = false,
            } = options;
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
        },
        disconnect() {
            TWVideoModule.disconnect();
        },
        flipCamera() {
            TWVideoModule.flipCamera();
        },
        getStats() {
            TWVideoModule.getStats();
        },
        publishLocalAudio() {
            TWVideoModule.publishLocalAudio();
        },
        publishLocalVideo() {
            TWVideoModule.publishLocalVideo();
        },
        unpublishLocalAudio() {
            TWVideoModule.unpublishLocalAudio();
        },
        unpublishLocalVideo() {
            TWVideoModule.unpublishLocalVideo();
        },
        sendString(message) {
            TWVideoModule.sendString(message);
        },
        setLocalVideoEnabled(enabled) {
            return TWVideoModule.setLocalVideoEnabled(enabled);
        },
        setLocalAudioEnabled(enabled) {
            return TWVideoModule.setLocalAudioEnabled(enabled);
        },
        setRemoteAudioEnabled(enabled) {
            TWVideoModule.setRemoteAudioEnabled(enabled);
            return Promise.resolve(enabled);
        },
        setBluetoothHeadsetConnected(enabled) {
            return Promise.resolve(enabled);
        },
        setRemoteAudioPlayback({ participantSid, enabled }) {
            TWVideoModule.setRemoteAudioPlayback(participantSid, enabled);
        },
        toggleSoundSetup(speaker) {
            TWVideoModule.toggleSoundSetup(speaker);
        },
    }));

    /* render */
    return props.children || null;
});

// PropTypes preserved for JS consumers
TwilioVideo.propTypes = {
    onRoomDidConnect: PropTypes.func,
    onRoomDidDisconnect: PropTypes.func,
    onRoomDidFailToConnect: PropTypes.func,
    onRoomParticipantDidConnect: PropTypes.func,
    onRoomParticipantDidDisconnect: PropTypes.func,
    onParticipantAddedVideoTrack: PropTypes.func,
    onParticipantRemovedVideoTrack: PropTypes.func,
    onParticipantAddedDataTrack: PropTypes.func,
    onParticipantRemovedDataTrack: PropTypes.func,
    onParticipantAddedAudioTrack: PropTypes.func,
    onParticipantRemovedAudioTrack: PropTypes.func,
    onParticipantEnabledVideoTrack: PropTypes.func,
    onParticipantDisabledVideoTrack: PropTypes.func,
    onParticipantEnabledAudioTrack: PropTypes.func,
    onParticipantDisabledAudioTrack: PropTypes.func,
    onDataTrackMessageReceived: PropTypes.func,
    onCameraDidStart: PropTypes.func,
    onCameraWasInterrupted: PropTypes.func,
    onCameraInterruptionEnded: PropTypes.func,
    onCameraDidStopRunning: PropTypes.func,
    onStatsReceived: PropTypes.func,
    onNetworkQualityLevelsChanged: PropTypes.func,
    onDominantSpeakerDidChange: PropTypes.func,
    autoInitializeCamera: PropTypes.bool,
    ...View.propTypes,
};

export default TwilioVideo;
