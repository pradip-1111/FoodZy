import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { messages, userMessage } = await request.json()
        console.log('🤖 Chat API called with message:', userMessage)

        // Use Groq API for fast, free AI responses
        const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_demo_key'
        const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
        console.log('🔑 Groq API Key present:', GROQ_API_KEY ? 'Yes' : 'No')
        console.log('🔑 API Key length:', GROQ_API_KEY?.length)
        console.log('🔑 API Key prefix:', GROQ_API_KEY?.substring(0, 8))

        // Build conversation context
        const conversationMessages = [
            {
                role: 'system',
                content: `You are a helpful food ordering assistant for FoodZy, a food delivery service. 
Your role is to:
- Help users browse the menu and find food items
- Answer questions about food, ingredients, and dietary preferences
- Assist with order tracking and delivery information
- Provide recommendations based on user preferences
- Be friendly, concise, and helpful

Keep responses short (2-3 sentences max) and use emojis occasionally to be friendly.
If users want to order specific items, acknowledge their choice enthusiastically.
For menu questions, mention we have burgers, pizzas, pasta, salads, desserts, and beverages.
Delivery typically takes 30-45 minutes.`
            },
            ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: userMessage
            }
        ]

        // Try Groq API first
        try {
            const groqResponse = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: conversationMessages,
                    temperature: 0.7,
                    max_tokens: 150,
                }),
            })

            console.log('✅ Groq API response status:', groqResponse.status)

            if (groqResponse.ok) {
                const data = await groqResponse.json()
                const aiResponse = data.choices[0]?.message?.content || 'I apologize, I had trouble processing that. Could you rephrase?'

                return NextResponse.json({
                    response: aiResponse,
                    source: 'groq'
                })
            }
        } catch (groqError) {
            console.error('❌ Groq API error:', groqError)
            console.log('Using fallback responses')
        }

        // Fallback to rule-based responses
        const response = generateFallbackResponse(userMessage)
        return NextResponse.json({
            response,
            source: 'fallback'
        })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        )
    }
}

function generateFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase()

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening)/)) {
        return "Hello! 👋 I'm your FoodZy assistant. I can help you find and order delicious food. What would you like to eat today?"
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
        return "I'd be happy to help you order! Could you tell me what type of food you're craving? We have burgers, pizzas, pasta, salads, and more!"
    }

    // Menu inquiry
    if (lowerMessage.includes('menu') || lowerMessage.includes('what do you have')) {
        return "We have a wide variety! 🍽️ Our menu includes burgers 🍔, pizzas 🍕, pasta 🍝, salads 🥗, desserts 🍰, and beverages 🥤. What would you like to explore?"
    }

    // Vegetarian/Vegan
    if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
        return "We have great vegetarian and vegan options! 🌱 Let me show you our plant-based menu items."
    }

    // Delivery
    if (lowerMessage.includes('delivery') || lowerMessage.includes('deliver')) {
        return "We deliver to your location! 🚚 Delivery typically takes 30-45 minutes. You can track your order in real-time once it's placed."
    }

    // Track order
    if (lowerMessage.includes('track') || lowerMessage.includes('status')) {
        return "You can track your order from the Orders page! 📦 Just click on your active order to see real-time updates."
    }

    // Help
    if (lowerMessage.includes('help')) {
        return "I'm here to help! You can ask about our menu, order food, check delivery options, or track orders. What do you need? 😊"
    }

    // Default response
    return "I'm here to help you order food! You can tell me what you'd like to eat, ask about our menu, or browse our categories. What can I get for you today? 😊"
}
