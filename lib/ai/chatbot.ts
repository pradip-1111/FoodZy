// AI Chatbot integration for FoodZy
// Uses /api/chat endpoint for dynamic AI responses


export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface FoodSuggestion {
    name: string
    id: string
    confidence: number
}

/**
 * Process user message and generate chatbot response using AI
 */
export async function processChatMessage(
    message: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    try {
        // Call our API route for AI-powered responses
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userMessage: message,
                messages: conversationHistory,
            }),
        })

        if (!response.ok) {
            console.error('Chat API error:', response.status)
            return processSimpleChatbot(message)
        }

        const data = await response.json()
        return data.response || processSimpleChatbot(message)
    } catch (error) {
        console.error('Chatbot error:', error)
        return processSimpleChatbot(message)
    }
}

/**
 * Simple rule-based chatbot fallback
 */
function processSimpleChatbot(message: string): string {
    const lowerMessage = message.toLowerCase()

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening)/)) {
        return "Hello! 👋 I'm your food ordering assistant. I can help you find and order delicious food. What would you like to eat today?"
    }

    // Order intent
    if (lowerMessage.includes('order') || lowerMessage.includes('want') || lowerMessage.includes('get')) {
        if (lowerMessage.includes('burger')) {
            return "Great choice! 🍔 We have several burger options. Let me show you our burger menu. Would you like a classic beef burger, chicken burger, or veggie burger?"
        }
        if (lowerMessage.includes('pizza')) {
            return "Excellent! 🍕 We have amazing pizzas. Would you prefer Margherita, Pepperoni, Vegetarian, or BBQ Chicken pizza?"
        }
        if (lowerMessage.includes('pasta')) {
            return "Wonderful! 🍝 Our pasta dishes are delicious. We have Carbonara, Bolognese, Alfredo, and Pesto pasta. Which one sounds good?"
        }
        if (lowerMessage.includes('salad')) {
            return "Healthy choice! 🥗 We have Caesar Salad, Greek Salad, and Garden Fresh Salad. Which would you like?"
        }
        if (lowerMessage.includes('drink') || lowerMessage.includes('beverage')) {
            return "Sure! 🥤 We have soft drinks, juices, smoothies, and coffee. What would you like to drink?"
        }
        return "I'd be happy to help you order! Could you tell me what type of food you're craving? We have burgers, pizzas, pasta, salads, and more!"
    }

    // Menu inquiry
    if (lowerMessage.includes('menu') || lowerMessage.includes('what do you have')) {
        return "We have a wide variety of delicious options! 🍽️ Our menu includes:\n• Burgers 🍔\n• Pizzas 🍕\n• Pasta 🍝\n• Salads 🥗\n• Desserts 🍰\n• Beverages 🥤\n\nWhat would you like to explore?"
    }

    // Vegetarian/Vegan
    if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
        return "We have great vegetarian and vegan options! 🌱 Let me show you our plant-based menu items."
    }

    // Price inquiry
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        return "Our prices vary by item. You can browse our menu to see detailed pricing. Most items range from ₹150 to ₹500. Would you like to see a specific category?"
    }

    // Delivery
    if (lowerMessage.includes('delivery') || lowerMessage.includes('deliver')) {
        return "We deliver to your location! 🚚 Delivery typically takes 30-45 minutes. You can track your order in real-time once it's placed."
    }

    // Help
    if (lowerMessage.includes('help')) {
        return "I'm here to help! You can:\n• Ask about our menu\n• Order food by telling me what you want\n• Check delivery options\n• Ask about prices\n\nJust let me know what you need!"
    }

    // Default response
    return "I'm here to help you order food! You can tell me what you'd like to eat, ask about our menu, or browse our categories. What can I get for you today? 😊"
}

/**
 * Extract food item names from user message
 */
export function extractFoodItems(message: string): string[] {
    const lowerMessage = message.toLowerCase()
    const foodKeywords = [
        'burger', 'pizza', 'pasta', 'salad', 'sandwich', 'fries',
        'chicken', 'beef', 'fish', 'vegetarian', 'vegan',
        'margherita', 'pepperoni', 'carbonara', 'alfredo',
        'caesar', 'greek', 'coffee', 'tea', 'juice', 'smoothie',
        'cake', 'ice cream', 'dessert'
    ]

    return foodKeywords.filter(keyword => lowerMessage.includes(keyword))
}

/**
 * Determine if message is an order intent
 */
export function isOrderIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    const orderKeywords = ['order', 'want', 'get', 'buy', 'add', 'cart']
    return orderKeywords.some(keyword => lowerMessage.includes(keyword))
}
