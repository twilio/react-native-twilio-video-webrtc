import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
} from "react-native";
import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo,
} from "react-native-twilio-video-webrtc";
import { check, PERMISSIONS, request } from "react-native-permissions";
import { styles } from "./styles";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { token } from "./access-token";

const Example = () => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [status, setStatus] = useState("disconnected");
    const [videoTracks, setVideoTracks] = useState(new Map());
    const [roomDetails, setRoomDetails] = useState({
        roomName: "",
        roomSid: "",
    });
    const twilioRef = useRef<any>(null);
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

        try {
            twilioRef.current?.connect({
                accessToken: token,
                enableNetworkQualityReporting: true,
                dominantSpeakerEnabled: true,
            });
        } catch (err) {
            console.log("🚀 ~ _onConnectButtonPress ~ err:", err)
            // no-op
        }
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

    const _onRoomDidConnect = (event: any) => {
        if(event.roomName) {
        setRoomDetails({
                roomName: event.roomName,
                roomSid: event.roomSid,
            });
        }
        setStatus("connected");
    };

    const _onRoomDidDisconnect = () => {
        setStatus("disconnected");
    };

    const _onRoomDidFailToConnect = () => {
        setStatus("disconnected");
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
        <SafeAreaView style={[styles.container]}>
            {status === "disconnected" && (
                <View>
                    <Text style={styles.welcome}>React Native Twilio Video</Text>

                    <TouchableOpacity style={styles.button} onPress={_onConnectButtonPress}>
                        <Text style={{ fontSize: 12 }}>Join Room</Text>
                    </TouchableOpacity>
                </View>
            )}

            {(status === "connected" || status === "connecting") && (
                <>
                <View style={{  padding:20, alignItems: "center" }}>
                    <Text style={{ fontSize: 12 }}>Room Name: {roomDetails.roomName}</Text>
                    <Text style={{ fontSize: 12 }}>Room Sid: {roomDetails.roomSid}</Text>
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
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionButton} onPress={_onEndButtonPress}>
                            <Text style={{ color: "#fff", fontSize: 12 }}>End</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionButton} onPress={_onMuteButtonPress}>
                            <Text style={{ color: "#fff", fontSize: 12 }}>{isAudioEnabled ? "Mute" : "Unmute"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionButton} onPress={_onFlipButtonPress}>
                            <Text style={{ color: "#fff", fontSize: 12 }}>Flip</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                    </>
                )}
            <TwilioVideo
                ref={twilioRef as any}
                onRoomDidConnect={_onRoomDidConnect}
                onRoomDidDisconnect={_onRoomDidDisconnect}
                onRoomDidFailToConnect={_onRoomDidFailToConnect}
                onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
                onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
            />
        </SafeAreaView>
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
