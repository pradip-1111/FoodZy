/** @type {import('next').NextConfig} */
const isMobileBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
    ...(isMobileBuild ? { output: 'export' } : {}),

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
