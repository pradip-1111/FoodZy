// Voice recognition using Web Speech API (browser native)
// This provides voice-to-text functionality for voice ordering

export interface VoiceRecognitionResult {
    transcript: string
    confidence: number
    isFinal: boolean
}

export class VoiceRecognition {
    private recognition: any
    private isListening: boolean = false
    private onResultCallback?: (result: VoiceRecognitionResult) => void
    private onErrorCallback?: (error: string) => void

    constructor() {
        if (typeof window !== 'undefined') {
            // Check for browser support
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition()
                this.recognition.continuous = false
                this.recognition.interimResults = true
                this.recognition.lang = 'en-US'

                this.recognition.onresult = (event: any) => {
                    const result = event.results[event.results.length - 1]
                    const transcript = result[0].transcript
                    const confidence = result[0].confidence
                    const isFinal = result.isFinal

                    if (this.onResultCallback) {
                        this.onResultCallback({ transcript, confidence, isFinal })
                    }
                }

                this.recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error)
                    this.isListening = false
                    if (this.onErrorCallback) {
                        this.onErrorCallback(event.error)
                    }
                }

                this.recognition.onend = () => {
                    this.isListening = false
                }
            }
        }
    }

    /**
     * Check if voice recognition is supported
     */
    isSupported(): boolean {
        return !!this.recognition
    }

    /**
     * Start listening for voice input
     */
    startListening(
        onResult: (result: VoiceRecognitionResult) => void,
        onError?: (error: string) => void
    ): void {
        if (!this.recognition) {
            onError?.('Voice recognition not supported in this browser')
            return
        }

        if (this.isListening) {
            return
        }

        this.onResultCallback = onResult
        this.onErrorCallback = onError
        this.isListening = true

        try {
            this.recognition.start()
        } catch (error) {
            console.error('Error starting voice recognition:', error)
            this.isListening = false
            onError?.('Failed to start voice recognition')
        }
    }

    /**
     * Stop listening
     */
    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop()
            this.isListening = false
        }
    }

    /**
     * Check if currently listening
     */
    getIsListening(): boolean {
        return this.isListening
    }

    /**
     * Set language for recognition
     */
    setLanguage(lang: string): void {
        if (this.recognition) {
            this.recognition.lang = lang
        }
    }
}

// Singleton instance
let voiceRecognitionInstance: VoiceRecognition | null = null

export function getVoiceRecognition(): VoiceRecognition {
    if (!voiceRecognitionInstance) {
        voiceRecognitionInstance = new VoiceRecognition()
    }
    return voiceRecognitionInstance
}
