'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaShoppingBag, FaLeaf, FaUtensils } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loader from '@/components/ui/Loader'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './menu.module.css'

interface FoodItem {
    id: string
    name: string
    description: string
    current_price: number
    image_url: string
    is_available: boolean
    is_vegetarian: boolean
    is_vegan: boolean
    category_id: string
    categories: {
        name: string
    }
}

// Helper function to get category-specific Unsplash image IDs
const getCategoryImageId = (categoryName: string): string => {
    const imageMap: { [key: string]: string } = {
        'Pizza': '1565299624946-b28f40a0ae38',
        'Burgers': '1568901346375-23c9450c58cd',
        'Sushi': '1579584425555-c3ce17fd4351',
        'Desserts': '1551024506-0bccd828d307',
        'Salads': '1512621776951-a57141f2eefd',
        'Pasta': '1621996346565-e3dbc646d9a9',
        'Beverages': '1544145945-f90425340c7e',
        'Appetizers': '1541529086209-51b2f0f155d4'
    }

    return imageMap[categoryName] || '1504674900247-0877df9cc836'
}

export default function MenuPage() {
    const { addItem } = useCart()
    const { t } = useLanguage()
    const searchParams = useSearchParams()
    const [foodItems, setFoodItems] = useState<FoodItem[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const categoryParam = searchParams.get('category')
        if (categoryParam) {
            setSelectedCategory(categoryParam)
        }
        fetchCategories()
        fetchFoodItems()
    }, [searchParams])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        if (data) setCategories(data)
    }

    const fetchFoodItems = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('food_items')
            .select(`
        *,
        categories (name)
      `)
            .eq('is_available', true)

        if (data) setFoodItems(data as any)
        setLoading(false)
    }

    const filteredItems = foodItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleAddToCart = async (item: FoodItem) => {
        await addItem(item.id, 1, item.current_price)
        // Could add a toast notification here
    }

    if (loading) {
        return <Loader fullScreen />
    }

    return (
        <div className={styles.menuPage}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.heroVideo}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                    }}
                >
                    <source src="/videos/FoodZy2.mp4" type="video/mp4" />
                </video>
                <div className={styles.heroContent} style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {t('menu.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {t('menu.subtitle')}
                    </motion.p>
                </div>
            </div>

            {/* Featured Categories */}
            <div className="container">
                <h2 className={styles.sectionTitle}>{t('menu.featured')}</h2>
                <div className={styles.featuredCategories}>
                    {categories.slice(0, 4).map(category => (
                        <div
                            key={category.id}
                            className={styles.categoryCard}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <img
                                src={category.image_url || `https://images.unsplash.com/photo-${getCategoryImageId(category.name)}?w=400&h=300&fit=crop&q=80`}
                                alt={category.name}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                }}
                            />
                            <div className={styles.categoryOverlay}>
                                <h3>{category.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trending Items */}
            <div className="container">
                <div className={styles.trendingSection}>
                    <h2 className={styles.sectionTitle}>{t('menu.trending')}</h2>
                    <div className={styles.trendingScroll}>
                        {foodItems.slice(0, 5).map(item => (
                            <div key={item.id} className={styles.trendingItem}>
                                <div className={styles.foodCard}>
                                    <div className={styles.foodImageWrapper}>
                                        <img
                                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                            alt={item.name}
                                            className={styles.foodImage}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                            }}
                                        />
                                        <div className={styles.badges}>
                                            {item.is_vegetarian && (
                                                <span className={`${styles.badge} ${styles.veg}`}>
                                                    <FaLeaf /> Veg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div className={styles.foodHeader}>
                                            <h3 className={styles.foodName} style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                                            <span className={styles.foodPrice}>₹{item.current_price.toFixed(2)}</span>
                                        </div>
                                        <button
                                            className={styles.addToCartBtn}
                                            onClick={() => handleAddToCart(item)}
                                            style={{ padding: '0.5rem' }}
                                        >
                                            <FaShoppingBag /> {t('cart.add')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Header */}
            <div className={styles.stickyHeader}>
                <div className="container">
                    <div className={styles.controlsContainer}>
                        {/* Categories */}
                        <div className={styles.categoryScroll}>
                            <button
                                className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                {t('menu.all')}
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className={styles.searchContainer}>
                            <Input
                                type="text"
                                placeholder={t('menu.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={<FaSearch />}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Food Grid */}
            <div className="container">
                <h2 className={styles.sectionTitle}>{t('menu.full')}</h2>
                <AnimatePresence mode='wait'>
                    {filteredItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={styles.emptyState}
                        >
                            <div className={styles.emptyStateIcon}>
                                <FaUtensils />
                            </div>
                            <h3>No items found</h3>
                            <p>Try adjusting your search or filters to find what you're looking for.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className={styles.foodGrid}
                        >
                            {filteredItems.map(item => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={item.id}
                                >
                                    <div className={styles.foodCard}>
                                        <div className={styles.foodImageWrapper}>
                                            <img
                                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                                alt={item.name}
                                                className={styles.foodImage}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                }}
                                            />
                                            <div className={styles.badges}>
                                                {item.is_vegetarian && (
                                                    <span className={`${styles.badge} ${styles.veg}`}>
                                                        <FaLeaf /> Veg
                                                    </span>
                                                )}
                                                {item.is_vegan && (
                                                    <span className={`${styles.badge} ${styles.vegan}`}>
                                                        <FaLeaf /> Vegan
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.foodHeader}>
                                                <h3 className={styles.foodName}>{item.name}</h3>
                                                <span className={styles.foodPrice}>
                                                    ₹{item.current_price.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className={styles.foodDescription}>
                                                {item.description || 'A delicious choice from our menu.'}
                                            </p>
                                            <button
                                                className={styles.addToCartBtn}
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                <FaShoppingBag /> {t('cart.add')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Info Section */}
            <div className={styles.infoSection}>
                <div className="container">
                    <div className={styles.benefitsGrid}>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🚀</div>
                            <h3>{t('home.feature.fast')}</h3>
                            <p>Hot and fresh food delivered to your doorstep in under 30 minutes.</p>
                        </div>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🥗</div>
                            <h3>Fresh Ingredients</h3>
                            <p>We use only the finest and freshest ingredients for our dishes.</p>
                        </div>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>💝</div>
                            <h3>Best Offers</h3>
                            <p>Enjoy great discounts and exclusive deals on your favorite meals.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
