'use client'

import { useState, useEffect, useRef } from 'react'
import { getVoiceRecognition } from '@/lib/ai/voice'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { FaPaperPlane, FaMicrophone, FaShoppingCart, FaPlus } from 'react-icons/fa'
import { LuBot, LuX, LuMessageCircle, LuEraser } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './ChatbotWidget.module.css'
import { processChatbotMessage } from '@/lib/ai/chatbot'

interface Message {
    role: 'user' | 'assistant'
    content: string
    items?: FoodItem[]
}

interface FoodItem {
    id: string
    name: string
    description: string
    current_price: number
    image_url: string
    category_id: string
}

export default function ChatbotWidget() {
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
    // Fix: Use addItem instead of addToCart as per CartContext definition
    const { addItem } = useCart()

    const suggestedQuestions = [
        "Order pizza 🍕",
        "Show me burgers 🍔",
        "I'm vegetarian 🥗",
        "Track my order 🛵"
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isOpen])

    const handleSendMessage = async (text: string = input, isVoice: boolean = false) => {
        if (!text || typeof text !== 'string' || !text.trim()) return

        const userMessage = text.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            // Process user message with client-side AI/matcher
            const data = await processChatbotMessage(userMessage, messages)

            // Auto add to cart if requested via voice or order intent
            if (data.autoAddToCart && data.orderedItem) {
                await addItem(data.orderedItem.id, data.quantity || 1, data.orderedItem.current_price)

                // Voice feedback if speech synthesis available
                if (isVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    try {
                        const utterance = new SpeechSynthesisUtterance(`Added ${data.orderedItem.name} to your cart`)
                        utterance.rate = 1.0
                        window.speechSynthesis.speak(utterance)
                    } catch (e) {
                        console.error('Speech synthesis error:', e)
                    }
                }
            }

            // Check if we got items to display
            if (data.items && data.items.length > 0) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    items: data.items
                }])
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response
                }])
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
                            setIsListening(false)
                            handleSendMessage(result.transcript, true)
                        }
                    }
                },
                () => {
                    setIsListening(false)
                }
            )
        }
    }

    const handleAddToCart = (item: FoodItem) => {
        // Fix: Use addItem with correct parameters (id, quantity, price)
        addItem(item.id, 1, item.current_price)

        // Add confirmation message
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Added "${item.name}" to your cart! You can continue shopping or go to checkout.`
        }])
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
                                    <h3>FoodZy Assistant</h3>
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
                                <div key={index}>
                                    <motion.div
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

                                    {/* Display food items if present */}
                                    {message.items && message.items.length > 0 && (
                                        <div style={{ marginLeft: message.role === 'assistant' ? '40px' : '0', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {message.items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '12px',
                                                        padding: '12px',
                                                        display: 'flex',
                                                        gap: '12px',
                                                        alignItems: 'center',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <img
                                                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                                                        alt={item.name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                                                        }}
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: '8px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                    <div style={{ flex: 1, color: 'white' }}>
                                                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.name}</div>
                                                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>{item.description?.substring(0, 50)}...</div>
                                                        <div style={{ fontSize: '16px', fontWeight: '700' }}>₹{item.current_price.toFixed(2)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        style={{
                                                            background: 'white',
                                                            color: '#667eea',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '8px 16px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '13px',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <FaPlus size={12} />
                                                        Add
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
