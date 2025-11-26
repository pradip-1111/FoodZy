'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Sidebar from '@/components/admin/Sidebar'
import Loader from '@/components/ui/Loader'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAdmin()
    }, [pathname])

    const checkAdmin = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                if (pathname !== '/admin/login') {
                    router.push('/admin/login')
                } else {
                    setLoading(false)
                }
                return
            }

            // If on login page and already logged in, redirect to dashboard
            if (pathname === '/admin/login') {
                const { data: adminData } = await supabase
                    .from('admin_users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (adminData) {
                    router.push('/admin/dashboard')
                } else {
                    // Not an admin
                    setLoading(false)
                }
                return
            }

            // Check if user is admin
            const { data: adminData } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (!adminData) {
                router.push('/') // Redirect non-admins to home
            } else {
                setLoading(false)
            }
        } catch (error) {
            console.error('Admin check error:', error)
            router.push('/admin/login')
        }
    }

    // Don't show sidebar on login page
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc'
            }}>
                <Loader />
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '2rem',
                width: 'calc(100% - 280px)'
            }}>
                {children}
            </main>
        </div>
    )
}
