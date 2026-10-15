'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaShoppingBag, FaLeaf, FaUtensils, FaTimes, FaFire } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/client'
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
    calories: number | null
    protein_g: number | null
    categories: {
        name: string
    }
}

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

function HighlightText({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    const parts = text.split(regex)
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className={styles.highlight}>{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    )
}

const NUTRITION_MAP: { [key: string]: { calories: number; protein: number } } = {
    'butter chicken': { calories: 490, protein: 35 },
    'chicken biryani': { calories: 620, protein: 40 },
    'paneer tikka': { calories: 380, protein: 22 },
    'dal makhani': { calories: 320, protein: 14 },
    'masala dosa': { calories: 290, protein: 8 },
    'chole bhature': { calories: 560, protein: 16 },
    'palak paneer': { calories: 310, protein: 18 },
    'veg biryani': { calories: 480, protein: 10 },
    'samosa (2 pcs)': { calories: 260, protein: 6 },
    'samosa': { calories: 260, protein: 6 },
    'pav bhaji': { calories: 420, protein: 10 },
    'kadai paneer': { calories: 370, protein: 20 },
    'tandoori chicken': { calories: 350, protein: 48 },
    'gulab jamun': { calories: 320, protein: 4 },
    'fresh mango lassi': { calories: 180, protein: 4 },
    'mango lassi': { calories: 180, protein: 4 },
    'classic cheeseburger': { calories: 680, protein: 32 },
    'bbq bacon burger': { calories: 820, protein: 42 },
    'mushroom swiss burger': { calories: 710, protein: 35 },
    'veggie burger': { calories: 520, protein: 18 },
    'double smash burger': { calories: 950, protein: 58 },
    'spicy jalapeno burger': { calories: 740, protein: 34 },
    'crispy chicken burger': { calories: 640, protein: 38 },
    'margherita pizza': { calories: 760, protein: 24 },
    'pepperoni feast': { calories: 900, protein: 38 },
    'bbq chicken pizza': { calories: 870, protein: 42 },
    'four cheese pizza': { calories: 920, protein: 36 },
    'veggie supreme pizza': { calories: 680, protein: 20 },
    'truffle mushroom pizza': { calories: 840, protein: 28 },
    'salmon nigiri': { calories: 180, protein: 12 },
    'california roll': { calories: 220, protein: 10 },
    'spicy tuna roll': { calories: 260, protein: 18 },
    'veggie maki': { calories: 150, protein: 4 },
    'dragon roll': { calories: 340, protein: 16 },
    'chocolate lava cake': { calories: 480, protein: 6 },
    'mango sorbet': { calories: 140, protein: 1 },
    'new york cheesecake': { calories: 420, protein: 7 },
    'tiramisu': { calories: 390, protein: 6 },
    'spaghetti bolognese': { calories: 720, protein: 34 },
    'penne arrabbiata': { calories: 560, protein: 16 },
    'fettuccine alfredo': { calories: 780, protein: 22 },
    'chicken pesto pasta': { calories: 690, protein: 38 },
    'mushroom risotto': { calories: 620, protein: 16 },
    'caesar salad': { calories: 380, protein: 14 },
    'greek salad': { calories: 290, protein: 10 },
    'quinoa power bowl': { calories: 420, protein: 18 },
    'grilled chicken salad': { calories: 340, protein: 30 },
    'cold brew coffee': { calories: 20, protein: 1 },
    'watermelon mint cooler': { calories: 80, protein: 1 },
    'chocolate milkshake': { calories: 480, protein: 8 },
}

function getNutrition(name: string, isVeg: boolean, dbCalories?: number | null, dbProtein?: number | null) {
    const key = name.toLowerCase().trim()
    const lookup = NUTRITION_MAP[key]
    const calories = dbCalories || lookup?.calories || (isVeg ? 380 : 540)
    const protein = dbProtein || lookup?.protein || (isVeg ? 14 : 28)
    return { calories, protein }
}

function NutritionBadge({ name, isVeg, calories, protein }: { name: string; isVeg: boolean; calories: number | null; protein: number | null }) {
    const info = getNutrition(name, isVeg, calories, protein)
    return (
        <div className={styles.nutritionBar}>
            <span className={styles.nutritionItem}>
                <span className={styles.nutritionIcon}>🔥</span>
                <span className={styles.nutritionValue}>{info.calories}</span>
                <span className={styles.nutritionLabel}>kcal</span>
            </span>
            <span className={styles.nutritionItem}>
                <span className={styles.nutritionIcon}>💪</span>
                <span className={styles.nutritionValue}>{info.protein}g</span>
                <span className={styles.nutritionLabel}>protein</span>
            </span>
        </div>
    )
}


export default function MenuPage() {
    const { addItem } = useCart()
    const { t } = useLanguage()
    const searchParams = useSearchParams()
    const [foodItems, setFoodItems] = useState<FoodItem[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [dropdownQuery, setDropdownQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [showDropdown, setShowDropdown] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
    const searchInputRef = useRef<HTMLInputElement>(null)
    const dropdownContainerRef = useRef<HTMLDivElement>(null)



    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
                setActiveIndex(-1)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const categoryParam = searchParams.get('category')
        if (categoryParam) setSelectedCategory(categoryParam)
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
            .select(`*, categories (name)`)
            .eq('is_available', true)
        if (data) setFoodItems(data as any)
        setLoading(false)
    }

    // Instant dropdown suggestions (pure in-memory, no debounce needed)
    const dropdownResults = useMemo(() => {
        const q = dropdownQuery.trim().toLowerCase()
        if (!q) return []
        return foodItems
            .filter(item =>
                item.name.toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q) ||
                (item.categories?.name || '').toLowerCase().includes(q)
            )
            .slice(0, 8)
    }, [dropdownQuery, foodItems])

    // Grid filter — live, instant client-side
    const filteredItems = useMemo(() => foodItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
        const q = searchQuery.trim().toLowerCase()
        const matchesSearch = !q ||
            item.name.toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.categories?.name || '').toLowerCase().includes(q)
        return matchesCategory && matchesSearch
    }), [foodItems, selectedCategory, searchQuery])

    const handleDropdownInput = (value: string) => {
        setDropdownQuery(value)
        setSearchQuery(value) // live grid filter as you type
        setActiveIndex(-1)
        setShowDropdown(value.trim().length > 0)
    }

    const commitSearch = (query: string) => {
        setSearchQuery(query)
        setDropdownQuery(query)
        setShowDropdown(false)
        setActiveIndex(-1)
        setTimeout(() => {
            document.getElementById('food-grid-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    const clearSearch = () => {
        setSearchQuery('')
        setDropdownQuery('')
        setShowDropdown(false)
        setActiveIndex(-1)
        searchInputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || dropdownResults.length === 0) {
            if (e.key === 'Enter') commitSearch(dropdownQuery)
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => Math.min(prev + 1, dropdownResults.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => Math.max(prev - 1, -1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0 && dropdownResults[activeIndex]) {
                commitSearch(dropdownResults[activeIndex].name)
            } else {
                commitSearch(dropdownQuery)
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false)
            setActiveIndex(-1)
        }
    }

    const handleAddToCart = async (item: FoodItem) => {
        await addItem(item.id, 1, item.current_price)
        setAddedItems(prev => new Set(prev).add(item.id))
        setTimeout(() => {
            setAddedItems(prev => {
                const next = new Set(prev)
                next.delete(item.id)
                return next
            })
        }, 1500)
    }

    if (loading) return <Loader fullScreen />

    return (
        <div className={styles.menuPage}>
            {/* Hero with Big Search */}
            <div className={styles.hero}>
                <video autoPlay loop muted playsInline className={styles.heroVideo}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
                    <source src="/videos/FoodZy2.mp4" type="video/mp4" />
                </video>
                <div className={styles.heroContent} style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {t('menu.title')}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                        {t('menu.subtitle')}
                    </motion.p>

                    {/* Hero Search Bar */}
                    <motion.div
                        className={styles.heroSearchWrapper}
                        ref={dropdownContainerRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className={styles.heroSearchBar}>
                            <FaSearch className={styles.heroSearchIcon} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className={styles.heroSearchInput}
                                placeholder="Search for burger, pizza, sushi..."
                                value={dropdownQuery}
                                onChange={e => handleDropdownInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => dropdownQuery.trim() && setShowDropdown(true)}
                                autoComplete="off"
                            />
                            {dropdownQuery && (
                                <button className={styles.clearBtn} onClick={clearSearch} tabIndex={-1}>
                                    <FaTimes />
                                </button>
                            )}
                            <button className={styles.heroSearchBtn} onClick={() => commitSearch(dropdownQuery)}>
                                Search
                            </button>
                        </div>

                        {/* Instant Dropdown */}
                        <AnimatePresence>
                            {showDropdown && dropdownResults.length > 0 && (
                                <motion.div
                                    className={styles.searchDropdown}
                                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    style={{ transformOrigin: 'top' }}
                                >
                                    <div className={styles.dropdownHeader}>
                                        <FaFire className={styles.dropdownHeaderIcon} />
                                        <span>{dropdownResults.length} result{dropdownResults.length !== 1 ? 's' : ''} found</span>
                                    </div>
                                    {dropdownResults.map((item, idx) => (
                                        <button
                                            key={item.id}
                                            className={`${styles.dropdownItem} ${idx === activeIndex ? styles.dropdownItemActive : ''}`}
                                            onClick={() => commitSearch(item.name)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                        >
                                            <img
                                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop&q=80'}
                                                alt={item.name}
                                                className={styles.dropdownItemImage}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop&q=80' }}
                                            />
                                            <div className={styles.dropdownItemInfo}>
                                                <span className={styles.dropdownItemName}>
                                                    <HighlightText text={item.name} query={dropdownQuery} />
                                                </span>
                                                <span className={styles.dropdownItemMeta}>
                                                    {item.categories?.name} &bull; ₹{(item.current_price ?? 0).toFixed(0)}
                                                    {item.is_vegetarian && <span className={styles.vegDot}> 🟢 Veg</span>}
                                                </span>
                                            </div>
                                            <button
                                                className={styles.dropdownAddBtn}
                                                onClick={e => { e.stopPropagation(); handleAddToCart(item) }}
                                                title="Add to cart"
                                            >
                                                <FaShoppingBag />
                                            </button>
                                        </button>
                                    ))}
                                    <button className={styles.dropdownViewAll} onClick={() => commitSearch(dropdownQuery)}>
                                        View all results for &ldquo;{dropdownQuery}&rdquo; →
                                    </button>
                                </motion.div>
                            )}
                            {showDropdown && dropdownQuery.trim() && dropdownResults.length === 0 && (
                                <motion.div
                                    className={styles.searchDropdown}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className={styles.dropdownEmpty}>
                                        <FaUtensils style={{ marginRight: 8 }} />
                                        No results for &ldquo;{dropdownQuery}&rdquo;
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick Tags */}
                        <motion.div className={styles.quickTags} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                            {['🍕 Pizza', '🍔 Burger', '🍛 Indian', '🍣 Sushi', '🥗 Salad', '🍝 Pasta'].map(tag => (
                                <button key={tag} className={styles.quickTag} onClick={() => commitSearch(tag.split(' ')[1])}>
                                    {tag}
                                </button>
                            ))}

                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Active Search Banner */}
            <AnimatePresence>
                {searchQuery && (
                    <motion.div className={styles.searchBanner}
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                            <span>
                                <strong>{filteredItems.length}</strong> result{filteredItems.length !== 1 ? 's' : ''} for <strong>&ldquo;{searchQuery}&rdquo;</strong>
                            </span>
                            <button className={styles.clearSearchBtn} onClick={clearSearch}>
                                <FaTimes /> Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Featured Categories (hidden during search) */}
            {!searchQuery && (
                <div className="container">
                    <h2 className={styles.sectionTitle}>{t('menu.featured')}</h2>
                    <div className={styles.featuredCategories}>
                        {categories.slice(0, 4).map(category => (
                            <div key={category.id} className={styles.categoryCard} onClick={() => setSelectedCategory(category.id)}>
                                <img
                                    src={category.image_url || `https://images.unsplash.com/photo-${getCategoryImageId(category.name)}?w=400&h=300&fit=crop&q=80`}
                                    alt={category.name}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop&q=80' }}
                                />
                                <div className={styles.categoryOverlay}><h3>{category.name}</h3></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trending (hidden during search) */}
            {!searchQuery && (
                <div className="container">
                    <div className={styles.trendingSection}>
                        <h2 className={styles.sectionTitle}>{t('menu.trending')}</h2>
                        <div className={styles.trendingScroll}>
                            {foodItems.slice(0, 5).map(item => (
                                <div key={item.id} className={styles.trendingItem}>
                                    <div className={styles.foodCard}>
                                        <div className={styles.foodImageWrapper}>
                                            <img
                                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop&q=80'}
                                                alt={item.name}
                                                className={styles.foodImage}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop&q=80' }}
                                            />
                                            <div className={styles.badges}>
                                                {item.is_vegetarian && <span className={`${styles.badge} ${styles.veg}`}><FaLeaf /> Veg</span>}
                                            </div>
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.foodHeader}>
                                                <h3 className={styles.foodName} style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                                                <span className={styles.foodPrice}>₹{(item.current_price ?? 0).toFixed(0)}</span>
                                            </div>
                                            <NutritionBadge name={item.name} isVeg={item.is_vegetarian} calories={item.calories} protein={item.protein_g} />
                                            <button
                                                className={`${styles.addToCartBtn} ${addedItems.has(item.id) ? styles.addedBtn : ''}`}
                                                onClick={() => handleAddToCart(item)}
                                                style={{ padding: '0.5rem' }}
                                            >
                                                {addedItems.has(item.id) ? '✓ Added!' : <><FaShoppingBag /> {t('cart.add')}</>}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Filter + Secondary Search */}
            <div className={styles.stickyHeader} id="food-grid-section">
                <div className="container">
                    <div className={styles.controlsContainer}>
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
                        <div className={styles.searchContainer}>
                            <div className={styles.stickySearchBar}>
                                <FaSearch className={styles.stickySearchIcon} />
                                <input
                                    type="text"
                                    className={styles.stickySearchInput}
                                    placeholder="Search menu..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setDropdownQuery(e.target.value) }}
                                />
                                {searchQuery && (
                                    <button className={styles.clearBtnSmall} onClick={clearSearch}><FaTimes /></button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Food Grid */}
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 className={styles.sectionTitle}>{searchQuery ? 'Results' : t('menu.full')}</h2>
                    {filteredItems.length > 0 && (
                        <span className={styles.resultCount}>{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</span>
                    )}
                </div>
                <AnimatePresence mode='wait'>
                    {filteredItems.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}><FaUtensils /></div>
                            <h3>No items found{searchQuery ? ` for "${searchQuery}"` : ''}</h3>
                            <p>Try adjusting your search or filters.</p>
                            {searchQuery && (
                                <button className={styles.clearSearchBtn} onClick={clearSearch} style={{ marginTop: '1rem' }}>
                                    <FaTimes /> Clear search
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div layout className={styles.foodGrid}>
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
                                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop&q=80'}
                                                alt={item.name}
                                                className={styles.foodImage}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop&q=80' }}
                                            />
                                            <div className={styles.badges}>
                                                {item.is_vegetarian && <span className={`${styles.badge} ${styles.veg}`}><FaLeaf /> Veg</span>}
                                                {item.is_vegan && <span className={`${styles.badge} ${styles.vegan}`}><FaLeaf /> Vegan</span>}
                                            </div>
                                        </div>
                                        <div className={styles.cardContent}>
                                            <div className={styles.foodHeader}>
                                                <h3 className={styles.foodName}>
                                                    {searchQuery
                                                        ? <HighlightText text={item.name} query={searchQuery} />
                                                        : item.name}
                                                </h3>
                                                <span className={styles.foodPrice}>₹{(item.current_price ?? 0).toFixed(0)}</span>
                                            </div>
                                            <p className={styles.foodDescription}>
                                                {item.description || 'A delicious choice from our menu.'}
                                            </p>
                                            <NutritionBadge name={item.name} isVeg={item.is_vegetarian} calories={item.calories} protein={item.protein_g} />
                                            <button
                                                className={`${styles.addToCartBtn} ${addedItems.has(item.id) ? styles.addedBtn : ''}`}
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                {addedItems.has(item.id) ? '✓ Added to cart!' : <><FaShoppingBag /> {t('cart.add')}</>}
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
