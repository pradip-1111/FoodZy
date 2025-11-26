'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FaShoppingBag, FaUsers, FaUtensils, FaDollarSign } from 'react-icons/fa'
import Loader from '@/components/ui/Loader'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalUsers: 0,
        totalItems: 0,
        totalRevenue: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            // Fetch total orders
            const { count: ordersCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })

            // Fetch total users
            const { count: usersCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })

            // Fetch total food items
            const { count: itemsCount } = await supabase
                .from('food_items')
                .select('*', { count: 'exact', head: true })

            // Calculate revenue (mock for now as we might not have completed orders)
            // In a real app, we would sum the total_amount of completed orders
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('status', 'delivered')

            const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

            setStats({
                totalOrders: ordersCount || 0,
                totalUsers: usersCount || 0,
                totalItems: itemsCount || 0,
                totalRevenue: revenue
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Loader />

    const statCards = [
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: FaShoppingBag,
            color: '#3b82f6',
            bg: '#eff6ff'
        },
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: FaUsers,
            color: '#10b981',
            bg: '#ecfdf5'
        },
        {
            title: 'Menu Items',
            value: stats.totalItems,
            icon: FaUtensils,
            color: '#f59e0b',
            bg: '#fffbeb'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: FaDollarSign,
            color: '#8b5cf6',
            bg: '#f5f3ff'
        }
    ]

    return (
        <div>
            <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '2rem',
                color: '#1e293b'
            }}>
                Dashboard Overview
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem'
            }}>
                {statCards.map((card, index) => (
                    <div key={index} style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: card.bg,
                            color: card.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            <card.icon />
                        </div>
                        <div>
                            <p style={{
                                margin: 0,
                                fontSize: '0.875rem',
                                color: '#64748b',
                                fontWeight: '500'
                            }}>
                                {card.title}
                            </p>
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#0f172a'
                            }}>
                                {card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#1e293b'
                }}>
                    Recent Activity
                </h2>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#64748b',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <p>No recent activity to show</p>
                </div>
            </div>
        </div>
    )
}
