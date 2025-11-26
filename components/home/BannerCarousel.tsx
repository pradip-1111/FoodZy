'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import styles from './BannerCarousel.module.css'

interface Banner {
    id: string
    title: string
    image_url: string
    link_url: string | null
    end_time: string | null
    display_order: number
}

export default function BannerCarousel() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState<Record<string, string>>({})
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        fetchBanners()
    }, [])

    useEffect(() => {
        // Use displayBanners for auto-play logic to handle placeholder
        const currentBanners = banners.length > 0 ? banners : [{
            id: 'placeholder',
            title: 'Welcome to FoodZy',
            image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            link_url: '/menu',
            end_time: null,
            display_order: 1
        }];

        if (currentBanners.length > 1) {
            resetTimeout()
            timeoutRef.current = setTimeout(
                () => setCurrentIndex((prevIndex) => (prevIndex + 1) % currentBanners.length),
                5000
            )
        } else {
            resetTimeout()
        }

        return () => resetTimeout()
    }, [currentIndex, banners.length])

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft: Record<string, string> = {}
            banners.forEach(banner => {
                if (banner.end_time) {
                    newTimeLeft[banner.id] = calculateTimeLeft(banner.end_time)
                }
            })
            setTimeLeft(newTimeLeft)
        }, 1000)

        return () => clearInterval(timer)
    }, [banners])

    const fetchBanners = async () => {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true })

            if (error) throw error
            setBanners(data || [])
        } catch (error) {
            console.error('Error fetching banners:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
    }

    const calculateTimeLeft = (endTime: string) => {
        const difference = +new Date(endTime) - +new Date()
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
            const minutes = Math.floor((difference / 1000 / 60) % 60)
            const seconds = Math.floor((difference / 1000) % 60)
            return `${days}d ${hours}h ${minutes}m ${seconds}s`
        }
        return 'Offer Expired'
    }

    const nextSlide = () => {
        const currentBanners = banners.length > 0 ? banners : [{
            id: 'placeholder',
            title: 'Welcome to FoodZy',
            image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            link_url: '/menu',
            end_time: null,
            display_order: 1
        }];
        setCurrentIndex((prevIndex) => (prevIndex + 1) % currentBanners.length)
    }

    const prevSlide = () => {
        const currentBanners = banners.length > 0 ? banners : [{
            id: 'placeholder',
            title: 'Welcome to FoodZy',
            image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            link_url: '/menu',
            end_time: null,
            display_order: 1
        }];
        setCurrentIndex((prevIndex) => (prevIndex - 1 + currentBanners.length) % currentBanners.length)
    }

    if (loading) return null

    // If no banners found, show a placeholder
    const displayBanners = banners.length > 0 ? banners : [{
        id: 'placeholder',
        title: 'Welcome to FoodZy',
        image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        link_url: '/menu',
        end_time: null,
        display_order: 1
    }]

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.carouselWrapper}>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className={styles.slide}
                    >
                        {displayBanners[currentIndex].link_url ? (
                            <Link href={displayBanners[currentIndex].link_url!}>
                                <img src={displayBanners[currentIndex].image_url} alt={displayBanners[currentIndex].title} />
                            </Link>
                        ) : (
                            <img src={displayBanners[currentIndex].image_url} alt={displayBanners[currentIndex].title} />
                        )}

                        {displayBanners[currentIndex].end_time && (
                            <div className={styles.countdownOverlay}>
                                <div className={styles.countdownContent}>
                                    <h3>Limited Time Offer</h3>
                                    <div className={styles.timer}>
                                        <FaClock />
                                        <span>{timeLeft[displayBanners[currentIndex].id] || 'Loading...'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {displayBanners.length > 1 && (
                    <>
                        <button className={styles.prevBtn} onClick={prevSlide}>
                            <FaChevronLeft />
                        </button>
                        <button className={styles.nextBtn} onClick={nextSlide}>
                            <FaChevronRight />
                        </button>

                        <div className={styles.dots}>
                            {displayBanners.map((_, index) => (
                                <span
                                    key={index}
                                    className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
