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
    TextInput,
} from "react-native";
import {
    TwilioVideoLocalView,
    TwilioVideoScreenShareView,
    TwilioVideoParticipantView,
    TwilioVideo,
    TrackIdentifier,
    VideoFormat,
    RoomFetchedEventArgs,
    TranscriptionEventArgs,
    TrackEventCbArgs,
    TrackErrorEventArgs,
    RoomEventArgs,
    RoomErrorEventArgs,
    RoomEventCommonArgs,
    ParticipantEventArgs,
    NetworkLevelChangeEventArgs,
    DominantSpeakerChangedEventArgs,
    DataTrackEventCbArgs,
    LocalParticipantSupportedCodecsCbEventArgs,
    ScreenShareChangedEventArgs,
    DataChangedEventArgs,
    ReconnectingEventArgs,
    Participant,
    Track,
    iOSConnectParams,
    androidConnectParams,
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

const NumberInput = ({ label, value, onChangeText, placeholder }: { label: string, value: string, onChangeText: (v: string) => void, placeholder?: string }) => (
    <View style={styles.toggleRow}>
        <Text style={{ marginRight: 6, flex: 1 }}>{label}</Text>
        <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, width: 80, textAlign: 'center' }}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType="numeric"
        />
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

const REGIONS = [
    { value: null, label: "No region selected" },
    { value: "gll", label: "Global Low Latency (gll)" },
    { value: "au1", label: "Australia (au1)" },
    { value: "br1", label: "Brazil (br1)" },
    { value: "de1", label: "Germany (de1)" },
    { value: "ie1", label: "Ireland (ie1)" },
    { value: "in1", label: "India (in1)" },
    { value: "jp1", label: "Japan (jp1)" },
    { value: "sg1", label: "Singapore (sg1)" },
    { value: "us1", label: "US East Coast (us1)" },
    { value: "us2", label: "US West Coast (us2)" },
];

type VideoFormatPreset = {
    value: string;
    label: string;
    width?: number;
    height?: number;
    frameRate?: number;
};

const VIDEO_FORMAT_PRESETS: VideoFormatPreset[] = [
    { value: "default", label: "Default (auto-select best camera format)" },
    { value: "1280x720_30", label: "1280x720, 30 FPS", width: 1280, height: 720, frameRate: 30 },
    { value: "900x720_15", label: "900x720, 15 FPS", width: 900, height: 720, frameRate: 15 },
    { value: "640x480_15", label: "640x480, 15 FPS", width: 640, height: 480, frameRate: 15 },
    { value: "352x258_15", label: "352x258, 15 FPS", width: 352, height: 258, frameRate: 15 },
    { value: "custom", label: "Custom video format" },
];

type PickerOption<T> = {
    value: T;
    label: string;
};

const Picker = <T extends string | null>({
    options,
    selectedValue,
    onSelect,
    title
}: {
    options: PickerOption<T>[];
    selectedValue: T;
    onSelect: (value: T) => void;
    title: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find(o => o.value === selectedValue)?.label || String(selectedValue);

    return (
        <>
            <TouchableOpacity
                style={styles.regionPicker}
                onPress={() => setIsOpen(true)}
            >
                <Text style={styles.regionPickerText}>{selectedLabel}</Text>
                <Text style={styles.regionPickerArrow}>▼</Text>
            </TouchableOpacity>
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.regionModalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.regionModalContainer}>
                        <Text style={styles.regionModalTitle}>{title}</Text>
                        <ScrollView style={styles.regionList}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={String(option.value)}
                                    style={[
                                        styles.regionOption,
                                        selectedValue === option.value && styles.regionOptionSelected
                                    ]}
                                    onPress={() => {
                                        onSelect(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.regionOptionText,
                                        selectedValue === option.value && styles.regionOptionTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const Example = () => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isDataTrackEnabled, setIsDataTrackEnabled] = useState(false);
    const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
    const [networkQualityEnabled, setNetworkQualityEnabled] = useState(false);
    const [dominantSpeakerEnabled, setDominantSpeakerEnabled] = useState(false);
    const [enableH264Codec, setEnableH264Codec] = useState(false);
    const [enableSimulcast, setEnableSimulcast] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "reconnecting">("disconnected");
    const [videoTracks, setVideoTracks] = useState<Map<string, TrackIdentifier>>(new Map());
    const [roomDetails, setRoomDetails] = useState({ roomName: "", roomSid: "" });
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [receiveTranscriptions, setReceiveTranscriptions] = useState(false);

    // Video format settings
    const [selectedVideoFormatId, setSelectedVideoFormatId] = useState("default");
    const [videoWidth, setVideoWidth] = useState("");
    const [videoHeight, setVideoHeight] = useState("");
    const [videoFrameRate, setVideoFrameRate] = useState("");
    const scrollRef = useRef<ScrollView>(null);
    const twilioRef = useRef<TwilioVideo>(null);
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
        setEnableSimulcast(false);
        setSelectedRegion(null);
        setLogs([]);
        setRoomDetails({ roomName: "", roomSid: "" });
        setReceiveTranscriptions(false);
        setSelectedVideoFormatId("default");
        setVideoWidth("");
        setVideoHeight("");
        setVideoFrameRate("");
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

        const customWidth = videoWidth ? parseInt(videoWidth, 10) : undefined;
        const customHeight = videoHeight ? parseInt(videoHeight, 10) : undefined;
        const customFrameRate = videoFrameRate ? parseInt(videoFrameRate, 10) : undefined;

        // Build videoFormat based on selected preset
        let videoFormat: VideoFormat | undefined;
        const selectedPreset = VIDEO_FORMAT_PRESETS.find(f => f.value === selectedVideoFormatId);

        if (selectedPreset) {
            if (selectedPreset.value === "custom") {
                if (customWidth && customHeight && customFrameRate) {
                    videoFormat = {
                        width: customWidth,
                        height: customHeight,
                        frameRate: customFrameRate,
                    };
                }
            } else if (selectedPreset.value !== "default" && selectedPreset.width && selectedPreset.height && selectedPreset.frameRate) {
                videoFormat = {
                    width: selectedPreset.width,
                    height: selectedPreset.height,
                    frameRate: selectedPreset.frameRate,
                };
            }
        }
        const connectOptions: iOSConnectParams | androidConnectParams = {
            accessToken: token,
            region: selectedRegion,
            enableAudio: isAudioEnabled,
            enableVideo: isVideoEnabled,
            enableDataTrack: isDataTrackEnabled,
            enableRemoteAudio: remoteAudioEnabled,
            enableNetworkQualityReporting: networkQualityEnabled,
            dominantSpeakerEnabled,
            encodingParameters: { enableH264Codec, enableSimulcast },
            receiveTranscriptions,
            ...(videoFormat && { videoFormat }),
        };

        twilioRef.current?.connect(connectOptions);
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

    const _onDataChanged = (event: DataChangedEventArgs) => {
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

    const _onScreenShareChanged = (event: ScreenShareChangedEventArgs) => {
        setIsSharing(event.screenShareEnabled);
        _log(`Screen Share ${event.screenShareEnabled ? 'Started' : 'Stopped'}`);
    };

    const _onCameraSwitched = (event: { isBackCamera: boolean }) => {
        _log(`Camera switched -> ${event?.isBackCamera ? "back" : "front"}`);
    };

    const _onCameraDidStart = () => {
        _log("Camera started");
    };

    const _onCameraWasInterrupted = (event?: { reason?: string }) => {
        _log(`Camera interrupted${event?.reason ? `: ${event.reason}` : ""}`);
    };

    const _onCameraInterruptionEnded = () => {
        _log("Camera interruption ended");
    };

    const _onCameraDidStopRunning = (event?: { error?: string }) => {
        _log(`Camera stopped${event?.error ? `: ${event.error}` : ""}`);
    };

    const _onVideoChanged = (event: { videoEnabled: boolean }) => {
        _log(`Video ${event?.videoEnabled ? "enabled" : "disabled"}`);
    };

    const _onAudioChanged = (event: { audioEnabled: boolean }) => {
        _log(`Audio ${event?.audioEnabled ? "enabled" : "disabled"}`);
    };

    const _onLocalParticipantSupportedCodecs = (event: LocalParticipantSupportedCodecsCbEventArgs) => {
        const codecs = Array.isArray(event?.supportedCodecs) ? event.supportedCodecs.join(", ") : "unknown";
        _log(`Supported codecs -> ${codecs}`);
    };

    const _onRoomDidConnect = (event: RoomEventArgs) => {
        if (event.roomName) {
            setRoomDetails({
                roomName: event.roomName,
                roomSid: event.roomSid,
            });
        }
        setStatus("connected");
    };

    const _onRoomDidDisconnect = (event: RoomErrorEventArgs) => {
        if (event.error) {
            setErrorMessage(_formatErrorMessage(event));
        }
        resetStates();
    };

    const _onRoomDidFailToConnect = (event: RoomErrorEventArgs) => {
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

    const describeParticipant = (participant?: Participant) => participant?.identity || participant?.sid || "unknown participant";
    const describeTrack = (track?: Track) => track?.trackName || track?.trackSid || "unknown track";
    const describeRoom = (event: RoomEventCommonArgs) => {
        if (event?.roomName) {
            return `${event.roomName}${event?.roomSid ? ` (${event.roomSid})` : ""}`;
        }
        return event?.roomSid || "unknown room";
    };
    const describeError = (event: TrackErrorEventArgs) => {
        let details = event?.error || "Unknown error";
        if (event?.code) {
            details += ` (code ${event.code})`;
        }
        if (event?.errorExplanation) {
            details += ` - ${event.errorExplanation}`;
        }
        return details;
    };
    const logTrackEvent = (prefix: string, participant?: Participant, track?: Track) => {
        _log(`${prefix}: ${describeParticipant(participant)} -> ${describeTrack(track)}`);
    };
    const logTrackErrorEvent = (prefix: string, event: TrackErrorEventArgs) => {
        _log(`${prefix}: ${describeParticipant(event?.participant)} -> ${describeTrack(event?.track)} | ${describeError(event)}`);
    };

    const _onRecordingStarted = (event: RoomEventCommonArgs) => {
        _log(`Recording started for ${describeRoom(event)}`);
    };

    const _onRecordingStopped = (event: RoomEventCommonArgs) => {
        _log(`Recording stopped for ${describeRoom(event)}`);
    };

    const _onNetworkQualityLevelsChanged = (event: NetworkLevelChangeEventArgs) => {
        const participantName = describeParticipant(event?.participant) || "local";
        _log(`Network Quality ${participantName} -> ${event?.quality}`);
    };

    const _onDominantSpeakerDidChange = (event: DominantSpeakerChangedEventArgs) => {
        _log(`Dominant Speaker -> ${event?.participant?.identity || "none"}`);
    };

    const _onDataTrackMessageReceived = (event: DataTrackEventCbArgs) => {
        if (event?.isBinary) {
            _log(`Data Track Binary (track ${event.trackSid}) payload=${event.payloadBase64?.slice(0, 16) || ""}...`);
        } else {
            _log(`Data Track Message ${event?.message}`);
        }
    };

    const _onRoomFetched = ({ name, state: roomState, remoteParticipants, signalingRegion,...rest }: RoomFetchedEventArgs) => {
        const roomName = name || "unknown";
        const state = roomState || "unknown";
        const remoteCount = remoteParticipants?.length;
        _log(`Fetched room ${roomName} (${state}) with ${remoteCount} remote participant(s) ${signalingRegion ? `in region ${signalingRegion}` : ""}`);
    };

    const _onLocalAudioTrackPublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Local audio track published", participant, track);
    };

    const _onLocalAudioTrackPublicationFailed = (event: TrackErrorEventArgs) => {
        logTrackErrorEvent("Local audio track publication failed", event);
    };

    const _onLocalVideoTrackPublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Local video track published", participant, track);
    };

    const _onLocalVideoTrackPublicationFailed = (event: TrackErrorEventArgs) => {
        logTrackErrorEvent("Local video track publication failed", event);
    };

    const _onLocalDataTrackPublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Local data track published", participant, track);
    };

    const _onLocalDataTrackPublicationFailed = (event: TrackErrorEventArgs) => {
        logTrackErrorEvent("Local data track publication failed", event);
    };

    const _onRemoteAudioTrackPublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Remote audio track published", participant, track);
    };

    const _onRemoteAudioTrackUnpublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Remote audio track unpublished", participant, track);
    };

    const _onRemoteAudioTrackSubscriptionFailed = (event: TrackErrorEventArgs) => {
        logTrackErrorEvent("Remote audio track subscription failed", event);
    };

    const _onRemoteVideoTrackPublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Remote video track published", participant, track);
    };

    const _onRemoteVideoTrackUnpublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Remote video track unpublished", participant, track);
    };

    const _onRemoteVideoTrackSubscriptionFailed = (event: TrackErrorEventArgs) => {
        logTrackErrorEvent("Remote video track subscription failed", event);
    };

    const _onRemoteDataTrackPublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Remote data track published", participant, track);
    };

    const _onRemoteDataTrackUnpublished = ({ participant, track }: TrackEventCbArgs) => {
        logTrackEvent("Remote data track unpublished", participant, track);
    };

    const _onRemoteDataTrackSubscriptionFailed = (event: TrackErrorEventArgs) => {
        logTrackErrorEvent("Remote data track subscription failed", event);
    };

    const _onParticipantAddedVideoTrack = ({ participant, track }: TrackEventCbArgs) => {
        setVideoTracks((originalVideoTracks) => {
            originalVideoTracks.set(track.trackSid, {
                participantSid: participant.sid,
                videoTrackSid: track.trackSid,
            });
            return new Map(originalVideoTracks);
        });
    };

    const _onParticipantRemovedVideoTrack = ({ track }: TrackEventCbArgs) => {
        setVideoTracks((originalVideoTracks) => {
            originalVideoTracks.delete(track.trackSid);
            return new Map(originalVideoTracks);
        });
    };

    const _onRoomIsReconnecting = (event: ReconnectingEventArgs) => {
        setStatus("reconnecting");
        _log(`Room Is Reconnecting ${event.roomName} ${event.error}`);
    };

    const _onRoomDidReconnect = (event: RoomEventCommonArgs) => {
        setStatus("connected");
        _log(`Room Did Reconnect ${event.roomName}`);
    };

    const _onTranscriptionReceived = (event: TranscriptionEventArgs) => {
        const transcriptionText = event?.transcription || "";
        const participant = event?.participant || "unknown";

        if (transcriptionText) {
            const displayText = `${participant}: ${transcriptionText}`;

            _log(`Transcription: ${displayText}`);
        }
    };

    const _onRoomParticipantDidConnect = (event: ParticipantEventArgs) => {
        _log(`Room participant did connect: ${event.participant.identity}`);
    };

    const _onRoomParticipantDidDisconnect = (event: ParticipantEventArgs) => {
        _log(`Room participant did disconnect: ${event.participant.identity}`);
    };

    return (
        <SafeAreaView style={{ ...styles.container, paddingBottom: insets.bottom }} >
            {status === "disconnected" && (
                <ScrollView>
                    <Text style={styles.welcome}>React Native Twilio Video</Text>

                    <View style={styles.regionPickerContainer}>
                        <Text style={styles.regionPickerLabel}>Signaling Region:</Text>
                        <Picker
                            options={REGIONS}
                            selectedValue={selectedRegion}
                            onSelect={setSelectedRegion}
                            title="Select Region"
                        />
                    </View>

                    <ToggleRow label="Connect with video enabled" value={isVideoEnabled} onValueChange={setIsVideoEnabled} />
                    <ToggleRow label="Connect with audio enabled" value={isAudioEnabled} onValueChange={setIsAudioEnabled} />
                    <ToggleRow label="Connect with data track enabled" value={isDataTrackEnabled} onValueChange={setIsDataTrackEnabled} />
                    <ToggleRow label="Enable H264" value={enableH264Codec} onValueChange={setEnableH264Codec} />
                    <ToggleRow label="Enable Simulcast (VP8 only)" value={enableSimulcast} onValueChange={setEnableSimulcast} />
                    <ToggleRow label="Network Quality" value={networkQualityEnabled} onValueChange={setNetworkQualityEnabled} />
                    <ToggleRow label="Dominant Speaker" value={dominantSpeakerEnabled} onValueChange={setDominantSpeakerEnabled} />
                    <ToggleRow label="Receive Transcriptions" value={receiveTranscriptions} onValueChange={setReceiveTranscriptions} />

                    <View style={styles.regionPickerContainer}>
                        <Text style={styles.regionPickerLabel}>Video Format:</Text>
                        <Picker
                            options={VIDEO_FORMAT_PRESETS}
                            selectedValue={selectedVideoFormatId}
                            onSelect={setSelectedVideoFormatId}
                            title="Select Video Format"
                        />
                    </View>
                    {selectedVideoFormatId === "custom" && (
                        <>
                            <NumberInput label="Width (px)" value={videoWidth} onChangeText={setVideoWidth} />
                            <NumberInput label="Height (px)" value={videoHeight} onChangeText={setVideoHeight} />
                            <NumberInput label="Frame Rate (fps)" value={videoFrameRate} onChangeText={setVideoFrameRate} />
                        </>
                    )}

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
                                {Array.from(videoTracks, ([trackSid, trackIdentifier]) => (
                                    <TwilioVideoParticipantView
                                        style={styles.remoteVideo}
                                        key={trackSid}
                                        trackIdentifier={trackIdentifier}
                                    />
                                ))}
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
                ref={twilioRef}
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
                onTranscriptionReceived={_onTranscriptionReceived}
                onRoomParticipantDidConnect={_onRoomParticipantDidConnect}
                onRoomParticipantDidDisconnect={_onRoomParticipantDidDisconnect}
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
