'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaClock } from 'react-icons/fa'
import Loader from '@/components/ui/Loader'
import ImageUpload from '@/components/admin/ImageUpload'
import styles from './Banners.module.css'

interface Banner {
    id: string
    title: string
    image_url: string
    link_url: string
    start_time: string | null
    end_time: string | null
    is_active: boolean
    display_order: number
}

export default function AdminBanners() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        link_url: '',
        start_time: '',
        end_time: '',
        is_active: true,
        display_order: 0
    })

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('display_order', { ascending: true })

            if (error) throw error
            setBanners(data || [])
        } catch (error) {
            console.error('Error fetching banners:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const dataToSave = {
                ...formData,
                start_time: formData.start_time || null,
                end_time: formData.end_time || null
            }

            if (editingBanner) {
                const { error } = await supabase
                    .from('banners')
                    .update(dataToSave)
                    .eq('id', editingBanner.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('banners')
                    .insert([dataToSave])

                if (error) throw error
            }

            await fetchBanners()
            closeModal()
        } catch (error) {
            console.error('Error saving banner:', error)
            alert('Failed to save banner')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return

        try {
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchBanners()
        } catch (error) {
            console.error('Error deleting banner:', error)
            alert('Failed to delete banner')
        }
    }

    const openModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner)
            setFormData({
                title: banner.title,
                image_url: banner.image_url,
                link_url: banner.link_url || '',
                start_time: banner.start_time ? new Date(banner.start_time).toISOString().slice(0, 16) : '',
                end_time: banner.end_time ? new Date(banner.end_time).toISOString().slice(0, 16) : '',
                is_active: banner.is_active,
                display_order: banner.display_order
            })
        } else {
            setEditingBanner(null)
            setFormData({
                title: '',
                image_url: '',
                link_url: '',
                start_time: '',
                end_time: '',
                is_active: true,
                display_order: banners.length + 1
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingBanner(null)
    }

    if (loading && !isModalOpen) return <Loader />

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Banners & Offers</h1>
                <button className={styles.addButton} onClick={() => openModal()}>
                    <FaPlus /> Add Banner
                </button>
            </div>

            <div className={styles.grid}>
                {banners.map((banner) => (
                    <div key={banner.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            <img src={banner.image_url} alt={banner.title} />
                            <span className={`${styles.status} ${banner.is_active ? styles.active : styles.inactive}`}>
                                {banner.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{banner.title}</h3>
                            {banner.end_time && (
                                <div className={styles.timer}>
                                    <FaClock />
                                    <span>Ends: {new Date(banner.end_time).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div className={styles.cardFooter}>
                                <span className={styles.order}>Order: {banner.display_order}</span>
                                <div className={styles.actions}>
                                    <button onClick={() => openModal(banner)} className={styles.editBtn}>
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(banner.id)} className={styles.deleteBtn}>
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
                        <h2>{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Banner Image</label>
                                    <ImageUpload
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                        bucketName="banners"
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Link URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.link_url}
                                        onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                                        placeholder="e.g., /menu/burgers"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Start Time (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>End Time (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
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

                                <div className={styles.formGroup}>
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
                                    Save Banner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
