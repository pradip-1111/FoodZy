'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaMap } from 'react-icons/fa'
import dynamic from 'next/dynamic'
import styles from './profile.module.css'

// Dynamically import map to avoid SSR issues
const AddressMapPicker = dynamic(() => import('@/components/AddressMapPicker'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Loading map...</div>
})

interface Address {
    id: string
    label: string
    street: string
    city: string
    state: string
    postal_code: string
    country: string
    is_default: boolean
    latitude?: number
    longitude?: number
}

interface UserProfile {
    id: string
    full_name: string
    phone: string
    avatar_url?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const supabase = createClientComponentClient()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isAddingAddress, setIsAddingAddress] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    const [profileForm, setProfileForm] = useState({
        full_name: '',
        phone: ''
    })

    const [addressForm, setAddressForm] = useState({
        label: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined
    })

    const [useMapEntry, setUseMapEntry] = useState(false)

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login')
            } else {
                fetchProfile(user.id)
                fetchAddresses(user.id)
                setLoading(false)
            }
        }
    }, [user, authLoading, router])

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error

            setProfile(data)
            setProfileForm({
                full_name: data.full_name || '',
                phone: data.phone || ''
            })
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const fetchAddresses = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false })

            if (error) throw error
            setAddresses(data || [])
        } catch (error) {
            console.error('Error fetching addresses:', error)
        }
    }

    const handleUpdateProfile = async () => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    full_name: profileForm.full_name,
                    phone: profileForm.phone
                })
                .eq('id', user.id)

            if (error) throw error

            await fetchProfile(user.id)
            setIsEditingProfile(false)
            alert('Profile updated successfully!')
        } catch (error: any) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile: ' + error.message)
        }
    }

    const handleAddAddress = async () => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('user_addresses')
                .insert({
                    user_id: user.id,
                    ...addressForm
                })

            if (error) throw error

            await fetchAddresses(user.id)
            setIsAddingAddress(false)
            resetAddressForm()
            alert('Address added successfully!')
        } catch (error: any) {
            console.error('Error adding address:', error)
            alert('Failed to add address: ' + error.message)
        }
    }

    const handleUpdateAddress = async () => {
        if (!user || !editingAddress) return

        try {
            const { error } = await supabase
                .from('user_addresses')
                .update(addressForm)
                .eq('id', editingAddress.id)

            if (error) throw error

            await fetchAddresses(user.id)
            setEditingAddress(null)
            resetAddressForm()
            alert('Address updated successfully!')
        } catch (error: any) {
            console.error('Error updating address:', error)
            alert('Failed to update address: ' + error.message)
        }
    }

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return

        try {
            const { error } = await supabase
                .from('user_addresses')
                .delete()
                .eq('id', addressId)

            if (error) throw error

            await fetchAddresses(user!.id)
            alert('Address deleted successfully!')
        } catch (error: any) {
            console.error('Error deleting address:', error)
            alert('Failed to delete address: ' + error.message)
        }
    }

    const handleSetDefaultAddress = async (addressId: string) => {
        if (!user) return

        try {
            // First, unset all default addresses
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)

            // Then set the selected address as default
            const { error } = await supabase
                .from('user_addresses')
                .update({ is_default: true })
                .eq('id', addressId)

            if (error) throw error

            await fetchAddresses(user.id)
        } catch (error: any) {
            console.error('Error setting default address:', error)
            alert('Failed to set default address: ' + error.message)
        }
    }

    const resetAddressForm = () => {
        setAddressForm({
            label: '',
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            is_default: false,
            latitude: undefined,
            longitude: undefined
        })
        setUseMapEntry(false)
    }

    const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
        // Parse the address components from Google Maps formatted address
        const parts = address.split(', ')
        setAddressForm(prev => ({
            ...prev,
            street: parts[0] || '',
            city: parts.length > 2 ? parts[parts.length - 3] : '',
            state: parts.length > 1 ? parts[parts.length - 2] : '',
            postal_code: '',
            country: parts[parts.length - 1] || '',
            latitude: lat,
            longitude: lng
        }))
    }

    const startEditingAddress = (address: Address) => {
        setEditingAddress(address)
        setAddressForm({
            label: address.label,
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            is_default: address.is_default,
            latitude: address.latitude,
            longitude: address.longitude
        })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>My Profile</h1>

                {/* Profile Information */}
                <Card className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <FaUser /> Personal Information
                        </h2>
                        {!isEditingProfile && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingProfile(true)}
                            >
                                <FaEdit /> Edit
                            </Button>
                        )}
                    </div>

                    {isEditingProfile ? (
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.full_name}
                                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditingProfile(false)
                                        setProfileForm({
                                            full_name: profile?.full_name || '',
                                            phone: profile?.phone || ''
                                        })
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.profileInfo}>
                            <div className={styles.infoItem}>
                                <FaUser className={styles.icon} />
                                <div>
                                    <div className={styles.label}>Name</div>
                                    <div className={styles.value}>{profile?.full_name || 'Not set'}</div>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <FaEnvelope className={styles.icon} />
                                <div>
                                    <div className={styles.label}>Email</div>
                                    <div className={styles.value}>{user?.email}</div>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <FaPhone className={styles.icon} />
                                <div>
                                    <div className={styles.label}>Phone</div>
                                    <div className={styles.value}>{profile?.phone || 'Not set'}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Addresses */}
                <Card className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <FaMapMarkerAlt /> Delivery Addresses
                        </h2>
                        {!isAddingAddress && !editingAddress && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingAddress(true)}
                            >
                                <FaPlus /> Add Address
                            </Button>
                        )}
                    </div>

                    {(isAddingAddress || editingAddress) && (
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Label (e.g., Home, Work)</label>
                                <input
                                    type="text"
                                    value={addressForm.label}
                                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                    className={styles.input}
                                />
                            </div>

                            {/* Toggle between Manual and Map Entry */}
                            <div className={styles.entryModeToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${!useMapEntry ? styles.active : ''}`}
                                    onClick={() => setUseMapEntry(false)}
                                >
                                    ✏️ Manual Entry
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${useMapEntry ? styles.active : ''}`}
                                    onClick={() => setUseMapEntry(true)}
                                >
                                    <FaMap /> Map Selection
                                </button>
                            </div>

                            {useMapEntry ? (
                                <AddressMapPicker
                                    onLocationSelect={handleMapLocationSelect}
                                    initialLat={addressForm.latitude}
                                    initialLng={addressForm.longitude}
                                />
                            ) : (
                                <>
                                    <div className={styles.formGroup}>
                                        <label>Street Address</label>
                                        <input
                                            type="text"
                                            value={addressForm.street}
                                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>City</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>State</label>
                                            <input
                                                type="text"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Postal Code</label>
                                            <input
                                                type="text"
                                                value={addressForm.postal_code}
                                                onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Country</label>
                                            <input
                                                type="text"
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={addressForm.is_default}
                                        onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                    />
                                    Set as default address
                                </label>
                            </div>
                            <div className={styles.formActions}>
                                <Button onClick={editingAddress ? handleUpdateAddress : handleAddAddress}>
                                    {editingAddress ? 'Update Address' : 'Add Address'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingAddress(false)
                                        setEditingAddress(null)
                                        resetAddressForm()
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className={styles.addressList}>
                        {addresses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <FaMapMarkerAlt />
                                <p>No addresses added yet</p>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <div key={address.id} className={styles.addressCard}>
                                    <div className={styles.addressHeader}>
                                        <div className={styles.addressLabel}>
                                            {address.label}
                                            {address.is_default && (
                                                <span className={styles.defaultBadge}>Default</span>
                                            )}
                                        </div>
                                        <div className={styles.addressActions}>
                                            <button
                                                onClick={() => startEditingAddress(address)}
                                                className={styles.iconBtn}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(address.id)}
                                                className={styles.iconBtn}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.addressDetails}>
                                        {address.street}<br />
                                        {address.city}, {address.state} {address.postal_code}<br />
                                        {address.country}
                                    </div>
                                    {!address.is_default && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetDefaultAddress(address.id)}
                                            className={styles.setDefaultBtn}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Logout Button */}
                <div className={styles.logoutSection}>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    )
}
