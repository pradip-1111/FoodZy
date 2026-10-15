import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Missing Supabase admin environment variables')
            return NextResponse.json({ error: 'Server configuration error: missing admin credentials' }, { status: 500 })
        }

        // 1. Verify Authentication & Admin Role
        const supabase = createServerSupabase()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', session.user.id)
            .single()


        if (!adminUser) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Initialize Supabase Admin Client (Service Role)
        const supabaseAdmin = createAdminClient(

            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )


        // 3. Fetch All Users from Auth (Source of Truth)
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) {
            console.error('Supabase Admin Fetch Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Map auth users to the format expected by the frontend
        const mappedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'N/A',
            phone: user.phone || 'N/A',
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
        }))

        return NextResponse.json(mappedUsers)

    } catch (error) {
        console.error('API Route Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
