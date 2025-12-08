'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './AddressMapPicker.module.css'

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface AddressMapPickerProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void
    initialLat?: number
    initialLng?: number
}

// Default center (New Delhi, India)
const defaultCenter: [number, number] = [28.6139, 77.2090]

export default function AddressMapPicker({
    onLocationSelect,
    initialLat,
    initialLng
}: AddressMapPickerProps) {
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)

    const [selectedAddress, setSelectedAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted || !mapContainerRef.current || mapRef.current) return

        // Initialize map
        const map = L.map(mapContainerRef.current).setView(
            [initialLat || defaultCenter[0], initialLng || defaultCenter[1]],
            15
        )

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        // Add initial marker if coordinates provided
        if (initialLat && initialLng) {
            const marker = L.marker([initialLat, initialLng]).addTo(map)
            markerRef.current = marker
        }

        // Handle map clicks
        map.on('click', async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng

            // Remove old marker if exists
            if (markerRef.current) {
                markerRef.current.remove()
            }

            // Add new marker
            const marker = L.marker([lat, lng]).addTo(map)
            markerRef.current = marker

            // Reverse geocode
            await reverseGeocode(lat, lng)
        })

        mapRef.current = map

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [mounted, initialLat, initialLng])

    const reverseGeocode = async (lat: number, lng: number) => {
        setLoading(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            )
            const data = await response.json()

            if (data && data.display_name) {
                setSelectedAddress(data.display_name)
                onLocationSelect(lat, lng, data.display_name)
            }
        } catch (error) {
            console.error('Geocoding error:', error)
            const address = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
            setSelectedAddress(address)
            onLocationSelect(lat, lng, address)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude

                // Update map view
                if (mapRef.current) {
                    mapRef.current.setView([lat, lng], 15)
                }

                // Remove old marker
                if (markerRef.current) {
                    markerRef.current.remove()
                }

                // Add new marker
                if (mapRef.current) {
                    const marker = L.marker([lat, lng]).addTo(mapRef.current)
                    markerRef.current = marker
                }

                // Reverse geocode
                await reverseGeocode(lat, lng)
            },
            (error) => {
                console.error('Geolocation error:', error)
                alert('Unable to get your location. Please enable location services.')
                setLoading(false)
            }
        )
    }

    if (!mounted) {
        return <div className={styles.loading}>Loading map...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Select Location on Map</h3>
                <button
                    onClick={getCurrentLocation}
                    className={styles.locationBtn}
                    disabled={loading}
                    type="button"
                >
                    📍 Use My Location
                </button>
            </div>

            <div className={styles.mapWrapper}>
                <div
                    ref={mapContainerRef}
                    style={{ height: '400px', width: '100%', borderRadius: '0.75rem' }}
                />
            </div>

            {selectedAddress && (
                <div className={styles.selectedAddress}>
                    <strong>Selected Address:</strong>
                    <p>{selectedAddress}</p>
                </div>
            )}

            <div className={styles.instructions}>
                <p>💡 Click anywhere on the map to select your delivery location</p>
            </div>
        </div>
    )
}
