package com.twiliorn.library;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import com.twilio.video.ScreenCapturer;
import com.twilio.video.LocalVideoTrack;
import com.twilio.video.VideoFormat;
import com.twilio.video.VideoDimensions;

class ScreenShareCapturer {
  private final ScreenCapturer capturer;
  private final LocalVideoTrack track;

  ScreenShareCapturer(Context ctx,
                      int resultCode,
                      Intent permissionData,
                      Handler handler) {

    capturer = new ScreenCapturer(ctx, resultCode, permissionData, null);
    VideoFormat format = new VideoFormat(
        new VideoDimensions(1280, 720), /* fps */15);

    track = LocalVideoTrack.create(ctx, true, capturer, format);
  }

  void start() { capturer.startCapture(1280, 720, 15); }
  void stop()  { capturer.stopCapture(); track.release(); }

  LocalVideoTrack getTrack() { return track; }
}