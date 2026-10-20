package com.aakashpatti.mictranslation

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

class TextToSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    @Volatile
    private var isInitialized = false
    private val activePromises = ConcurrentHashMap<String, Promise>()
    private val idCounter = AtomicLong(0)

    init {
        initTtsEngine()
    }

    private fun initTtsEngine() {
        val appContext = reactContext.applicationContext ?: reactContext
        try {
            // Prefer Google TTS engine for superior Indian language models (gu, bn, ta, te, mr, hi)
            tts = TextToSpeech(appContext, this, "com.google.android.tts")
        } catch (e: Exception) {
            tts = TextToSpeech(appContext, this)
        }
    }

    override fun getName(): String = "NativeTextToSpeech"

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            try {
                // Faster conversational rate (~1.15x) for ultra-low latency continuous speech
                tts?.setSpeechRate(1.15f)
                setupProgressListener()
            } catch (_: Exception) {}
        } else {
            // If Google TTS engine failed to init, fallback to default system TTS
            try {
                val appContext = reactContext.applicationContext ?: reactContext
                tts = TextToSpeech(appContext) { fallbackStatus ->
                    if (fallbackStatus == TextToSpeech.SUCCESS) {
                        isInitialized = true
                        tts?.setSpeechRate(1.15f)
                        setupProgressListener()
                    } else {
                        isInitialized = false
                    }
                }
            } catch (_: Exception) {
                isInitialized = false
            }
        }
    }

    private fun setupProgressListener() {
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                sendEvent("onTtsStart", utteranceId ?: "")
            }

            override fun onDone(utteranceId: String?) {
                sendEvent("onTtsDone", utteranceId ?: "")
                if (utteranceId != null) {
                    activePromises.remove(utteranceId)?.resolve(true)
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                sendEvent("onTtsError", utteranceId ?: "")
                if (utteranceId != null) {
                    activePromises.remove(utteranceId)?.resolve(false)
                }
            }

            override fun onError(utteranceId: String?, errorCode: Int) {
                sendEvent("onTtsError", utteranceId ?: "")
                if (utteranceId != null) {
                    activePromises.remove(utteranceId)?.resolve(false)
                }
            }
        })
    }

    @ReactMethod
    fun speak(text: String, languageCode: String, promise: Promise) {
        if (text.isBlank()) {
            promise.resolve(false)
            return
        }

        if (!isInitialized || tts == null) {
            // If TTS is currently initializing, wait up to 1.5 seconds in background thread
            Thread {
                var waited = 0
                while (!isInitialized && waited < 15) {
                    try { Thread.sleep(100) } catch (_: Exception) {}
                    waited++
                }
                if (!isInitialized || tts == null) {
                    promise.resolve(false)
                } else {
                    speakInternal(text, languageCode, promise)
                }
            }.start()
            return
        }

        speakInternal(text, languageCode, promise)
    }

    private fun speakInternal(text: String, languageCode: String, promise: Promise) {
        val t = tts ?: run {
            promise.resolve(false)
            return
        }

        try {
            val locale = when (languageCode.lowercase().trim()) {
                "mr", "mr-in" -> Locale("mr", "IN")
                "gu", "gu-in" -> Locale("gu", "IN")
                "bn", "bn-in" -> Locale("bn", "IN")
                "ta", "ta-in" -> Locale("ta", "IN")
                "te", "te-in" -> Locale("te", "IN")
                "hi", "hi-in" -> Locale("hi", "IN")
                "en", "en-us", "en-in" -> Locale.US
                "es", "es-es" -> Locale("es", "ES")
                "fr", "fr-fr" -> Locale.FRANCE
                "de", "de-de" -> Locale.GERMANY
                else -> Locale(languageCode)
            }

            var langResult = t.setLanguage(locale)
            if (langResult == TextToSpeech.LANG_MISSING_DATA || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                // Fallback to base language code without country
                langResult = t.setLanguage(Locale(locale.language))
            }

            val utteranceId = "utt_${System.currentTimeMillis()}_${idCounter.incrementAndGet()}"
            activePromises[utteranceId] = promise

            val res = t.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
            if (res == TextToSpeech.ERROR) {
                activePromises.remove(utteranceId)?.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            tts?.stop()
            for ((_, p) in activePromises) {
                p.resolve(false)
            }
            activePromises.clear()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message)
        }
    }

    private fun sendEvent(eventName: String, params: String) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (_: Exception) {}
        tts = null
    }
}

