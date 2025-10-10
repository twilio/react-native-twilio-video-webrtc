/**
 * Component for Twilio Video screen share preview.
 * <p>
 * Authors:
 * Jonathan Chang <slycoder@gmail.com>
 */

package com.twiliorn.library;

import com.facebook.react.uimanager.ThemedReactContext;

public class TwilioScreenSharePreview extends RNVideoViewGroup {

    private static final String TAG = "TwilioScreenSharePreview";

    public TwilioScreenSharePreview(ThemedReactContext themedReactContext) {
        super(themedReactContext);
        CustomTwilioVideoView.registerScreenShareVideoView(this.getSurfaceViewRenderer());
    }

    public void applyZOrder(boolean applyZOrder) {
        this.getSurfaceViewRenderer().applyZOrder(applyZOrder);
    }
}

