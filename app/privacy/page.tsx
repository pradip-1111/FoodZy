'use client'

import { motion } from 'framer-motion'
import styles from './legal.module.css'

export default function PrivacyPage() {
    return (
        <div className={styles.legalPage}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last Updated: November 28, 2024</p>
                </motion.div>

                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <section className={styles.section}>
                        <h2>1. Introduction</h2>
                        <p>
                            FoodZy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our food delivery service.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Information We Collect</h2>
                        <h3>Personal Information:</h3>
                        <ul>
                            <li>Name, email address, and phone number</li>
                            <li>Delivery addresses</li>
                            <li>Payment information (processed securely through third-party payment processors)</li>
                            <li>Order history and preferences</li>
                        </ul>
                        <h3>Automatically Collected Information:</h3>
                        <ul>
                            <li>IP address and browser type</li>
                            <li>Device information</li>
                            <li>Usage data and analytics</li>
                            <li>Location data (with your permission)</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Process and deliver your orders</li>
                            <li>Communicate with you about your orders and account</li>
                            <li>Improve our services and user experience</li>
                            <li>Send promotional communications (with your consent)</li>
                            <li>Prevent fraud and enhance security</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Information Sharing</h2>
                        <p>We may share your information with:</p>
                        <ul>
                            <li><strong>Restaurants:</strong> To fulfill your orders</li>
                            <li><strong>Delivery Partners:</strong> To deliver your orders</li>
                            <li><strong>Payment Processors:</strong> To process payments securely</li>
                            <li><strong>Service Providers:</strong> Who assist in operating our platform</li>
                            <li><strong>Legal Authorities:</strong> When required by law</li>
                        </ul>
                        <p>We do not sell your personal information to third parties.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your information</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Data portability</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences.
                        </p>
                        <h3>Types of cookies we use:</h3>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for the website to function</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
                            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Children's Privacy</h2>
                        <p>
                            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Third-Party Links</h2>
                        <p>
                            Our service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>12. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>13. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy, please contact us at:
                        </p>
                        <ul>
                            <li>Email: sreekar234@gmail.com</li>
                            <li>Phone: +91 7070824102</li>
                            <li>Address: 123 Food Street, Culinary City, FC 12345</li>
                        </ul>
                    </section>
                </motion.div>
            </div>
        </div>
    )
}
