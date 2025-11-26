'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import Loader from '@/components/ui/Loader'
import ImageUpload from '@/components/admin/ImageUpload'
import styles from './Categories.module.css'

interface Category {
    id: string
    name: string
    description: string
    image_url: string
    display_order: number
    is_active: boolean
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        display_order: 0,
        is_active: true
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update(formData)
                    .eq('id', editingCategory.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([formData])

                if (error) throw error
            }

            await fetchCategories()
            closeModal()
        } catch (error) {
            console.error('Error saving category:', error)
            alert('Failed to save category')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Failed to delete category')
        }
    }

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                description: category.description || '',
                image_url: category.image_url || '',
                display_order: category.display_order,
                is_active: category.is_active
            })
        } else {
            setEditingCategory(null)
            setFormData({
                name: '',
                description: '',
                image_url: '',
                display_order: categories.length + 1,
                is_active: true
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCategory(null)
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && !isModalOpen) return <Loader />

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Categories</h1>
                <button className={styles.addButton} onClick={() => openModal()}>
                    <FaPlus /> Add Category
                </button>
            </div>

            <div className={styles.searchBar}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.grid}>
                {filteredCategories.map((category) => (
                    <div key={category.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>{category.name}</h3>
                            <span className={`${styles.status} ${category.is_active ? styles.active : styles.inactive}`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className={styles.description}>{category.description}</p>
                        <div className={styles.cardFooter}>
                            <span className={styles.order}>Order: {category.display_order}</span>
                            <div className={styles.actions}>
                                <button onClick={() => openModal(category)} className={styles.editBtn}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(category.id)} className={styles.deleteBtn}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
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
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <div className={styles.checkboxGroup}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            Active
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
