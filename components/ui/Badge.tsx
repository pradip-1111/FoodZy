import React from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    size?: 'sm' | 'md'
    className?: string
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}: BadgeProps) {
    const classes = [
        styles.badge,
        styles[variant],
        styles[size],
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <span className={classes}>{children}</span>
}
