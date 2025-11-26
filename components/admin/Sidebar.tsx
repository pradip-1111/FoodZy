'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
    FaChartPie,
    FaHamburger,
    FaListAlt,
    FaUsers,
    FaClipboardList,
    FaTags,
    FaSignOutAlt,
    FaCog,
    FaPaperPlane
} from 'react-icons/fa'
import styles from './Sidebar.module.css'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const menuItems = [
        { name: 'Dashboard', icon: FaChartPie, path: '/admin/dashboard' },
        { name: 'Orders', icon: FaClipboardList, path: '/admin/orders' },
        { name: 'Food Items', icon: FaHamburger, path: '/admin/food' },
        { name: 'Categories', icon: FaListAlt, path: '/admin/categories' },
        { name: 'Banners', icon: FaTags, path: '/admin/banners' },
        { name: 'Marketing', icon: FaPaperPlane, path: '/admin/marketing' },
        { name: 'Users', icon: FaUsers, path: '/admin/users' },
        { name: 'Settings', icon: FaCog, path: '/admin/settings' },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>FoodZy Admin</h2>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <item.icon className={styles.icon} />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className={styles.footer}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}
