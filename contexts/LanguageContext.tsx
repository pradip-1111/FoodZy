'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translateText, SupportedLanguage, LANGUAGE_NAMES } from '@/lib/translation/translate'

interface LanguageContextType {
    currentLanguage: SupportedLanguage
    setLanguage: (lang: SupportedLanguage) => void
    t: (key: string) => string
    translate: (text: string) => Promise<string>
    languages: typeof LANGUAGE_NAMES
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation keys (will be loaded from JSON files in production)
const translations: Record<SupportedLanguage, Record<string, string>> = {
    en: {
        'nav.home': 'Home',
        'nav.menu': 'Menu',
        'nav.offers': 'Offers',
        'nav.cart': 'Cart',
        'nav.orders': 'Orders',
        'nav.profile': 'Profile',
        'auth.login': 'Login',
        'auth.signup': 'Sign Up',
        'auth.logout': 'Logout',
        'cart.add': 'Add to Cart',
        'cart.empty': 'Your cart is empty',
        'order.place': 'Place Order',
        'order.track': 'Track Order',
        'home.title': 'Delicious Food,',
        'home.subtitle': 'Delivered Fast',
        'home.desc': 'Order with AI chatbot, voice commands, or browse our menu',
        'home.browse': 'Browse Menu',
        'home.getStarted': 'Get Started',
        'home.why': 'Why Choose FoodZy?',
        'home.feature.ai': 'AI Chatbot Ordering',
        'home.feature.voice': 'Voice Ordering',
        'home.feature.multi': 'Multi-Lingual',
        'home.feature.fast': 'Fast Delivery',
        'home.how': 'How It Works',
        'home.step1': 'Choose Your Food',
        'home.step2': 'Place Your Order',
        'home.step3': 'Get It Delivered',
        'menu.title': 'Our Menu',
        'menu.subtitle': 'Hand-crafted dishes made with love and premium ingredients',
        'menu.featured': 'Featured Categories',
        'menu.trending': 'Trending Now',
        'menu.full': 'Full Menu',
        'menu.search': 'Search dishes...',
        'menu.all': 'All Items',
    },
    ar: {
        'nav.home': 'الرئيسية',
        'nav.menu': 'القائمة',
        'nav.offers': 'العروض',
        'nav.cart': 'السلة',
        'nav.orders': 'الطلبات',
        'nav.profile': 'الملف الشخصي',
        'auth.login': 'تسجيل الدخول',
        'auth.signup': 'إنشاء حساب',
        'auth.logout': 'تسجيل الخروج',
        'cart.add': 'أضف إلى السلة',
        'cart.empty': 'سلتك فارغة',
        'order.place': 'تقديم الطلب',
        'order.track': 'تتبع الطلب',
        'home.title': 'طعام لذيذ،',
        'home.subtitle': 'توصيل سريع',
        'home.desc': 'اطلب عبر الدردشة الذكية، الأوامر الصوتية، أو تصفح القائمة',
        'home.browse': 'تصفح القائمة',
        'home.getStarted': 'ابدأ الآن',
        'home.why': 'لماذا تختار FoodZy؟',
        'home.feature.ai': 'طلب عبر الذكاء الاصطناعي',
        'home.feature.voice': 'طلب صوتي',
        'home.feature.multi': 'متعدد اللغات',
        'home.feature.fast': 'توصيل سريع',
        'home.how': 'كيف يعمل',
        'home.step1': 'اختر طعامك',
        'home.step2': 'اطلب الآن',
        'home.step3': 'استلم طلبك',
        'menu.title': 'قائمتنا',
        'menu.subtitle': 'أطباق مصنوعة يدوياً بحب ومكونات ممتازة',
        'menu.featured': 'فئات مميزة',
        'menu.trending': 'الأكثر طلباً',
        'menu.full': 'القائمة الكاملة',
        'menu.search': 'ابحث عن طبق...',
        'menu.all': 'كل الأصناف',
    },
    hi: {
        'nav.home': 'होम',
        'nav.menu': 'मेनू',
        'nav.offers': 'ऑफर',
        'nav.cart': 'कार्ट',
        'nav.orders': 'ऑर्डर',
        'nav.profile': 'प्रोफ़ाइल',
        'auth.login': 'लॉगिन',
        'auth.signup': 'साइन अप',
        'auth.logout': 'लॉगआउट',
        'cart.add': 'कार्ट में जोड़ें',
        'cart.empty': 'आपकी कार्ट खाली है',
        'order.place': 'ऑर्डर करें',
        'order.track': 'ऑर्डर ट्रैक करें',
        'home.title': 'स्वादिष्ट भोजन,',
        'home.subtitle': 'तेजी से वितरण',
        'home.desc': 'AI चैटबॉट, वॉयस कमांड के साथ ऑर्डर करें या हमारा मेनू ब्राउज़ करें',
        'home.browse': 'मेनू देखें',
        'home.getStarted': 'शुरू करें',
        'home.why': 'FoodZy क्यों चुनें?',
        'home.feature.ai': 'AI चैटबॉट ऑर्डरिंग',
        'home.feature.voice': 'वॉयस ऑर्डरिंग',
        'home.feature.multi': 'बहुभाषी',
        'home.feature.fast': 'तेज डिलीवरी',
        'home.how': 'यह कैसे काम करता है',
        'home.step1': 'अपना भोजन चुनें',
        'home.step2': 'अपना ऑर्डर दें',
        'home.step3': 'डिलीवरी प्राप्त करें',
        'menu.title': 'हमारा मेनू',
        'menu.subtitle': 'प्रेम और प्रीमियम सामग्री के साथ बनाए गए हस्तनिर्मित व्यंजन',
        'menu.featured': 'विशेष श्रेणियां',
        'menu.trending': 'अभी ट्रेंडिंग',
        'menu.full': 'पूरा मेनू',
        'menu.search': 'व्यंजन खोजें...',
        'menu.all': 'सभी आइटम',
    },
    es: {
        'nav.home': 'Inicio',
        'nav.menu': 'Menú',
        'nav.offers': 'Ofertas',
        'nav.cart': 'Carrito',
        'nav.orders': 'Pedidos',
        'nav.profile': 'Perfil',
        'auth.login': 'Iniciar sesión',
        'auth.signup': 'Registrarse',
        'auth.logout': 'Cerrar sesión',
        'cart.add': 'Añadir al carrito',
        'cart.empty': 'Tu carrito está vacío',
        'order.place': 'Realizar pedido',
        'order.track': 'Rastrear pedido',
        'home.title': 'Comida deliciosa,',
        'home.subtitle': 'Entrega rápida',
        'home.desc': 'Pide con chatbot AI, comandos de voz o navega por nuestro menú',
        'home.browse': 'Ver Menú',
        'home.getStarted': 'Empezar',
        'home.why': '¿Por qué elegir FoodZy?',
        'home.feature.ai': 'Pedidos con IA',
        'home.feature.voice': 'Pedidos por voz',
        'home.feature.multi': 'Multilingüe',
        'home.feature.fast': 'Entrega rápida',
        'home.how': 'Cómo funciona',
        'home.step1': 'Elige tu comida',
        'home.step2': 'Realiza tu pedido',
        'home.step3': 'Recíbelo',
        'menu.title': 'Nuestro Menú',
        'menu.subtitle': 'Platos artesanales hechos con amor e ingredientes premium',
        'menu.featured': 'Categorías Destacadas',
        'menu.trending': 'Tendencias',
        'menu.full': 'Menú Completo',
        'menu.search': 'Buscar platos...',
        'menu.all': 'Todos los artículos',
    },
    fr: {
        'nav.home': 'Accueil',
        'nav.menu': 'Menu',
        'nav.offers': 'Offres',
        'nav.cart': 'Panier',
        'nav.orders': 'Commandes',
        'nav.profile': 'Profil',
        'auth.login': 'Connexion',
        'auth.signup': 'Inscription',
        'auth.logout': 'Déconnexion',
        'cart.add': 'Ajouter au panier',
        'cart.empty': 'Votre panier est vide',
        'order.place': 'Passer commande',
        'order.track': 'Suivre la commande',
        'home.title': 'Nourriture délicieuse,',
        'home.subtitle': 'Livraison rapide',
        'home.desc': 'Commandez avec le chatbot IA, les commandes vocales ou parcourez notre menu',
        'home.browse': 'Voir le Menu',
        'home.getStarted': 'Commencer',
        'home.why': 'Pourquoi choisir FoodZy ?',
        'home.feature.ai': 'Commande par IA',
        'home.feature.voice': 'Commande vocale',
        'home.feature.multi': 'Multilingue',
        'home.feature.fast': 'Livraison rapide',
        'home.how': 'Comment ça marche',
        'home.step1': 'Choisissez votre repas',
        'home.step2': 'Passez votre commande',
        'home.step3': 'Faites-vous livrer',
        'menu.title': 'Notre Menu',
        'menu.subtitle': 'Plats artisanaux faits avec amour et des ingrédients de première qualité',
        'menu.featured': 'Catégories en vedette',
        'menu.trending': 'Tendances actuelles',
        'menu.full': 'Menu Complet',
        'menu.search': 'Rechercher des plats...',
        'menu.all': 'Tous les articles',
    },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en')

    useEffect(() => {
        // Load saved language from localStorage
        const saved = localStorage.getItem('preferred_language') as SupportedLanguage
        if (saved && Object.keys(LANGUAGE_NAMES).includes(saved)) {
            setCurrentLanguage(saved)
        }
    }, [])

    const setLanguage = (lang: SupportedLanguage) => {
        setCurrentLanguage(lang)
        localStorage.setItem('preferred_language', lang)
        // Update document direction for RTL languages
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = lang
    }

    const t = (key: string): string => {
        return translations[currentLanguage][key] || key
    }

    const translate = async (text: string): Promise<string> => {
        if (currentLanguage === 'en') return text
        return await translateText(text, currentLanguage, 'en')
    }

    return (
        <LanguageContext.Provider
            value={{
                currentLanguage,
                setLanguage,
                t,
                translate,
                languages: LANGUAGE_NAMES,
            }}
        >
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
