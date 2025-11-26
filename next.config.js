/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', 'supabase.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
    i18n: {
        locales: ['en', 'ar', 'hi', 'es', 'fr'],
        defaultLocale: 'en',
    },
}

module.exports = nextConfig
