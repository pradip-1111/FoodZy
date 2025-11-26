'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${styles[size]}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className={styles.header}>
                        <h3 className={styles.title}>{title}</h3>
                        <button className={styles.closeButton} onClick={onClose}>
                            ✕
                        </button>
                    </div>
                )}
                <div className={styles.content}>{children}</div>
            </div>
        </div>,
        document.body
    )
}
