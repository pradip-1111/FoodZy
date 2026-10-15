# FoodZy - Food Delivery Web Application

A full-stack food delivery platform built with Next.js 14, featuring AI-powered chatbot ordering, voice commands, multi-lingual support, and comprehensive admin management.

## 🚀 Features

### User-Side Feature
- **AI Chatbot Ordering**: Order food naturally through conversational AI
- **Voice Ordering**: Use voice commands to place orders hands-free
- **Multi-Lingual Support**: Available in English, Arabic, Hindi, Spanish, and French
- **Menu Browsing**: Browse by category, search, and filter food items
- **Shopping Cart**: Add, remove, and update quantities
- **Order Tracking**: Real-time order status updates
- **User Profiles**: Manage profile and delivery addresses
- **Offers & Discounts**: Apply promo codes and view special offers

### Admin-Side Features
- **Food Management**: CRUD operations for menu items
- **Order Management**: View and update order statuses
- **Dynamic Pricing**: Time-based and demand-based pricing rules
- **Inventory Management**: Track stock levels and auto-disable out-of-stock items
- **Email Notifications**: Send campaigns to users
- **User Management**: View users and their order history

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Vanilla CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **AI/ML**: HuggingFace API (chatbot), Web Speech API (voice)
- **Translation**: LibreTranslate
- **Real-time Chat**: Firebase Realtime Database
- **Animations**: Framer Motion

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- (Optional) HuggingFace API key for advanced chatbot
- (Optional) Firebase project for support chat
- (Optional) LibreTranslate instance for translation

## 🔧 Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Required variables:
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase (for support chat)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url

# HuggingFace (optional - chatbot will use rule-based fallback if not provided)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# LibreTranslate (optional - defaults to public instance)
NEXT_PUBLIC_LIBRETRANSLATE_URL=https://libretranslate.com
\`\`\`

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the schema file: `supabase/schema.sql`

This will create all necessary tables, RLS policies, functions, and triggers.

### 4. Set Up Storage Buckets (Optional)

In Supabase dashboard:
1. Go to Storage
2. Create a bucket named `food-images`
3. Set it to public
4. Upload food item images

### 5. Add Video Assets

Place your hero section videos in `public/videos/`:
- `hero-1.mp4`
- `hero-2.mp4`
- `hero-3.mp4`

Or update the video paths in `app/page.tsx`.

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
FoodApp/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── menu/                # Menu browsing
│   ├── cart/                # Shopping cart
│   ├── orders/              # Order history & tracking
│   ├── profile/             # User profile
│   ├── admin/               # Admin dashboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── chatbot/             # AI chatbot widget
│   ├── layout/              # Layout components
│   └── menu/                # Menu-specific components
├── contexts/                # React contexts
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── LanguageContext.tsx
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── firebase/            # Firebase config
│   ├── ai/                  # AI services (chatbot, voice)
│   └── translation/         # Translation service
├── supabase/
│   └── schema.sql           # Database schema
└── public/
    ├── videos/              # Hero section videos
    └── images/              # Static images
\`\`\`

## 🎨 Key Features Implementation

### AI Chatbot Ordering
The chatbot (`components/chatbot/ChatbotWidget.tsx`) uses:
- Natural language processing to understand user intent
- Database search to find matching food items
- Automatic cart integration
- Voice input support via Web Speech API

### Voice Ordering
Voice recognition (`lib/ai/voice.ts`) provides:
- Browser-native speech-to-text
- Real-time transcription
- Integration with chatbot for seamless ordering

### Multi-Lingual Support
Translation system (`lib/translation/translate.ts`) offers:
- 5 languages: English, Arabic, Hindi, Spanish, French
- RTL support for Arabic
- LibreTranslate API integration
- Fallback to static translations

### Dynamic Pricing
Admin can configure pricing rules based on:
- Time of day
- Day of week (weekends, holidays)
- Demand levels
- Manual overrides

### Inventory Management
Automatic stock tracking:
- Deducts ingredients when orders are placed
- Auto-disables menu items when out of stock
- Low-stock alerts
- Transaction history

## 🔐 Authentication

The app uses Supabase Authentication with:
- Email/password sign up and login
- Password reset functionality
- Row Level Security (RLS) policies
- Protected routes

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoints: mobile (<768px), tablet (768px+), desktop (1024px+)
- Touch-friendly UI elements
- Optimized for all screen sizes

## 🎯 Next Steps

To complete the application, you'll need to:

1. **Add Sample Data**: Populate categories and food items in Supabase
2. **Configure API Keys**: Set up HuggingFace, Firebase, etc.
3. **Upload Images**: Add food item images to Supabase Storage
4. **Add Videos**: Place hero section videos in `public/videos/`
5. **Build Remaining Pages**:
   - Cart page (`app/cart/page.tsx`)
   - Checkout page (`app/checkout/page.tsx`)
   - Order tracking (`app/orders/[id]/page.tsx`)
   - Admin dashboard (`app/admin/`)
6. **Test Features**: Test authentication, ordering, chatbot, voice input
7. **Deploy**: Deploy to Vercel or your preferred platform

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

\`\`\`bash
npm run build
\`\`\`

## 📝 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a custom-built application. Feel free to fork and modify for your needs.

## 📧 Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

Built with ❤️ using Next.js 14, Supabase, and modern web technologies.
