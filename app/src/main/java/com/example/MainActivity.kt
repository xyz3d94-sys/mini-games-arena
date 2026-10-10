package com.example

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        try {
            MobileAds.initialize(this) {}
            AdManager.loadInterstitial(this)
        } catch (e: Exception) {
            Log.w("MainActivity", "MobileAds initialization failed: ${e.message}")
        }

        setContent {
            MyApplicationTheme {
                MiniGamesApp(activity = this)
            }
        }
    }
}

object AdManager {
    private var interstitialAd: InterstitialAd? = null
    private var isAdLoading = false
    private var gamesFinishedCount = 0

    fun loadInterstitial(context: Context) {
        if (interstitialAd != null || isAdLoading) return
        isAdLoading = true
        val adRequest = AdRequest.Builder().build()
        // Test interstitial ad unit ID: ca-app-pub-3940256099942544/1033173712
        InterstitialAd.load(
            context,
            "ca-app-pub-3940256099942544/1033173712",
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isAdLoading = false
                    Log.d("AdManager", "Interstitial ad loaded successfully")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialAd = null
                    isAdLoading = false
                    Log.w("AdManager", "Interstitial ad failed to load: ${error.message}")
                }
            }
        )
    }

    fun onGameFinished(activity: Activity?) {
        gamesFinishedCount++
        Log.d("AdManager", "Game completed. Total games completed: $gamesFinishedCount")
        // User request: After 2 games are completed, show full-screen Google AdMob ad
        if (gamesFinishedCount >= 2) {
            gamesFinishedCount = 0
            activity?.runOnUiThread {
                showInterstitial(activity)
            }
        }
    }

    private fun showInterstitial(activity: Activity) {
        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    loadInterstitial(activity)
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    interstitialAd = null
                    loadInterstitial(activity)
                }
            }
            ad.show(activity)
        } else {
            Log.d("AdManager", "Interstitial ad not ready, preloading for next round")
            loadInterstitial(activity)
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MiniGamesApp(activity: Activity? = null) {
    val context = LocalContext.current
    val currentActivity = activity ?: (context as? Activity)
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var reloadTrigger by remember { mutableStateOf(0) }

    // Intercept back button to navigate to menu if possible
    BackHandler(enabled = true) {
        webViewInstance?.evaluateJavascript("if (typeof App !== 'undefined' && App.currentView !== 'menu') { if (typeof ChessGame !== 'undefined') ChessGame.stop(); App.navigateTo('menu'); }", null)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ComposeColor(0xFF0F172A))
            .statusBarsPadding()
            .testTag("mini_games_container")
    ) {
        // Main Game Area - Takes all available space above the AdMob banner
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            key(reloadTrigger) {
                AndroidView(
                    modifier = Modifier
                        .fillMaxSize()
                        .testTag("webview_game_view"),
                    factory = { ctx ->
                        WebView(ctx).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            setBackgroundColor(Color.parseColor("#0F172A"))
                            settings.apply {
                                javaScriptEnabled = true
                                domStorageEnabled = true
                                databaseEnabled = true
                                allowFileAccess = true
                                allowContentAccess = true
                                allowFileAccessFromFileURLs = true
                                allowUniversalAccessFromFileURLs = true
                                useWideViewPort = true
                                loadWithOverviewMode = true
                                cacheMode = WebSettings.LOAD_DEFAULT
                                mediaPlaybackRequiresUserGesture = false
                                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            }
                            webViewClient = object : WebViewClient() {
                                override fun onReceivedError(
                                    view: WebView?,
                                    request: WebResourceRequest?,
                                    error: WebResourceError?
                                ) {
                                    super.onReceivedError(view, request, error)
                                    Log.w("MiniGamesWebView", "Resource error: ${error?.description}")
                                }

                                override fun onRenderProcessGone(
                                    view: WebView?,
                                    detail: RenderProcessGoneDetail?
                                ): Boolean {
                                    Log.e("MiniGamesWebView", "Render process crashed: didCrash=${detail?.didCrash()}")
                                    view?.let {
                                        val parent = it.parent as? ViewGroup
                                        parent?.removeView(it)
                                        it.destroy()
                                    }
                                    reloadTrigger++
                                    return true
                                }
                            }
                            webChromeClient = object : WebChromeClient() {
                                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                                    consoleMessage?.let {
                                        Log.d("MiniGamesJS", "${it.sourceId()}:${it.lineNumber()} - ${it.message()}")
                                    }
                                    return super.onConsoleMessage(consoleMessage)
                                }
                            }
                            addJavascriptInterface(AndroidBridge(currentActivity ?: ctx), "AndroidBridge")
                            loadUrl("file:///android_asset/index.html")
                            webViewInstance = this
                        }
                    },
                    update = {
                        webViewInstance = it
                    }
                )
            }
        }

        // Dedicated AdMob Banner container at the bottom - does not overlap any buttons or UI
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight()
                .heightIn(min = 50.dp)
                .background(ComposeColor(0xFF0F172A))
                .navigationBarsPadding()
                .testTag("admob_banner_container"),
            contentAlignment = Alignment.Center
        ) {
            AndroidView(
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
                    .testTag("admob_banner_view"),
                factory = { ctx ->
                    AdView(ctx).apply {
                        setAdSize(AdSize.BANNER)
                        // Standard test banner ad unit ID: ca-app-pub-3940256099942544/6300978111
                        adUnitId = "ca-app-pub-3940256099942544/6300978111"
                        loadAd(AdRequest.Builder().build())
                    }
                }
            )
        }
    }
}

class AndroidBridge(private val contextOrActivity: Any) {
    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            val ctx = (contextOrActivity as? Context) ?: (contextOrActivity as? Activity)?.applicationContext
            val vibrator = ctx?.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (vibrator?.hasVibrator() == true) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(
                        VibrationEffect.createOneShot(
                            durationMs.coerceIn(10L, 2000L),
                            VibrationEffect.DEFAULT_AMPLITUDE
                        )
                    )
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(durationMs.coerceIn(10L, 2000L))
                }
            }
        } catch (e: Exception) {
            Log.w("AndroidBridge", "Vibration failed: ${e.message}")
        }
    }

    @JavascriptInterface
    fun onGameFinished() {
        val activity = contextOrActivity as? Activity
        AdManager.onGameFinished(activity)
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Box(modifier = modifier)
}
