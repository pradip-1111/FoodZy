'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import styles from './page.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Dynamically import 3D viewer to avoid SSR issues
const Model3DViewer = dynamic(() => import('@/components/Model3DViewer'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }} />
})

export default function HomePage() {
    const { t } = useLanguage()
    const supabase = createClientComponentClient()
    const [categories, setCategories] = useState<any[]>([])
    const [loadingCategories, setLoadingCategories] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
                .limit(8)

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoadingCategories(false)
        }
    }

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.videoContainer}>
                    <video
                        className={styles.heroVideo}
                        src="/videos/FoodZy1.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                    <div className={styles.videoOverlay} />
                </div>

                <div className={styles.heroContent}>
                    <h1 className={`${styles.heroTitle} animate-fade-in-up`}>
                        {t('home.title')}
                        <br />
                        <span className="gradient-text">{t('home.subtitle')}</span>
                    </h1>
                    <p className={`${styles.heroSubtitle} animate-fade-in-up`}>
                        {t('home.desc')}
                        <br />
                        {t('home.feature.multi')}
                    </p>
                    <div className={`${styles.heroButtons} animate-fade-in-up`}>
                        <Link href="/menu">
                            <Button size="lg">{t('home.browse')}</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="lg">{t('home.getStarted')}</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3D Food Showcase - Burger Section */}
            <section className={`${styles.section} ${styles.showcase3DSection}`}>
                <div className="container">
                    <div className={styles.singleModelSection}>
                        <div className={styles.modelContent}>
                            <div className={styles.modelInfo}>
                                <h2>Gourmet Burger</h2>
                                <p className="text-secondary">
                                    Experience our signature gourmet burger with premium beef patty, fresh vegetables,
                                    and our special house sauce. Perfectly grilled to perfection.
                                </p>
                                <Link href="/menu">
                                    <Button size="lg">Order Now</Button>
                                </Link>
                            </div>
                            <div className={styles.singleModel3DViewer}>
                                <Model3DViewer modelPath="/videos/burger.glb" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3D Food Showcase - Momo Section */}
            <section className={`${styles.section} ${styles.showcase3DSectionAlt}`}>
                <div className="container">
                    <div className={styles.singleModelSection}>
                        <div className={styles.modelContent}>
                            <div className={styles.singleModel3DViewer}>
                                <Model3DViewer modelPath="/videos/momo_food.glb" />
                            </div>
                            <div className={styles.modelInfo}>
                                <h2>Authentic Momos</h2>
                                <p className="text-secondary">
                                    Steamed to perfection, our momos are filled with flavorful ingredients and served
                                    with our signature spicy dipping sauce. A crowd favorite!
                                </p>
                                <Link href="/menu">
                                    <Button size="lg">Order Now</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3D Food Showcase - Thai Food Section */}
            <section className={`${styles.section} ${styles.showcase3DSection}`}>
                <div className="container">
                    <div className={styles.singleModelSection}>
                        <div className={styles.modelContent}>
                            <div className={styles.modelInfo}>
                                <h2>Thai Delicacy</h2>
                                <p className="text-secondary">
                                    Authentic Thai cuisine with aromatic herbs and spices. Experience the perfect balance
                                    of sweet, sour, salty, and spicy flavors in every bite.
                                </p>
                                <Link href="/menu">
                                    <Button size="lg">Order Now</Button>
                                </Link>
                            </div>
                            <div className={styles.singleModel3DViewer}>
                                <Model3DViewer modelPath="/videos/thai_food_01.glb" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3D Food Showcase - Cake Section */}
            <section className={`${styles.section} ${styles.showcase3DSectionAlt}`}>
                <div className="container">
                    <div className={styles.singleModelSection}>
                        <div className={styles.modelContent}>
                            <div className={styles.singleModel3DViewer}>
                                <Model3DViewer modelPath="/videos/full.glb" />
                            </div>
                            <div className={styles.modelInfo}>
                                <h2>Deluxe Cake</h2>
                                <p className="text-secondary">
                                    Indulge in our premium cakes made with the finest ingredients. Perfect for celebrations
                                    or treating yourself to something special.
                                </p>
                                <Link href="/menu">
                                    <Button size="lg">Order Now</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3D Food Showcase - Full Breakfast Section */}
            <section className={`${styles.section} ${styles.showcase3DSection}`}>
                <div className="container">
                    <div className={styles.singleModelSection}>
                        <div className={styles.modelContent}>
                            <div className={styles.modelInfo}>
                                <h2>Full Breakfast</h2>
                                <p className="text-secondary">
                                    Start your day right with our complete breakfast platter. Includes eggs, toast,
                                    fresh fruits, and your choice of beverage.
                                </p>
                                <Link href="/menu">
                                    <Button size="lg">Order Now</Button>
                                </Link>
                            </div>
                            <div className={styles.singleModel3DViewer}>
                                <Model3DViewer modelPath="/videos/cake.glb" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features - Why Choose FoodZy */}
            <section className={`${styles.section} ${styles.featuresSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('home.why')}</h2>
                        <p className={styles.sectionSubtitle}>
                            Experience the future of food delivery with cutting-edge technology and exceptional service
                        </p>
                    </div>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconWrapper}>
                                <div className={styles.featureIconBg}>
                                    <svg className={styles.featureIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={styles.featureTitle}>{t('home.feature.ai')}</h3>
                            <p className={styles.featureDescription}>
                                Order food naturally by chatting with our intelligent AI assistant. Get personalized recommendations and seamless ordering experience.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIconWrapper}>
                                <div className={styles.featureIconBg}>
                                    <svg className={styles.featureIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={styles.featureTitle}>{t('home.feature.voice')}</h3>
                            <p className={styles.featureDescription}>
                                Use voice commands to place your order hands-free. Perfect for multitasking or when you're on the go.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIconWrapper}>
                                <div className={styles.featureIconBg}>
                                    <svg className={styles.featureIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={styles.featureTitle}>{t('home.feature.multi')}</h3>
                            <p className={styles.featureDescription}>
                                Available in English, Arabic, Hindi, Spanish, and French. Order in your preferred language with ease.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIconWrapper}>
                                <div className={styles.featureIconBg}>
                                    <svg className={styles.featureIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={styles.featureTitle}>{t('home.feature.fast')}</h3>
                            <p className={styles.featureDescription}>
                                Track your order in real-time with live updates. Know exactly when your delicious food will arrive.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className={`${styles.section} ${styles.howItWorksSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('home.how')}</h2>
                        <p className={styles.sectionSubtitle}>
                            Three simple steps to satisfy your cravings
                        </p>
                    </div>
                    <div className={styles.stepsContainer}>
                        <div className={styles.stepCard}>
                            <div className={styles.stepIconWrapper}>
                                <div className={styles.stepIconBg}>
                                    <svg className={styles.stepIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className={styles.stepNumberBadge}>1</div>
                            </div>
                            <h3 className={styles.stepTitle}>{t('home.step1')}</h3>
                            <p className={styles.stepDescription}>
                                Browse our extensive menu or use our intelligent AI chatbot to discover your favorite dishes and get personalized recommendations.
                            </p>
                        </div>

                        <div className={styles.stepConnector}>
                            <svg viewBox="0 0 100 20" className={styles.connectorSvg}>
                                <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="url(#gradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#FF6B6B" />
                                        <stop offset="100%" stopColor="#4ECDC4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepIconWrapper}>
                                <div className={styles.stepIconBg}>
                                    <svg className={styles.stepIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className={styles.stepNumberBadge}>2</div>
                            </div>
                            <h3 className={styles.stepTitle}>{t('home.step2')}</h3>
                            <p className={styles.stepDescription}>
                                Add your selected items to the cart, review your order, and proceed to checkout with your preferred delivery address and payment method.
                            </p>
                        </div>

                        <div className={styles.stepConnector}>
                            <svg viewBox="0 0 100 20" className={styles.connectorSvg}>
                                <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="url(#gradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                            </svg>
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepIconWrapper}>
                                <div className={styles.stepIconBg}>
                                    <svg className={styles.stepIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className={styles.stepNumberBadge}>3</div>
                            </div>
                            <h3 className={styles.stepTitle}>{t('home.step3')}</h3>
                            <p className={styles.stepDescription}>
                                Track your order in real-time with live updates and enjoy your delicious, hot, and fresh food delivered right to your doorstep.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Categories */}
            <section className={`${styles.section} ${styles.categoriesSection}`}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Popular Categories</h2>
                        <p className={styles.sectionSubtitle}>
                            Explore our diverse menu and find your favorite dishes
                        </p>
                    </div>
                    {loadingCategories ? (
                        <div className={styles.categoriesGrid}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={styles.categoryCardSkeleton}>
                                    <div className={styles.skeletonImage}></div>
                                    <div className={styles.skeletonText}></div>
                                </div>
                            ))}
                        </div>
                    ) : categories.length > 0 ? (
                        <div className={styles.categoriesGrid}>
                            {categories.map((category) => (
                                <Link href={`/menu?category=${category.id}`} key={category.id}>
                                    <div className={styles.categoryCard}>
                                        <div className={styles.categoryImageWrapper}>
                                            {category.image_url ? (
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    className={styles.categoryImage}
                                                />
                                            ) : (
                                                <div className={styles.categoryPlaceholder}>
                                                    <span className={styles.categoryEmoji}>🍽️</span>
                                                </div>
                                            )}
                                            <div className={styles.categoryOverlay}></div>
                                        </div>
                                        <div className={styles.categoryInfo}>
                                            <h3 className={styles.categoryName}>{category.name}</h3>
                                            {category.description && (
                                                <p className={styles.categoryDescription}>{category.description}</p>
                                            )}
                                        </div>
                                        <div className={styles.categoryArrow}>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No categories available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA - Ready to Order */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <div className={styles.ctaCard}>
                        <div className={styles.ctaDecoration}></div>
                        <div className={styles.ctaContent}>
                            <div className={styles.ctaHeader}>
                                <h2 className={styles.ctaTitle}>Ready to Order?</h2>
                                <p className={styles.ctaSubtitle}>
                                    Join thousands of happy customers enjoying delicious food delivered fresh to your door
                                </p>
                            </div>

                            <div className={styles.ctaButtons}>
                                <Link href="/menu">
                                    <Button size="lg" className={styles.ctaPrimaryButton}>
                                        <svg className={styles.ctaButtonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Browse Menu
                                    </Button>
                                </Link>
                                <Link href="/menu">
                                    <Button size="lg" variant="outline" className={styles.ctaSecondaryButton}>
                                        <svg className={styles.ctaButtonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Order Now
                                    </Button>
                                </Link>
                            </div>

                            <div className={styles.ctaFeatures}>
                                <div className={styles.ctaFeature}>
                                    <svg className={styles.ctaFeatureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Free Delivery on Orders Over $30</span>
                                </div>
                                <div className={styles.ctaFeature}>
                                    <svg className={styles.ctaFeatureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Fresh Ingredients Daily</span>
                                </div>
                                <div className={styles.ctaFeature}>
                                    <svg className={styles.ctaFeatureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>30-Minute Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mb-xl">
                        <div>
                            <h3 className="mb-md">FoodZy</h3>
                            <p className="text-secondary">
                                Delicious food delivered fast with AI-powered ordering
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-md">Quick Links</h4>
                            <div className={styles.footerLinks}>
                                <Link href="/menu">{t('nav.menu')}</Link>
                                <Link href="/login">{t('auth.login')}</Link>
                                <Link href="/register">{t('auth.signup')}</Link>
                                <Link href="/admin/login">Admin</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="mb-md">Contact</h4>
                            <p className="text-secondary">Email: support@foodzy.com</p>
                            <p className="text-secondary">Phone: +1 234 567 8900</p>
                        </div>
                    </div>
                    <div className="text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <p className="text-secondary">© 2024 FoodZy. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
