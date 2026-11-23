package com.whoistonny.x404.derivo

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.facebook.react.ReactApplication

class OverlayService : Service() {
  private lateinit var windowManager: WindowManager
  private var overlayView: View? = null
  private var layoutParams: WindowManager.LayoutParams? = null

  override fun onCreate() {
    super.onCreate()
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    startForeground(NOTIFICATION_ID, createNotification())
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this)) {
      showWindow()
    } else {
      stopSelf()
    }
    return START_NOT_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onDestroy() {
    overlayView?.let { view ->
      if (view.isAttachedToWindow) windowManager.removeView(view)
    }
    overlayView = null
    activeService = null
    isRunning = false
    super.onDestroy()
  }

  private fun showWindow() {
    if (overlayView?.isAttachedToWindow == true) return

    val root = createOverlayView()
    val params = WindowManager.LayoutParams(
      dp(300),
      dp(130),
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      },
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT,
    ).apply {
      gravity = Gravity.BOTTOM or Gravity.END
      x = dp(20)
      y = dp(120)
    }

    windowManager.addView(root, params)
    overlayView = root
    layoutParams = params
    activeService = this
    updateOverlay()
  }

  private fun createOverlayView(): View {
    val root = FrameLayout(this).apply {
      background = GradientDrawable().apply {
        setColor(Color.rgb(10, 14, 26))
        cornerRadius = dp(20).toFloat()
        setStroke(dp(1), Color.argb(140, 212, 175, 55))
      }
      clipToOutline = true
    }

    val imageId = resources.getIdentifier("derivo_overlay", "drawable", packageName)
    if (imageId != 0) {
      root.addView(
        ImageView(this).apply {
          setImageResource(imageId)
          scaleType = ImageView.ScaleType.CENTER_CROP
          alpha = 0.35f
        },
        FrameLayout.LayoutParams(-1, -1),
      )
    }
    root.addView(View(this).apply { setBackgroundColor(Color.argb(210, 10, 14, 26)) })

    val content = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(dp(18), dp(14), dp(18), dp(14))
    }

    val textBlock = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
    }

    titleView = TextView(this).apply {
      text = "Derivo Live Bot"
      setTextColor(Color.rgb(212, 175, 55))
      textSize = 17f
      typeface = Typeface.DEFAULT_BOLD
      setPadding(0, 0, 0, dp(4))
    }

    val statusRow = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(0, dp(4), 0, 0)
    }

    statusDot = View(this).apply {
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.rgb(16, 185, 129))
      }
    }

    statusText = TextView(this).apply {
      text = "Bot running"
      setTextColor(Color.WHITE)
      textSize = 13f
      setPadding(dp(6), 0, 0, 0)
    }

    statusRow.addView(statusDot, LinearLayout.LayoutParams(dp(8), dp(8)))
    statusRow.addView(statusText)
    textBlock.addView(titleView)
    textBlock.addView(statusRow)
    content.addView(textBlock, LinearLayout.LayoutParams(0, -2, 1f))

    // Action buttons container
    val actionsLayout = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
    }

    // Return to App Button
    returnButton = ImageView(this).apply {
      setPadding(dp(10), dp(10), dp(10), dp(10))
      setColorFilter(Color.WHITE)
      setImageResource(android.R.drawable.ic_menu_revert)
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.rgb(30, 41, 59))
        setStroke(dp(1), Color.rgb(51, 65, 85))
      }
      setOnClickListener {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        }
        if (launchIntent != null) {
          startActivity(launchIntent)
        }
        stopSelf()
      }
    }

    // Toggle Play/Pause Button
    toggleButton = ImageView(this).apply {
      setPadding(dp(11), dp(11), dp(11), dp(11))
      setColorFilter(Color.WHITE)
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.rgb(251, 113, 133))
      }
      setOnClickListener {
        isRunning = !isRunning
        updateOverlay()
        val reactContext = (application as? ReactApplication)?.reactHost?.currentReactContext
        if (reactContext is com.facebook.react.bridge.ReactApplicationContext) {
          OverlayModule.emitToggle(reactContext)
        }
      }
    }

    val returnParams = LinearLayout.LayoutParams(dp(44), dp(44)).apply {
      marginEnd = dp(8)
    }
    actionsLayout.addView(returnButton, returnParams)
    actionsLayout.addView(toggleButton, LinearLayout.LayoutParams(dp(44), dp(44)))
    content.addView(actionsLayout, LinearLayout.LayoutParams(-2, -2))

    root.addView(content, FrameLayout.LayoutParams(-1, -1))
    root.setOnTouchListener { _, event -> handleDrag(event) }
    return root
  }

  private fun handleDrag(event: MotionEvent): Boolean {
    val params = layoutParams ?: return false
    when (event.action) {
      MotionEvent.ACTION_DOWN -> {
        dragStartX = event.rawX
        dragStartY = event.rawY
        startOffsetX = params.x
        startOffsetY = params.y
        return true
      }
      MotionEvent.ACTION_MOVE -> {
        params.x = (startOffsetX + dragStartX - event.rawX).toInt().coerceAtLeast(0)
        params.y = (startOffsetY + dragStartY - event.rawY).toInt().coerceAtLeast(0)
        overlayView?.let { windowManager.updateViewLayout(it, params) }
        return true
      }
      MotionEvent.ACTION_UP -> return true
    }
    return false
  }

  private fun updateOverlay() {
    statusText?.text = if (isRunning) "Bot running" else "Bot paused"
    statusDot?.alpha = if (isRunning) 1f else 0.45f
    toggleButton?.setImageResource(
      if (isRunning) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play,
    )
  }

  private fun createNotification(): Notification {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, "Derivo floating controls", NotificationManager.IMPORTANCE_LOW),
      )
    }
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    return builder
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setContentTitle("Derivo live trading bot")
      .setContentText("Floating controls are active.")
      .setOngoing(true)
      .build()
  }

  private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

  private lateinit var titleView: TextView
  private lateinit var statusText: TextView
  private lateinit var statusDot: View
  private lateinit var toggleButton: ImageView
  private lateinit var returnButton: ImageView
  private var dragStartX = 0f
  private var dragStartY = 0f
  private var startOffsetX = 0
  private var startOffsetY = 0

  companion object {
    private const val CHANNEL_ID = "derivo_overlay"
    private const val NOTIFICATION_ID = 2401
    @Volatile private var isRunning = false
    @Volatile private var activeService: OverlayService? = null

    fun setBotRunning(running: Boolean) {
      isRunning = running
      activeService?.runOnUiThread { activeService?.updateOverlay() }
    }

    fun isBotRunning() = isRunning
  }

  private fun runOnUiThread(action: () -> Unit) {
    android.os.Handler(mainLooper).post(action)
  }
}
