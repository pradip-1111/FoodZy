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

async function promoteFirstUser() {
    console.log('Fetching users...');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users found to promote.');
        return;
    }

    const user = users[0];
    console.log(`Promoting user: ${user.email} (ID: ${user.id})`);

    const { error: insertError } = await supabase
        .from('admin_users')
        .upsert({
            id: user.id,
            role: 'super_admin',
            permissions: { all: true }
        });

    if (insertError) {
        console.error('Error promoting user:', insertError);
    } else {
        console.log('Successfully promoted user to super_admin!');
    }
}

promoteFirstUser();
