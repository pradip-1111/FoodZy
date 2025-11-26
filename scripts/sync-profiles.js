const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
        acc[key.trim()] = value.trim();
    }
    return acc;
}, {});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncProfiles() {
    console.log('Syncing user profiles...');

    // 1. Fetch all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }
    console.log(`Found ${users.length} auth users.`);

    // 2. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id');

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
    }

    const profileIds = new Set(profiles.map(p => p.id));
    console.log(`Found ${profiles.length} user profiles.`);

    // 3. Find missing profiles
    const missingUsers = users.filter(u => !profileIds.has(u.id));
    console.log(`Found ${missingUsers.length} users without profiles.`);

    // 4. Create missing profiles
    for (const user of missingUsers) {
        console.log(`Creating profile for ${user.email}...`);
        const { error } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                preferred_language: 'en'
            });

        if (error) {
            console.error(`Failed to create profile for ${user.email}:`, error);
        } else {
            console.log(`Profile created for ${user.email}`);
        }
    }

    console.log('Sync complete!');
}

syncProfiles();
