'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './faq.module.css'

const faqs = [
    {
        category: 'Orders',
        questions: [
            {
                q: 'How do I place an order?',
                a: 'You can place an order through our website, mobile app, or by using our AI chatbot. Simply browse the menu, add items to your cart, and proceed to checkout.'
            },
            {
                q: 'Can I modify my order after placing it?',
                a: 'Yes, you can modify your order within 5 minutes of placing it. Go to "My Orders" and click "Modify Order". After 5 minutes, please contact support for assistance.'
            },
            {
                q: 'How do I track my order?',
                a: 'Once your order is confirmed, you can track it in real-time from the "My Orders" section. You\'ll receive updates via SMS and email as well.'
            },
        ]
    },
    {
        category: 'Delivery',
        questions: [
            {
                q: 'What are the delivery hours?',
                a: 'We deliver from 8:00 AM to 11:00 PM, 7 days a week. Some restaurants may have different hours.'
            },
            {
                q: 'How much is the delivery fee?',
                a: 'Delivery fees vary based on distance and demand. Orders over $30 qualify for free delivery. You\'ll see the exact fee before checkout.'
            },
            {
                q: 'How long does delivery take?',
                a: 'Most deliveries arrive within 30-45 minutes. Exact time depends on restaurant preparation time and distance.'
            },
        ]
    },
    {
        category: 'Payment',
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, PayPal, Apple Pay, Google Pay, and cash on delivery.'
            },
            {
                q: 'Is my payment information secure?',
                a: 'Yes, all payments are processed through secure, PCI-compliant payment gateways. We never store your full card details.'
            },
            {
                q: 'Can I get a refund?',
                a: 'Yes, if there\'s an issue with your order, contact support within 24 hours. Refunds are processed within 5-7 business days.'
            },
        ]
    },
    {
        category: 'Account',
        questions: [
            {
                q: 'How do I create an account?',
                a: 'Click "Sign Up" and enter your email, name, and password. You can also sign up using Google or Facebook.'
            },
            {
                q: 'I forgot my password. What should I do?',
                a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a reset link.'
            },
            {
                q: 'How do I delete my account?',
                a: 'Go to Settings > Account > Delete Account. Note that this action is permanent and cannot be undone.'
            },
        ]
    },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={styles.faqItem}>
            <button
                className={styles.faqQuestion}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <svg
                    className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={styles.faqAnswer}
                    >
                        <p>{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function FAQPage() {
    return (
        <div className={styles.faqPage}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className={styles.title}>Frequently Asked Questions</h1>
                    <p className={styles.subtitle}>
                        Find quick answers to common questions
                    </p>
                </motion.div>

                <div className={styles.faqContent}>
                    {faqs.map((category, index) => (
                        <motion.div
                            key={category.category}
                            className={styles.faqCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h2 className={styles.categoryTitle}>{category.category}</h2>
                            <div className={styles.faqList}>
                                {category.questions.map((faq, i) => (
                                    <FAQItem key={i} question={faq.q} answer={faq.a} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className={styles.stillHaveQuestions}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>Still have questions?</h3>
                    <p>Can't find what you're looking for? Our support team is here to help.</p>
                    <a href="/contact" className={styles.contactButton}>
                        Contact Support
                    </a>
                </motion.div>
            </div>
        </div>
    )
}
