'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import AnimatedButton from '@/components/ui/AnimatedButton'
import Input from '@/components/ui/Input'
import styles from './auth.module.css'

export default function RegisterPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const { error } = await signUp(email, password, fullName)
            if (error) {
                setError(error.message)
            } else {
                router.push('/menu')
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
                        src="https://images.unsplash.com/photo-1615719413546-198b25453f85?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
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
                            Create Account
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Join thousands of food lovers
                        </motion.p>
                    </div>

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
                            id="fullName"
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            helperText="At least 6 characters"
                        />

                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <AnimatedButton
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                            disabled={loading}
                        >
                            Create Account
                        </AnimatedButton>
                    </form>

                    <div className={styles.authFooter}>
                        <p>
                            Already have an account?{' '}
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
