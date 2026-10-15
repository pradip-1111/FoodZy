/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',

    images: {
        unoptimized: true,
        domains: ['localhost', 'supabase.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
};

module.exports = nextConfig;
