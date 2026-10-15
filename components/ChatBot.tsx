'use client'

import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaTimes, FaPaperPlane, FaSearch } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import styles from './ChatBot.module.css'

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    items?: FoodItem[]
}

interface FoodItem {
    id: string
    name: string
    current_price: number
    image_url: string
    description: string
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your food assistant. Tell me what you're craving (e.g., 'burger', 'pizza') and I'll find it for you!",
            sender: 'bot'
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [categories, setCategories] = useState<any[]>([])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)

        console.log('ChatBot: Fetched categories:', data, error)
        if (data) setCategories(data)
    }

    const handleSend = async () => {
        if (!inputValue.trim()) return

        const userText = inputValue.trim()
        console.log('ChatBot: User input:', userText)
        setInputValue('')

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user'
        }
        setMessages(prev => [...prev, userMsg])

        setIsTyping(true)

        try {
            // Check for category match
            console.log('ChatBot: Checking against categories:', categories)
            const matchedCategory = categories.find(cat =>
                cat.name.toLowerCase() === userText.toLowerCase() ||
                userText.toLowerCase().includes(cat.name.toLowerCase())
            )
            console.log('ChatBot: Matched category:', matchedCategory)

            if (matchedCategory) {
                setTimeout(() => {
                    setIsTyping(false)
                    const botMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: `Taking you to our ${matchedCategory.name} menu...`,
                        sender: 'bot'
                    }
                    setMessages(prev => [...prev, botMsg])

                    // Navigate to menu with category
                    setTimeout(() => {
                        window.location.href = `/menu?category=${matchedCategory.id}`
                    }, 1500)
                }, 1000)
                return
            }

            // Search for food items
            const { data: items, error } = await supabase
                .from('food_items')
                .select('*')
                .ilike('name', `%${userText}%`)
                .eq('is_available', true)
                .limit(5)

            if (error) throw error

            setTimeout(() => {
                setIsTyping(false)

                if (items && items.length > 0) {
                    const botMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: `I found ${items.length} delicious items matching "${userText}":`,
                        sender: 'bot',
                        items: items
                    }
                    setMessages(prev => [...prev, botMsg])
                } else {
                    const botMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: `Sorry, I couldn't find any items matching "${userText}". Try searching for something else like "pizza" or "salad".`,
                        sender: 'bot'
                    }
                    setMessages(prev => [...prev, botMsg])
                }
            }, 1000) // Fake delay for natural feel

        } catch (error) {
            console.error('Search error:', error)
            setIsTyping(false)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting to the kitchen right now. Please try again later.",
                sender: 'bot'
            }])
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend()
        }
    }

    return (
        <div className={styles.chatWidget}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <FaRobot size={20} />
                            Food Assistant v2 ({categories.length})
                        </div>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                                    {msg.text}
                                </div>
                                {msg.items && (
                                    <div style={{ width: '85%', marginTop: '5px' }}>
                                        {msg.items.map(item => (
                                            <Link href={`/menu/${item.id}`} key={item.id} className={styles.productCard}>
                                                <img
                                                    src={item.image_url || 'https://via.placeholder.com/60'}
                                                    alt={item.name}
                                                    className={styles.productImage}
                                                />
                                                <div className={styles.productInfo}>
                                                    <div className={styles.productName}>{item.name}</div>
                                                    <div className={styles.productPrice}>₹{item.current_price.toFixed(0)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className={styles.typingIndicator}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Type a food name..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <FaPaperPlane size={14} />
                        </button>
                    </div>
                </div>
            )}

            <button
                className={styles.toggleBtn}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaTimes /> : <FaSearch />}
            </button>
        </div>
    )
}
