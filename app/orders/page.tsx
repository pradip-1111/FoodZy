'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import styles from './orders.module.css'

interface Order {
    id: string
    created_at: string
    total_amount: number
    status: string
}

export default function OrdersPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setOrders(data || [])
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()

        // Real-time subscription
        const subscription = supabase
            .channel('orders')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `user_id=eq.${user.id}`
            }, payload => {
                fetchOrders()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    if (!user) {
        return (
            <div className={`container ${styles.ordersPage}`}>
                <div className={styles.emptyState}>
                    <h2>Please login to view your orders</h2>
                    <Link href="/login" className={styles.viewBtn}>Login</Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.ordersPage}>
            <div className="container">
                <h1 className={styles.title}>{t('nav.orders')}</h1>

                {loading ? (
                    <div>Loading...</div>
                ) : orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h2>No orders found</h2>
                        <Link href="/menu" className={styles.viewBtn}>Start Ordering</Link>
                    </div>
                ) : (
                    <div className={styles.ordersList}>
                        {orders.map((order) => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div>
                                        <div className={styles.orderId}>Order #{order.id.slice(0, 8)}</div>
                                        <div className={styles.orderDate}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(/\s/g, '')]}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className={styles.orderDetails}>
                                    <div className={styles.orderTotal}>
                                        ${order.total_amount.toFixed(2)}
                                    </div>
                                    <Link href={`/orders/${order.id}`} className={styles.viewBtn}>
                                        {t('order.track')}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
