/**
 * Component for Twilio Video camera preview.
 * <p>
 * Authors:
 * Jonathan Chang <slycoder@gmail.com>
 */

package com.twiliorn.library;

import com.facebook.react.uimanager.ThemedReactContext;

public class TwilioVideoPreview extends RNVideoViewGroup {

    private static final String TAG = "TwilioVideoPreview";

    public TwilioVideoPreview(ThemedReactContext themedReactContext) {
        super(themedReactContext);
        CustomTwilioVideoView.registerThumbnailVideoView(this.getSurfaceViewRenderer());
    }

    public void applyZOrder(boolean applyZOrder) {
        this.getSurfaceViewRenderer().applyZOrder(applyZOrder);
    }
}
