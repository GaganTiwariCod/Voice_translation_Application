package com.aakashpatti.mictranslation

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioRecordModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var audioRecord: AudioRecord? = null
    @Volatile
    private var isRecording = false
    private var recordingThread: Thread? = null

    override fun getName(): String = "NativeAudioRecorder"

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun start(sampleRate: Int, channels: Int, bitsPerSample: Int, promise: Promise) {
        if (isRecording) {
            promise.resolve(true)
            return
        }

        try {
            val channelConfig = if (channels == 2) AudioFormat.CHANNEL_IN_STEREO else AudioFormat.CHANNEL_IN_MONO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT

            val minBufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
            // 100ms at 16kHz 16-bit mono = 3200 bytes
            val frameSize = (sampleRate * (bitsPerSample / 8) * channels) / 10
            val bufferSize = Math.max(minBufferSize, frameSize * 2)

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                // Fallback to default MIC source if VOICE_RECOGNITION is unavailable
                audioRecord = AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    sampleRate,
                    channelConfig,
                    audioFormat,
                    bufferSize
                )
            }

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                promise.reject("INIT_FAILED", "Failed to initialize AudioRecord hardware device")
                return
            }

            audioRecord?.startRecording()
            isRecording = true

            recordingThread = Thread({
                val buffer = ByteArray(frameSize)
                while (isRecording && audioRecord != null) {
                    val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (bytesRead > 0) {
                        val base64Data = Base64.encodeToString(buffer, 0, bytesRead, Base64.NO_WRAP)
                        sendEvent("onAudioChunk", base64Data)
                    } else if (bytesRead < 0) {
                        try {
                            Thread.sleep(30)
                        } catch (_: Exception) {}
                    }
                }
            }, "AudioRecordThread")

            recordingThread?.start()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        isRecording = false
        try {
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
            recordingThread?.interrupt()
            recordingThread = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_FAILED", e.message)
        }
    }

    private fun sendEvent(eventName: String, params: String) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        }
    }
}

