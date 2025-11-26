import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
    try {
        console.log('=== Send Email API Called (Resend) ===')

        // Validate API key first
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not configured')
            return NextResponse.json({
                error: 'Email service is not configured. Please contact administrator.'
            }, { status: 500 })
        }

        // Initialize Resend
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Get the authorization token from the request header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('No authorization header found')
            return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')

        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        console.log('User check:', user ? `Authenticated as ${user.email}` : 'Not authenticated')

        if (authError || !user) {
            console.error('Authentication error:', authError)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { subject, message, targetAudience } = await request.json()
        console.log('Request data:', { subject, targetAudience, messageLength: message?.length })

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
        }

        let recipients: string[] = []

        if (targetAudience === 'all') {
            // Use Supabase Admin API to fetch all user emails from auth.users
            const { createClient: createSupabaseClient } = require('@supabase/supabase-js')

            const supabaseAdmin = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            )

            const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

            if (usersError) {
                console.error('Error fetching users:', usersError)
                throw usersError
            }

            recipients = users.map((u: any) => u.email).filter((email: string | null) => email) as string[]
            console.log(`Found ${recipients.length} users`)
        } else {
            return NextResponse.json({ error: 'Invalid target audience' }, { status: 400 })
        }

        // Filter out invalid emails
        recipients = recipients.filter(email => email && email.includes('@'))
        console.log(`Valid recipients: ${recipients.length}`)

        if (recipients.length === 0) {
            return NextResponse.json({ message: 'No valid recipients found' })
        }

        console.log(`Sending to ${recipients.length} recipients...`)

        // Send emails using Resend
        // Note: Resend's free tier has a limit of 100 emails/day
        const emailPromises = recipients.map(async (email) => {
            return resend.emails.send({
                from: 'FoodZy <onboarding@resend.dev>', // Use Resend's test domain
                to: email,
                subject: subject,
                html: `<p>${message.replace(/\n/g, '<br>')}</p>`
            })
        })

        const results = await Promise.allSettled(emailPromises)

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        console.log(`Email sending complete: ${successful} successful, ${failed} failed`)

        if (failed > 0) {
            const errors = results
                .filter(r => r.status === 'rejected')
                .map((r: any) => r.reason?.message || 'Unknown error')

            console.error('Some emails failed:', errors)

            return NextResponse.json({
                success: true,
                message: `Sent ${successful} emails successfully, ${failed} failed`,
                errors: errors.slice(0, 3) // Only show first 3 errors
            })
        }

        return NextResponse.json({
            success: true,
            message: `Successfully sent ${successful} emails`
        })
    } catch (error: any) {
        console.error('Error sending email:', error)
        return NextResponse.json({
            error: error.message || 'An unexpected error occurred'
        }, { status: 500 })
    }
}
