'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FaCloudUploadAlt, FaTimes, FaExclamationCircle, FaLink, FaImage } from 'react-icons/fa'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    bucketName?: string
}

type UploadMode = 'file' | 'url'

export default function ImageUpload({ value, onChange, bucketName = 'food-images' }: ImageUploadProps) {
    const [mode, setMode] = useState<UploadMode>('file')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [urlInput, setUrlInput] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (value && value.startsWith('http')) {
            // If value exists and looks like a URL, we can default to URL mode if it's not a supabase storage URL, 
            // but for now let's just keep 'file' as default unless we want to be smart.
            // Actually, let's just sync urlInput with value if it's in URL mode
            if (mode === 'url') {
                setUrlInput(value)
            }
        }
    }, [value, mode])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await uploadImage(e.target.files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadImage(e.dataTransfer.files[0])
        }
    }

    const uploadImage = async (file: File) => {
        try {
            setUploading(true)
            setError(null)

            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file')
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image size must be less than 5MB')
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file)

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error(`Bucket '${bucketName}' not found.`)
                }
                throw uploadError
            }

            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            onChange(data.publicUrl)
        } catch (error: any) {
            console.error('Error uploading image:', error)
            setError(error.message || 'Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value
        setUrlInput(newUrl)
        onChange(newUrl)
    }

    const handleRemove = () => {
        onChange('')
        setUrlInput('')
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${mode === 'file' ? styles.activeTab : ''}`}
                    onClick={() => setMode('file')}
                >
                    <FaCloudUploadAlt /> Upload File
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${mode === 'url' ? styles.activeTab : ''}`}
                    onClick={() => setMode('url')}
                >
                    <FaLink /> Image URL
                </button>
            </div>

            <div className={styles.content}>
                {value ? (
                    <div className={styles.preview}>
                        <img src={value} alt="Preview" onError={(e) => (e.currentTarget.src = '/placeholder-image.png')} />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className={styles.removeBtn}
                            title="Remove image"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ) : (
                    <>
                        {mode === 'file' ? (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <div
                                    className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {uploading ? (
                                        <div className={styles.loader}>
                                            <div className={styles.spinner} />
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className={styles.placeholder}>
                                            <FaCloudUploadAlt className={styles.icon} />
                                            <div className={styles.text}>
                                                Click to upload or drag and drop
                                            </div>
                                            <div className={styles.subtext}>
                                                SVG, PNG, JPG or GIF (max. 5MB)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.urlInputContainer}>
                                <div className={styles.inputWrapper}>
                                    <FaImage className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        value={urlInput}
                                        onChange={handleUrlChange}
                                        placeholder="Paste image URL here..."
                                        className={styles.urlInput}
                                    />
                                </div>
                                <p className={styles.helpText}>
                                    Paste a direct link to an image (ends in .jpg, .png, etc.)
                                </p>
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <div className={styles.error}>
                        <FaExclamationCircle />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
