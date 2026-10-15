const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = envContent.split("\n").reduce((acc, line) => {
    const [key, ...rest] = line.split("=");
    const value = rest.join("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

async function seed() {
    console.log("Seeding database with verified images...\n");

    const categories = [
        { name: "Burgers",   image_url: img("1568901346375-23c9450c58cd"), is_active: true, display_order: 1 },
        { name: "Pizza",     image_url: img("1565299624946-b28f40a0ae38"), is_active: true, display_order: 2 },
        { name: "Sushi",     image_url: img("1579871494447-9811cf80d66c"), is_active: true, display_order: 3 },
        { name: "Desserts",  image_url: img("1563729784474-d77dbb933a9e"), is_active: true, display_order: 4 },
        { name: "Pasta",     image_url: img("1563379091339-03b21ab4a4f8"), is_active: true, display_order: 5 },
        { name: "Salads",    image_url: img("1512621776951-a57141f2eefd"), is_active: true, display_order: 6 },
        { name: "Beverages", image_url: img("1544145945-f90425340c7e"), is_active: true, display_order: 7 },
    ];

    const { data: catData, error: catError } = await supabase.from("categories").upsert(categories, { onConflict: "name" }).select();
    if (catError) { console.error("Category error:", catError); return; }
    console.log("Categories seeded:", catData.length, "\n");

    const cat = (name) => catData.find(c => c.name === name)?.id;

    const foodItems = [
        // BURGERS (7) - All IDs tested & 200 OK
        { name: "Classic Cheeseburger",    description: "Juicy beef patty with cheddar, lettuce, tomato, and secret sauce.", current_price: 12.99, base_price: 12.99, image_url: img("1568901346375-23c9450c58cd"), category_id: cat("Burgers"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 12, calories: 680 },
        { name: "BBQ Bacon Burger",         description: "Smoky BBQ sauce, crispy bacon, caramelised onions, Swiss cheese.", current_price: 14.99, base_price: 14.99, image_url: img("1550547660-d9450f859349"), category_id: cat("Burgers"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 14, calories: 820 },
        { name: "Mushroom Swiss Burger",    description: "Sauteed mushrooms and Swiss cheese on a beef patty with garlic aioli.", current_price: 13.49, base_price: 13.49, image_url: img("1586190848861-99aa4a171e90"), category_id: cat("Burgers"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 13, calories: 710 },
        { name: "Veggie Burger",            description: "Black bean patty with avocado, roasted peppers, and chipotle mayo.", current_price: 11.99, base_price: 11.99, image_url: img("1525059696034-4967a8e1dca2"), category_id: cat("Burgers"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 11, calories: 520 },
        { name: "Double Smash Burger",      description: "Two smashed beef patties, American cheese, pickles, and special sauce.", current_price: 15.99, base_price: 15.99, image_url: img("1572802419224-296b0aeee0d9"), category_id: cat("Burgers"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 15, calories: 950 },
        { name: "Spicy Jalapeno Burger",    description: "Pepper jack cheese, jalapenos, sriracha aioli, and crispy onion rings.", current_price: 13.99, base_price: 13.99, image_url: img("1609167830220-7164aa360951"), category_id: cat("Burgers"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 13, calories: 740 },
        { name: "Crispy Chicken Burger",    description: "Crispy fried chicken breast, coleslaw, pickles, and honey mustard.", current_price: 12.49, base_price: 12.49, image_url: img("1561758033-d89a9ad46330"), category_id: cat("Burgers"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 12, calories: 640 },

        // PIZZA (6) - All IDs tested & 200 OK
        { name: "Margherita Pizza",         description: "San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.", current_price: 13.99, base_price: 13.99, image_url: img("1565299624946-b28f40a0ae38"), category_id: cat("Pizza"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 18, calories: 760 },
        { name: "Pepperoni Feast",          description: "Double pepperoni with mozzarella and rich tomato sauce.", current_price: 15.99, base_price: 15.99, image_url: img("1534308983496-4fabb1a015ee"), category_id: cat("Pizza"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 18, calories: 900 },
        { name: "BBQ Chicken Pizza",        description: "Smoky BBQ base, grilled chicken, red onion, and coriander.", current_price: 16.49, base_price: 16.49, image_url: img("1513104890138-7c749659a591"), category_id: cat("Pizza"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 20, calories: 870 },
        { name: "Four Cheese Pizza",        description: "Mozzarella, gorgonzola, parmesan, and ricotta on a white base.", current_price: 16.99, base_price: 16.99, image_url: img("1574071318508-1cdbab80d002"), category_id: cat("Pizza"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 18, calories: 920 },
        { name: "Veggie Supreme Pizza",     description: "Bell peppers, mushrooms, olives, and onions on tomato sauce.", current_price: 14.49, base_price: 14.49, image_url: img("1593560708920-61dd98c46a4e"), category_id: cat("Pizza"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 18, calories: 680 },
        { name: "Truffle Mushroom Pizza",   description: "White truffle oil, wild mushrooms, taleggio cheese, and fresh thyme.", current_price: 18.99, base_price: 18.99, image_url: img("1571066811602-716837d681de"), category_id: cat("Pizza"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 22, calories: 840 },

        // SUSHI (5) - All IDs tested & 200 OK
        { name: "Salmon Nigiri",            description: "Fresh Atlantic salmon over hand-pressed sushi rice with wasabi.", current_price: 9.99,  base_price: 9.99,  image_url: img("1615361200141-f45040f367be"), category_id: cat("Sushi"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 10, calories: 180 },
        { name: "California Roll",          description: "Crab stick, avocado, and cucumber in an inside-out roll.", current_price: 8.99,  base_price: 8.99,  image_url: img("1579584425555-c3ce17fd4351"), category_id: cat("Sushi"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 10, calories: 220 },
        { name: "Spicy Tuna Roll",          description: "Fresh tuna, sriracha mayo, cucumber, and tobiko.", current_price: 11.99, base_price: 11.99, image_url: img("1579871494447-9811cf80d66c"), category_id: cat("Sushi"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 12, calories: 260 },
        { name: "Veggie Maki",              description: "Cucumber, avocado, and pickled daikon in a classic maki roll.", current_price: 7.49,  base_price: 7.49,  image_url: img("1611143669185-af224c5e3252"), category_id: cat("Sushi"), is_available: true, is_vegetarian: true,  is_vegan: true,  preparation_time: 10, calories: 150 },
        { name: "Dragon Roll",              description: "Prawn tempura inside, avocado on top, with eel sauce and sesame.", current_price: 13.99, base_price: 13.99, image_url: img("1553621042-f6e147245754"), category_id: cat("Sushi"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 15, calories: 340 },

        // DESSERTS (5) - All IDs tested & 200 OK
        { name: "Chocolate Lava Cake",      description: "Warm chocolate fondant with molten centre and vanilla ice cream.", current_price: 6.99,  base_price: 6.99,  image_url: img("1578985545062-69928b1d9587"), category_id: cat("Desserts"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 12, calories: 480 },
        { name: "Mango Sorbet",             description: "Refreshing dairy-free sorbet made with real Alphonso mangoes.", current_price: 4.99,  base_price: 4.99,  image_url: img("1551024506-0bccd828d307"), category_id: cat("Desserts"), is_available: true, is_vegetarian: true,  is_vegan: true,  preparation_time: 5,  calories: 140 },
        { name: "New York Cheesecake",      description: "Dense and creamy NY-style cheesecake with a graham cracker crust.", current_price: 5.99,  base_price: 5.99,  image_url: img("1587314168485-3236d6710814"), category_id: cat("Desserts"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 5,  calories: 420 },
        { name: "Tiramisu",                 description: "Espresso-soaked ladyfingers with mascarpone cream.", current_price: 6.49,  base_price: 6.49,  image_url: img("1571877227200-a0d98ea607e9"), category_id: cat("Desserts"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 5,  calories: 390 },
        { name: "Gulab Jamun",              description: "Soft milk-solid balls soaked in rose-flavoured sugar syrup. 4 pieces.", current_price: 3.99, base_price: 3.99, image_url: img("1541781774459-bb2af2f05b55"), category_id: cat("Desserts"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 5,  calories: 320 },

        // PASTA (5) - All IDs tested & 200 OK
        { name: "Spaghetti Bolognese",      description: "Slow-cooked beef and pork ragu with spaghetti and parmesan.", current_price: 13.99, base_price: 13.99, image_url: img("1551183053-bf91a1d81141"), category_id: cat("Pasta"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 20, calories: 720 },
        { name: "Penne Arrabbiata",         description: "Penne in a fiery tomato and garlic sauce with fresh parsley.", current_price: 11.99, base_price: 11.99, image_url: img("1563379091339-03b21ab4a4f8"), category_id: cat("Pasta"), is_available: true, is_vegetarian: true,  is_vegan: true,  preparation_time: 18, calories: 560 },
        { name: "Fettuccine Alfredo",       description: "Silky Alfredo sauce with fettuccine, parmesan, and cracked pepper.", current_price: 12.99, base_price: 12.99, image_url: img("1555949258-eb67b1ef0ceb"), category_id: cat("Pasta"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 18, calories: 780 },
        { name: "Chicken Pesto Pasta",      description: "Grilled chicken with basil pesto, cherry tomatoes, and pine nuts.", current_price: 14.49, base_price: 14.49, image_url: img("1621996346565-e3dbc646d9a9"), category_id: cat("Pasta"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 20, calories: 690 },
        { name: "Mushroom Risotto",         description: "Creamy Italian rice with wild mushrooms, parmesan, and herbs.", current_price: 13.49, base_price: 13.49, image_url: img("1546549032-9571cd6b27df"), category_id: cat("Pasta"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 25, calories: 620 },

        // SALADS (4) - All IDs tested & 200 OK
        { name: "Caesar Salad",             description: "Romaine, parmesan, croutons, and house-made Caesar dressing.", current_price: 9.99,  base_price: 9.99,  image_url: img("1512621776951-a57141f2eefd"), category_id: cat("Salads"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 8, calories: 380 },
        { name: "Greek Salad",              description: "Tomatoes, cucumber, Kalamata olives, red onion, and feta cheese.", current_price: 8.99,  base_price: 8.99,  image_url: img("1540420773420-3366772f4999"), category_id: cat("Salads"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 8, calories: 290 },
        { name: "Quinoa Power Bowl",        description: "Quinoa, roasted chickpeas, avocado, kale, and tahini dressing.", current_price: 11.49, base_price: 11.49, image_url: img("1504674900247-0877df9cc836"), category_id: cat("Salads"), is_available: true, is_vegetarian: true,  is_vegan: true,  preparation_time: 10, calories: 420 },
        { name: "Grilled Chicken Salad",    description: "Mixed greens, grilled chicken, cherry tomatoes, and balsamic glaze.", current_price: 12.99, base_price: 12.99, image_url: img("1546069901-ba9599a7e63c"), category_id: cat("Salads"), is_available: true, is_vegetarian: false, is_vegan: false, preparation_time: 12, calories: 340 },

        // BEVERAGES (4) - All IDs tested & 200 OK
        { name: "Fresh Mango Lassi",        description: "Creamy yoghurt blended with fresh Alphonso mango pulp.", current_price: 3.99,  base_price: 3.99,  image_url: img("1544145945-f90425340c7e"), category_id: cat("Beverages"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 5, calories: 180 },
        { name: "Cold Brew Coffee",         description: "Slow-steeped Arabica cold brew, smooth and low-acid. Served over ice.", current_price: 4.49, base_price: 4.49, image_url: img("1461023058943-07fcbe16d735"), category_id: cat("Beverages"), is_available: true, is_vegetarian: true,  is_vegan: true,  preparation_time: 3, calories: 20 },
        { name: "Watermelon Mint Cooler",   description: "Freshly blended watermelon with mint, lime juice, and ginger.", current_price: 3.49, base_price: 3.49, image_url: img("1556881286-fc6915169721"), category_id: cat("Beverages"), is_available: true, is_vegetarian: true,  is_vegan: true,  preparation_time: 5, calories: 80 },
        { name: "Chocolate Milkshake",      description: "Thick creamy milkshake made with premium chocolate ice cream.", current_price: 4.99, base_price: 4.99, image_url: img("1572490122747-3968b75cc699"), category_id: cat("Beverages"), is_available: true, is_vegetarian: true,  is_vegan: false, preparation_time: 5, calories: 480 },
    ];

    console.log(`Processing ${foodItems.length} food items...\n`);
    let inserted = 0, updated = 0, failed = 0;

    for (const item of foodItems) {
        if (!item.category_id) { console.warn("Skipping (no category):", item.name); continue; }

        const { data: existing } = await supabase.from("food_items").select("id").eq("name", item.name).maybeSingle();

        if (existing) {
            // Update image URL and details
            const { error } = await supabase.from("food_items").update({
                image_url: item.image_url,
                description: item.description,
                current_price: item.current_price,
                base_price: item.base_price,
                category_id: item.category_id,
                is_available: item.is_available,
                is_vegetarian: item.is_vegetarian,
                is_vegan: item.is_vegan,
                preparation_time: item.preparation_time,
                calories: item.calories
            }).eq("id", existing.id);

            if (error) {
                console.error("Update failed:", item.name, error.message);
                failed++;
            } else {
                updated++;
            }
        } else {
            const { error } = await supabase.from("food_items").insert(item);
            if (error) {
                console.error("Insert failed:", item.name, error.message);
                failed++;
            } else {
                inserted++;
            }
        }
    }

    console.log(`\nSeed Complete! Total: ${foodItems.length} | Inserted: ${inserted} | Updated: ${updated} | Failed: ${failed}`);
}

seed().catch(console.error);
