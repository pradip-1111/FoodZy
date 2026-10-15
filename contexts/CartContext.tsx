'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'

interface CartItem {
    id: string
    food_item_id: string
    quantity: number
    price_at_add: number
    food_item?: {
        name: string
        image_url: string
        current_price: number
        is_available: boolean
    }
}

interface CartContextType {
    items: CartItem[]
    loading: boolean
    itemCount: number
    total: number
    addItem: (foodItemId: string, quantity: number, price: number) => Promise<void>
    removeItem: (cartItemId: string) => Promise<void>
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)

    const GUEST_CART_KEY = 'foodzy_guest_cart'

    const getLocalCart = (): CartItem[] => {
        if (typeof window === 'undefined') return []
        try {
            const raw = localStorage.getItem(GUEST_CART_KEY)
            return raw ? JSON.parse(raw) : []
        } catch {
            return []
        }
    }

    const saveLocalCart = (cartItems: CartItem[]) => {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems))
        } catch (e) {
            console.error('Failed to save guest cart:', e)
        }
    }

    const refreshCart = async () => {
        if (!user) {
            setItems(getLocalCart())
            setLoading(false)
            return
        }

        try {
            // Check if there are guest items to merge
            const guestItems = getLocalCart()
            if (guestItems.length > 0) {
                for (const gItem of guestItems) {
                    await supabase.from('cart_items').insert({
                        user_id: user.id,
                        food_item_id: gItem.food_item_id,
                        quantity: gItem.quantity,
                        price_at_add: gItem.price_at_add,
                    })
                }
                localStorage.removeItem(GUEST_CART_KEY)
            }

            const { data, error } = await supabase
                .from('cart_items')
                .select(`
          *,
          food_item:food_items(name, image_url, current_price, is_available)
        `)
                .eq('user_id', user.id)

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error('Error fetching cart:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshCart()
    }, [user])

    const addItem = async (foodItemId: string, quantity: number, price: number) => {
        if (!user) {
            // Guest mode: save to localStorage
            try {
                const currentItems = getLocalCart()
                const existingIndex = currentItems.findIndex(i => i.food_item_id === foodItemId)

                if (existingIndex > -1) {
                    currentItems[existingIndex].quantity += quantity
                } else {
                    // Fetch food item info for guest cart preview
                    const { data: foodItem } = await supabase
                        .from('food_items')
                        .select('name, image_url, current_price, is_available')
                        .eq('id', foodItemId)
                        .maybeSingle()

                    currentItems.push({
                        id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                        food_item_id: foodItemId,
                        quantity,
                        price_at_add: price,
                        food_item: foodItem || {
                            name: 'Food Item',
                            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
                            current_price: price,
                            is_available: true
                        }
                    })
                }

                saveLocalCart(currentItems)
                setItems([...currentItems])
            } catch (err) {
                console.error('Error adding guest item:', err)
            }
            return
        }

        try {
            // Check if item already exists in cart
            const existingItem = items.find(item => item.food_item_id === foodItemId)

            if (existingItem) {
                // Update quantity
                await updateQuantity(existingItem.id, existingItem.quantity + quantity)
            } else {
                // Add new item
                const { error } = await supabase.from('cart_items').insert({
                    user_id: user.id,
                    food_item_id: foodItemId,
                    quantity,
                    price_at_add: price,
                })

                if (error) throw error
                await refreshCart()
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert('Failed to add item to cart')
        }
    }

    const removeItem = async (cartItemId: string) => {
        if (!user) {
            const currentItems = getLocalCart().filter(i => i.id !== cartItemId)
            saveLocalCart(currentItems)
            setItems(currentItems)
            return
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId)

            if (error) throw error
            await refreshCart()
        } catch (error) {
            console.error('Error removing from cart:', error)
            alert('Failed to remove item from cart')
        }
    }

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeItem(cartItemId)
            return
        }

        if (!user) {
            const currentItems = getLocalCart().map(i => i.id === cartItemId ? { ...i, quantity } : i)
            saveLocalCart(currentItems)
            setItems(currentItems)
            return
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', cartItemId)

            if (error) throw error
            await refreshCart()
        } catch (error) {
            console.error('Error updating quantity:', error)
            alert('Failed to update quantity')
        }
    }

    const clearCart = async () => {
        if (!user) {
            if (typeof window !== 'undefined') localStorage.removeItem(GUEST_CART_KEY)
            setItems([])
            return
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)

            if (error) throw error
            setItems([])
        } catch (error) {
            console.error('Error clearing cart:', error)
        }
    }

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const total = items.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0)

    return (
        <CartContext.Provider
            value={{
                items,
                loading,
                itemCount,
                total,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
