// Client-side AI Chatbot & Voice Assistant for FoodZy
// Supports static exports & mobile Capacitor builds

import { supabase } from '@/lib/supabase/client'

export interface FoodItem {
    id: string
    name: string
    description: string
    current_price: number
    image_url: string
    category_id: string
    is_available?: boolean
    is_vegetarian?: boolean
    is_vegan?: boolean
    categories?: {
        name: string
    }
}

export interface ChatbotResponse {
    response: string
    items?: FoodItem[]
    autoAddToCart?: boolean
    orderedItem?: FoodItem
    quantity?: number
}

// Word to number mapping for spoken quantities
const NUMBER_WORDS: { [key: string]: number } = {
    'one': 1, 'a': 1, 'an': 1, 'single': 1,
    'two': 2, 'couple': 2, 'double': 2,
    'three': 3, 'triple': 3,
    'four': 4,
    'five': 5
}

function extractQuantity(text: string): number {
    const lower = text.toLowerCase()

    // Check digit pattern: "2 burgers" or "3x pizza"
    const digitMatch = lower.match(/\b(\d+)\s*(?:x|of)?\b/)
    if (digitMatch) {
        const num = parseInt(digitMatch[1], 10)
        if (num > 0 && num <= 20) return num
    }

    // Check word pattern: "two burgers", "a pizza"
    for (const [word, val] of Object.entries(NUMBER_WORDS)) {
        const regex = new RegExp(`\\b${word}\\s+([a-z]+)`, 'i')
        if (regex.test(lower)) {
            return val
        }
    }

    return 1
}

// Cache food items in memory to make chatbot instant
let cachedFoodItems: FoodItem[] | null = null
let lastCacheTime = 0

async function getAvailableFoodItems(): Promise<FoodItem[]> {
    const now = Date.now()
    if (cachedFoodItems && now - lastCacheTime < 60000) {
        return cachedFoodItems
    }

    try {
        const { data, error } = await supabase
            .from('food_items')
            .select(`
                *,
                categories (name)
            `)
            .eq('is_available', true)

        if (error) {
            console.error('Error fetching food items for chatbot:', error)
            return cachedFoodItems || []
        }

        cachedFoodItems = (data || []) as FoodItem[]
        lastCacheTime = now
        return cachedFoodItems
    } catch (e) {
        console.error('Exception fetching food items:', e)
        return cachedFoodItems || []
    }
}

/**
 * Process a user message (from voice or text) and return intelligent action + response
 */
export async function processChatbotMessage(
    userMessage: string,
    _history: any[] = []
): Promise<ChatbotResponse> {
    const rawMessage = (userMessage || '').trim()
    const message = rawMessage.toLowerCase()

    if (!message) {
        return {
            response: "I didn't quite catch that. What delicious meal can I get for you today? 🍔🍕",
            items: []
        }
    }

    const foodItems = await getAvailableFoodItems()

    // Greetings
    if (/^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i.test(message)) {
        return {
            response: "Hello there! 👋 Welcome to FoodZy! I can take your order, recommend delicious meals, or show our menu. What are you craving today?",
            items: foodItems.slice(0, 3)
        }
    }

    // Order & add intent keywords
    const orderKeywords = [
        'order', 'add', 'get', 'want', 'buy', 'take', 'cart',
        'have', 'give me', 'bring', 'send', 'deliver', 'craving', 'need', 'eat'
    ]
    const hasOrderIntent = orderKeywords.some(keyword => message.includes(keyword))

    // Check vegetarian / vegan
    const isVegQuery = message.includes('veg') || message.includes('plant') || message.includes('salad')

    // 1. Food item name match
    let matchedItem: FoodItem | null = null
    let highestScore = 0

    for (const item of foodItems) {
        const itemNameLower = item.name.toLowerCase()

        // Exact substring match
        if (message.includes(itemNameLower)) {
            matchedItem = item
            highestScore = 100
            break
        }

        // Word-by-word token match (e.g. "cheeseburger" inside "Classic Cheeseburger")
        const itemWords = itemNameLower.split(/\s+/)
        let score = 0
        for (const word of itemWords) {
            if (word.length > 2 && message.includes(word)) {
                score += 25
            }
        }

        if (score > highestScore) {
            highestScore = score
            matchedItem = item
        }
    }

    if (highestScore < 25) {
        matchedItem = null
    }

    const quantity = extractQuantity(message)

    // 2. Action: Order specific matched item
    if (matchedItem && (hasOrderIntent || highestScore >= 40)) {
        const relatedItems = foodItems.filter(
            f => f.category_id === matchedItem!.category_id && f.id !== matchedItem!.id
        ).slice(0, 3)

        return {
            response: `✅ Added ${quantity > 1 ? `${quantity}x ` : ''}"${matchedItem.name}" (₹${(matchedItem.current_price * quantity).toFixed(2)}) to your cart! 🛒 Would you like anything else?`,
            autoAddToCart: true,
            orderedItem: matchedItem,
            quantity,
            items: [matchedItem, ...relatedItems]
        }
    }

    // 3. Category matching
    const categories = [
        { key: 'burger', name: 'Burgers', defaultItem: 'Classic Cheeseburger', emoji: '🍔' },
        { key: 'pizza', name: 'Pizza', defaultItem: 'Margherita Pizza', emoji: '🍕' },
        { key: 'sushi', name: 'Sushi', defaultItem: 'California Roll', emoji: '🍣' },
        { key: 'pasta', name: 'Pasta', defaultItem: 'Fettuccine Alfredo', emoji: '🍝' },
        { key: 'dessert', name: 'Desserts', defaultItem: 'Chocolate Lava Cake', emoji: '🍰' },
        { key: 'cake', name: 'Desserts', defaultItem: 'Chocolate Lava Cake', emoji: '🍰' },
        { key: 'ice cream', name: 'Desserts', defaultItem: 'Mango Sorbet', emoji: '🍨' },
        { key: 'salad', name: 'Salads', defaultItem: 'Caesar Salad', emoji: '🥗' },
        { key: 'drink', name: 'Beverages', defaultItem: 'Cold Brew Coffee', emoji: '🥤' },
        { key: 'beverage', name: 'Beverages', defaultItem: 'Cold Brew Coffee', emoji: '🥤' },
        { key: 'coffee', name: 'Beverages', defaultItem: 'Cold Brew Coffee', emoji: '☕' },
        { key: 'shake', name: 'Beverages', defaultItem: 'Chocolate Milkshake', emoji: '🥤' }
    ]

    const matchedCategory = categories.find(c => message.includes(c.key))

    if (matchedCategory) {
        const categoryItems = foodItems.filter(f =>
            f.categories?.name?.toLowerCase() === matchedCategory.name.toLowerCase() ||
            f.name.toLowerCase().includes(matchedCategory.key)
        )

        // If user said "order a burger" or "order pizza" (with order intent)
        if (hasOrderIntent) {
            const targetItem = categoryItems.find(i => i.name.toLowerCase() === matchedCategory.defaultItem.toLowerCase()) || categoryItems[0]

            if (targetItem) {
                return {
                    response: `✅ Added our popular "${targetItem.name}" to your cart! ${matchedCategory.emoji}🛒 Check out other delicious ${matchedCategory.name} options below:`,
                    autoAddToCart: true,
                    orderedItem: targetItem,
                    quantity,
                    items: categoryItems.slice(0, 4)
                }
            }
        }

        // Browsing category
        return {
            response: `Here are our best ${matchedCategory.name} options! ${matchedCategory.emoji} Click 'Add' on any item to order:`,
            items: categoryItems.slice(0, 4)
        }
    }

    // 4. Vegetarian / Vegan filter
    if (isVegQuery) {
        const vegItems = foodItems.filter(f => f.is_vegetarian || f.is_vegan)
        return {
            response: "🌱 Here are our fresh and delicious vegetarian options! Say 'order [dish]' or click 'Add':",
            items: vegItems.slice(0, 4)
        }
    }

    // 5. General menu inquiry
    if (message.includes('menu') || message.includes('what do you have') || message.includes('options') || message.includes('food')) {
        return {
            response: "We have an amazing selection of Burgers 🍔, Pizza 🍕, Sushi 🍣, Pasta 🍝, Desserts 🍰, Salads 🥗, and Beverages 🥤! Tell me what you'd like to eat or say 'order [dish]'!",
            items: foodItems.slice(0, 4)
        }
    }

    // 6. Track order inquiry
    if (message.includes('track') || message.includes('status') || message.includes('where is my order')) {
        return {
            response: "🛵 You can track your ongoing orders in real-time! Simply click 'Orders' in the top navigation bar.",
            items: []
        }
    }

    // 7. Default fallback with recommendations
    const popularItems = foodItems.slice(0, 3)
    return {
        response: `I'm ready to take your order! 🤖 You can say "Order Classic Cheeseburger", "Add Margherita Pizza", or "Show me sushi". Here are some popular favourites:`,
        items: popularItems
    }
}
