'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from './help.module.css'

const helpCategories = [
    {
        title: 'Getting Started',
        icon: '🚀',
        articles: [
            { title: 'How to create an account', link: '#' },
            { title: 'Placing your first order', link: '#' },
            { title: 'Using the AI chatbot', link: '#' },
            { title: 'Voice ordering guide', link: '#' },
        ]
    },
    {
        title: 'Orders & Delivery',
        icon: '📦',
        articles: [
            { title: 'Track your order', link: '#' },
            { title: 'Delivery times and fees', link: '#' },
            { title: 'Modify or cancel an order', link: '#' },
            { title: 'Delivery instructions', link: '#' },
        ]
    },
    {
        title: 'Payment & Billing',
        icon: '💳',
        articles: [
            { title: 'Payment methods accepted', link: '#' },
            { title: 'Promo codes and discounts', link: '#' },
            { title: 'Refunds and credits', link: '#' },
            { title: 'Billing issues', link: '#' },
        ]
    },
    {
        title: 'Account & Settings',
        icon: '⚙️',
        articles: [
            { title: 'Update your profile', link: '#' },
            { title: 'Manage addresses', link: '#' },
            { title: 'Change password', link: '#' },
            { title: 'Notification preferences', link: '#' },
        ]
    },
    {
        title: 'Food & Menu',
        icon: '🍔',
        articles: [
            { title: 'Dietary preferences', link: '#' },
            { title: 'Allergen information', link: '#' },
            { title: 'Menu availability', link: '#' },
            { title: 'Special requests', link: '#' },
        ]
    },
    {
        title: 'Troubleshooting',
        icon: '🔧',
        articles: [
            { title: 'App not working', link: '#' },
            { title: 'Order issues', link: '#' },
            { title: 'Payment problems', link: '#' },
            { title: 'Contact support', link: '/contact' },
        ]
    },
]

export default function HelpCenterPage() {
    return (
        <div className={styles.helpPage}>
            <div className="container">
                {/* Header */}
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className={styles.title}>Help Center</h1>
                    <p className={styles.subtitle}>
                        Find answers to your questions and get the help you need
                    </p>

                    {/* Search Bar */}
                    <div className={styles.searchContainer}>
                        <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search for help..."
                            className={styles.searchInput}
                        />
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    className={styles.quickActions}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Link href="/contact" className={styles.quickAction}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Contact Us</span>
                    </Link>
                    <Link href="/faq" className={styles.quickAction}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>FAQ</span>
                    </Link>
                    <Link href="/orders" className={styles.quickAction}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>Track Order</span>
                    </Link>
                </motion.div>

                {/* Help Categories */}
                <div className={styles.categoriesGrid}>
                    {helpCategories.map((category, index) => (
                        <motion.div
                            key={category.title}
                            className={styles.categoryCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                        >
                            <div className={styles.categoryHeader}>
                                <span className={styles.categoryIcon}>{category.icon}</span>
                                <h2 className={styles.categoryTitle}>{category.title}</h2>
                            </div>
                            <ul className={styles.articleList}>
                                {category.articles.map((article) => (
                                    <li key={article.title}>
                                        <Link href={article.link} className={styles.articleLink}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>{article.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Still Need Help */}
                <motion.div
                    className={styles.needHelp}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <h3>Still need help?</h3>
                    <p>Our support team is here to assist you</p>
                    <Link href="/contact" className={styles.contactButton}>
                        Contact Support
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
