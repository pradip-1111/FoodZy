'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import styles from '../../login/auth.module.css'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Sign in with Supabase
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError(signInError.message)
                setLoading(false)
                return
            }

            // Check if user is admin
            const { data: adminData, error: adminError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', data.user.id)
                .single()

            if (adminError || !adminData) {
                setError('Access denied. Admin privileges required.')
                await supabase.auth.signOut()
                setLoading(false)
                return
            }

            // Redirect to admin dashboard
            router.push('/admin/dashboard')
        } catch (err) {
            setError('An unexpected error occurred')
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
                        FoodZy Admin
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        Manage your restaurant with ease
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
                        <div className={styles.icon}>📊</div>
                        <h4>Analytics</h4>
                        <p>Track performance</p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.icon}>🍔</div>
                        <h4>Menu Mgmt</h4>
                        <p>Update items</p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.icon}>🛵</div>
                        <h4>Orders</h4>
                        <p>Track deliveries</p>
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
                            Admin Login
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Access the FoodZy admin dashboard
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
                            id="email"
                            type="email"
                            label="Admin Email"
                            placeholder="admin@foodzy.com"
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
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                            disabled={loading}
                        >
                            Sign In as Admin
                        </Button>
                    </form>

                    <div className={styles.authFooter}>
                        <p>
                            Not an admin?{' '}
                            <Link href="/login" className="text-primary font-semibold">
                                User Login
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
