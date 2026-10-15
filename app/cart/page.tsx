'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaTrash, FaShoppingBasket, FaMinus, FaPlus, FaMoneyBillWave, FaCreditCard, FaMobileAlt } from 'react-icons/fa'
import { QRCodeSVG } from 'qrcode.react'
import Input from '@/components/ui/Input'
import styles from './cart.module.css'
import { supabase } from '@/lib/supabase/client'

export default function CartPage() {
    const { items, total, updateQuantity, removeItem, clearCart } = useCart()
    const { t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()
    const [paymentMethod, setPaymentMethod] = useState('cash')

    // Payment State
    const [cardNumber, setCardNumber] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCvc, setCardCvc] = useState('')
    const [upiId, setUpiId] = useState('')
    const [paymentError, setPaymentError] = useState('')

    const handleCheckout = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        setPaymentError('')

        // Validate Payment Details
        if (paymentMethod === 'card') {
            if (!cardNumber || !cardExpiry || !cardCvc) {
                setPaymentError('Please fill in all card details')
                return
            }
        } else if (paymentMethod === 'upi') {
            if (!upiId) {
                setPaymentError('Please enter your UPI ID')
                return
            }
        }

        try {
            console.log('Starting checkout process...')
            console.log('User ID:', user.id)
            console.log('Total amount:', total)
            console.log('Cart items:', items)

            // Fetch user's default address
            const { data: addresses, error: addressError } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_default', true)
                .limit(1)

            if (addressError) {
                console.error('Address fetch error:', addressError)
            }

            // Use default address or fetch any address if no default
            let deliveryAddress = addresses?.[0]

            if (!deliveryAddress) {
                const { data: anyAddress } = await supabase
                    .from('user_addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(1)

                deliveryAddress = anyAddress?.[0]
            }

            // Create address snapshot
            const addressSnapshot = deliveryAddress ? {
                street: deliveryAddress.street_address,
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                postal_code: deliveryAddress.postal_code,
                country: deliveryAddress.country || 'USA',
                latitude: deliveryAddress.latitude,
                longitude: deliveryAddress.longitude
            } : {
                street: 'No address provided',
                city: 'Unknown',
                state: 'Unknown',
                postal_code: '00000',
                country: 'USA',
                latitude: null,
                longitude: null
            }

            console.log('Delivery address snapshot:', addressSnapshot)

            // Generate unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            console.log('Generated order number:', orderNumber)

            // Calculate order amounts
            const subtotal = total
            const deliveryFee = 5.00
            const totalAmount = subtotal + deliveryFee

            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    order_number: orderNumber,
                    subtotal: subtotal,
                    delivery_fee: deliveryFee,
                    total_amount: totalAmount,
                    status: 'pending',
                    payment_status: 'pending',
                    payment_method: paymentMethod,
                    delivery_address_snapshot: addressSnapshot
                })
                .select()
                .single()

            if (orderError) {
                console.error('Order creation error:', orderError)
                throw new Error(`Failed to create order: ${orderError.message}`)
            }

            console.log('Order created successfully:', order)

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                food_item_id: item.food_item_id,
                quantity: item.quantity,
                unit_price: item.price_at_add,
                total_price: item.price_at_add * item.quantity,
                food_item_snapshot: {
                    name: item.food_item?.name || 'Unknown Item',
                    image_url: item.food_item?.image_url || '',
                    price: item.price_at_add
                }
            }))

            console.log('Creating order items:', orderItems)

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) {
                console.error('Order items creation error:', itemsError)
                throw new Error(`Failed to create order items: ${itemsError.message}`)
            }

            console.log('Order items created successfully')

            // Clear cart
            await clearCart()

            console.log('Cart cleared, redirecting to orders page')

            // Redirect to orders page
            router.push('/orders')
        } catch (error: any) {
            console.error('Checkout error:', error)
            alert(`Failed to place order: ${error.message || 'Please try again.'}`)
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
                                            ₹{(item.price_at_add * item.quantity).toFixed(0)}
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
                            <span>₹{total.toFixed(0)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span>₹40</span>
                        </div>

                        <div className={styles.paymentMethods}>
                            <h3 className={styles.paymentTitle}>Payment Method</h3>
                            <div className={styles.paymentOptions}>
                                <label className={`${styles.paymentOption} ${paymentMethod === 'cash' ? styles.active : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.paymentIcon}>
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.paymentName}>Cash on Delivery</span>
                                        <span className={styles.paymentDesc}>Pay when you receive</span>
                                    </div>
                                </label>
                                <label className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.active : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.paymentIcon}>
                                        <FaCreditCard />
                                    </div>
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.paymentName}>Credit/Debit Card</span>
                                        <span className={styles.paymentDesc}>Visa, Mastercard, Amex</span>
                                    </div>
                                </label>
                                <label className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.active : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.paymentIcon}>
                                        <FaMobileAlt />
                                    </div>
                                    <div className={styles.paymentInfo}>
                                        <span className={styles.paymentName}>UPI</span>
                                        <span className={styles.paymentDesc}>Google Pay, PhonePe, Paytm</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Payment Details Inputs */}
                        <div className={styles.paymentDetails}>
                            {paymentMethod === 'card' && (
                                <div className={styles.cardInputs}>
                                    <Input
                                        placeholder="Card Number"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        maxLength={16}
                                    />
                                    <div className={styles.cardRow}>
                                        <Input
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            maxLength={5}
                                        />
                                        <Input
                                            placeholder="CVC"
                                            value={cardCvc}
                                            onChange={(e) => setCardCvc(e.target.value)}
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'upi' && (
                                <div className={styles.upiInputs}>
                                    <Input
                                        placeholder="Enter UPI ID (e.g. user@upi)"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                    />
                                    {upiId && (
                                        <div className={styles.qrCode}>
                                            <p>Scan to Pay</p>
                                            <QRCodeSVG
                                                value={`upi://pay?pa=${upiId}&pn=FoodZy&am=${(total + 40).toFixed(0)}`}
                                                size={128}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {paymentError && (
                                <p className={styles.errorText} style={{ color: 'red', marginTop: '10px' }}>
                                    {paymentError}
                                </p>
                            )}
                        </div>

                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>₹{(total + 40).toFixed(0)}</span>
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
