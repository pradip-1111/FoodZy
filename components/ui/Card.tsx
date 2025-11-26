import React from 'react'
import styles from './Card.module.css'

interface CardProps {
    children: React.ReactNode
    className?: string
    glass?: boolean
    hover?: boolean
    onClick?: () => void
}

export default function Card({
    children,
    className = '',
    glass = false,
    hover = false,
    onClick,
}: CardProps) {
    const classes = [
        styles.card,
        glass ? styles.glass : '',
        hover ? styles.hover : '',
        onClick ? styles.clickable : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.cardHeader} ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.cardBody} ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.cardFooter} ${className}`}>{children}</div>
}
