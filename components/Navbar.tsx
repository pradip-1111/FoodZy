'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { FaShoppingBag, FaUser, FaGlobe, FaClipboardList } from 'react-icons/fa'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './Navbar.module.css'

export default function Navbar() {
    const pathname = usePathname()
    const { itemCount } = useCart()
    const { currentLanguage, setLanguage, languages, t } = useLanguage()
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false)
            }
        }

        if (isLangDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isLangDropdownOpen])

    // Don't show navbar on admin pages
    if (pathname?.startsWith('/admin')) return null

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    <span style={{ fontSize: '1.8rem' }}>🍔</span>
                    <span>FoodZy</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link
                        href="/"
                        className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
                    >
                        {t('nav.home')}
                    </Link>
                    <Link
                        href="/menu"
                        className={`${styles.navLink} ${pathname === '/menu' ? styles.active : ''}`}
                    >
                        {t('nav.menu')}
                    </Link>
                    <Link
                        href="/orders"
                        className={`${styles.navLink} ${pathname === '/orders' ? styles.active : ''}`}
                    >
                        {t('nav.orders')}
                    </Link>
                </div>

                <div className={styles.navActions}>
                    {/* Language Switcher */}
                    <div className={styles.languageSelector} ref={dropdownRef}>
                        <button
                            className={styles.langBtn}
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                        >
                            <FaGlobe />
                            <span>{languages[currentLanguage].nativeName}</span>
                        </button>
                        <div className={`${styles.langDropdown} ${isLangDropdownOpen ? styles.open : ''}`}>
                            {(Object.keys(languages) as Array<keyof typeof languages>).map((lang) => (
                                <button
                                    key={lang}
                                    className={`${styles.langOption} ${currentLanguage === lang ? styles.active : ''}`}
                                    onClick={() => {
                                        setLanguage(lang)
                                        setIsLangDropdownOpen(false)
                                    }}
                                >
                                    {languages[lang].nativeName}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cart */}
                    <Link href="/cart">
                        <button className={styles.iconButton}>
                            <FaShoppingBag />
                            {itemCount > 0 && (
                                <span className={styles.badge}>{itemCount}</span>
                            )}
                        </button>
                    </Link>

                    {/* Profile/Login */}
                    <Link href="/login">
                        <button className={styles.iconButton}>
                            <FaUser />
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
