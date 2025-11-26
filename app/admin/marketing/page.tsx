'use client'

import { useState } from 'react'
import { FaPaperPlane, FaUsers } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'
import styles from './Marketing.module.css'

export default function MarketingPage() {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [targetAudience, setTargetAudience] = useState('all')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)

        try {
            // Get the current session to extract the access token
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error('You must be logged in to send emails')
            }

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    subject,
                    message,
                    targetAudience,
                }),
            })

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send email')
                }
                setStatus({ type: 'success', message: 'Emails sent successfully!' })
                setSubject('')
                setMessage('')
            } else {
                // If not JSON, it's likely an error page or redirect
                const text = await response.text()
                console.error('Non-JSON response:', text)
                throw new Error('Server returned an unexpected response. Please check console for details.')
            }

        } catch (error: any) {
            console.error('Send email error:', error)
            setStatus({ type: 'error', message: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Email Marketing</h1>
                <p>Send updates, discounts, and announcements to your users.</p>
            </div>

            <div className={styles.content}>
                <form onSubmit={handleSend} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="audience">Target Audience</label>
                        <div className={styles.selectWrapper}>
                            <FaUsers className={styles.icon} />
                            <select
                                id="audience"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                className={styles.select}
                            >
                                <option value="all">All Registered Users</option>
                                {/* Add more options here later, e.g., "Active Users", "Inactive Users" */}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="subject">Subject Line</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., 50% OFF This Weekend Only!"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="message">Message Content</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                            required
                            rows={10}
                            className={styles.textarea}
                        />
                        <p className={styles.hint}>HTML tags are not supported in this version. Plain text only.</p>
                    </div>

                    {status && (
                        <div className={`${styles.status} ${styles[status.type]}`}>
                            {status.message}
                        </div>
                    )}

                    <button type="submit" className={styles.sendBtn} disabled={loading}>
                        {loading ? 'Sending...' : (
                            <>
                                <FaPaperPlane /> Send Campaign
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
