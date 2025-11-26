'use client'

import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaTrash, FaShoppingBasket, FaMinus, FaPlus } from 'react-icons/fa'
import styles from './cart.module.css'
import { supabase } from '@/lib/supabase/client'

export default function CartPage() {
    const { items, total, updateQuantity, removeItem, clearCart } = useCart()
    const { t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()

    const handleCheckout = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        try {
            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: total,
                    status: 'pending',
                    payment_status: 'pending'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                food_item_id: item.food_item_id,
                quantity: item.quantity,
                price_at_order: item.price_at_add
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // Clear cart
            await clearCart()

            // Redirect to orders page
            router.push('/orders')
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Failed to place order. Please try again.')
        }
    }

    if (items.length === 0) {
        return (
            <div className={`container ${styles.cartPage}`}>
                <div className={styles.emptyCart}>
                    <FaShoppingBasket className={styles.emptyIcon} />
                    <h2 className={styles.emptyText}>{t('cart.empty')}</h2>
                    <Link href="/menu" className={styles.browseBtn}>
                        {t('nav.menu')}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.cartPage}>
            <div className="container">
                <h1 className={styles.title}>{t('nav.cart')}</h1>

                <div className={styles.cartGrid}>
                    <div className={styles.cartItems}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <img
                                    src={item.food_item?.image_url || 'https://via.placeholder.com/100'}
                                    alt={item.food_item?.name}
                                    className={styles.itemImage}
                                />
                                <div className={styles.itemDetails}>
                                    <div className={styles.itemHeader}>
                                        <h3 className={styles.itemName}>{item.food_item?.name}</h3>
                                        <span className={styles.itemPrice}>
                                            ${(item.price_at_add * item.quantity).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className={styles.itemControls}>
                                        <div className={styles.quantityControls}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <FaMinus size={10} />
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                        </div>

                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span>$5.00</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>${(total + 5).toFixed(2)}</span>
                        </div>
                        <button className={styles.checkoutBtn} onClick={handleCheckout}>
                            {t('order.place')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
