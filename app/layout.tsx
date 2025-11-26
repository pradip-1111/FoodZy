import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ChatbotWidget from '@/components/chatbot/ChatbotWidget'

import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'FoodZy - Delicious Food Delivered Fast',
    description: 'Order your favorite food with FoodZy - AI-powered ordering, voice commands, and multi-lingual support',
    keywords: 'food delivery, online food order, restaurant delivery, AI chatbot ordering, FoodZy',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <LanguageProvider>
                        <CartProvider>
                            <Navbar />
                            {children}
                            <ChatbotWidget />
                        </CartProvider>
                    </LanguageProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
