'use client'

import { motion } from 'framer-motion'
import styles from './legal.module.css'

export default function TermsPage() {
    return (
        <div className={styles.legalPage}>
            <div className="container">
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last Updated: November 28, 2024</p>
                </motion.div>

                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <section className={styles.section}>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using FoodZy's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Use of Service</h2>
                        <p>
                            FoodZy provides an online platform for ordering food from restaurants. You agree to use the service only for lawful purposes and in accordance with these Terms.
                        </p>
                        <h3>You agree not to:</h3>
                        <ul>
                            <li>Use the service in any way that violates any applicable laws or regulations</li>
                            <li>Impersonate or attempt to impersonate FoodZy, a FoodZy employee, another user, or any other person or entity</li>
                            <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
                            <li>Use any robot, spider, or other automatic device to access the service</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Account Registration</h2>
                        <p>
                            To use certain features of our service, you must register for an account. You agree to:
                        </p>
                        <ul>
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Maintain the security of your password and account</li>
                            <li>Accept all responsibility for all activities that occur under your account</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Orders and Payment</h2>
                        <p>
                            All orders placed through FoodZy are subject to acceptance by the restaurant. We reserve the right to refuse or cancel any order for any reason.
                        </p>
                        <h3>Payment Terms:</h3>
                        <ul>
                            <li>Payment is due at the time of order placement</li>
                            <li>We accept major credit cards, debit cards, and other payment methods as displayed</li>
                            <li>Prices are subject to change without notice</li>
                            <li>You are responsible for any applicable taxes</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Delivery</h2>
                        <p>
                            Delivery times are estimates and not guaranteed. FoodZy is not responsible for delays caused by restaurants, traffic, weather, or other circumstances beyond our control.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Cancellations and Refunds</h2>
                        <p>
                            Orders may be cancelled within 5 minutes of placement. After this time, cancellations are subject to restaurant approval. Refunds for cancelled orders will be processed within 5-7 business days.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Intellectual Property</h2>
                        <p>
                            The service and its original content, features, and functionality are owned by FoodZy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Limitation of Liability</h2>
                        <p>
                            FoodZy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FoodZy operates, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <ul>
                            <li>Email: sarrafpradeep857@gmail.com</li>
                            <li>Phone: +91 7070824102</li>
                            <li>Address: 123 Food Street, Culinary City, FC 12345</li>
                        </ul>
                    </section>
                </motion.div>
            </div>
        </div>
    )
}
