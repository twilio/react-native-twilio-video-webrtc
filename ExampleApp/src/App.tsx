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
} from "react-native-twilio-video-webrtc";
import { check, PERMISSIONS, request } from "react-native-permissions";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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

    const _onGetStatsPress = () => {
        twilioRef.current?.getStats();
        _log("(you) requested stats");
    };

    const _onSendStringPress = () => {
        twilioRef.current?.sendString("Hello from RN");
        _log("(you) sent: Hello from RN");
    };

    const _onShareButtonPress = () => {
        twilioRef.current?.toggleScreenSharing(!isSharing);
    };

    const _onScreenShareChanged = (event: any) => {
        setIsSharing(event.screenShareEnabled);
        _log(`Screen Share ${event.screenShareEnabled ? 'Started' : 'Stopped'}`);
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

    const _onRoomDidDisconnect = () => {
        resetStates();
    };

    const _onRoomDidFailToConnect = (event: any) => {
        setStatus("disconnected");

        let errorMsg = event?.error || "Failed to connect to room";

        if (event?.code) {
            errorMsg += `\n\nError Code: ${event.code}`;
        }

        if (event?.errorExplanation) {
            errorMsg += `\n\nDetails: ${event.errorExplanation}`;
        }

        setErrorMessage(errorMsg);
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

    return (
        <SafeAreaView style={styles.container}>
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

            {(status === "connected" || status === "connecting") && (
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
                            <OptionButton label={isSharing ? "Stop Sharing" : "Start Sharing"} onPress={_onShareButtonPress} />
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
                onStatsReceived={data => _log(`Stats ${JSON.stringify(data)}...`)}
                onNetworkQualityLevelsChanged={e => _log(`Network Quality ${e.participant.identity || 'local'} -> ${e.quality}`)}
                onDominantSpeakerDidChange={e => _log(`Dominant Speaker -> ${e.participant?.identity || 'none'}`)}
                onDataTrackMessageReceived={e => _log(`Data Track Message ${e.message}`)}
                onDataChanged={_onDataChanged}
                onRoomIsReconnecting={e => _log(`Room Is Reconnecting ${e.roomName} ${e.error}`)}
                onRoomDidReconnect={e => _log(`Room Did Reconnect ${e.roomName}`)}
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
