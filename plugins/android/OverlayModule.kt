package com.whoistonny.x404.derivo

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class OverlayModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  override fun getName() = "OverlayModule"

  @ReactMethod
  fun hasPermission(promise: Promise) {
    promise.resolve(Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(context))
  }

  @ReactMethod
  fun openPermissionSettings(promise: Promise) {
    try {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}"),
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("E_OVERLAY_SETTINGS", "Unable to open overlay permission settings.", error)
    }
  }

  @ReactMethod
  fun showOverlay(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
      promise.reject("E_OVERLAY_PERMISSION", "Display over other apps permission is required.")
      return
    }
    try {
      val intent = Intent(context, OverlayService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent)
      else context.startService(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("E_OVERLAY_START", "Unable to start the Derivo floating control.", error)
    }
  }

  @ReactMethod
  fun hideOverlay() {
    context.stopService(Intent(context, OverlayService::class.java))
  }

  @ReactMethod
  fun setBotState(isRunning: Boolean) {
    OverlayService.setBotRunning(isRunning)
  }

  @ReactMethod
  fun getBotState(promise: Promise) {
    promise.resolve(OverlayService.isBotRunning())
  }

  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Int) = Unit

  companion object {
    fun emitToggle(context: ReactApplicationContext) {
      if (!context.hasActiveReactInstance()) return
      context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("overlayToggle", null)
    }
  }
}
