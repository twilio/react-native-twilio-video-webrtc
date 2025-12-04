import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    Switch,
    ScrollView,
    Modal,
} from "react-native";
import {
    TwilioVideoLocalView,
    TwilioVideoScreenShareView,
    TwilioVideoParticipantView,
    TwilioVideo,
} from "@twilio/video-react-native-sdk";
import { check, PERMISSIONS, request } from "react-native-permissions";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { token } from "./access-token";

// Only keep the latest 50 log lines so the list doesn’t grow without bound, preventing extra memory use and lag.
const MAX_LOG_LINES = 50;

const ToggleRow = ({ label, value, onValueChange }: { label: string, value: boolean, onValueChange: (v: boolean) => void }) => (
    <View style={styles.toggleRow}>
        <Text style={{ marginRight: 6 }}>{label}</Text>
        <Switch value={value} onValueChange={onValueChange} />
    </View>
);

const ControlBar = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.optionsContainer}>{children}</View>
);

const OptionButton = ({ label, onPress, disabled }: { label: string, onPress: () => void, disabled?: boolean }) => (
    <TouchableOpacity
        style={[styles.optionButton, disabled && { opacity: 0.5 }]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
    >
        <Text style={{ color: '#fff', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
);

const LogPanel = React.memo(({ logs, scrollRef }: { logs: string[], scrollRef: React.RefObject<ScrollView | null> }) => (
    <View style={styles.logPanel}>
        <ScrollView ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
            {logs.map((l, i) => (<Text key={i} style={styles.logText}>{l}</Text>))}
        </ScrollView>
    </View>
));

const SAMPLE_BINARY_BASE64 = "AQIDBA=="; // 0x01 0x02 0x03 0x04


const Example = () => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isDataTrackEnabled, setIsDataTrackEnabled] = useState(false);
    const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
    const [networkQualityEnabled, setNetworkQualityEnabled] = useState(false);
    const [dominantSpeakerEnabled, setDominantSpeakerEnabled] = useState(false);
    const [enableH264Codec, setEnableH264Codec] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [status, setStatus] = useState("disconnected");
    const [videoTracks, setVideoTracks] = useState(new Map());
    const [roomDetails, setRoomDetails] = useState({ roomName: "", roomSid: "" });
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const scrollRef = useRef<ScrollView>(null);
    const twilioRef = useRef<any>(null);
    const insets = useSafeAreaInsets();
    const _log = (line: string) =>
        setLogs(prev => [...prev.slice(-MAX_LOG_LINES), line]);

    const resetStates = () => {
        setVideoTracks(new Map());
        setIsSharing(false);
        setStatus("disconnected");
        setIsAudioEnabled(true);
        setIsVideoEnabled(true);
        setIsDataTrackEnabled(false);
        setRemoteAudioEnabled(true);
        setNetworkQualityEnabled(false);
        setDominantSpeakerEnabled(false);
        setEnableH264Codec(false);
        setLogs([]);
        setRoomDetails({ roomName: "", roomSid: "" });
    };

    const _requestAudioPermission = () => {
        return PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: "Need permission to access microphone",
                message: "To run this demo we need permission to access your microphone",
                buttonNegative: "Cancel",
                buttonPositive: "OK",
            }
        );
    };

    const _requestCameraPermission = () => {
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: "Need permission to access camera",
            message: "To run this demo we need permission to access your camera",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
        });
    };



    const _onConnectButtonPress = async () => {
        if (Platform.OS === "android") {
            await _requestAudioPermission();
            await _requestCameraPermission();
        }
        else {
            await check(PERMISSIONS.IOS.CAMERA);
            await check(PERMISSIONS.IOS.MICROPHONE);
            await request(PERMISSIONS.IOS.CAMERA);
            await request(PERMISSIONS.IOS.MICROPHONE);
        }

        twilioRef.current?.connect({
            accessToken: token,
            enableAudio: isAudioEnabled,
            enableVideo: isVideoEnabled,
            enableDataTrack: isDataTrackEnabled,
            enableRemoteAudio: remoteAudioEnabled,
            enableNetworkQualityReporting: networkQualityEnabled,
            dominantSpeakerEnabled,
            encodingParameters: { enableH264Codec },
        });
        setStatus("connecting");
    };

    const _onEndButtonPress = () => {
        twilioRef.current?.disconnect();
    };

    const _onMuteButtonPress = () => {
        twilioRef.current
            ?.setLocalAudioEnabled(!isAudioEnabled)
            .then((enabled: boolean) => setIsAudioEnabled(enabled));
    };

    const _onFlipButtonPress = () => {
        twilioRef.current?.flipCamera();
    };

    const _onToggleVideoPress = () => {
        twilioRef.current?.setLocalVideoEnabled(!isVideoEnabled).then((enabled: boolean) => setIsVideoEnabled(enabled));
    };

    const _onToggleRemoteAudioPress = () => {
        twilioRef.current?.setRemoteAudioEnabled(!remoteAudioEnabled).then((enabled: boolean) => setRemoteAudioEnabled(enabled));
    };

    const _onToggleDataTrackPress = () => {
        twilioRef.current?.setLocalDataTrackEnabled(!isDataTrackEnabled).then((enabled: boolean) => setIsDataTrackEnabled(enabled));
    };

    const _onDataChanged = (event: any) => {
        setIsDataTrackEnabled(event.dataEnabled);
        _log(`Data Track ${event.dataEnabled ? 'Enabled' : 'Disabled'}`);
    };

    const _onStatsReceived = (data: any) => {
        _log(`Stats ${JSON.stringify(data)}...`);
    };

    const _onGetStatsPress = () => {
        twilioRef.current?.getStats();
        _log("(you) requested stats");
    };

    const _onFetchRoomPress = () => {
        twilioRef.current?.fetchRoom();
        _log("(you) requested room snapshot");
    };

    const _onSendStringPress = () => {
        twilioRef.current?.sendString("Hello from RN");
        _log("(you) sent: Hello from RN");
    };

    const _onSendBinaryPress = () => {
        twilioRef.current?.sendBinary(SAMPLE_BINARY_BASE64);
        _log("(you) sent binary payload (4 bytes)");
    };

    const _onShareButtonPress = () => {
        twilioRef.current?.toggleScreenSharing(!isSharing);
    };

    const _onScreenShareChanged = (event: any) => {
        setIsSharing(event.screenShareEnabled);
        _log(`Screen Share ${event.screenShareEnabled ? 'Started' : 'Stopped'}`);
    };

    const _onCameraSwitched = (event: any) => {
        _log(`Camera switched -> ${event?.isBackCamera ? "back" : "front"}`);
    };

    const _onCameraDidStart = () => {
        _log("Camera started");
    };

    const _onCameraWasInterrupted = (event: any) => {
        _log(`Camera interrupted${event?.reason ? `: ${event.reason}` : ""}`);
    };

    const _onCameraInterruptionEnded = () => {
        _log("Camera interruption ended");
    };

    const _onCameraDidStopRunning = (event: any) => {
        _log(`Camera stopped${event?.error ? `: ${event.error}` : ""}`);
    };

    const _onVideoChanged = (event: any) => {
        _log(`Video ${event?.videoEnabled ? "enabled" : "disabled"}`);
    };

    const _onAudioChanged = (event: any) => {
        _log(`Audio ${event?.audioEnabled ? "enabled" : "disabled"}`);
    };

    const _onLocalParticipantSupportedCodecs = (event: any) => {
        const codecs = Array.isArray(event?.supportedCodecs) ? event.supportedCodecs.join(", ") : "unknown";
        _log(`Supported codecs -> ${codecs}`);
    };

    const _onRoomDidConnect = (event: any) => {
        if (event.roomName) {
            setRoomDetails({
                roomName: event.roomName,
                roomSid: event.roomSid,
            });
        }
        setStatus("connected");
    };

    const _onRoomDidDisconnect = (event: any) => {
        if (event.error) {
            setErrorMessage(_formatErrorMessage(event));
        }
        resetStates();
    };

    const _onRoomDidFailToConnect = (event: any) => {
        setStatus("disconnected");
        setErrorMessage(_formatErrorMessage(event));
    };

    const _formatErrorMessage = (event: any) => {
        let errorMsg = event?.error || "Something went wrong";
        if (event?.code) {
            errorMsg += `\n\nError Code: ${event.code}`;
        }
        if (event?.errorExplanation) {
            errorMsg += `\n\nDetails: ${event.errorExplanation}`;
        }
        return errorMsg;
    };

    const describeParticipant = (participant?: any) => participant?.identity || participant?.sid || "unknown participant";
    const describeTrack = (track?: any) => track?.trackName || track?.trackSid || "unknown track";
    const describeRoom = (event: any) => {
        if (event?.roomName) {
            return `${event.roomName}${event?.roomSid ? ` (${event.roomSid})` : ""}`;
        }
        return event?.roomSid || "unknown room";
    };
    const describeError = (event: any) => {
        let details = event?.error || "Unknown error";
        if (event?.code) {
            details += ` (code ${event.code})`;
        }
        if (event?.errorExplanation) {
            details += ` - ${event.errorExplanation}`;
        }
        return details;
    };
    const logTrackEvent = (prefix: string, participant?: any, track?: any) => {
        _log(`${prefix}: ${describeParticipant(participant)} -> ${describeTrack(track)}`);
    };
    const logTrackErrorEvent = (prefix: string, event: any) => {
        _log(`${prefix}: ${describeParticipant(event?.participant)} -> ${describeTrack(event?.track)} | ${describeError(event)}`);
    };

    const _onRecordingStarted = (event: any) => {
        _log(`Recording started for ${describeRoom(event)}`);
    };

    const _onRecordingStopped = (event: any) => {
        _log(`Recording stopped for ${describeRoom(event)}`);
    };

    const _onNetworkQualityLevelsChanged = (event: any) => {
        const participantName = describeParticipant(event?.participant) || "local";
        _log(`Network Quality ${participantName} -> ${event?.quality}`);
    };

    const _onDominantSpeakerDidChange = (event: any) => {
        _log(`Dominant Speaker -> ${event?.participant?.identity || "none"}`);
    };

    const _onDataTrackMessageReceived = (event: any) => {
        if (event?.isBinary) {
            _log(`Data Track Binary (track ${event.trackSid}) payload=${event.payloadBase64?.slice(0, 16) || ""}...`);
        } else {
            _log(`Data Track Message ${event?.message}`);
        }
    };

    const _onRoomFetched = (event: any) => {
        console.log("event", event);
        const roomName = event?.name || "unknown";
        const state = event?.state || "unknown";
        const remoteCount = Array.isArray(event?.remoteParticipants) ? event.remoteParticipants.length : 0;
        _log(`Fetched room ${roomName} (${state}) with ${remoteCount} remote participant(s)`);
    };

    const _onLocalAudioTrackPublished = ({ participant, track }: any) => {
        logTrackEvent("Local audio track published", participant, track);
    };

    const _onLocalAudioTrackPublicationFailed = (event: any) => {
        logTrackErrorEvent("Local audio track publication failed", event);
    };

    const _onLocalVideoTrackPublished = ({ participant, track }: any) => {
        logTrackEvent("Local video track published", participant, track);
    };

    const _onLocalVideoTrackPublicationFailed = (event: any) => {
        logTrackErrorEvent("Local video track publication failed", event);
    };

    const _onLocalDataTrackPublished = ({ participant, track }: any) => {
        logTrackEvent("Local data track published", participant, track);
    };

    const _onLocalDataTrackPublicationFailed = (event: any) => {
        logTrackErrorEvent("Local data track publication failed", event);
    };

    const _onRemoteAudioTrackPublished = ({ participant, track }: any) => {
        logTrackEvent("Remote audio track published", participant, track);
    };

    const _onRemoteAudioTrackUnpublished = ({ participant, track }: any) => {
        logTrackEvent("Remote audio track unpublished", participant, track);
    };

    const _onRemoteAudioTrackSubscriptionFailed = (event: any) => {
        logTrackErrorEvent("Remote audio track subscription failed", event);
    };

    const _onRemoteVideoTrackPublished = ({ participant, track }: any) => {
        logTrackEvent("Remote video track published", participant, track);
    };

    const _onRemoteVideoTrackUnpublished = ({ participant, track }: any) => {
        logTrackEvent("Remote video track unpublished", participant, track);
    };

    const _onRemoteVideoTrackSubscriptionFailed = (event: any) => {
        logTrackErrorEvent("Remote video track subscription failed", event);
    };

    const _onRemoteDataTrackPublished = ({ participant, track }: any) => {
        logTrackEvent("Remote data track published", participant, track);
    };

    const _onRemoteDataTrackUnpublished = ({ participant, track }: any) => {
        logTrackEvent("Remote data track unpublished", participant, track);
    };

    const _onRemoteDataTrackSubscriptionFailed = (event: any) => {
        logTrackErrorEvent("Remote data track subscription failed", event);
    };

    const _onParticipantAddedVideoTrack = ({ participant, track }: any) => {
        setVideoTracks((originalVideoTracks: Map<string, any>) => {
            originalVideoTracks.set(track.trackSid, {
                participantSid: participant.sid,
                videoTrackSid: track.trackSid,
            });
            return new Map(originalVideoTracks);
        });
    };

    const _onParticipantRemovedVideoTrack = ({ track }: any) => {
        setVideoTracks((originalVideoTracks: Map<string, any>) => {
            originalVideoTracks.delete(track.trackSid);
            return new Map(originalVideoTracks);
        });
    };

    const _onRoomIsReconnecting = (event: any) => {
        setStatus("reconnecting");
        _log(`Room Is Reconnecting ${event.roomName} ${event.error}`);
    };

    const _onRoomDidReconnect = (event: any) => {
        setStatus("connected");
        _log(`Room Did Reconnect ${event.roomName}`);
    };

    return (
        <SafeAreaView style={{ ...styles.container, paddingBottom: insets.bottom }} >
            {status === "disconnected" && (
                <ScrollView>
                    <Text style={styles.welcome}>React Native Twilio Video</Text>

                    <ToggleRow label="Connect with video enabled" value={isVideoEnabled} onValueChange={setIsVideoEnabled} />
                    <ToggleRow label="Connect with audio enabled" value={isAudioEnabled} onValueChange={setIsAudioEnabled} />
                    <ToggleRow label="Connect with data track enabled" value={isDataTrackEnabled} onValueChange={setIsDataTrackEnabled} />
                    <ToggleRow label="Enable H264" value={enableH264Codec} onValueChange={setEnableH264Codec} />
                    <ToggleRow label="Network Quality" value={networkQualityEnabled} onValueChange={setNetworkQualityEnabled} />
                    <ToggleRow label="Dominant Speaker" value={dominantSpeakerEnabled} onValueChange={setDominantSpeakerEnabled} />

                    <TouchableOpacity style={styles.button} onPress={_onConnectButtonPress}>
                        <Text style={{ fontSize: 12 }}>Join Room</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {(status === "connected" || status === "connecting" || status === "reconnecting") && (
                <View style={styles.connectedWrapper}>
                    <View style={styles.headerContainer}>
                        <Text style={{ fontSize: 12 }}>Room Name: {roomDetails.roomName}</Text>
                        <Text style={{ fontSize: 12 }}>Room Sid: {roomDetails.roomSid}</Text>
                        <Text style={{ fontSize: 12 }}>Status: {status}</Text>
                    </View>

                    <View style={styles.callContainer}>
                        {status === "connected" && (
                            <View style={styles.remoteGrid}>
                                {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                                    return (
                                        <TwilioVideoParticipantView
                                            style={styles.remoteVideo}
                                            key={trackSid}
                                            trackIdentifier={trackIdentifier as any}
                                        />
                                    );
                                })}
                            </View>
                        )}
                        <TwilioVideoLocalView enabled={true} style={styles.localVideo} />
                        {isSharing ? <TwilioVideoScreenShareView enabled={true} style={styles.localVideo} /> : null}
                        <LogPanel logs={logs} scrollRef={scrollRef} />
                        <ControlBar>
                            <OptionButton label="End" onPress={_onEndButtonPress} />
                            <OptionButton label={isAudioEnabled ? "Mute" : "Unmute"} onPress={_onMuteButtonPress} />
                            <OptionButton label="Flip" onPress={_onFlipButtonPress} />
                            <OptionButton label={isVideoEnabled ? "Disable Video" : "Enable Video"} onPress={_onToggleVideoPress} />
                            <OptionButton label={remoteAudioEnabled ? "Mute Remote" : "Unmute Remote"} onPress={_onToggleRemoteAudioPress} />
                            <OptionButton label={isDataTrackEnabled ? "Disable Data" : "Enable Data"} onPress={_onToggleDataTrackPress} />
                            <OptionButton label="Stats" onPress={_onGetStatsPress} />
                            <OptionButton label="Ping" onPress={_onSendStringPress} disabled={!isDataTrackEnabled} />
                            <OptionButton label="Send Binary" onPress={_onSendBinaryPress} disabled={!isDataTrackEnabled} />
                            <OptionButton label={isSharing ? "Stop Sharing" : "Start Sharing"} onPress={_onShareButtonPress} />
                            <OptionButton label="Fetch Room" onPress={_onFetchRoomPress} />
                        </ControlBar>
                    </View>
                </View>
            )
            }
            <TwilioVideo
                ref={twilioRef as any}
                onRoomDidConnect={_onRoomDidConnect}
                onRoomDidDisconnect={_onRoomDidDisconnect}
                onRoomDidFailToConnect={_onRoomDidFailToConnect}
                onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
                onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
                onScreenShareChanged={_onScreenShareChanged}
                onCameraSwitched={_onCameraSwitched}
                onCameraDidStart={_onCameraDidStart}
                onCameraWasInterrupted={_onCameraWasInterrupted}
                onCameraInterruptionEnded={_onCameraInterruptionEnded}
                onCameraDidStopRunning={_onCameraDidStopRunning}
                onVideoChanged={_onVideoChanged}
                onAudioChanged={_onAudioChanged}
                onLocalParticipantSupportedCodecs={_onLocalParticipantSupportedCodecs}
                onStatsReceived={_onStatsReceived}
                onNetworkQualityLevelsChanged={_onNetworkQualityLevelsChanged}
                onDominantSpeakerDidChange={_onDominantSpeakerDidChange}
                onDataTrackMessageReceived={_onDataTrackMessageReceived}
                onRoomIsReconnecting={_onRoomIsReconnecting}
                onRoomDidReconnect={_onRoomDidReconnect}
                onDataChanged={_onDataChanged}
                onRecordingStarted={_onRecordingStarted}
                onRecordingStopped={_onRecordingStopped}
                onLocalAudioTrackPublished={_onLocalAudioTrackPublished}
                onLocalAudioTrackPublicationFailed={_onLocalAudioTrackPublicationFailed}
                onLocalVideoTrackPublished={_onLocalVideoTrackPublished}
                onLocalVideoTrackPublicationFailed={_onLocalVideoTrackPublicationFailed}
                onLocalDataTrackPublished={_onLocalDataTrackPublished}
                onLocalDataTrackPublicationFailed={_onLocalDataTrackPublicationFailed}
                onRemoteAudioTrackPublished={_onRemoteAudioTrackPublished}
                onRemoteAudioTrackUnpublished={_onRemoteAudioTrackUnpublished}
                onRemoteAudioTrackSubscriptionFailed={_onRemoteAudioTrackSubscriptionFailed}
                onRemoteVideoTrackPublished={_onRemoteVideoTrackPublished}
                onRemoteVideoTrackUnpublished={_onRemoteVideoTrackUnpublished}
                onRemoteVideoTrackSubscriptionFailed={_onRemoteVideoTrackSubscriptionFailed}
                onRemoteDataTrackPublished={_onRemoteDataTrackPublished}
                onRemoteDataTrackUnpublished={_onRemoteDataTrackUnpublished}
                onRemoteDataTrackSubscriptionFailed={_onRemoteDataTrackSubscriptionFailed}
                onRoomFetched={_onRoomFetched}
            />

            <Modal
                visible={!!errorMessage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setErrorMessage("")}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Connection Error</Text>
                        <Text style={styles.modalMessage}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setErrorMessage("")}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
};


const App = () => {
    return (
        <SafeAreaProvider>
            <Example />
        </SafeAreaProvider>
    );
};
export default App;
