'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FaSearch, FaFilter, FaUser, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import Loader from '@/components/ui/Loader'
import styles from './Orders.module.css'

interface OrderItem {
    id: string
    food_item_snapshot: {
        name: string
    }
    quantity: number
    total_price: number
}

interface Order {
    id: string
    order_number: string
    status: string
    total_amount: number
    created_at: string
    user_id: string
    delivery_address_snapshot: {
        label: string
        street_address: string
        city: string
        postal_code: string
    }
    user_profiles: {
        full_name: string
        phone: string
    }
    order_items: OrderItem[]
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

    useEffect(() => {
        fetchOrders()

        // Subscribe to real-time updates
        const channel = supabase
            .channel('admin_orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => fetchOrders()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    user_profiles:user_id (
                        full_name,
                        phone
                    ),
                    order_items (
                        id,
                        quantity,
                        total_price,
                        food_item_snapshot
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            // Also add to history
            await supabase
                .from('order_status_history')
                .insert([{
                    order_id: orderId,
                    status: newStatus,
                    notes: `Status updated to ${newStatus} by admin`
                }])

            setIsStatusModalOpen(false)
            setSelectedOrder(null)
            fetchOrders()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        })
    }

    if (loading) return <Loader />

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Order Management</h1>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by Order # or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className={styles.ordersList}>
                {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        No orders found matching your criteria.
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.orderInfo}>
                                    <h3>Order #{order.order_number}</h3>
                                    <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                                </div>
                                <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.customerInfo}>
                                    <h4>Customer Details</h4>
                                    <div className={styles.customerDetails}>
                                        <p><FaUser /> {order.user_profiles?.full_name || 'Unknown User'}</p>
                                        <p><FaPhone /> {order.user_profiles?.phone || 'No Phone'}</p>
                                        <p><FaMapMarkerAlt /> {order.delivery_address_snapshot?.street_address}, {order.delivery_address_snapshot?.city}</p>
                                    </div>
                                </div>

                                <div className={styles.itemsList}>
                                    <h4>Order Items</h4>
                                    <div className={styles.items}>
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className={styles.item}>
                                                <span>
                                                    <span className={styles.quantity}>{item.quantity}x</span>
                                                    {item.food_item_snapshot.name}
                                                </span>
                                                <span>${item.total_price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.total}>
                                    Total: ${order.total_amount.toFixed(2)}
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionBtn + ' ' + styles.updateBtn}
                                        onClick={() => {
                                            setSelectedOrder(order)
                                            setIsStatusModalOpen(true)
                                        }}
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isStatusModalOpen && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Update Order Status</h2>
                        <div className={styles.statusOptions}>
                            {['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    className={`${styles.statusOption} ${selectedOrder.status === status ? styles.active : ''}`}
                                    onClick={() => updateStatus(selectedOrder.id, status)}
                                >
                                    {status.replace(/_/g, ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setIsStatusModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
