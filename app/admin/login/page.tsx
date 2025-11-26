'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardBody } from '@/components/ui/Card'
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
            <div className={styles.authContainer}>
                <Card className={styles.authCard}>
                    <CardBody>
                        <div className={styles.authHeader}>
                            <h1>Admin Login</h1>
                            <p className="text-secondary">Access the FoodZy admin dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.authForm}>
                            {error && (
                                <div className={styles.errorAlert}>
                                    {error}
                                </div>
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
                                <a href="/login" className="text-primary font-semibold">
                                    User Login
                                </a>
                            </p>
                        </div>

                        <div className={styles.backHome}>
                            <a href="/">← Back to Home</a>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
