'use client'

import { useState, useEffect, useRef } from 'react'
import { processChatMessage, extractFoodItems, isOrderIntent } from '@/lib/ai/chatbot'
import { getVoiceRecognition } from '@/lib/ai/voice'
import { supabase } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa'
import { LuBot, LuX, LuMessageCircle, LuEraser } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ChatbotWidget.module.css'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function ChatbotWidget() {
    const { addItem } = useCart()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your FoodZy Assistant. 🤖\nI can help you browse the menu, track orders, or recommend delicious meals."
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const voiceRecognition = getVoiceRecognition()

    const suggestedQuestions = [
        "Show me the menu 🍔",
        "Track my order 🛵",
        "I'm vegetarian 🥗",
        "Spicy food recommendations 🌶️"
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isOpen])

    const handleSendMessage = async (text: string = input) => {
        if (!text || typeof text !== 'string' || !text.trim()) return

        const userMessage = text.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            if (isOrderIntent(userMessage)) {
                const foodKeywords = extractFoodItems(userMessage)

                if (foodKeywords.length > 0) {
                    const { data: foodItems } = await supabase
                        .from('food_items')
                        .select('*')
                        .eq('is_available', true)
                        .ilike('name', `%${foodKeywords[0]}%`)
                        .limit(3)

                    if (foodItems && foodItems.length > 0) {
                        await addItem(foodItems[0].id, 1, foodItems[0].current_price)

                        const response = `Great choice! I've added ${foodItems[0].name} to your cart. 🛒\n${foodItems.length > 1
                            ? `We also have ${foodItems.slice(1).map(item => item.name).join(', ')}. Would you like to try those?`
                            : 'Anything else for your order?'
                            }`

                        setMessages(prev => [...prev, { role: 'assistant', content: response }])
                    } else {
                        const response = "I couldn't find that specific item. 😕\nWould you like to see our popular categories instead?"
                        setMessages(prev => [...prev, { role: 'assistant', content: response }])
                    }
                } else {
                    const response = await processChatMessage(userMessage, messages)
                    setMessages(prev => [...prev, { role: 'assistant', content: response }])
                }
            } else {
                const response = await processChatMessage(userMessage, messages)
                setMessages(prev => [...prev, { role: 'assistant', content: response }])
            }
        } catch (error) {
            console.error('Chatbot error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having a little trouble connecting right now. Please try again in a moment! 🙏"
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleVoiceInput = () => {
        if (!voiceRecognition.isSupported()) {
            alert('Voice recognition is not supported in your browser')
            return
        }

        if (isListening) {
            voiceRecognition.stopListening()
            setIsListening(false)
        } else {
            setIsListening(true)
            voiceRecognition.startListening(
                (result) => {
                    if (result && result.transcript) {
                        setInput(result.transcript)
                        if (result.isFinal) {
                            handleSendMessage(result.transcript)
                        }
                    }
                },
                () => {
                    setIsListening(false)
                }
            )
        }
    }

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: "Chat cleared! How can I help you now?"
        }])
    }

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={styles.chatButton}
                        onClick={() => setIsOpen(true)}
                        aria-label="Open chat"
                    >
                        <LuMessageCircle />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={styles.chatWidget}
                    >
                        <div className={styles.chatHeader}>
                            <div className={styles.headerContent}>
                                <div className={styles.botAvatar}>
                                    <LuBot />
                                    <span className={styles.statusDot} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h3>Assistant</h3>
                                    <span className={styles.subtitle}>Always here to help</span>
                                </div>
                            </div>
                            <div className={styles.headerActions}>
                                <button
                                    onClick={clearChat}
                                    className={styles.iconButton}
                                    title="Clear chat"
                                >
                                    <LuEraser />
                                </button>
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close chat"
                                >
                                    <LuX />
                                </button>
                            </div>
                        </div>

                        <div className={styles.chatMessages}>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.botMessage}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className={styles.messageAvatar}>
                                            <LuBot />
                                        </div>
                                    )}
                                    <div className={styles.messageContent}>
                                        {message.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`${styles.message} ${styles.botMessage}`}
                                >
                                    <div className={styles.messageAvatar}>
                                        <LuBot />
                                    </div>
                                    <div className={styles.typing}>
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles.suggestions}>
                            {suggestedQuestions.map((question, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={styles.suggestionChip}
                                    onClick={() => handleSendMessage(question)}
                                >
                                    {question}
                                </motion.button>
                            ))}
                        </div>

                        <div className={styles.chatInputArea}>
                            <div className={styles.chatInputWrapper}>
                                <button
                                    className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
                                    onClick={handleVoiceInput}
                                    title="Voice Input"
                                >
                                    <FaMicrophone />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    disabled={loading}
                                />
                                <button
                                    className={styles.sendButton}
                                    onClick={() => handleSendMessage()}
                                    disabled={!input || typeof input !== 'string' || !input.trim() || loading}
                                    title="Send Message"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                            <div className={styles.poweredBy}>
                                Powered by FoodZy AI
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
