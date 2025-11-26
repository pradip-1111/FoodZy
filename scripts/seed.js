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

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding database...');

    // Categories
    const categories = [
        { name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', is_active: true, display_order: 1 },
        { name: 'Pizza', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', is_active: true, display_order: 2 },
        { name: 'Sushi', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', is_active: true, display_order: 3 },
        { name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800', is_active: true, display_order: 4 },
    ];

    const { data: catData, error: catError } = await supabase.from('categories').upsert(categories, { onConflict: 'name' }).select();
    if (catError) console.error('Error seeding categories:', catError);
    else console.log('Categories seeded:', catData.length);

    // Food Items
    if (catData) {
        const burgerCat = catData.find(c => c.name === 'Burgers');
        const pizzaCat = catData.find(c => c.name === 'Pizza');

        const foodItems = [
            {
                name: 'Classic Cheeseburger',
                description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our secret sauce.',
                current_price: 12.99,
                base_price: 12.99,
                image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
                category_id: burgerCat?.id,
                is_available: true,
                is_vegetarian: false,
                is_vegan: false
            },
            {
                name: 'Margherita Pizza',
                description: 'Fresh basil, mozzarella cheese, and tomato sauce on a crispy crust.',
                current_price: 14.99,
                base_price: 14.99,
                image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
                category_id: pizzaCat?.id,
                is_available: true,
                is_vegetarian: true,
                is_vegan: false
            }
        ];

        for (const item of foodItems) {
            const { data: existing } = await supabase.from('food_items').select('id').eq('name', item.name).single();
            if (!existing) {
                const { error } = await supabase.from('food_items').insert(item);
                if (error) console.error(`Error inserting ${item.name}:`, error);
                else console.log(`Inserted ${item.name}`);
            } else {
                console.log(`Skipped ${item.name} (already exists)`);
            }
        }
    }
}

seed();
