// Translation service using LibreTranslate API
// Provides multi-lingual support for the application

const LIBRETRANSLATE_URL = process.env.NEXT_PUBLIC_LIBRETRANSLATE_URL || 'https://libretranslate.com'

export type SupportedLanguage = 'en' | 'ar' | 'hi' | 'es' | 'fr'

export const LANGUAGE_NAMES: Record<SupportedLanguage, { nativeName: string }> = {
    en: { nativeName: 'English' },
    ar: { nativeName: 'العربية' },
    hi: { nativeName: 'हिन्दी' },
    es: { nativeName: 'Español' },
    fr: { nativeName: 'Français' },
}

export const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
    en: 'en',
    ar: 'ar',
    hi: 'hi',
    es: 'es',
    fr: 'fr',
}

/**
 * Translate text from one language to another
 */
export async function translateText(
    text: string,
    targetLang: SupportedLanguage,
    sourceLang: SupportedLanguage = 'en'
): Promise<string> {
    // If same language, return original text
    if (sourceLang === targetLang) {
        return text
    }

    try {
        const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: LANGUAGE_CODES[sourceLang],
                target: LANGUAGE_CODES[targetLang],
                format: 'text',
            }),
        })

        if (!response.ok) {
            console.error('Translation API error:', await response.text())
            return text // Return original text on error
        }

        const data = await response.json()
        return data.translatedText || text
    } catch (error) {
        console.error('Translation error:', error)
        return text // Return original text on error
    }
}

/**
 * Translate multiple texts at once
 */
export async function translateBatch(
    texts: string[],
    targetLang: SupportedLanguage,
    sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
    if (sourceLang === targetLang) {
        return texts
    }

    try {
        const translations = await Promise.all(
            texts.map(text => translateText(text, targetLang, sourceLang))
        )
        return translations
    } catch (error) {
        console.error('Batch translation error:', error)
        return texts
    }
}

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<SupportedLanguage> {
    try {
        const response = await fetch(`${LIBRETRANSLATE_URL}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
            }),
        })

        if (!response.ok) {
            return 'en' // Default to English on error
        }

        const data = await response.json()
        const detectedLang = data[0]?.language || 'en'

        // Map to supported language
        if (Object.keys(LANGUAGE_CODES).includes(detectedLang)) {
            return detectedLang as SupportedLanguage
        }

        return 'en'
    } catch (error) {
        console.error('Language detection error:', error)
        return 'en'
    }
}
