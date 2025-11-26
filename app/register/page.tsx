'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardBody } from '@/components/ui/Card'
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
            <div className={styles.authContainer}>
                <Card className={styles.authCard}>
                    <CardBody>
                        <div className={styles.authHeader}>
                            <h1>Create Account</h1>
                            <p className="text-secondary">Join us and start ordering</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.authForm}>
                            {error && (
                                <div className={styles.errorAlert}>
                                    {error}
                                </div>
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

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={loading}
                                disabled={loading}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className={styles.authFooter}>
                            <p>
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary font-semibold">
                                    Sign in
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
