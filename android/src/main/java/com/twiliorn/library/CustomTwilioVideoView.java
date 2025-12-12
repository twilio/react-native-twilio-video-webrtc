/**
 * Component to orchestrate the Twilio Video connection and the various video
 * views.
 * <p>
 * Authors:
 * Ralph Pina <ralph.pina@gmail.com>
 * Jonathan Chang <slycoder@gmail.com>
 */
package com.twiliorn.library;

import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_AUDIO_CHANGED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CAMERA_DID_START;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CAMERA_DID_STOP_RUNNING;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CAMERA_INTERRUPTION_ENDED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CAMERA_SWITCHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CAMERA_WAS_INTERRUPTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CONNECTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_CONNECT_FAILURE;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_DATATRACK_MESSAGE_RECEIVED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_DATA_CHANGED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_DISCONNECTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_DOMINANT_SPEAKER_CHANGED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_AUDIO_TRACK_PUBLICATION_FAILED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_AUDIO_TRACK_PUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_DATA_TRACK_PUBLICATION_FAILED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_DATA_TRACK_PUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_PARTICIPANT_SUPPORTED_CODECS;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_VIDEO_TRACK_PUBLICATION_FAILED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_LOCAL_VIDEO_TRACK_PUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_NETWORK_QUALITY_LEVELS_CHANGED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_ADDED_AUDIO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_ADDED_DATA_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_ADDED_VIDEO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_CONNECTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_DISABLED_AUDIO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_DISABLED_VIDEO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_DISCONNECTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_ENABLED_AUDIO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_ENABLED_VIDEO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_REMOVED_AUDIO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_REMOVED_DATA_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_PARTICIPANT_REMOVED_VIDEO_TRACK;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_RECONNECTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_RECONNECTING;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_RECORDING_STARTED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_RECORDING_STOPPED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_AUDIO_TRACK_PUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_AUDIO_TRACK_SUBSCRIPTION_FAILED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_AUDIO_TRACK_UNPUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_DATA_TRACK_PUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_DATA_TRACK_SUBSCRIPTION_FAILED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_DATA_TRACK_UNPUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_VIDEO_TRACK_PUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_VIDEO_TRACK_SUBSCRIPTION_FAILED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_REMOTE_VIDEO_TRACK_UNPUBLISHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_ROOM_FETCHED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_SCREEN_SHARE_CHANGED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_STATS_RECEIVED;
import static com.twiliorn.library.CustomTwilioVideoView.Events.ON_VIDEO_CHANGED;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioAttributes;
import android.media.AudioDeviceInfo;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StringDef;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.twilio.video.AudioTrackPublication;
import com.twilio.video.BaseTrackStats;
import com.twilio.video.CameraCapturer;
import com.twilio.video.ConnectOptions;
import com.twilio.video.DataTrackOptions;
import com.twilio.video.H264Codec;
import com.twilio.video.LocalAudioTrack;
import com.twilio.video.LocalAudioTrackPublication;
import com.twilio.video.LocalAudioTrackStats;
import com.twilio.video.LocalDataTrack;
import com.twilio.video.LocalDataTrackPublication;
import com.twilio.video.LocalParticipant;
import com.twilio.video.LocalTrackStats;
import com.twilio.video.LocalVideoTrack;
import com.twilio.video.LocalVideoTrackPublication;
import com.twilio.video.LocalVideoTrackStats;
import com.twilio.video.NetworkQualityConfiguration;
import com.twilio.video.NetworkQualityLevel;
import com.twilio.video.NetworkQualityVerbosity;
import com.twilio.video.Participant;
import com.twilio.video.RemoteAudioTrack;
import com.twilio.video.RemoteAudioTrackPublication;
import com.twilio.video.RemoteAudioTrackStats;
import com.twilio.video.RemoteDataTrack;
import com.twilio.video.RemoteDataTrackPublication;
import com.twilio.video.RemoteParticipant;
import com.twilio.video.RemoteTrackStats;
import com.twilio.video.RemoteVideoTrack;
import com.twilio.video.RemoteVideoTrackPublication;
import com.twilio.video.RemoteVideoTrackStats;
import com.twilio.video.Room;
import com.twilio.video.Room.State;
import com.twilio.video.ScreenCapturer;
import com.twilio.video.StatsListener;
import com.twilio.video.StatsReport;
import com.twilio.video.TrackPublication;
import com.twilio.video.TwilioException;
import com.twilio.video.Video;
import com.twilio.video.VideoCodec;
import com.twilio.video.VideoDimensions;
import com.twilio.video.VideoFormat;
import com.twilio.video.Vp8Codec;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import tvi.webrtc.Camera1Enumerator;
import tvi.webrtc.HardwareVideoDecoderFactory;
import tvi.webrtc.HardwareVideoEncoderFactory;
import tvi.webrtc.VideoCodecInfo;


public class CustomTwilioVideoView extends View
        implements LifecycleEventListener, AudioManager.OnAudioFocusChangeListener {
    private static final String TAG = "CustomTwilioVideoView";
    private static final String DATA_TRACK_MESSAGE_THREAD_NAME = "DataTrackMessages";
    private static final String FRONT_CAMERA_TYPE = "front";
    private static final String BACK_CAMERA_TYPE = "back";
    private static final String TRACK_NAME_CAMERA = "camera";
    private static final String TRACK_NAME_MICROPHONE = "microphone";
    private static final String TRACK_NAME_SCREEN = "screen";
    private static final String TRACK_NAME_DATA = "data";
    private static final int REQUEST_MEDIA_PROJECTION = 100;
    private boolean enableRemoteAudio = false;
    private boolean enableNetworkQualityReporting = false;
    private boolean isVideoEnabled = false;
    private boolean isScreenShareEnabled = false;
    private boolean dominantSpeakerEnabled = false;
    private static String frontFacingDevice;
    private static String backFacingDevice;
    private boolean maintainVideoTrackInBackground = false;
    private String cameraType = "";
    private boolean enableH264Codec = false;
    private boolean isDataEnabled = false;
    private boolean cameraInterrupted = false;

    @Retention(RetentionPolicy.SOURCE)
    @StringDef({Events.ON_CAMERA_SWITCHED,
                Events.ON_CAMERA_DID_START,
                Events.ON_CAMERA_WAS_INTERRUPTED,
                Events.ON_CAMERA_INTERRUPTION_ENDED,
                Events.ON_CAMERA_DID_STOP_RUNNING,
                Events.ON_VIDEO_CHANGED,
                Events.ON_AUDIO_CHANGED,
                Events.ON_CONNECTED,
                Events.ON_CONNECT_FAILURE,
                Events.ON_DISCONNECTED,
                Events.ON_PARTICIPANT_CONNECTED,
                Events.ON_PARTICIPANT_DISCONNECTED,
                Events.ON_PARTICIPANT_ADDED_VIDEO_TRACK,
                Events.ON_DATATRACK_MESSAGE_RECEIVED,
                Events.ON_PARTICIPANT_ADDED_DATA_TRACK,
                Events.ON_PARTICIPANT_REMOVED_DATA_TRACK,
                Events.ON_PARTICIPANT_REMOVED_VIDEO_TRACK,
                Events.ON_PARTICIPANT_ADDED_AUDIO_TRACK,
                Events.ON_PARTICIPANT_REMOVED_AUDIO_TRACK,
                Events.ON_PARTICIPANT_ENABLED_VIDEO_TRACK,
                Events.ON_PARTICIPANT_DISABLED_VIDEO_TRACK,
                Events.ON_PARTICIPANT_ENABLED_AUDIO_TRACK,
                Events.ON_PARTICIPANT_DISABLED_AUDIO_TRACK,
                Events.ON_STATS_RECEIVED,
                Events.ON_NETWORK_QUALITY_LEVELS_CHANGED,
                Events.ON_DOMINANT_SPEAKER_CHANGED,
                Events.ON_LOCAL_PARTICIPANT_SUPPORTED_CODECS,
                Events.ON_SCREEN_SHARE_CHANGED,
                Events.ON_RECONNECTING,
                Events.ON_RECONNECTED,
                Events.ON_DATA_CHANGED,
                Events.ON_ROOM_FETCHED,
                Events.ON_RECORDING_STARTED,
                Events.ON_RECORDING_STOPPED,
                Events.ON_LOCAL_AUDIO_TRACK_PUBLISHED,
                Events.ON_LOCAL_AUDIO_TRACK_PUBLICATION_FAILED,
                Events.ON_LOCAL_VIDEO_TRACK_PUBLISHED,
                Events.ON_LOCAL_VIDEO_TRACK_PUBLICATION_FAILED,
                Events.ON_LOCAL_DATA_TRACK_PUBLISHED,
                Events.ON_LOCAL_DATA_TRACK_PUBLICATION_FAILED,
                Events.ON_REMOTE_AUDIO_TRACK_PUBLISHED,
                Events.ON_REMOTE_AUDIO_TRACK_UNPUBLISHED,
                Events.ON_REMOTE_AUDIO_TRACK_SUBSCRIPTION_FAILED,
                Events.ON_REMOTE_VIDEO_TRACK_PUBLISHED,
                Events.ON_REMOTE_VIDEO_TRACK_UNPUBLISHED,
                Events.ON_REMOTE_VIDEO_TRACK_SUBSCRIPTION_FAILED,
                Events.ON_REMOTE_DATA_TRACK_PUBLISHED,
                Events.ON_REMOTE_DATA_TRACK_UNPUBLISHED,
                Events.ON_REMOTE_DATA_TRACK_SUBSCRIPTION_FAILED})
    public @interface Events {
        String ON_CAMERA_SWITCHED = "onCameraSwitched";
        String ON_CAMERA_DID_START = "onCameraDidStart";
        String ON_CAMERA_WAS_INTERRUPTED = "onCameraWasInterrupted";
        String ON_CAMERA_INTERRUPTION_ENDED = "onCameraInterruptionEnded";
        String ON_CAMERA_DID_STOP_RUNNING = "onCameraDidStopRunning";
        String ON_VIDEO_CHANGED = "onVideoChanged";
        String ON_AUDIO_CHANGED = "onAudioChanged";
        String ON_CONNECTED = "onRoomDidConnect";
        String ON_CONNECT_FAILURE = "onRoomDidFailToConnect";
        String ON_DISCONNECTED = "onRoomDidDisconnect";
        String ON_PARTICIPANT_CONNECTED = "onRoomParticipantDidConnect";
        String ON_PARTICIPANT_DISCONNECTED = "onRoomParticipantDidDisconnect";
        String ON_DATATRACK_MESSAGE_RECEIVED = "onDataTrackMessageReceived";
        String ON_PARTICIPANT_ADDED_DATA_TRACK = "onParticipantAddedDataTrack";
        String ON_PARTICIPANT_REMOVED_DATA_TRACK = "onParticipantRemovedDataTrack";
        String ON_PARTICIPANT_ADDED_VIDEO_TRACK = "onParticipantAddedVideoTrack";
        String ON_PARTICIPANT_REMOVED_VIDEO_TRACK = "onParticipantRemovedVideoTrack";
        String ON_PARTICIPANT_ADDED_AUDIO_TRACK = "onParticipantAddedAudioTrack";
        String ON_PARTICIPANT_REMOVED_AUDIO_TRACK = "onParticipantRemovedAudioTrack";
        String ON_PARTICIPANT_ENABLED_VIDEO_TRACK = "onParticipantEnabledVideoTrack";
        String ON_PARTICIPANT_DISABLED_VIDEO_TRACK = "onParticipantDisabledVideoTrack";
        String ON_PARTICIPANT_ENABLED_AUDIO_TRACK = "onParticipantEnabledAudioTrack";
        String ON_PARTICIPANT_DISABLED_AUDIO_TRACK = "onParticipantDisabledAudioTrack";
        String ON_STATS_RECEIVED = "onStatsReceived";
        String ON_NETWORK_QUALITY_LEVELS_CHANGED = "onNetworkQualityLevelsChanged";
        String ON_DOMINANT_SPEAKER_CHANGED = "onDominantSpeakerDidChange";
        String ON_LOCAL_PARTICIPANT_SUPPORTED_CODECS = "onLocalParticipantSupportedCodecs";
        String ON_SCREEN_SHARE_CHANGED = "onScreenShareChanged";
        String ON_RECONNECTING = "onRoomIsReconnecting";
        String ON_RECONNECTED = "onRoomDidReconnect";
        String ON_DATA_CHANGED = "onDataChanged";
        String ON_ROOM_FETCHED = "onRoomFetched";
        String ON_RECORDING_STARTED = "onRecordingStarted";
        String ON_RECORDING_STOPPED = "onRecordingStopped";
        String ON_LOCAL_AUDIO_TRACK_PUBLISHED = "onLocalAudioTrackPublished";
        String ON_LOCAL_AUDIO_TRACK_PUBLICATION_FAILED = "onLocalAudioTrackPublicationFailed";
        String ON_LOCAL_VIDEO_TRACK_PUBLISHED = "onLocalVideoTrackPublished";
        String ON_LOCAL_VIDEO_TRACK_PUBLICATION_FAILED = "onLocalVideoTrackPublicationFailed";
        String ON_LOCAL_DATA_TRACK_PUBLISHED = "onLocalDataTrackPublished";
        String ON_LOCAL_DATA_TRACK_PUBLICATION_FAILED = "onLocalDataTrackPublicationFailed";
        String ON_REMOTE_AUDIO_TRACK_PUBLISHED = "onRemoteAudioTrackPublished";
        String ON_REMOTE_AUDIO_TRACK_UNPUBLISHED = "onRemoteAudioTrackUnpublished";
        String ON_REMOTE_AUDIO_TRACK_SUBSCRIPTION_FAILED = "onRemoteAudioTrackSubscriptionFailed";
        String ON_REMOTE_VIDEO_TRACK_PUBLISHED = "onRemoteVideoTrackPublished";
        String ON_REMOTE_VIDEO_TRACK_UNPUBLISHED = "onRemoteVideoTrackUnpublished";
        String ON_REMOTE_VIDEO_TRACK_SUBSCRIPTION_FAILED = "onRemoteVideoTrackSubscriptionFailed";
        String ON_REMOTE_DATA_TRACK_PUBLISHED = "onRemoteDataTrackPublished";
        String ON_REMOTE_DATA_TRACK_UNPUBLISHED = "onRemoteDataTrackUnpublished";
        String ON_REMOTE_DATA_TRACK_SUBSCRIPTION_FAILED = "onRemoteDataTrackSubscriptionFailed";
    }

    private final ThemedReactContext themedReactContext;
    private final RCTEventEmitter eventEmitter;

    private AudioFocusRequest audioFocusRequest;
    private AudioAttributes playbackAttributes;
    private Handler handler = new Handler();

    /*
     * A Room represents communication between the client and one or more
     * participants.
     */
    private static Room room;
    private String roomName = null;
    private String accessToken = null;
    private LocalParticipant localParticipant;

    /*
     * A VideoView receives frames from a local or remote video track and renders
     * them
     * to an associated view.
     */
    private static PatchedVideoView thumbnailVideoView;
    // Camera video track (default local track)
    private static LocalVideoTrack localVideoTrack;

    // Dedicated screen-capture video track – lives alongside the camera track.
    private static LocalVideoTrack screenVideoTrack;

    // Preview surface for local screen-capture frames.
    private static PatchedVideoView screenSharePreviewView;
    private static CameraCapturer cameraCapturer;
    private static ScreenCapturer screenCapturer;
    private ScreenCapturerManager screenCapturerManager;
    private LocalAudioTrack localAudioTrack;
    private AudioManager audioManager;
    private MediaProjectionManager mediaProjectionManager;
    private int previousAudioMode;
    private boolean disconnectedFromOnDestroy;
    private IntentFilter intentFilter;
    private BecomingNoisyReceiver myNoisyAudioStreamReceiver;

    // Dedicated thread and handler for messages received from a RemoteDataTrack
    private final HandlerThread dataTrackMessageThread = new HandlerThread(DATA_TRACK_MESSAGE_THREAD_NAME);
    private Handler dataTrackMessageThreadHandler;

    private LocalDataTrack localDataTrack;

    // Map used to map remote data tracks to remote participants
    private final Map<RemoteDataTrack, RemoteParticipant> dataTrackRemoteParticipantMap = new HashMap<>();

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            super.onActivityResult(activity, requestCode, resultCode, data);
            if (requestCode == REQUEST_MEDIA_PROJECTION) {
                if (resultCode == Activity.RESULT_OK) {
                    screenCapturer = new ScreenCapturer(themedReactContext, resultCode, data, new ScreenCapturer.Listener() {
                        @Override
                        public void onFirstFrameAvailable() {
                        }
                        @Override
                        public void onScreenCaptureError(String errorDescription) {
                            stopScreenCapture();
                        }
                    });
                    startScreenCapture();
                }
            }
        };
    };

    public CustomTwilioVideoView(ThemedReactContext context) {
        super(context);
        this.themedReactContext = context;
        this.eventEmitter = themedReactContext.getJSModule(RCTEventEmitter.class);

        // add lifecycle for onResume and on onPause
        themedReactContext.addLifecycleEventListener(this);

        // Create activity for media projection (screen sharing) permission events
        Activity currentActivity = context.getCurrentActivity();
        mediaProjectionManager = (MediaProjectionManager) currentActivity.getApplication().getSystemService(Context.MEDIA_PROJECTION_SERVICE);

        ReactApplicationContext getReactApplicationContext = context.getReactApplicationContext();
        getReactApplicationContext.addActivityEventListener(activityEventListener);

        if (android.os.Build.VERSION.SDK_INT >= 29) {
            // Android 10 (API 29) requires a foreground service of type `mediaProjection` - create it here
            screenCapturerManager = new ScreenCapturerManager(getContext());
        }
        /*
         * Needed for setting/abandoning audio focus during call
         */
        audioManager = (AudioManager) themedReactContext.getSystemService(Context.AUDIO_SERVICE);
        myNoisyAudioStreamReceiver = new BecomingNoisyReceiver();
        intentFilter = new IntentFilter(Intent.ACTION_HEADSET_PLUG);

        // Start dedicated thread for RemoteDataTrack messages and create its handler
        dataTrackMessageThread.start();
        dataTrackMessageThreadHandler = new Handler(dataTrackMessageThread.getLooper());
    }

    // ===== SETUP =================================================================================

    private VideoFormat buildVideoFormat() {
        return new VideoFormat(VideoDimensions.CIF_VIDEO_DIMENSIONS, 15);
    }

    private CameraCapturer createCameraCaputer(Context context, String cameraId) {
        CameraCapturer newCameraCapturer = null;
        try {
            newCameraCapturer = new CameraCapturer(
                    context,
                    cameraId,
                    new CameraCapturer.Listener() {
                        @Override
                        public void onFirstFrameAvailable() {
                            pushEvent(CustomTwilioVideoView.this, ON_CAMERA_DID_START, null);
                            cameraInterrupted = false;
                        }

                        @Override
                        public void onCameraSwitched(String newCameraId) {
                            setThumbnailMirror();
                            WritableMap event = new WritableNativeMap();
                            event.putBoolean("isBackCamera", isCurrentCameraSourceBackFacing());
                            pushEvent(CustomTwilioVideoView.this, ON_CAMERA_SWITCHED, event);
                        }

                        @Override
                        public void onError(int i) {
                            Log.i("CustomTwilioVideoView", "Error getting camera");
                            WritableMap event = new WritableNativeMap();
                            event.putString("error", "Camera error: " + i);
                            pushEvent(CustomTwilioVideoView.this, ON_CAMERA_DID_STOP_RUNNING, event);
                        }
                    });
            return newCameraCapturer;
        } catch (Exception e) {
            return null;
        }
    }

    private void buildDeviceInfo() {
        Camera1Enumerator enumerator = new Camera1Enumerator();
        String[] deviceNames = enumerator.getDeviceNames();
        backFacingDevice = null;
        frontFacingDevice = null;
        for (String deviceName : deviceNames) {
            if (enumerator.isBackFacing(deviceName) && enumerator.getSupportedFormats(deviceName).size() > 0) {
                backFacingDevice = deviceName;
            } else if (enumerator.isFrontFacing(deviceName) && enumerator.getSupportedFormats(deviceName).size() > 0) {
                frontFacingDevice = deviceName;
            }
        }
    }

    private boolean createLocalVideo(boolean enableVideo, String cameraType) {
        isVideoEnabled = enableVideo;

        // Share your camera
        buildDeviceInfo();

        if (cameraType.equals(CustomTwilioVideoView.FRONT_CAMERA_TYPE)) {
            if (frontFacingDevice != null) {
                cameraCapturer = this.createCameraCaputer(getContext(), frontFacingDevice);
            } else {
                // IF the camera is unavailable try the other camera
                cameraCapturer = this.createCameraCaputer(getContext(), backFacingDevice);
            }
        } else {
            if (backFacingDevice != null) {
                cameraCapturer = this.createCameraCaputer(getContext(), backFacingDevice);
            } else {
                // IF the camera is unavailable try the other camera
                cameraCapturer = this.createCameraCaputer(getContext(), frontFacingDevice);
            }
        }

        // If no camera is available let the caller know
        if (cameraCapturer == null) {
            WritableMap event = new WritableNativeMap();
            event.putString("error", "No camera is supported on this device");
            pushEvent(CustomTwilioVideoView.this, ON_CONNECT_FAILURE, event);
            return false;
        }

        localVideoTrack = LocalVideoTrack.create(
                getContext(), enableVideo, cameraCapturer, buildVideoFormat(), TRACK_NAME_CAMERA);
        if (thumbnailVideoView != null && localVideoTrack != null) {
            localVideoTrack.addSink(thumbnailVideoView);
        }
        setThumbnailMirror();
        return true;
    }

    // ===== LIFECYCLE EVENTS ======================================================================

    @Override
    public void onHostResume() {
        /*
         * In case it wasn't set.
         */
        if (themedReactContext.getCurrentActivity() != null) {
            /*
             * If the local video track was released when the app was put in the background,
             * recreate.
             */
            if (cameraCapturer != null && localVideoTrack == null) {
                localVideoTrack = LocalVideoTrack.create(
                        getContext(), isVideoEnabled, cameraCapturer, buildVideoFormat(), TRACK_NAME_CAMERA);
            }
            /*
             * If the screen share track was released when the app was put in the background, recreate.
             */
            if (screenCapturer != null && screenVideoTrack == null) {
                screenVideoTrack = LocalVideoTrack.create(
                        getContext(), isScreenShareEnabled, screenCapturer, TRACK_NAME_SCREEN);
            }

            if (localVideoTrack != null) {
                if (thumbnailVideoView != null) {
                    localVideoTrack.addSink(thumbnailVideoView);
                }

                /*
                 * If connected to a Room then share the local video track.
                 */
                if (localParticipant != null) {
                    localParticipant.publishTrack(localVideoTrack);
                }
            }

            if (cameraInterrupted) {
                pushEvent(CustomTwilioVideoView.this, ON_CAMERA_INTERRUPTION_ENDED, null);
                cameraInterrupted = false;
            }
            if (room != null) {
                themedReactContext.getCurrentActivity().setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
            }
        }
    }

    @Override
    public void onHostPause() {
        /*
         * Release the local video track before going in the background. This ensures
         * that the
         * camera can be used by other applications while this app is in the background.
         */
        if (localVideoTrack != null && !maintainVideoTrackInBackground) {
            /*
             * If this local video track is being shared in a Room, remove from local
             * participant before releasing the video track. Participants will be notified
             * that
             * the track has been removed.
             */
            if (localParticipant != null) {
                localParticipant.unpublishTrack(localVideoTrack);
            }

            localVideoTrack.release();
            localVideoTrack = null;

            cameraInterrupted = true;
            WritableMap event = new WritableNativeMap();
            event.putString("reason", "App backgrounded");
            pushEvent(CustomTwilioVideoView.this, ON_CAMERA_WAS_INTERRUPTED, event);
        }
    }

    @Override
    public void onHostDestroy() {
        /*
         * Remove stream voice control
         */
        if (themedReactContext.getCurrentActivity() != null) {
            themedReactContext.getCurrentActivity().setVolumeControlStream(AudioManager.USE_DEFAULT_STREAM_TYPE);
        }
        /*
         * Always disconnect from the room before leaving the Activity to
         * ensure any memory allocated to the Room resource is freed.
         */
        if (room != null && room.getState() != Room.State.DISCONNECTED) {
            room.disconnect();
            disconnectedFromOnDestroy = true;
        }

        /*
         * Release the local media ensuring any memory allocated to audio or video is
         * freed.
         */
        if (localVideoTrack != null) {
            localVideoTrack.release();
            localVideoTrack = null;
        }

        if (screenVideoTrack != null) {
            if (screenSharePreviewView != null) {
                screenVideoTrack.removeSink(screenSharePreviewView);
            }
            screenVideoTrack.release();
            screenVideoTrack = null;
        }

        if (android.os.Build.VERSION.SDK_INT >= 29) {
            screenCapturerManager.unbindService();
        }

        if (localAudioTrack != null) {
            localAudioTrack.release();
            audioManager.stopBluetoothSco();
            localAudioTrack = null;
        }

        if (localDataTrack != null) {
            if (localParticipant != null) {
                localParticipant.unpublishTrack(localDataTrack);
            }
            localDataTrack.release();
            localDataTrack = null;
        }

        // Quit the data track message thread
        dataTrackMessageThread.quit();
    }

    public void releaseResource() {
        themedReactContext.removeLifecycleEventListener(this);
        room = null;
        localVideoTrack = null;
        thumbnailVideoView = null;
        cameraCapturer = null;
        screenCapturer = null;
        localDataTrack = null;
    }

    // ====== CONNECTING ===========================================================================

    public void connectToRoomWrapper(
            String roomName,
            String accessToken,
            boolean enableAudio,
            boolean enableVideo,
            boolean enableRemoteAudio,
            boolean enableNetworkQualityReporting,
            boolean dominantSpeakerEnabled,
            boolean maintainVideoTrackInBackground,
            String cameraType,
            boolean enableH264Codec,
            boolean enableDataTrack) {
        this.roomName = roomName;
        this.accessToken = accessToken;
        this.enableRemoteAudio = enableRemoteAudio;
        this.enableNetworkQualityReporting = enableNetworkQualityReporting;
        this.dominantSpeakerEnabled = dominantSpeakerEnabled;
        this.maintainVideoTrackInBackground = maintainVideoTrackInBackground;
        this.cameraType = cameraType;
        this.enableH264Codec = enableH264Codec;
        this.isDataEnabled = enableDataTrack;

        // Share your microphone
        if (enableAudio) {
            localAudioTrack = LocalAudioTrack.create(getContext(), enableAudio, TRACK_NAME_MICROPHONE);
        }

        if (cameraCapturer == null && enableVideo) {
            boolean createVideoStatus = createLocalVideo(enableVideo, cameraType);
            if (!createVideoStatus) {
                Log.d("RNTwilioVideo", "Failed to create local video");
                // No need to connect to room if video creation failed
                return;
            }
        } else {
            isVideoEnabled = false;
        }

        // Create data track if enabled
        if (enableDataTrack) {
            DataTrackOptions dataTrackOptions =
                    new DataTrackOptions.Builder().name(TRACK_NAME_DATA).build();
            localDataTrack = LocalDataTrack.create(getContext(), dataTrackOptions);
        }

        setAudioFocus(enableAudio);
        connectToRoom();
    }

    public void connectToRoom() {
        /*
         * Create a VideoClient allowing you to connect to a Room
         */

        if (this.accessToken == null || this.accessToken.isEmpty()) {
            WritableMap event = new WritableNativeMap();
            event.putString("error", "Access token is required");
            pushEvent(CustomTwilioVideoView.this, ON_CONNECT_FAILURE, event);
            return;
        }

        ConnectOptions.Builder connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken);

        if (this.roomName != null) {
            connectOptionsBuilder.roomName(this.roomName);
        }

        if (localAudioTrack != null) {
            connectOptionsBuilder.audioTracks(Collections.singletonList(localAudioTrack));
        }

        if (localVideoTrack != null) {
            connectOptionsBuilder.videoTracks(Collections.singletonList(localVideoTrack));
        }

        if (localDataTrack != null) {
            connectOptionsBuilder.dataTracks(Collections.singletonList(localDataTrack));
        }

        // H264 Codec Support Detection:
        // https://www.twilio.com/docs/video/managing-codecs
        HardwareVideoEncoderFactory hardwareVideoEncoderFactory = new HardwareVideoEncoderFactory(null, true, true);
        HardwareVideoDecoderFactory hardwareVideoDecoderFactory = new HardwareVideoDecoderFactory(null);

        boolean h264EncoderSupported = false;
        for (VideoCodecInfo videoCodecInfo : hardwareVideoEncoderFactory.getSupportedCodecs()) {
            if (videoCodecInfo.name.equalsIgnoreCase("h264")) {
                h264EncoderSupported = true;
                break;
            }
        }
        boolean h264DecoderSupported = false;
        for (VideoCodecInfo videoCodecInfo : hardwareVideoDecoderFactory.getSupportedCodecs()) {
            if (videoCodecInfo.name.equalsIgnoreCase("h264")) {
                h264DecoderSupported = true;
                break;
            }
        }

        boolean isH264Supported = h264EncoderSupported && h264DecoderSupported;

        Log.d("RNTwilioVideo", "H264 supported by hardware: " + isH264Supported);

        WritableArray supportedCodecs = new WritableNativeArray();

        VideoCodec videoCodec = new Vp8Codec();
        // VP8 is supported on all android devices by default
        supportedCodecs.pushString(videoCodec.toString());

        if (isH264Supported && this.enableH264Codec) {
            videoCodec = new H264Codec();
            supportedCodecs.pushString(videoCodec.toString());
        }

        WritableMap event = new WritableNativeMap();

        event.putArray("supportedCodecs", supportedCodecs);

        pushEvent(CustomTwilioVideoView.this, ON_LOCAL_PARTICIPANT_SUPPORTED_CODECS, event);

        connectOptionsBuilder.preferVideoCodecs(Collections.singletonList(videoCodec));

        connectOptionsBuilder.enableDominantSpeaker(this.dominantSpeakerEnabled);

        if (enableNetworkQualityReporting) {
            connectOptionsBuilder.enableNetworkQuality(true);
            connectOptionsBuilder.networkQualityConfiguration(new NetworkQualityConfiguration(
                    NetworkQualityVerbosity.NETWORK_QUALITY_VERBOSITY_MINIMAL,
                    NetworkQualityVerbosity.NETWORK_QUALITY_VERBOSITY_MINIMAL));
        }

        room = Video.connect(getContext(), connectOptionsBuilder.build(), roomListener());
    }

    public void setAudioType() {
        AudioDeviceInfo[] devicesInfo = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS);
        boolean hasNonSpeakerphoneDevice = false;
        for (int i = 0; i < devicesInfo.length; i++) {
            int deviceType = devicesInfo[i].getType();
            if (deviceType == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
                deviceType == AudioDeviceInfo.TYPE_WIRED_HEADPHONES) {
                hasNonSpeakerphoneDevice = true;
            }
            if (deviceType == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                deviceType == AudioDeviceInfo.TYPE_BLUETOOTH_SCO) {
                audioManager.startBluetoothSco();
                audioManager.setBluetoothScoOn(true);
                hasNonSpeakerphoneDevice = true;
            }
        }
        audioManager.setSpeakerphoneOn(!hasNonSpeakerphoneDevice);
    }

    private void setAudioFocus(boolean focus) {
        if (focus) {
            previousAudioMode = audioManager.getMode();
            // Request audio focus before making any device switch.
            if (android.os.Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                audioManager.requestAudioFocus(this,
                                               AudioManager.STREAM_VOICE_CALL,
                                               AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
            } else {
                playbackAttributes = new AudioAttributes.Builder()
                                             .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                                             .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                             .build();
                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                                            .setAudioAttributes(playbackAttributes)
                                            .setAcceptsDelayedFocusGain(true)
                                            .setOnAudioFocusChangeListener(this, handler)
                                            .build();
                audioManager.requestAudioFocus(audioFocusRequest);
            }
            /*
             * Use MODE_IN_COMMUNICATION as the default audio mode. It is required
             * to be in this mode when playout and/or recording starts for the best
             * possible VoIP performance. Some devices have difficulties with
             * speaker mode if this is not set.
             */
            audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
            setAudioType();
            getContext().registerReceiver(myNoisyAudioStreamReceiver, intentFilter);

        } else {
            if (android.os.Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                audioManager.abandonAudioFocus(this);
            } else if (audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            }

            audioManager.setSpeakerphoneOn(false);
            audioManager.setMode(previousAudioMode);
            try {
                if (myNoisyAudioStreamReceiver != null) {
                    getContext().unregisterReceiver(myNoisyAudioStreamReceiver);
                }
                myNoisyAudioStreamReceiver = null;
            } catch (Exception e) {
                // already registered
                e.printStackTrace();
            }
        }
    }

    private class BecomingNoisyReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            // audioManager.setSpeakerphoneOn(true);
            if (Intent.ACTION_HEADSET_PLUG.equals(intent.getAction())) {
                setAudioType();
            }
        }
    }

    @Override
    public void onAudioFocusChange(int focusChange) {
        Log.e(TAG, "onAudioFocusChange: focuschange: " + focusChange);
    }

    // ====== DISCONNECTING ========================================================================

    public void disconnect() {
        if (room != null) {
            room.disconnect();
        }
        if (localAudioTrack != null) {
            localAudioTrack.release();
            localAudioTrack = null;
            audioManager.stopBluetoothSco();
        }
        if (localVideoTrack != null) {
            localVideoTrack.release();
            localVideoTrack = null;
            audioManager.stopBluetoothSco();
        }
        if (screenVideoTrack != null) {
            if (screenSharePreviewView != null) {
                screenVideoTrack.removeSink(screenSharePreviewView);
            }
            screenVideoTrack.release();
            screenVideoTrack = null;
        }
        if (localDataTrack != null) {
            if (localParticipant != null) {
                localParticipant.unpublishTrack(localDataTrack);
            }
            localDataTrack.release();
            localDataTrack = null;
        }
        setAudioFocus(false);
        if (cameraCapturer != null) {
            cameraCapturer.stopCapture();
            cameraCapturer = null;
        }
        if (screenCapturer != null) {
            screenCapturer.stopCapture();
            screenCapturer = null;
        }
    }

    // ===== SEND STRING ON DATA TRACK ======================================================================
    public void sendString(String message) {
        if (localDataTrack != null) {
            localDataTrack.send(message);
        }
    }

    public void sendBinary(String base64Payload) {
        if (localDataTrack == null || base64Payload == null) {
            return;
        }
        try {
            byte[] bytes = Base64.decode(base64Payload, Base64.DEFAULT);
            if (bytes == null) {
                return;
            }
            ByteBuffer buffer = ByteBuffer.wrap(bytes);
            localDataTrack.send(buffer);
        } catch (Exception exception) {
            Log.e(TAG, "Failed to decode base64 binary payload", exception);
        }
    }

    private static boolean isCurrentCameraSourceBackFacing() {
        return cameraCapturer != null && cameraCapturer.getCameraId() == backFacingDevice;
    }

    // ===== BUTTON LISTENERS ======================================================================
    private static void setThumbnailMirror() {
        if (cameraCapturer != null) {
            final boolean isBackCamera = isCurrentCameraSourceBackFacing();
            if (thumbnailVideoView != null && thumbnailVideoView.getVisibility() == View.VISIBLE) {
                thumbnailVideoView.setMirror(!isBackCamera);
            }
        }
    }

    public void switchCamera() {
        if (cameraCapturer != null) {
            final boolean isBackCamera = isCurrentCameraSourceBackFacing();
            if (frontFacingDevice != null && (isBackCamera || backFacingDevice == null)) {
                cameraCapturer.switchCamera(frontFacingDevice);
                cameraType = CustomTwilioVideoView.FRONT_CAMERA_TYPE;
            } else {
                cameraCapturer.switchCamera(backFacingDevice);
                cameraType = CustomTwilioVideoView.BACK_CAMERA_TYPE;
            }
        }
    }

    public void toggleVideo(boolean enabled) {
        isVideoEnabled = enabled;
        boolean trackWasJustCreated = false;
        if (cameraCapturer == null && enabled) {
            String fallbackCameraType = cameraType == null ? CustomTwilioVideoView.FRONT_CAMERA_TYPE : cameraType;
            boolean createVideoStatus = createLocalVideo(true, fallbackCameraType);
            if (!createVideoStatus) {
                Log.d("RNTwilioVideo", "Failed to create local video");
                return;
            }
            trackWasJustCreated = true;
        }
        if (localVideoTrack != null) {
            localVideoTrack.enable(enabled);
            // If we just created a new track and we're in a room, publish it
            if (trackWasJustCreated && localParticipant != null) {
                localParticipant.publishTrack(localVideoTrack);
            }
            WritableMap event = new WritableNativeMap();
            event.putBoolean("videoEnabled", enabled);
            pushEvent(CustomTwilioVideoView.this, ON_VIDEO_CHANGED, event);
        }
    }

    public void toggleScreenSharing(boolean enabled) {
        if (enabled) {
            // NOTE: Starting a foreground service of type "mediaProjection" before the user has
            // granted screen-capture permission causes a SecurityException on Android 14+. We now
            // start the foreground service only *after* MediaProjection permission has been
            // granted (inside startScreenCapture()).
            if (screenCapturer != null) {
                startScreenCapture();
            } else {
                // This initiates a prompt dialog for the user to confirm screen projection.
                if (mediaProjectionManager == null) {
                    Log.w("RNTwilioVideo", "mediaProjectionManager is null");
                    return;
                }
                Activity currentActivity = this.themedReactContext.getCurrentActivity();

                UiThreadUtil.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        assert currentActivity != null;
                        currentActivity.startActivityForResult(
                                mediaProjectionManager.createScreenCaptureIntent(), REQUEST_MEDIA_PROJECTION);
                    }
                });
            }
        } else {
            // Foreground service is stopped inside stopScreenCapture().
            stopScreenCapture();
        }
    }

    private void startScreenCapture() {
        if (android.os.Build.VERSION.SDK_INT >= 29) {
            screenCapturerManager.startForeground();
        }

        // Guard: already sharing
        if (screenVideoTrack != null) return;

        // Create dedicated screen-capture track
        screenVideoTrack = LocalVideoTrack.create(getContext(), true, screenCapturer, TRACK_NAME_SCREEN);

        // Attach preview sink
        if (screenSharePreviewView != null && screenVideoTrack != null) {
            screenVideoTrack.addSink(screenSharePreviewView);
        }

        // Publish to the room
        if (localParticipant != null && screenVideoTrack != null) {
            localParticipant.publishTrack(screenVideoTrack);
        }

        isScreenShareEnabled = true;

        WritableMap event = new WritableNativeMap();
        event.putBoolean("screenShareEnabled", true);
        pushEvent(CustomTwilioVideoView.this, ON_SCREEN_SHARE_CHANGED, event);
    }

    private void stopScreenCapture() {
        isScreenShareEnabled = false;

        if (screenCapturer != null && screenVideoTrack != null) {

            // Unpublish screen track first
            if (localParticipant != null) {
                localParticipant.unpublishTrack(screenVideoTrack);
            }

            screenCapturer.stopCapture();

            if (screenSharePreviewView != null) {
                screenVideoTrack.removeSink(screenSharePreviewView);
            }
            screenVideoTrack.release();
            screenVideoTrack = null;
            screenCapturer = null;

            WritableMap event = new WritableNativeMap();
            event.putBoolean("screenShareEnabled", false);
            pushEvent(CustomTwilioVideoView.this, ON_SCREEN_SHARE_CHANGED, event);
        }

        // Stop foreground service AFTER all cleanup is complete
        if (android.os.Build.VERSION.SDK_INT >= 29) {
            screenCapturerManager.endForeground();
        }
    }

    public void toggleSoundSetup(boolean speaker) {
        AudioManager audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        if (speaker) {
            audioManager.setSpeakerphoneOn(true);
        } else {
            audioManager.setSpeakerphoneOn(false);
        }
    }

    public void toggleAudio(boolean enabled) {
        if (enabled) {
            if (localAudioTrack != null) {
                localAudioTrack.enable(true);
            } else {
                // Create a new local audio track as enabled and publish it
                localAudioTrack = LocalAudioTrack.create(getContext(), true, TRACK_NAME_MICROPHONE);
                publishLocalAudio(true);
            }
        } else {
            if (localAudioTrack != null) {
                localAudioTrack.enable(false);
            } else {
                // If localAudioTrack doesn't exist and enabled is false, do nothing
                return;
            }
        }
        WritableMap event = new WritableNativeMap();
        event.putBoolean("audioEnabled", enabled);
        pushEvent(CustomTwilioVideoView.this, ON_AUDIO_CHANGED, event);
    }

    public void toggleDataTrack(boolean enabled) {
        isDataEnabled = enabled;
        if (enabled) {
            if (localDataTrack != null) {
                // Track already exists, just publish if in room
                publishLocalDataTrack(true);
            } else {
                // Create a new local data track and publish it
                DataTrackOptions dataTrackOptions =
                        new DataTrackOptions.Builder().name(TRACK_NAME_DATA).build();
                localDataTrack = LocalDataTrack.create(getContext(), dataTrackOptions);
                if (localDataTrack != null) {
                    publishLocalDataTrack(true);
                }
            }
        } else {
            if (localDataTrack != null) {
                // Unpublish first, then release
                publishLocalDataTrack(false);
                localDataTrack.release();
                localDataTrack = null;
            } else {
                // If localDataTrack doesn't exist and enabled is false, do nothing
                return;
            }
        }
        WritableMap event = new WritableNativeMap();
        event.putBoolean("dataEnabled", enabled);
        pushEvent(CustomTwilioVideoView.this, ON_DATA_CHANGED, event);
    }

    public void toggleBluetoothHeadset(boolean enabled) {
        AudioManager audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        if (enabled) {
            audioManager.startBluetoothSco();
            audioManager.setSpeakerphoneOn(false);
        } else {
            audioManager.stopBluetoothSco();
            audioManager.setSpeakerphoneOn(true);
        }
    }

    public void toggleRemoteAudio(boolean enabled) {
        if (room != null) {
            for (RemoteParticipant rp : room.getRemoteParticipants()) {
                for (AudioTrackPublication at : rp.getAudioTracks()) {
                    if (at.getAudioTrack() != null) {
                        ((RemoteAudioTrack) at.getAudioTrack()).enablePlayback(enabled);
                    }
                }
            }
        }
    }

    public void setRemoteAudioPlayback(String participant, boolean enabled) {
        if (room != null) {
            for (RemoteParticipant rp : room.getRemoteParticipants()) {
                if (rp.getSid().equals(participant)) {
                    for (AudioTrackPublication at : rp.getAudioTracks()) {
                        if (at.getAudioTrack() != null) {
                            ((RemoteAudioTrack) at.getAudioTrack()).enablePlayback(enabled);
                        }
                    }
                }
            }
        }
    }

    public void publishLocalVideo(boolean enabled) {
        if (localParticipant != null && localVideoTrack != null) {
            if (enabled) {
                localParticipant.publishTrack(localVideoTrack);
            } else {
                localParticipant.unpublishTrack(localVideoTrack);
            }
        }
    }

    public void publishLocalAudio(boolean enabled) {
        if (localParticipant != null && localAudioTrack != null) {
            if (enabled) {
                localParticipant.publishTrack(localAudioTrack);
            } else {
                localParticipant.unpublishTrack(localAudioTrack);
            }
        }
    }

    public void publishLocalDataTrack(boolean enabled) {
        if (localParticipant != null && localDataTrack != null) {
            if (enabled) {
                localParticipant.publishTrack(localDataTrack);
            } else {
                localParticipant.unpublishTrack(localDataTrack);
            }
        }
    }

    private void convertBaseTrackStats(BaseTrackStats bs, WritableMap result) {
        result.putString("codec", bs.codec);
        result.putInt("packetsLost", bs.packetsLost);
        result.putString("ssrc", bs.ssrc);
        result.putDouble("timestamp", bs.timestamp);
        result.putString("trackSid", bs.trackSid);
    }

    private void convertLocalTrackStats(LocalTrackStats ts, WritableMap result) {
        result.putDouble("bytesSent", ts.bytesSent);
        result.putInt("packetsSent", ts.packetsSent);
        result.putDouble("roundTripTime", ts.roundTripTime);
    }

    private void convertRemoteTrackStats(RemoteTrackStats ts, WritableMap result) {
        result.putDouble("bytesReceived", ts.bytesReceived);
        result.putInt("packetsReceived", ts.packetsReceived);
    }

    private WritableMap convertAudioTrackStats(RemoteAudioTrackStats as) {
        WritableMap result = new WritableNativeMap();
        result.putInt("audioLevel", as.audioLevel);
        result.putInt("jitter", as.jitter);
        convertBaseTrackStats(as, result);
        convertRemoteTrackStats(as, result);
        return result;
    }

    private WritableMap convertLocalAudioTrackStats(LocalAudioTrackStats as) {
        WritableMap result = new WritableNativeMap();
        result.putInt("audioLevel", as.audioLevel);
        result.putInt("jitter", as.jitter);
        convertBaseTrackStats(as, result);
        convertLocalTrackStats(as, result);
        return result;
    }

    private WritableMap convertVideoTrackStats(RemoteVideoTrackStats vs) {
        WritableMap result = new WritableNativeMap();
        WritableMap dimensions = new WritableNativeMap();
        dimensions.putInt("height", vs.dimensions.height);
        dimensions.putInt("width", vs.dimensions.width);
        result.putMap("dimensions", dimensions);
        result.putInt("frameRate", vs.frameRate);
        convertBaseTrackStats(vs, result);
        convertRemoteTrackStats(vs, result);
        return result;
    }

    private WritableMap convertLocalVideoTrackStats(LocalVideoTrackStats vs) {
        WritableMap result = new WritableNativeMap();
        WritableMap dimensions = new WritableNativeMap();
        dimensions.putInt("height", vs.dimensions.height);
        dimensions.putInt("width", vs.dimensions.width);
        result.putMap("dimensions", dimensions);
        result.putInt("frameRate", vs.frameRate);
        convertBaseTrackStats(vs, result);
        convertLocalTrackStats(vs, result);
        return result;
    }

    public void getStats() {
        if (room != null) {
            room.getStats(new StatsListener() {
                @Override
                public void onStats(List<StatsReport> statsReports) {
                    WritableMap event = new WritableNativeMap();
                    for (StatsReport sr : statsReports) {
                        WritableMap connectionStats = new WritableNativeMap();
                        WritableArray as = new WritableNativeArray();
                        for (RemoteAudioTrackStats s : sr.getRemoteAudioTrackStats()) {
                            as.pushMap(convertAudioTrackStats(s));
                        }
                        connectionStats.putArray("remoteAudioTrackStats", as);

                        WritableArray vs = new WritableNativeArray();
                        for (RemoteVideoTrackStats s : sr.getRemoteVideoTrackStats()) {
                            vs.pushMap(convertVideoTrackStats(s));
                        }
                        connectionStats.putArray("remoteVideoTrackStats", vs);

                        WritableArray las = new WritableNativeArray();
                        for (LocalAudioTrackStats s : sr.getLocalAudioTrackStats()) {
                            las.pushMap(convertLocalAudioTrackStats(s));
                        }
                        connectionStats.putArray("localAudioTrackStats", las);

                        WritableArray lvs = new WritableNativeArray();
                        for (LocalVideoTrackStats s : sr.getLocalVideoTrackStats()) {
                            lvs.pushMap(convertLocalVideoTrackStats(s));
                        }
                        connectionStats.putArray("localVideoTrackStats", lvs);
                        event.putMap(sr.getPeerConnectionId(), connectionStats);
                    }
                    pushEvent(CustomTwilioVideoView.this, ON_STATS_RECEIVED, event);
                }
            });
        }
    }

    public void fetchRoom() {
        WritableMap roomMap = buildRoom(room);
        pushEvent(CustomTwilioVideoView.this, ON_ROOM_FETCHED, roomMap);
    }

    // ====== ROOM LISTENER ========================================================================

    /*
     * Room events listener
     */
    private Room.Listener roomListener() {
        return new Room.Listener() {
            @Override
            public void onConnected(Room room) {
                /*
                 * Enable changing the volume using the up/down keys during a conversation
                 */
                if (themedReactContext.getCurrentActivity() != null) {
                    themedReactContext.getCurrentActivity().setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
                }

                localParticipant = room.getLocalParticipant();
                localParticipant.setListener(localListener());

                WritableMap event = new WritableNativeMap();
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                List<RemoteParticipant> participants = room.getRemoteParticipants();

                WritableArray participantsArray = new WritableNativeArray();
                for (RemoteParticipant participant : participants) {
                    participantsArray.pushMap(buildParticipant(participant));
                }
                participantsArray.pushMap(buildParticipant(localParticipant));
                event.putArray("participants", participantsArray);
                event.putMap("localParticipant", buildParticipant(localParticipant));

                pushEvent(CustomTwilioVideoView.this, ON_CONNECTED, event);

                if (localDataTrack != null) {
                    localParticipant.publishTrack(localDataTrack);
                }

                for (RemoteParticipant participant : participants) {
                    addParticipant(room, participant);
                }
            }

            @Override
            public void onConnectFailure(Room room, TwilioException e) {
                WritableMap event = new WritableNativeMap();
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                event.putString("error", e.getMessage());
                event.putString("code", Integer.toString(e.getCode()));
                event.putString("errorExplanation", e.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_CONNECT_FAILURE, event);
            }

            @Override
            public void onReconnecting(@NonNull Room room, @NonNull TwilioException twilioException) {
                WritableMap event = new WritableNativeMap();
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                event.putString("error", twilioException.getMessage());
                pushEvent(CustomTwilioVideoView.this, ON_RECONNECTING, event);
            }

            @Override
            public void onReconnected(@NonNull Room room) {
                WritableMap event = new WritableNativeMap();
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                pushEvent(CustomTwilioVideoView.this, ON_RECONNECTED, event);
            }

            @Override
            public void onDisconnected(Room room, TwilioException e) {
                WritableMap event = new WritableNativeMap();

                /*
                 * Remove stream voice control
                 */
                if (themedReactContext.getCurrentActivity() != null) {
                    themedReactContext.getCurrentActivity()
                            .setVolumeControlStream(AudioManager.USE_DEFAULT_STREAM_TYPE);
                }
                if (localParticipant != null) {
                    event.putString("participant", localParticipant.getIdentity());
                }
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                if (e != null) {
                    event.putString("error", e.getMessage());
                }
                pushEvent(CustomTwilioVideoView.this, ON_DISCONNECTED, event);

                localParticipant = null;
                roomName = null;
                accessToken = null;

                CustomTwilioVideoView.room = null;
                // Only reinitialize the UI if disconnect was not called from onDestroy()
                if (!disconnectedFromOnDestroy) {
                    setAudioFocus(false);
                }
            }

            @Override
            public void onParticipantConnected(Room room, RemoteParticipant participant) {
                addParticipant(room, participant);
            }

            @Override
            public void onParticipantDisconnected(Room room, RemoteParticipant participant) {
                removeParticipant(room, participant);
            }

            @Override
            public void onRecordingStarted(Room room) {
                WritableMap event = new WritableNativeMap();
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                pushEvent(CustomTwilioVideoView.this, ON_RECORDING_STARTED, event);
            }

            @Override
            public void onRecordingStopped(Room room) {
                WritableMap event = new WritableNativeMap();
                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());
                pushEvent(CustomTwilioVideoView.this, ON_RECORDING_STOPPED, event);
            }

            @Override
            public void onDominantSpeakerChanged(Room room, RemoteParticipant remoteParticipant) {
                WritableMap event = new WritableNativeMap();

                event.putString("roomName", room.getName());
                event.putString("roomSid", room.getSid());

                if (remoteParticipant == null) {
                    event.putString("participant", "");
                } else {
                    event.putMap("participant", buildParticipant(remoteParticipant));
                }

                pushEvent(CustomTwilioVideoView.this, ON_DOMINANT_SPEAKER_CHANGED, event);
            }
        };
    }

    /*
     * Called when participant joins the room
     */
    private void addParticipant(Room room, RemoteParticipant remoteParticipant) {

        WritableMap event = new WritableNativeMap();
        event.putString("roomName", room.getName());
        event.putString("roomSid", room.getSid());
        event.putMap("participant", buildParticipant(remoteParticipant));

        pushEvent(this, ON_PARTICIPANT_CONNECTED, event);

        /*
         * Start listening for participant media events
         */
        remoteParticipant.setListener(mediaListener());

        for (final RemoteDataTrackPublication remoteDataTrackPublication : remoteParticipant.getRemoteDataTracks()) {
            /*
             * Data track messages are received on the thread that calls setListener. Post
             * the
             * invocation of setting the listener onto our dedicated data track message
             * thread.
             */
            if (remoteDataTrackPublication.isTrackSubscribed()) {
                dataTrackMessageThreadHandler.post(() -> addRemoteDataTrack(remoteParticipant, remoteDataTrackPublication.getRemoteDataTrack()));
            }
        }
    }

    /*
     * Called when participant leaves the room
     */
    private void removeParticipant(Room room, RemoteParticipant participant) {
        WritableMap event = new WritableNativeMap();
        event.putString("roomName", room.getName());
        event.putString("roomSid", room.getSid());
        event.putMap("participant", buildParticipant(participant));
        pushEvent(this, ON_PARTICIPANT_DISCONNECTED, event);
        // something about this breaking.
        // participant.setListener(null);
    }

    private void addRemoteDataTrack(RemoteParticipant remoteParticipant, RemoteDataTrack remoteDataTrack) {
        dataTrackRemoteParticipantMap.put(remoteDataTrack, remoteParticipant);
        remoteDataTrack.setListener(remoteDataTrackListener());
    }

    // ====== MEDIA LISTENER =======================================================================

    private RemoteParticipant.Listener mediaListener() {
        return new RemoteParticipant.Listener() {
            @Override
            public void onAudioTrackSubscribed(RemoteParticipant participant, RemoteAudioTrackPublication publication,
                                               RemoteAudioTrack audioTrack) {
                audioTrack.enablePlayback(enableRemoteAudio);
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_ADDED_AUDIO_TRACK, event);
            }

            @Override
            public void onAudioTrackUnsubscribed(RemoteParticipant participant, RemoteAudioTrackPublication publication,
                                                 RemoteAudioTrack audioTrack) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_REMOVED_AUDIO_TRACK, event);
            }

            @Override
            public void onAudioTrackSubscriptionFailed(RemoteParticipant participant,
                                                       RemoteAudioTrackPublication publication, TwilioException twilioException) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                event.putString("error", twilioException.getMessage());
                event.putString("code", Integer.toString(twilioException.getCode()));
                event.putString("errorExplanation", twilioException.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_AUDIO_TRACK_SUBSCRIPTION_FAILED, event);
            }

            @Override
            public void onAudioTrackPublished(RemoteParticipant participant, RemoteAudioTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_AUDIO_TRACK_PUBLISHED, event);
            }

            @Override
            public void onAudioTrackUnpublished(RemoteParticipant participant,
                                                RemoteAudioTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_AUDIO_TRACK_UNPUBLISHED, event);
            }

            @Override
            public void onDataTrackSubscribed(RemoteParticipant remoteParticipant,
                                              RemoteDataTrackPublication remoteDataTrackPublication, RemoteDataTrack remoteDataTrack) {
                WritableMap event = buildParticipantDataEvent(remoteParticipant, remoteDataTrackPublication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_ADDED_DATA_TRACK, event);
                dataTrackMessageThreadHandler.post(() -> addRemoteDataTrack(remoteParticipant, remoteDataTrack));
            }

            @Override
            public void onDataTrackUnsubscribed(RemoteParticipant remoteParticipant,
                                                RemoteDataTrackPublication remoteDataTrackPublication, RemoteDataTrack remoteDataTrack) {
                WritableMap event = buildParticipantDataEvent(remoteParticipant, remoteDataTrackPublication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_REMOVED_DATA_TRACK, event);
            }

            @Override
            public void onDataTrackSubscriptionFailed(RemoteParticipant participant,
                                                      RemoteDataTrackPublication publication, TwilioException twilioException) {
                WritableMap event = buildParticipantDataEvent(participant, publication);
                event.putString("error", twilioException.getMessage());
                event.putString("code", Integer.toString(twilioException.getCode()));
                event.putString("errorExplanation", twilioException.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_DATA_TRACK_SUBSCRIPTION_FAILED, event);
            }

            @Override
            public void onDataTrackPublished(RemoteParticipant participant, RemoteDataTrackPublication publication) {
                WritableMap event = buildParticipantDataEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_DATA_TRACK_PUBLISHED, event);
            }

            @Override
            public void onDataTrackUnpublished(RemoteParticipant participant, RemoteDataTrackPublication publication) {
                WritableMap event = buildParticipantDataEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_DATA_TRACK_UNPUBLISHED, event);
            }

            @Override
            public void onVideoTrackSubscribed(RemoteParticipant participant, RemoteVideoTrackPublication publication,
                                               RemoteVideoTrack videoTrack) {
                addParticipantVideo(participant, publication);
            }

            @Override
            public void onVideoTrackUnsubscribed(RemoteParticipant participant,
                                                 RemoteVideoTrackPublication publication, RemoteVideoTrack track) {
                removeParticipantVideo(participant, publication);
            }

            @Override
            public void onVideoTrackSubscriptionFailed(RemoteParticipant participant,
                                                       RemoteVideoTrackPublication publication, TwilioException twilioException) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                event.putString("error", twilioException.getMessage());
                event.putString("code", Integer.toString(twilioException.getCode()));
                event.putString("errorExplanation", twilioException.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_VIDEO_TRACK_SUBSCRIPTION_FAILED, event);
            }

            @Override
            public void onVideoTrackPublished(RemoteParticipant participant, RemoteVideoTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_VIDEO_TRACK_PUBLISHED, event);
            }

            @Override
            public void onVideoTrackUnpublished(RemoteParticipant participant,
                                                RemoteVideoTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_REMOTE_VIDEO_TRACK_UNPUBLISHED, event);
            }

            @Override
            public void onAudioTrackEnabled(RemoteParticipant participant, RemoteAudioTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_ENABLED_AUDIO_TRACK, event);
            }

            @Override
            public void onAudioTrackDisabled(RemoteParticipant participant, RemoteAudioTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_DISABLED_AUDIO_TRACK, event);
            }

            @Override
            public void onVideoTrackEnabled(RemoteParticipant participant, RemoteVideoTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_ENABLED_VIDEO_TRACK, event);
            }

            @Override
            public void onVideoTrackDisabled(RemoteParticipant participant, RemoteVideoTrackPublication publication) {
                WritableMap event = buildParticipantVideoEvent(participant, publication);
                pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_DISABLED_VIDEO_TRACK, event);
            }

            @Override
            public void onNetworkQualityLevelChanged(RemoteParticipant remoteParticipant,
                                                     NetworkQualityLevel networkQualityLevel) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(remoteParticipant));
                event.putBoolean("isLocalUser", false);

                // Twilio SDK defines Enum 0 as UNKNOWN and 1 as Quality ZERO, so we subtract
                // one to get the correct quality level as an integer
                event.putInt("quality", networkQualityLevel.ordinal() - 1);

                pushEvent(CustomTwilioVideoView.this, ON_NETWORK_QUALITY_LEVELS_CHANGED, event);
            }
        };
    }

    // ====== LOCAL LISTENER =======================================================================
    private LocalParticipant.Listener localListener() {
        return new LocalParticipant.Listener() {
            @Override
            public void onAudioTrackPublished(LocalParticipant localParticipant,
                                              LocalAudioTrackPublication localAudioTrackPublication) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putMap("track", buildTrack(localAudioTrackPublication));
                pushEvent(CustomTwilioVideoView.this, ON_LOCAL_AUDIO_TRACK_PUBLISHED, event);
            }

            @Override
            public void onAudioTrackPublicationFailed(LocalParticipant localParticipant,
                                                      LocalAudioTrack localAudioTrack, TwilioException twilioException) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putString("error", twilioException.getMessage());
                event.putString("code", Integer.toString(twilioException.getCode()));
                event.putString("errorExplanation", twilioException.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_LOCAL_AUDIO_TRACK_PUBLICATION_FAILED, event);
            }

            @Override
            public void onVideoTrackPublished(LocalParticipant localParticipant,
                                              LocalVideoTrackPublication localVideoTrackPublication) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putMap("track", buildTrack(localVideoTrackPublication));
                pushEvent(CustomTwilioVideoView.this, ON_LOCAL_VIDEO_TRACK_PUBLISHED, event);
            }

            @Override
            public void onVideoTrackPublicationFailed(LocalParticipant localParticipant,
                                                      LocalVideoTrack localVideoTrack, TwilioException twilioException) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putString("error", twilioException.getMessage());
                event.putString("code", Integer.toString(twilioException.getCode()));
                event.putString("errorExplanation", twilioException.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_LOCAL_VIDEO_TRACK_PUBLICATION_FAILED, event);
            }

            @Override
            public void onDataTrackPublished(LocalParticipant localParticipant,
                                             LocalDataTrackPublication localDataTrackPublication) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putMap("track", buildTrack(localDataTrackPublication));
                pushEvent(CustomTwilioVideoView.this, ON_LOCAL_DATA_TRACK_PUBLISHED, event);
            }

            @Override
            public void onDataTrackPublicationFailed(LocalParticipant localParticipant, LocalDataTrack localDataTrack,
                                                     TwilioException twilioException) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putString("error", twilioException.getMessage());
                event.putString("code", Integer.toString(twilioException.getCode()));
                event.putString("errorExplanation", twilioException.getExplanation());
                pushEvent(CustomTwilioVideoView.this, ON_LOCAL_DATA_TRACK_PUBLICATION_FAILED, event);
            }

            @Override
            public void onNetworkQualityLevelChanged(LocalParticipant localParticipant,
                                                     NetworkQualityLevel networkQualityLevel) {
                WritableMap event = new WritableNativeMap();
                event.putMap("participant", buildParticipant(localParticipant));
                event.putBoolean("isLocalUser", true);

                // Twilio SDK defines Enum 0 as UNKNOWN and 1 as Quality ZERO, so we subtract
                // one to get the correct quality level as an integer
                event.putInt("quality", networkQualityLevel.ordinal() - 1);

                pushEvent(CustomTwilioVideoView.this, ON_NETWORK_QUALITY_LEVELS_CHANGED, event);
            }
        };
    }

    private WritableMap buildParticipant(Participant participant) {
        WritableMap participantMap = new WritableNativeMap();
        if (participant == null) {
            participantMap.putString("identity", "");
            participantMap.putString("sid", "");
            return participantMap;
        }
        participantMap.putString("identity", participant.getIdentity());
        participantMap.putString("sid", participant.getSid());
        return participantMap;
    }

    private WritableMap buildParticipantWithTracks(Participant participant) {
        WritableMap participantMap = buildParticipant(participant);
        List<? extends TrackPublication> audioTracks = participant != null ? participant.getAudioTracks() : null;
        List<? extends TrackPublication> videoTracks = participant != null ? participant.getVideoTracks() : null;
        List<? extends TrackPublication> dataTracks = participant != null ? participant.getDataTracks() : null;

        participantMap.putArray("audioTracks", buildTrackPublications(audioTracks));
        participantMap.putArray("videoTracks", buildTrackPublications(videoTracks));
        participantMap.putArray("dataTracks", buildTrackPublications(dataTracks));
        return participantMap;
    }

    private WritableMap buildTrack(TrackPublication publication) {
        WritableMap trackMap = new WritableNativeMap();
        trackMap.putString("trackSid", publication.getTrackSid());
        trackMap.putString("trackName", publication.getTrackName());
        trackMap.putBoolean("enabled", publication.isTrackEnabled());
        return trackMap;
    }

    private WritableMap buildRoom(Room currentRoom) {
        WritableMap roomMap = new WritableNativeMap();
        if (currentRoom == null) {
            return roomMap;
        }

        roomMap.putString("sid", currentRoom.getSid());
        roomMap.putString("name", currentRoom.getName());
        roomMap.putString("mediaRegion", currentRoom.getMediaRegion());
        roomMap.putString("state", currentRoom.getState().toString());
        roomMap.putMap("dominantSpeaker", currentRoom.getDominantSpeaker() != null ? buildParticipantWithTracks(currentRoom.getDominantSpeaker()) : null);
        roomMap.putArray("remoteParticipants", buildRemoteParticipants(currentRoom.getRemoteParticipants()));
        roomMap.putMap("localParticipant", buildParticipantWithTracks(currentRoom.getLocalParticipant()));
        return roomMap;
    }

    private WritableArray buildRemoteParticipants(List<RemoteParticipant> participants) {
        WritableArray participantsArray = new WritableNativeArray();
        if (participants == null) {
            return participantsArray;
        }
        for (RemoteParticipant participant : participants) {
            participantsArray.pushMap(buildParticipantWithTracks(participant));
        }
        return participantsArray;
    }

    private WritableArray buildTrackPublications(List<? extends TrackPublication> publications) {
        WritableArray tracksArray = new WritableNativeArray();
        if (publications == null) {
            return tracksArray;
        }
        for (TrackPublication publication : publications) {
            tracksArray.pushMap(buildTrack(publication));
        }
        return tracksArray;
    }

    private WritableMap buildParticipantDataEvent(Participant participant, TrackPublication publication) {
        WritableMap participantMap = buildParticipant(participant);
        WritableMap trackMap = buildTrack(publication);

        WritableMap event = new WritableNativeMap();
        event.putMap("participant", participantMap);
        event.putMap("track", trackMap);
        return event;
    }

    private WritableMap buildParticipantVideoEvent(Participant participant, TrackPublication publication) {
        WritableMap participantMap = buildParticipant(participant);
        WritableMap trackMap = buildTrack(publication);

        WritableMap event = new WritableNativeMap();
        event.putMap("participant", participantMap);
        event.putMap("track", trackMap);
        return event;
    }

    private WritableMap buildDataTrackEvent(RemoteDataTrack remoteDataTrack) {
        WritableMap event = new WritableNativeMap();
        event.putString("trackSid", remoteDataTrack.getSid());
        return event;
    }

    private void addParticipantVideo(Participant participant, RemoteVideoTrackPublication publication) {
        WritableMap event = this.buildParticipantVideoEvent(participant, publication);
        pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_ADDED_VIDEO_TRACK, event);
    }

    private void removeParticipantVideo(Participant participant, RemoteVideoTrackPublication deleteVideoTrack) {
        WritableMap event = this.buildParticipantVideoEvent(participant, deleteVideoTrack);
        pushEvent(CustomTwilioVideoView.this, ON_PARTICIPANT_REMOVED_VIDEO_TRACK, event);
    }
    // ===== EVENTS TO RN ==========================================================================

    void pushEvent(View view, String name, WritableMap data) {
        eventEmitter.receiveEvent(view.getId(), name, data);
    }

    public static void registerPrimaryVideoView(PatchedVideoView v, String trackSid) {
        if (room != null) {

            for (RemoteParticipant participant : room.getRemoteParticipants()) {
                for (RemoteVideoTrackPublication publication : participant.getRemoteVideoTracks()) {
                    RemoteVideoTrack track = publication.getRemoteVideoTrack();
                    if (track == null) {
                        continue;
                    }
                    if (publication.getTrackSid().equals(trackSid)) {
                        track.addSink(v);
                    } else {
                        track.removeSink(v);
                    }
                }
            }
        }
    }

    public static void registerThumbnailVideoView(PatchedVideoView v) {
        thumbnailVideoView = v;
        if (localVideoTrack != null) {
            localVideoTrack.addSink(v);
        }
        setThumbnailMirror();
    }

    public static void registerScreenShareVideoView(PatchedVideoView v) {
        screenSharePreviewView = v;
        if (screenVideoTrack != null) {
            screenVideoTrack.addSink(v);
        }
    }

    private RemoteDataTrack.Listener remoteDataTrackListener() {
        return new RemoteDataTrack.Listener() {
            @Override
            public void onMessage(RemoteDataTrack remoteDataTrack, ByteBuffer byteBuffer) {
                byte[] bytes = new byte[byteBuffer.remaining()];
                byteBuffer.get(bytes);
                WritableMap event = buildDataTrackEvent(remoteDataTrack);
                event.putString("payloadBase64", Base64.encodeToString(bytes, Base64.NO_WRAP));
                event.putBoolean("isBinary", true);
                pushEvent(CustomTwilioVideoView.this, ON_DATATRACK_MESSAGE_RECEIVED, event);
            }

            @Override
            public void onMessage(RemoteDataTrack remoteDataTrack, String message) {
                WritableMap event = buildDataTrackEvent(remoteDataTrack);
                event.putString("message", message);
                event.putBoolean("isBinary", false);
                pushEvent(CustomTwilioVideoView.this, ON_DATATRACK_MESSAGE_RECEIVED, event);
            }
        };
    }
}
