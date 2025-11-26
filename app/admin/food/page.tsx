'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUtensils } from 'react-icons/fa'
import Loader from '@/components/ui/Loader'
import ImageUpload from '@/components/admin/ImageUpload'
import styles from './FoodItems.module.css'

interface Category {
    id: string
    name: string
}

interface FoodItem {
    id: string
    category_id: string
    name: string
    description: string
    base_price: number
    current_price: number
    image_url: string
    is_available: boolean
    is_vegetarian: boolean
    is_vegan: boolean
    preparation_time: number
    calories: number
    categories?: Category // Joined data
}

export default function AdminFood() {
    const [items, setItems] = useState<FoodItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null)

    const initialFormState = {
        category_id: '',
        name: '',
        description: '',
        base_price: 0,
        current_price: 0,
        image_url: '',
        is_available: true,
        is_vegetarian: false,
        is_vegan: false,
        preparation_time: 15,
        calories: 0
    }

    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch categories
            const { data: categoriesData } = await supabase
                .from('categories')
                .select('id, name')
                .order('name')

            if (categoriesData) setCategories(categoriesData)

            // Fetch food items
            const { data: itemsData, error } = await supabase
                .from('food_items')
                .select(`
                    *,
                    categories (
                        id,
                        name
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setItems(itemsData || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Ensure current_price matches base_price if not set specifically (simple logic for now)
            const dataToSave = {
                ...formData,
                current_price: formData.current_price || formData.base_price
            }

            if (editingItem) {
                const { error } = await supabase
                    .from('food_items')
                    .update(dataToSave)
                    .eq('id', editingItem.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('food_items')
                    .insert([dataToSave])

                if (error) throw error
            }

            await fetchData()
            closeModal()
        } catch (error) {
            console.error('Error saving item:', error)
            alert('Failed to save item')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const { error } = await supabase
                .from('food_items')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchData()
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Failed to delete item')
        }
    }

    const openModal = (item?: FoodItem) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                category_id: item.category_id,
                name: item.name,
                description: item.description || '',
                base_price: item.base_price,
                current_price: item.current_price,
                image_url: item.image_url || '',
                is_available: item.is_available,
                is_vegetarian: item.is_vegetarian,
                is_vegan: item.is_vegan,
                preparation_time: item.preparation_time || 15,
                calories: item.calories || 0
            })
        } else {
            setEditingItem(null)
            setFormData({
                ...initialFormState,
                category_id: categories.length > 0 ? categories[0].id : ''
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter
        return matchesSearch && matchesCategory
    })

    if (loading && !isModalOpen) return <Loader />

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Food Items</h1>
                <button className={styles.addButton} onClick={() => openModal()}>
                    <FaPlus /> Add Item
                </button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search food items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.grid}>
                {filteredItems.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} />
                            ) : (
                                <div className={styles.noImage}>
                                    <FaUtensils />
                                </div>
                            )}
                            <div className={styles.priceTag}>
                                ${item.current_price.toFixed(2)}
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3>{item.name}</h3>
                                {item.categories && (
                                    <span className={styles.categoryBadge}>
                                        {item.categories.name}
                                    </span>
                                )}
                            </div>
                            <p className={styles.description}>{item.description}</p>

                            <div className={styles.meta}>
                                {item.is_vegetarian && <span className={`${styles.tag} ${styles.veg}`}>Veg</span>}
                                {item.is_vegan && <span className={`${styles.tag} ${styles.vegan}`}>Vegan</span>}
                                <span className={styles.tag}>{item.calories} cal</span>
                                <span className={styles.tag}>{item.preparation_time} min</span>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.status}>
                                    <div className={`${styles.statusDot} ${item.is_available ? styles.available : styles.unavailable}`} />
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                </div>
                                <div className={styles.actions}>
                                    <button onClick={() => openModal(item)} className={styles.editBtn}>
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{editingItem ? 'Edit Item' : 'New Food Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.base_price}
                                        onChange={e => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Image</label>
                                    <ImageUpload
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Prep Time (min)</label>
                                    <input
                                        type="number"
                                        value={formData.preparation_time}
                                        onChange={e => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Calories</label>
                                    <input
                                        type="number"
                                        value={formData.calories}
                                        onChange={e => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <div className={styles.checkboxGroup}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_available}
                                                onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                                            />
                                            Available
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_vegetarian}
                                                onChange={e => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                                            />
                                            Vegetarian
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_vegan}
                                                onChange={e => setFormData({ ...formData, is_vegan: e.target.checked })}
                                            />
                                            Vegan
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
