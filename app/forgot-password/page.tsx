'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AnimatedButton from '@/components/ui/AnimatedButton'
import Input from '@/components/ui/Input'
import styles from '../login/auth.module.css'

export default function ForgotPasswordPage() {
    const supabase = createClientComponentClient()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setError(error.message)
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.authPage}>
            {/* Left Side - Visual Showcase */}
            <motion.div
                className={styles.visualSide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className={styles.brandSection}>
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        FoodZy
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        Delicious food, delivered fast
                    </motion.p>
                </div>

                <motion.div
                    className={styles.foodIllustration}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <img
                        src="/food-hero.jpg"
                        alt="Delicious Food"
                        style={{ borderRadius: '20px' }}
                    />
                </motion.div>

                <motion.div
                    className={styles.features}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                >
                    <div className={styles.feature}>
                        <div className={styles.icon}>🚀</div>
                        <h4>Fast Delivery</h4>
                        <p>30 min or less</p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.icon}>⭐</div>
                        <h4>Top Quality</h4>
                        <p>Fresh ingredients</p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.icon}>💝</div>
                        <h4>Great Deals</h4>
                        <p>Save on orders</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Right Side - Form */}
            <div className={styles.formSide}>
                <motion.div
                    className={styles.formContainer}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.authHeader}>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Reset Password
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            {success
                                ? "Check your email for the reset link"
                                : "Enter your email to receive a reset link"
                            }
                        </motion.p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className={styles.authForm}>
                            {error && (
                                <motion.div
                                    className={styles.errorAlert}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Input
                                id="email"
                                type="email"
                                label="Email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <AnimatedButton
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={loading}
                                disabled={loading}
                            >
                                Send Reset Link
                            </AnimatedButton>
                        </form>
                    ) : (
                        <div className={styles.authForm}>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(76, 175, 80, 0.15)',
                                borderLeft: '3px solid #4caf50',
                                borderRadius: 'var(--radius-md)',
                                color: '#81c784',
                                fontSize: 'var(--font-size-sm)'
                            }}>
                                Password reset email sent! Check your inbox and follow the instructions.
                            </div>
                        </div>
                    )}

                    <div className={styles.authFooter}>
                        <p>
                            Remember your password?{' '}
                            <Link href="/login">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className={styles.backHome}>
                        <Link href="/">← Back to Home</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
