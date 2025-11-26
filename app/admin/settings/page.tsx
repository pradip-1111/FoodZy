'use client'

import { useState } from 'react'
import styles from './Settings.module.css'

export default function AdminSettings() {
    // Mock settings state for now since we don't have a settings table yet
    const [settings, setSettings] = useState({
        restaurantName: 'FoodZy',
        email: 'admin@foodzy.com',
        phone: '+1 234 567 890',
        address: '123 Food Street, Tasty City',
        currency: 'USD',
        deliveryFee: 5.00,
        taxRate: 10,
        isOpen: true
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, save to Supabase
        alert('Settings saved successfully!')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Settings</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>General Information</h2>
                    <div className={styles.formGroup}>
                        <label>Restaurant Name</label>
                        <input
                            type="text"
                            value={settings.restaurantName}
                            onChange={e => setSettings({ ...settings, restaurantName: e.target.value })}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Contact Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Phone Number</label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Address</label>
                        <textarea
                            rows={3}
                            value={settings.address}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Business Configuration</h2>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Currency</label>
                            <select
                                value={settings.currency}
                                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Restaurant Status</label>
                            <select
                                value={settings.isOpen ? 'open' : 'closed'}
                                onChange={e => setSettings({ ...settings, isOpen: e.target.value === 'open' })}
                            >
                                <option value="open">Open for Business</option>
                                <option value="closed">Temporarily Closed</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Base Delivery Fee</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.deliveryFee}
                                onChange={e => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tax Rate (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.taxRate}
                                onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className={styles.saveBtn}>
                    Save Changes
                </button>
            </form>
        </div>
    )
}
