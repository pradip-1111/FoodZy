'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardBody } from '@/components/ui/Card'
import styles from './auth.module.css'

export default function LoginPage() {
    const router = useRouter()
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error } = await signIn(email, password)
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
            <div className={styles.authContainer}>
                <Card className={styles.authCard}>
                    <CardBody>
                        <div className={styles.authHeader}>
                            <h1>Welcome Back</h1>
                            <p className="text-secondary">Sign in to your account</p>
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
                            />

                            <div className={styles.forgotPassword}>
                                <Link href="/forgot-password">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={loading}
                                disabled={loading}
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className={styles.authFooter}>
                            <p>
                                Don't have an account?{' '}
                                <Link href="/register" className="text-primary font-semibold">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        <div className={styles.backHome}>
                            <Link href="/">← Back to Home</Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
