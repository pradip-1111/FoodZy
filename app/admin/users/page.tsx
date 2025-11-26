'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaUser } from 'react-icons/fa'
import Loader from '@/components/ui/Loader'
import styles from './Users.module.css'
import { supabase } from '@/lib/supabase/client'

interface UserProfile {
    id: string
    full_name: string
    email: string
    phone: string
    created_at: string
    role?: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setUsers(data || [])
        } catch (err: any) {
            console.error('Error fetching users:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <Loader />
    if (error) return <div style={{ color: 'red', padding: '1rem' }}>Error: {error}</div>
    // if (!loading && users.length === 0) return <div className={styles.noData}>No users found.</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>User Management</h1>
            </div>

            <div className={styles.searchBar}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search by Name, Email or Phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Phone</th>
                            <th>Joined Date</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                <FaUser />
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{user.full_name || 'Unnamed User'}</span>
                                                <span className={styles.userEmail}>{user.email || user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={styles.roleBadge}>{user.role || 'Customer'}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
