'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaArrowLeft, FaCheckCircle, FaTruck, FaBoxOpen, FaClipboardCheck } from 'react-icons/fa'
import styles from '../orders.module.css'

interface OrderItem {
    id: string
    quantity: number
    price_at_order: number
    food_item: {
        name: string
        image_url: string
    }
}

interface Order {
    id: string
    created_at: string
    total_amount: number
    status: string
    order_items: OrderItem[]
}

export default function OrderDetailsPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const { t } = useLanguage()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user || !id) return

        const fetchOrder = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            id,
                            quantity,
                            price_at_order,
                            food_item:food_items(name, image_url)
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (error) throw error
                setOrder(data)
            } catch (error) {
                console.error('Error fetching order:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()

        // Real-time subscription for status updates
        const subscription = supabase
            .channel(`order-${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${id}`
            }, payload => {
                setOrder(prev => prev ? { ...prev, status: payload.new.status } : null)
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user, id])

    if (loading) return <div className="container">Loading...</div>
    if (!order) return <div className="container">Order not found</div>

    const steps = [
        { status: 'pending', icon: FaClipboardCheck, label: 'Order Placed' },
        { status: 'preparing', icon: FaBoxOpen, label: 'Preparing' },
        { status: 'ontheway', icon: FaTruck, label: 'On the Way' },
        { status: 'delivered', icon: FaCheckCircle, label: 'Delivered' }
    ]

    const currentStepIndex = steps.findIndex(s => s.status === order.status.toLowerCase().replace(/\s/g, ''))

    return (
        <div className={styles.ordersPage}>
            <div className="container">
                <Link href="/orders" className={styles.viewBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <FaArrowLeft /> Back to Orders
                </Link>

                <div className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Order #{order.id.slice(0, 8)}</h1>
                            <div className={styles.orderDate}>
                                {new Date(order.created_at).toLocaleString()}
                            </div>
                        </div>
                        <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(/\s/g, '')]}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Tracking Steps */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '40px 0', position: 'relative' }}>
                        {/* Progress Bar Background */}
                        <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '4px', background: '#eee', zIndex: 0 }}></div>
                        {/* Active Progress Bar */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '0',
                            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                            height: '4px',
                            background: 'var(--color-primary)',
                            zIndex: 0,
                            transition: 'width 0.5s ease'
                        }}></div>

                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = index <= currentStepIndex
                            return (
                                <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: isActive ? 'var(--color-primary)' : 'white',
                                        border: `2px solid ${isActive ? 'var(--color-primary)' : '#eee'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isActive ? 'white' : '#ccc',
                                        marginBottom: '8px',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <Icon />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? 'var(--color-text)' : '#ccc' }}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <h3 style={{ marginBottom: '20px' }}>Items</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {order.order_items.map((item) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <img
                                        src={item.food_item?.image_url || 'https://via.placeholder.com/50'}
                                        alt={item.food_item?.name}
                                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{item.food_item?.name}</div>
                                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Qty: {item.quantity}</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700 }}>
                                    ${(item.price_at_order * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total Amount</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            ${order.total_amount.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
